<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['applicant.personalInformation', 'user']);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('stripe_payment_intent_id', 'like', "%{$search}%")
                ->orWhereHas('applicant.personalInformation', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
        }

        if ($request->has('status') && $request->get('status') != '') {
            $query->where('status', $request->get('status'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'amount', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $payments = $query->paginate(15);
        $payments->appends($request->only(['search', 'status', 'sort_by', 'sort_dir']));

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ]
        ]);
    }

    public function export(Request $request)
    {
        $query = Payment::with(['applicant.personalInformation', 'user']);

        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where('stripe_payment_intent_id', 'like', "%{$search}%")
                ->orWhereHas('applicant.personalInformation', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
        }

        if ($request->has('status') && $request->get('status') != '') {
            $query->where('status', $request->get('status'));
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'amount', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $payments = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=payments.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Transaction ID', 'Stripe ID', 'Applicant Name', 'Email', 'Amount', 'Status', 'Date'];

        $callback = function() use($payments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($payments as $payment) {
                $row['Transaction ID'] = 'PAY-' . $payment->id;
                $row['Stripe ID'] = $payment->stripe_payment_intent_id;
                $row['Applicant Name'] = $payment->applicant && $payment->applicant->personalInformation ? $payment->applicant->personalInformation->first_name . ' ' . $payment->applicant->personalInformation->last_name : 'N/A';
                $row['Email'] = $payment->applicant ? $payment->applicant->email : 'N/A';
                $row['Amount'] = '$' . number_format($payment->amount, 2);
                $row['Status'] = $payment->status;
                $row['Date'] = $payment->created_at->format('Y-m-d H:i:s');

                fputcsv($file, array($row['Transaction ID'], $row['Stripe ID'], $row['Applicant Name'], $row['Email'], $row['Amount'], $row['Status'], $row['Date']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
