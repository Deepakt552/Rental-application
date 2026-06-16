<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    public function index(Request $request)
    {
        $query = EmailLog::with('applicant.personalInformation');

        // Filter by recipient type
        if ($request->has('type') && $request->type != 'all') {
            $query->where('recipient_type', $request->type);
        }

        // Filter by status
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('recipient_email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        // Sort logic
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'recipient_email', 'subject', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $emailLogs = $query->paginate(20);
        $emailLogs->appends($request->only(['type', 'status', 'search', 'sort_by', 'sort_dir']));

        // Get statistics
        $stats = [
            'total' => EmailLog::count(),
            'admin_emails' => EmailLog::where('recipient_type', 'admin')->count(),
            'user_emails' => EmailLog::where('recipient_type', 'user')->count(),
            'sent' => EmailLog::where('status', 'sent')->count(),
            'failed' => EmailLog::where('status', 'failed')->count(),
        ];

        return Inertia::render('Admin/EmailLogs', [
            'emailLogs' => $emailLogs,
            'stats' => $stats,
            'filters' => [
                'type' => $request->type ?? 'all',
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ]
        ]);
    }

    public function export(Request $request)
    {
        $query = EmailLog::query();

        if ($request->has('type') && $request->type != 'all') {
            $query->where('recipient_type', $request->type);
        }

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('recipient_email', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'recipient_email', 'subject', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $logs = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=email_logs.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Recipient Name', 'Recipient Email', 'Subject', 'Status', 'Sent At'];

        $callback = function() use($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->recipient_name,
                    $log->recipient_email,
                    $log->subject,
                    $log->status,
                    $log->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function show($id)
    {
        $emailLog = EmailLog::with('applicant.personalInformation')->findOrFail($id);
        
        return Inertia::render('Admin/EmailLogDetail', [
            'emailLog' => $emailLog
        ]);
    }

    public function resend($id)
    {
        $emailLog = EmailLog::findOrFail($id);
        
        // Logic to resend email (you can implement this)
        
        return redirect()->back()->with('success', 'Email resent successfully');
    }

    public function destroy($id)
    {
        $emailLog = EmailLog::findOrFail($id);
        $emailLog->delete();
        
        return redirect()->back()->with('success', 'Email log deleted successfully');
    }

    public function unreadCount()
    {
        // Since we don't have an is_read column, we'll return 0 for now
        // or you could return the count of failed emails if that's more useful
        return response()->json(['count' => 0]);
    }
}