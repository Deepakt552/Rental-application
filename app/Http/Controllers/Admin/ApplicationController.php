<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ApplicationController extends Controller
{
       protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    public function dashboard()
    {
        // Get only latest 5 applicants for the dashboard overview
        $applicants = Applicant::with([
            'personalInformation',
            'currentAddress',
        ])->latest()->limit(5)->get();

        $emailStats = $this->emailService->getEmailStats();

        // Status breakdown for pie chart
        $statusCounts = Applicant::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->toArray();

        // Default statuses if missing
        $statusCounts = array_merge([
            'draft' => 0,
            'submitted' => 0,
            'approved' => 0,
            'rejected' => 0
        ], $statusCounts);

        // Applications trend for line chart (last 7 days)
        $trendData = Applicant::selectRaw('DATE(created_at) as date, count(*) as total')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('total', 'date')
            ->toArray();

        // Fill in missing days
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $trend[$date] = $trendData[$date] ?? 0;
        }

        // Payment stats
        $totalRevenue = \App\Models\Payment::where('status', 'completed')->sum('amount');
        $recentRevenue = \App\Models\Payment::where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount');

        $recentPaymentsList = \App\Models\Payment::with(['applicant.personalInformation'])
            ->latest()
            ->limit(5)
            ->get();

        // Calculate dynamic growth/change metrics
        $now = now();
        $sevenDaysAgo = $now->copy()->subDays(7);
        $fourteenDaysAgo = $now->copy()->subDays(14);
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Applications growth (last 30 days vs preceding 30 days)
        $current30DaysApps = Applicant::where('created_at', '>=', $thirtyDaysAgo)->count();
        $previous30DaysApps = Applicant::where('created_at', '>=', $sixtyDaysAgo)
            ->where('created_at', '<', $thirtyDaysAgo)
            ->count();
        $applicationsGrowth = $previous30DaysApps > 0
            ? round((($current30DaysApps - $previous30DaysApps) / $previous30DaysApps) * 100, 1)
            : ($current30DaysApps > 0 ? 100 : 0);

        // Recent applications growth (last 7 days vs preceding 7 days)
        $current7DaysApps = Applicant::where('created_at', '>=', $sevenDaysAgo)->count();
        $previous7DaysApps = Applicant::where('created_at', '>=', $fourteenDaysAgo)
            ->where('created_at', '<', $sevenDaysAgo)
            ->count();
        $recentApplicationsGrowth = $previous7DaysApps > 0
            ? round((($current7DaysApps - $previous7DaysApps) / $previous7DaysApps) * 100, 1)
            : ($current7DaysApps > 0 ? 100 : 0);

        // Revenue growth (last 30 days vs preceding 30 days)
        $current30DaysRev = \App\Models\Payment::where('status', 'completed')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->sum('amount');
        $previous30DaysRev = \App\Models\Payment::where('status', 'completed')
            ->where('created_at', '>=', $sixtyDaysAgo)
            ->where('created_at', '<', $thirtyDaysAgo)
            ->sum('amount');
        $revenueGrowth = $previous30DaysRev > 0
            ? round((($current30DaysRev - $previous30DaysRev) / $previous30DaysRev) * 100, 1)
            : ($current30DaysRev > 0 ? 100 : 0);

        $recentRevenueGrowth = $revenueGrowth;

        // Consent counts per applicant (per user)
        $completedConsentsCount = Applicant::whereHas('consentRecord', function ($query) {
            $query->where('status', 'completed');
        })->count();

        $pendingConsentsCount = Applicant::whereDoesntHave('consentRecord', function ($query) {
            $query->where('status', 'completed');
        })->count();

        $stats = [
            'total_applications' => Applicant::count(),
            'recent_applications' => $current7DaysApps,
            'total_emails_sent' => $emailStats['total_sent'],
            'admin_emails' => $emailStats['admin_emails'],
            'total_revenue' => (float) $totalRevenue,
            'recent_revenue' => (float) $recentRevenue,
            'total_users' => \App\Models\User::where('role', 'user')->count(),
            'total_consents' => $completedConsentsCount,
            'total_documents' => \App\Models\ApplicantDocument::count(),
            'applications_submitted' => Applicant::where('status', 'submitted')->count(),
            'pending_consents' => $pendingConsentsCount,
            'pending_payments' => \App\Models\Payment::where('status', 'pending')->count(),
            'applications_growth' => $applicationsGrowth,
            'recent_applications_growth' => $recentApplicationsGrowth,
            'revenue_growth' => $revenueGrowth,
            'recent_revenue_growth' => $recentRevenueGrowth,
        ];

        return Inertia::render('Admin/Dashboard', [
            'applicants' => ['data' => $applicants], // Keep same structure for compatibility
            'stats' => $stats,
            'chartData' => [
                'status' => $statusCounts,
                'trend' => $trend
            ],
            'recentPayments' => $recentPaymentsList
        ]);
    }

    // public function index(Request $request)
    // {
    //     $query = Applicant::with(['personalInformation', 'currentAddress', 'consentRecord']);

    //     if ($request->has('search')) {
    //         $search = $request->get('search');
    //         $query->where('email', 'like', "%{$search}%")
    //             ->orWhereHas('personalInformation', function ($q) use ($search) {
    //                 $q->where('first_name', 'like', "%{$search}%")
    //                     ->orWhere('last_name', 'like', "%{$search}%")
    //                     ->orWhere('phone', 'like', "%{$search}%");
    //             });
    //     }

    //     if ($request->has('status') && $request->get('status') != '') {
    //         $query->where('status', $request->get('status'));
    //     }

    //     $applicants = $query->latest()->paginate(15);

    //     return Inertia::render('Admin/Applications', [
    //         'applicants' => $applicants,
    //         'filters' => $request->only(['search', 'status'])
    //     ]);
    // }

     public function index(Request $request)
    {
        $query = Applicant::with(['personalInformation', 'currentAddress', 'consentRecord']);

        // CRITICAL: Apply type filter FIRST
        if ($request->has('type') && in_array($request->get('type'), ['admin', 'superadmin'])) {
            $type = $request->get('type');
            $query->where('type', $type);
            \Log::info('Filtering by type: ' . $type); // Debug log
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('personalInformation', function ($q2) use ($search) {
                        $q2->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // Apply status filter
        if ($request->has('status') && $request->get('status') != '') {
            $query->where('status', $request->get('status'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'email', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        // Get paginated results (15 per page)
        $applicants = $query->paginate(15);

        // Preserve query parameters in pagination links
        $applicants->appends($request->only(['search', 'status', 'type', 'sort_by', 'sort_dir']));

        // Get TOTAL counts from database (without any filters except type)
        $totalAdmin = Applicant::where('type', 'admin')->count();
        $totalSuperAdmin = Applicant::where('type', 'superadmin')->count();

        // Debug: Log the counts
        Log::info('Total Admin Count: ' . $totalAdmin);
        Log::info('Total SuperAdmin Count: ' . $totalSuperAdmin);
        Log::info('Current Page Records Count: ' . $applicants->count());
        Log::info('Current Page Type Filter: ' . $request->get('type'));

        return Inertia::render('Admin/Applications', [
            'applicants' => $applicants,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'type' => $request->get('type', ''),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'total_admin' => $totalAdmin,
            'total_superadmin' => $totalSuperAdmin,
        ]);
    }

    public function show($id)
    {
        $applicant = Applicant::with([
            'personalInformation',
            'currentAddress',
            'previousAddress',
            'employment',
            'previousEmployment',
            'screening',
            'pets',
            'vehicles',
            'emergencyContact',
            'documents',
            'consentRecord'
        ])->findOrFail($id);

        $applicant->is_consent_completed = $applicant->consentRecord?->status === 'completed';

        return Inertia::render('Admin/ApplicationDetail', [
            'applicant' => $applicant
        ]);
    }

    public function resend($id)
    {
        $applicant = Applicant::findOrFail($id);
        $type = $applicant->type ?? 'admin';
        $emailService = app(\App\Services\EmailService::class);
        $emailService->sendAllApplicationEmails($applicant, $type);

        return redirect()->back()->with('success', 'Application notification email resent successfully.');
    }

    public function destroy($id)
    {
        $applicant = Applicant::findOrFail($id);
        $applicant->delete();

        return redirect()->back()->with('success', 'Application deleted successfully');
    }

    public function updateComment(Request $request, $id)
    {
        $request->validate([
            'admin_comment' => 'nullable|string'
        ]);

        $applicant = Applicant::findOrFail($id);
        $applicant->update([
            'admin_comment' => $request->admin_comment
        ]);

        return redirect()->back()->with('success', 'Comment updated successfully');
    }

    public function export(Request $request)
    {
        $query = Applicant::with(['personalInformation', 'currentAddress', 'consentRecord']);

        if ($request->has('type') && in_array($request->get('type'), ['admin', 'superadmin'])) {
            $query->where('type', $request->get('type'));
        }

        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('personalInformation', function ($q2) use ($search) {
                        $q2->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status') && $request->get('status') != '') {
            $query->where('status', $request->get('status'));
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['id', 'email', 'status', 'created_at'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $applicants = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=applications.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Status', 'Consent Status', 'Payment Status', 'Created At'];

        $callback = function() use($applicants, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($applicants as $app) {
                $row['ID'] = $app->id;
                $row['Type'] = $app->type === 'admin' ? 'Triumph' : ($app->type === 'superadmin' ? 'Excel' : 'User');
                $row['Name'] = $app->personalInformation ? $app->personalInformation->first_name . ' ' . $app->personalInformation->last_name : 'N/A';
                $row['Email'] = $app->email ?? 'N/A';
                $row['Phone'] = $app->personalInformation ? $app->personalInformation->phone : 'N/A';
                $row['Status'] = $app->status;
                $row['Consent Status'] = $app->consentRecord && $app->consentRecord->status === 'completed' ? 'Completed' : 'Pending';
                $row['Payment Status'] = $app->payment_status;
                $row['Created At'] = $app->created_at->format('Y-m-d H:i:s');

                fputcsv($file, array($row['ID'], $row['Type'], $row['Name'], $row['Email'], $row['Phone'], $row['Status'], $row['Consent Status'], $row['Payment Status'], $row['Created At']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function uploadDocument(Request $request, $id)
    {
        $request->validate([
            'document_type' => 'required|string|in:driving_license,pay_check,bank_statement,social_security_card,other_source_of_income,other',
            'file' => 'required|file|max:5120|mimes:pdf,jpg,jpeg,png',
            'description' => 'nullable|string'
        ]);

        try {
            $applicant = Applicant::findOrFail($id);
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $sessionId = $applicant->session_id ?? (string) \Illuminate\Support\Str::uuid();

            // Calculate file hash to prevent duplicates
            $fileHash = md5_file($file->getRealPath());

            // Check if this file already exists for this applicant
            $alreadyExists = \App\Models\ApplicantDocument::where('applicant_id', $applicant->id)
                ->where('file_hash', $fileHash)
                ->exists();

            if ($alreadyExists) {
                return redirect()->back()->with('error', 'This document has already been uploaded.');
            }

            $fileName = time() . '_' . \Illuminate\Support\Str::random(10) . '_' .
                (\Illuminate\Support\Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) ?: 'file')
                . '.' . strtolower($extension);

            $filePath = $file->storeAs(
                'documents/' . $sessionId,
                $fileName,
                'public'
            );

            \App\Models\ApplicantDocument::create([
                'applicant_id'      => $applicant->id,
                'session_id'        => $sessionId,
                'document_type'     => $request->document_type,
                'file_path'         => $filePath,
                'original_filename' => $originalName,
                'mime_type'         => $file->getMimeType(),
                'size'              => $file->getSize(),
                'file_hash'         => $fileHash,
                'description'       => $request->description
            ]);

            return redirect()->back()->with('success', 'Document uploaded successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Admin document upload error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to upload document: ' . $e->getMessage());
        }
    }

    public function deleteDocument($id, $documentId)
    {
        try {
            $document = \App\Models\ApplicantDocument::where('applicant_id', $id)->findOrFail($documentId);

            // Delete physical file
            if ($document->file_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return redirect()->back()->with('success', 'Document deleted successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Admin delete document error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete document: ' . $e->getMessage());
        }
    }
}
