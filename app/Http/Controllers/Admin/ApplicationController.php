<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
        // Get latest applicants for the dashboard overview with essential relationships
        $applicants = Applicant::with([
            'personalInformation',
            'currentAddress',
            'consentRecord',
            'payments',
            'property',
        ])->latest()->limit(8)->get();

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

        $recentPaymentsList = \App\Models\Payment::with(['applicant.personalInformation', 'applicant.property'])
            ->latest()
            ->limit(6)
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

        $totalAppsCount = Applicant::count();

        $stats = [
            'total_applications' => $totalAppsCount,
            'recent_applications' => $current7DaysApps,
            'total_emails_sent' => $emailStats['total_sent'],
            'admin_emails' => $emailStats['admin_emails'],
            'total_revenue' => (float) $totalRevenue,
            'recent_revenue' => (float) $recentRevenue,
            'total_users' => \App\Models\User::where('role', 'user')->count(),
            'total_consents' => $completedConsentsCount,
            'total_documents' => \App\Models\ApplicantDocument::count(),
            'applications_submitted' => Applicant::where('status', 'submitted')->count(),
            'applications_draft' => Applicant::where('status', 'draft')->count(),
            'applications_approved' => Applicant::where('status', 'approved')->count(),
            'applications_rejected' => Applicant::where('status', 'rejected')->count(),
            'pending_consents' => $pendingConsentsCount,
            'pending_payments' => \App\Models\Payment::where('status', 'pending')->count(),
            'completed_payments' => \App\Models\Payment::where('status', 'completed')->count(),
            'paid_applicants_count' => Applicant::where('payment_status', 'paid')->count(),
            'triumph_total' => Applicant::where('type', 'admin')->count(),
            'excel_total' => Applicant::where('type', 'superadmin')->count(),
            'opted_out_count' => Applicant::where('reminders_opted_out', true)->count(),
            'moved_in_count' => Applicant::where('move_in_status', 'moved_in')->count(),
            'move_in_pending_count' => Applicant::where('move_in_status', 'pending')->count(),
            'submission_rate' => $totalAppsCount > 0 ? round((Applicant::where('status', 'submitted')->count() / $totalAppsCount) * 100, 1) : 0,
            'consent_rate' => $totalAppsCount > 0 ? round(($completedConsentsCount / $totalAppsCount) * 100, 1) : 0,
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
        $query = Applicant::with(['personalInformation', 'currentAddress', 'consentRecord', 'property']);

        // CRITICAL: Apply type filter FIRST
        if ($request->has('type') && in_array($request->get('type'), ['admin', 'superadmin'])) {
            $type = $request->get('type');
            $query->where('type', $type);
            \Log::info('Filtering by type: ' . $type); // Debug log
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('property_name', 'like', "%{$search}%")
                    ->orWhere('property_code', 'like', "%{$search}%")
                    ->orWhereHas('property', function ($qp) use ($search) {
                        $qp->where('property_code', 'like', "%{$search}%")
                           ->orWhere('property_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('personalInformation', function ($q2) use ($search) {
                        $q2->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Apply Date Range filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->get('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->get('to_date'));
        }

        // Apply Payment Status filter
        if ($request->filled('payment_status')) {
            $payStatus = $request->get('payment_status');
            if ($payStatus === 'paid') {
                $query->where('payment_status', 'paid');
            } elseif ($payStatus === 'unpaid') {
                $query->where(function ($q) {
                    $q->where('payment_status', '!=', 'paid')
                      ->orWhereNull('payment_status');
                });
            } elseif ($payStatus === 'pending') {
                $query->where(function ($q) {
                    $q->where('payment_status', 'pending')
                      ->orWhereNull('payment_status');
                });
            } else {
                $query->where('payment_status', $payStatus);
            }
        }

        // Apply Consent Status filter
        if ($request->filled('consent_status')) {
            $cStatus = $request->get('consent_status');
            if ($cStatus === 'completed') {
                $query->where(function ($q) {
                    $q->where('consent_status', 'completed')
                      ->orWhereHas('consentRecord', function ($cr) {
                          $cr->where('status', 'completed');
                      });
                });
            } elseif ($cStatus === 'pending') {
                $query->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('consent_status', '!=', 'completed')
                            ->orWhereNull('consent_status');
                    })->whereDoesntHave('consentRecord', function ($cr) {
                        $cr->where('status', 'completed');
                    });
                });
            }
        }

        // Apply Source filter
        if ($request->filled('source')) {
            $query->where('source', $request->get('source'));
        }

        // Apply Move In Status filter
        if ($request->filled('move_in_status')) {
            $moveInStatus = $request->get('move_in_status');
            if ($moveInStatus === 'pending') {
                $query->where(function ($q) {
                    $q->whereNull('move_in_status')
                      ->orWhere('move_in_status', '')
                      ->orWhere('move_in_status', 'pending');
                });
            } else {
                $query->where('move_in_status', $moveInStatus);
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = strtolower($request->get('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'email', 'status', 'created_at', 'property_name', 'source', 'move_in_status', 'payment_status', 'consent_status'];

        if ($sortBy === 'applicant') {
            $query->leftJoin('personal_information', 'applicants.id', '=', 'personal_information.applicant_id')
                ->select('applicants.*')
                ->orderBy('personal_information.first_name', $sortDir);
        } elseif (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        // Get paginated results (15 per page)
        $applicants = $query->paginate(15);

        // Preserve all query parameters in pagination links
        $applicants->appends($request->only([
            'search', 'status', 'type', 'sort_by', 'sort_dir',
            'from_date', 'to_date', 'payment_status', 'consent_status', 'source', 'move_in_status'
        ]));

        // Get TOTAL counts from database (without pagination limit)
        $totalAdmin = Applicant::where('type', 'admin')->count();
        $totalSuperAdmin = Applicant::where('type', 'superadmin')->count();
        $submittedCount = Applicant::where('status', 'submitted')->count();

        return Inertia::render('Admin/Applications', [
            'applicants' => $applicants,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'type' => $request->get('type', ''),
                'from_date' => $request->get('from_date', ''),
                'to_date' => $request->get('to_date', ''),
                'payment_status' => $request->get('payment_status', ''),
                'consent_status' => $request->get('consent_status', ''),
                'source' => $request->get('source', ''),
                'move_in_status' => $request->get('move_in_status', ''),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'total_admin' => $totalAdmin,
            'total_superadmin' => $totalSuperAdmin,
            'submitted_count' => $submittedCount,
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
            'consentRecord',
            'payments',
            'property'
        ])->findOrFail($id);

        $applicant->is_consent_completed = $applicant->consentRecord?->status === 'completed';


        return Inertia::render('Admin/ApplicationDetail', [
            'applicant' => $applicant
        ]);
    }

    public function sendSms(Request $request, $id)
    {
        $request->validate([
            'phone' => 'nullable|string|max:30',
            'message' => 'required|string|max:1000',
        ]);

        $applicant = Applicant::with(['personalInformation'])->findOrFail($id);

        $phone = $request->phone ?: $applicant->personalInformation?->phone;

        if (empty($phone)) {
            return redirect()->back()->withErrors([
                'phone' => 'No phone number available for this applicant. Please enter a valid phone number.'
            ]);
        }

        $twilioService = app(\App\Services\TwilioService::class);
        $result = $twilioService->sendSms($phone, $request->message);

        if ($result['success']) {
            $applicant->update([
                'reminder_sent_count' => ($applicant->reminder_sent_count ?? 0) + 1,
                'last_reminder_sent_at' => now(),
            ]);

            return redirect()->back()->with('success', 'SMS reminder sent successfully to ' . ($result['to'] ?? $phone) . '!');
        }

        return redirect()->back()->withErrors([
            'sms_error' => 'Failed to send SMS: ' . ($result['error'] ?? 'Unknown Twilio error')
        ]);
    }

    public function sendEmailReminder(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
        ]);

        $applicant = Applicant::with(['personalInformation'])->findOrFail($id);

        if ($applicant->reminders_opted_out) {
            return redirect()->back()->withErrors([
                'email_error' => 'Cannot send reminder: This tenant has opted out / deactivated email reminders.'
            ]);
        }

        $email = trim($request->email);

        $subject = trim($request->subject);
        $messageBody = trim($request->message);

        // Update email if different from stored
        if (!empty($email) && $applicant->email !== $email) {
            $applicant->email = $email;
        }

        $success = $this->emailService->sendTenantReminder(
            $applicant,
            $subject,
            $messageBody,
            ($applicant->reminder_sent_count ?? 0) + 1,
            false
        );

        if ($success) {
            return redirect()->back()->with('success', "Email reminder sent successfully to {$email}!");
        }

        return redirect()->back()->withErrors([
            'email_error' => "Failed to send email reminder to {$email}. Please verify SMTP settings and email address."
        ]);
    }

    /**
     * Toggle automated reminders status (deactivate or reactivate) by admin
     */
    public function toggleReminders(Request $request, $id)
    {
        $applicant = Applicant::findOrFail($id);
        $newState = !$applicant->reminders_opted_out;
        $applicant->update([
            'reminders_opted_out' => $newState,
            'reminder_opt_out_at' => $newState ? now() : null,
        ]);

        $statusText = $newState ? 'deactivated' : 're-activated';
        return redirect()->back()->with('success', "Automated reminders successfully {$statusText} for Applicant #{$applicant->id}.");
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
        $userId = $applicant->user_id;

        // Delete application records & files
        $applicant->delete();

        // Safely delete associated tenant user account if exists
        if ($userId) {
            $associatedUser = \App\Models\User::find($userId);
            if ($associatedUser && !in_array($associatedUser->role, ['admin', 'superadmin'])) {
                $associatedUser->delete();
            }
        }

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

    public function updatePropertyDetails(Request $request, $id)
    {
        $request->validate([
            'property_name' => 'required|string|max:255',
            'property_id' => 'nullable',
            'property_code' => 'nullable|string|max:50',
            'property_type' => 'nullable|string|max:255',
            'desired_move_date' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'source_other' => 'nullable|string|max:255',
        ]);

        $applicant = Applicant::findOrFail($id);

        $applicant->update([
            'property_id' => $request->property_id !== null && $request->property_id !== '' ? $request->property_id : null,
            'property_code' => $request->property_code !== null && $request->property_code !== '' ? $request->property_code : null,
            'property_name' => $request->property_name,
            'property_type' => $request->property_type,
            'desired_move_date' => $request->desired_move_date,
            'source' => $request->source,
            'source_other' => $request->source === 'Other' ? $request->source_other : null,
        ]);

        return redirect()->back()->with('success', 'Property & move-in details updated successfully.');
    }

    public function export(Request $request)
    {
        $query = Applicant::with(['personalInformation', 'currentAddress', 'consentRecord', 'property']);

        if ($request->has('type') && in_array($request->get('type'), ['admin', 'superadmin'])) {
            $query->where('type', $request->get('type'));
        }

        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('property_name', 'like', "%{$search}%")
                    ->orWhere('property_code', 'like', "%{$search}%")
                    ->orWhereHas('property', function ($qp) use ($search) {
                        $qp->where('property_code', 'like', "%{$search}%");
                    })
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

        // Apply Date Range filter
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->get('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->get('to_date'));
        }

        // Apply Payment Status filter
        if ($request->filled('payment_status')) {
            $payStatus = $request->get('payment_status');
            if ($payStatus === 'paid') {
                $query->where('payment_status', 'paid');
            } elseif ($payStatus === 'unpaid') {
                $query->where(function ($q) {
                    $q->where('payment_status', '!=', 'paid')
                      ->orWhereNull('payment_status');
                });
            } elseif ($payStatus === 'pending') {
                $query->where(function ($q) {
                    $q->where('payment_status', 'pending')
                      ->orWhereNull('payment_status');
                });
            } else {
                $query->where('payment_status', $payStatus);
            }
        }

        // Apply Consent Status filter
        if ($request->filled('consent_status')) {
            $cStatus = $request->get('consent_status');
            if ($cStatus === 'completed') {
                $query->where(function ($q) {
                    $q->where('consent_status', 'completed')
                      ->orWhereHas('consentRecord', function ($cr) {
                          $cr->where('status', 'completed');
                      });
                });
            } elseif ($cStatus === 'pending') {
                $query->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->where('consent_status', '!=', 'completed')
                            ->orWhereNull('consent_status');
                    })->whereDoesntHave('consentRecord', function ($cr) {
                        $cr->where('status', 'completed');
                    });
                });
            }
        }

        // Apply Source filter
        if ($request->filled('source')) {
            $query->where('source', $request->get('source'));
        }

        // Apply Move In Status filter
        if ($request->filled('move_in_status')) {
            $moveInStatus = $request->get('move_in_status');
            if ($moveInStatus === 'pending') {
                $query->where(function ($q) {
                    $q->whereNull('move_in_status')
                      ->orWhere('move_in_status', '')
                      ->orWhere('move_in_status', 'pending');
                });
            } else {
                $query->where('move_in_status', $moveInStatus);
            }
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = strtolower($request->get('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'email', 'status', 'created_at', 'property_name', 'source', 'move_in_status', 'payment_status', 'consent_status'];

        if ($sortBy === 'applicant') {
            $query->leftJoin('personal_information', 'applicants.id', '=', 'personal_information.applicant_id')
                ->select('applicants.*')
                ->orderBy('personal_information.first_name', $sortDir);
        } elseif (in_array($sortBy, $allowedSorts)) {
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

        $columns = ['ID', 'Type', 'Property Name', 'Property Code', 'Source', 'Name', 'Email', 'Phone', 'Status', 'Consent Status', 'Payment Status', 'Move In Status', 'Created At'];

        $callback = function() use($applicants, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($applicants as $app) {
                $sourceVal = $app->source;
                if ($sourceVal === 'Other' && !empty($app->source_other)) {
                    $sourceVal = 'Other: ' . $app->source_other;
                }

                $resolvedPropertyCode = 'N/A';
                if (!empty($app->property?->property_code)) {
                    $resolvedPropertyCode = (string)$app->property->property_code;
                } elseif (!empty($app->property_code)) {
                    $resolvedPropertyCode = (string)$app->property_code;
                }

                $moveInStatusVal = $app->move_in_status === 'moved_in' ? 'Moved In' : ($app->move_in_status === 'denied' ? 'Denied' : 'Pending');

                $row['ID'] = $app->id;
                $row['Type'] = $app->type === 'admin' ? 'Triumph' : ($app->type === 'superadmin' ? 'Excel' : 'User');
                $row['Property Name'] = $app->property_name ?: ($app->property?->property_name ?? 'N/A');
                $row['Property Code'] = $resolvedPropertyCode;
                $row['Source'] = $sourceVal ?: 'N/A';

                $row['Name'] = $app->personalInformation ? $app->personalInformation->first_name . ' ' . $app->personalInformation->last_name : 'N/A';
                $row['Email'] = $app->email ?? 'N/A';
                $row['Phone'] = $app->personalInformation ? $app->personalInformation->phone : 'N/A';
                $row['Status'] = $app->status;
                $row['Consent Status'] = $app->consentRecord && $app->consentRecord->status === 'completed' ? 'Completed' : 'Pending';
                $row['Payment Status'] = $app->payment_status;
                $row['Move In Status'] = $moveInStatusVal;
                $row['Created At'] = $app->created_at->format('Y-m-d H:i:s');

                fputcsv($file, array(
                    $row['ID'],
                    $row['Type'],
                    $row['Property Name'],
                    $row['Property Code'],
                    $row['Source'],
                    $row['Name'],
                    $row['Email'],
                    $row['Phone'],
                    $row['Status'],
                    $row['Consent Status'],
                    $row['Payment Status'],
                    $row['Move In Status'],
                    $row['Created At']
                ));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function updateMoveInStatus(Request $request, $id)
    {
        $request->validate([
            'move_in_status' => 'nullable|string|in:moved_in,denied,pending,',
        ]);

        $applicant = Applicant::findOrFail($id);
        $statusVal = $request->input('move_in_status');
        $applicant->move_in_status = ($statusVal === '' || $statusVal === 'pending') ? null : $statusVal;
        $applicant->save();

        return redirect()->back()->with('success', 'Move-in status updated successfully.');
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

            $filePath = 'documents/' . $sessionId . '/' . $fileName;

            // Encrypt file contents before saving to private storage
            $encryptedContent = \Illuminate\Support\Facades\Crypt::encrypt(file_get_contents($file->getRealPath()));
            \Illuminate\Support\Facades\Storage::disk('local')->put($filePath, $encryptedContent);

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

            return redirect()->back()->with('success', 'Document uploaded and encrypted successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Admin document upload error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to upload document: ' . $e->getMessage());
        }
    }

    public function deleteDocument($id, $documentId)
    {
        try {
            $document = \App\Models\ApplicantDocument::where('applicant_id', $id)->findOrFail($documentId);

            // Delete physical file safely from disk
            $document->deletePhysicalFile();

            $document->delete();

            return redirect()->back()->with('success', 'Document deleted successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Admin delete document error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete document: ' . $e->getMessage());
        }
    }
}
