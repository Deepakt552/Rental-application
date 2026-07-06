<?php

namespace App\Http\Controllers;

use App\Http\Requests\Step1ConsentRequest;
use App\Http\Requests\Step2ConsentRequest;
use App\Http\Requests\Step3ConsentRequest;
use App\Models\ConsentRecord;
use App\Services\ConsentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\PDFConsentService;

class ConsentController extends Controller
{
    protected $consentService;
    protected $pdfService;

    public function __construct(ConsentService $consentService, PDFConsentService $pdfService)
    {
        $this->consentService = $consentService;
        $this->pdfService = $pdfService;
    }

    private function checkConsentAccessAndPayment($sessionId, $checkPayment = true)
    {
        $applicant = null;
        $record = ConsentRecord::where('session_id', $sessionId)->first();
        if ($record && $record->applicant_id) {
            $applicant = \App\Models\Applicant::find($record->applicant_id);
        }
        if (!$applicant) {
            $applicant = \App\Models\Applicant::where('session_id', $sessionId)->first();
        }

        if (!$applicant) {
            return ['allowed' => true];
        }

        $user = Auth::user();
        $isAdmin = $user && ($user->isAdmin() || $user->isSuperAdmin());

        // Authorization check
        if ($user) {
            if (!$isAdmin && $applicant->user_id !== $user->id) {
                return ['allowed' => false, 'error_code' => 403, 'message' => 'Unauthorized'];
            }
        } else {
            if ($applicant->user_id !== null) {
                return ['allowed' => false, 'error_code' => 403, 'message' => 'Unauthorized'];
            }
        }

        // Payment check
        if ($checkPayment && $applicant->payment_status === 'paid' && !$isAdmin) {
            return ['allowed' => false, 'error_code' => 403, 'message' => 'You cannot modify your consent form after payment has been completed.'];
        }

        return ['allowed' => true, 'applicant' => $applicant];
    }

    /**
     * Display the consent form
     */
    public function index(Request $request)
    {
        try {
            // Get applicant and type
            $applicant = null;
            $applicantType = 'admin';
            if (auth()->check()) {
                $applicant = \App\Models\Applicant::where('user_id', auth()->id())->with('consentRecord')->latest()->first();
                if ($applicant) {
                    $applicantType = $applicant->type;
                }
            }

            // Get session ID from query parameter or session
            $sessionId = $request->get('session_id') ?? session('consent_session_id');

            // If no session ID exists but we have an applicant with a record, use that
            if (!$sessionId && $applicant && $applicant->consentRecord) {
                $sessionId = $applicant->consentRecord->session_id;
            }

            if ($sessionId) {
                $access = $this->checkConsentAccessAndPayment($sessionId, false);
                if (!$access['allowed']) {
                    return redirect()->route('dashboard')->with('error', $access['message']);
                }
                $resolvedApplicant = $access['applicant'] ?? null;
                if ($resolvedApplicant && $resolvedApplicant->payment_status === 'paid' && !(Auth::check() && (Auth::user()->isAdmin() || Auth::user()->isSuperAdmin()))) {
                    return redirect()->route('dashboard')->with('error', 'Consent form cannot be modified after payment is completed.');
                }
            }

            // If still no session ID, create a new one
            if (!$sessionId) {
                $sessionId = (string) Str::uuid();
                if ($applicant) {
                    // Only create a pending record if there is no completed record yet
                    $existingCompleted = ConsentRecord::where('applicant_id', $applicant->id)
                        ->where('status', 'completed')
                        ->exists();
                    if (!$existingCompleted) {
                        ConsentRecord::updateOrCreate(
                            ['applicant_id' => $applicant->id],
                            ['session_id' => $sessionId, 'status' => 'pending']
                        );
                    }
                }
            }

            session(['consent_session_id' => $sessionId]);

            // Get existing consent data for this session
            $consentData = $this->consentService->getConsentData($sessionId);

            $resolvedApplicant = null;
            if (isset($access) && isset($access['applicant'])) {
                $resolvedApplicant = $access['applicant'];
            }
            if (!$resolvedApplicant) {
                $record = ConsentRecord::where('session_id', $sessionId)->first();
                if ($record && $record->applicant_id) {
                    $resolvedApplicant = \App\Models\Applicant::find($record->applicant_id);
                }
            }

            return Inertia::render('Consent/Form', [
                'sessionId' => $sessionId,
                'applicantId' => $resolvedApplicant ? $resolvedApplicant->id : null,
                'step1Data' => $consentData['step1'],
                'step2Data' => $consentData['step2'],
                'step3Data' => $consentData['step3'],
                'applicantType' => $applicantType
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading consent form: ' . $e->getMessage());
            return back()->with('error', 'Unable to load consent form. Please try again.');
        }
    }
    public function indexExcel(Request $request)
    {

        try {
            // Get session ID from query parameter or session


            // If no session ID exists, create a new one

            $sessionId = (string) Str::uuid();
            session(['consent_session_id' => $sessionId]);


            // Get existing consent data for this session
            $sessionId = $request->query('session_id') ?? session('consent_session_id');

            // If no session ID exists, create a new one
            if (!$sessionId) {
                $sessionId = (string) Str::uuid();
                session(['consent_session_id' => $sessionId]);
            }

            return Inertia::render('Consent/ExcelForm', [
                'sessionId' => $sessionId,

            ]);
        } catch (\Exception $e) {
            Log::error('Error loading consent form: ' . $e->getMessage());
            return back()->with('error', 'Unable to load consent form. Please try again.');
        }
    }

    /**
     * Save Step 1 data
     */
    public function saveStep1(Step1ConsentRequest $request)
    {
        // dd($request->all());


        try {
            $validated = $request->validated();
            $sessionId = $validated['session_id'];

            $access = $this->checkConsentAccessAndPayment($sessionId, true);
            if (!$access['allowed']) {
                return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
            }

            // Save step 1 data
            $this->consentService->saveStep1($sessionId, $validated);

            // Store session ID in Laravel session
            session(['consent_session_id' => $sessionId]);

            return response()->json([
                'success' => true,
                'message' => 'Step 1 saved successfully',
                'session_id' => $sessionId
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving step 1: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save step 1. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function saveExcel(Step1ConsentRequest $request)
    {




        $type = 'superadmin';
        try {
            $validated = $request->validated();
            $sessionId = $validated['session_id'];

            $access = $this->checkConsentAccessAndPayment($sessionId, true);
            if (!$access['allowed']) {
                return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
            }

            // Save step 1 data


            $this->consentService->saveStep1($sessionId, $validated, $type);


            $pdfPath = $this->pdfService->generateConsentexcelPDF($sessionId);
            ConsentRecord::updateOrCreate(
                [
                    'session_id' => $sessionId
                ],
                [
                    'consent_pdf_path' => $pdfPath,
                    'status' => 'completed',
                    'completed_at' => now(),
                ]
            );

            // Store session ID in Laravel session
            session(['consent_session_id' => $sessionId]);


            return response()->json([
                'success' => true,
                'message' => 'Applicant saved successfully',
                'session_id' => $sessionId
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving step 1: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save step 1. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save Step 2 data
     */
    public function saveStep2(Step2ConsentRequest $request)
    {
        try {
            $validated = $request->validated();
            $sessionId = $validated['session_id'];

            $access = $this->checkConsentAccessAndPayment($sessionId, true);
            if (!$access['allowed']) {
                return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
            }

            // Save step 2 data
            $this->consentService->saveStep2($sessionId, $validated);

            // Store session ID in Laravel session
            session(['consent_session_id' => $sessionId]);

            return response()->json([
                'success' => true,
                'message' => 'Step 2 saved successfully',
                'session_id' => $sessionId
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving step 2: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save step 2. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save Step 3 data
     */
    public function saveStep3(Step3ConsentRequest $request)
    {

        try {
            $validated = $request->validated();
            $sessionId = $validated['session_id'];

            $access = $this->checkConsentAccessAndPayment($sessionId, true);
            if (!$access['allowed']) {
                return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
            }

            DB::beginTransaction();
            // Generate PDF immediately after step 3

            // Save step 3 data
            $this->consentService->saveStep3($sessionId, $validated);

            $pdfPath = $this->pdfService->generateConsentPDF($sessionId);



            // Store PDF path in session for later use
            session(['consent_pdf_path' => $pdfPath]);
            session(['consent_session_id' => $sessionId]);
            session(['consent_completed' => true]);


            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Step 3 saved successfully. PDF generated.',
                'session_id' => $sessionId,
                'pdf_generated' => true
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error saving step 3: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save step 3. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function completeAndDownload(Request $request)
    // {
    //     try {
    //         $sessionId = $request->input('session_id') ?? session('consent_session_id');

    //         if (!$sessionId) {
    //             return response()->json(['error' => 'Session not found'], 404);
    //         }

    //         // Generate PDF content
    //         $pdfContent = $this->pdfService->generateConsentPDF($sessionId);

    //         if (!$pdfContent) {
    //             return response()->json(['error' => 'Failed to generate PDF'], 500);
    //         }

    //         // Debug - log PDF size
    //         Log::info("PDF size: " . strlen($pdfContent) . " bytes");

    //         // Return PDF with correct headers
    //         return response($pdfContent)
    //             ->header('Content-Type', 'application/pdf')
    //             ->header('Content-Disposition', 'attachment; filename="consent_form_' . $sessionId . '.pdf"')
    //             ->header('Content-Length', strlen($pdfContent))
    //             ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
    //             ->header('Pragma', 'no-cache')
    //             ->header('Expires', '0');
    //     } catch (\Exception $e) {
    //         Log::error('Error downloading PDF: ' . $e->getMessage());
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }



    public function completeAndDownload(Request $request)
    {
        try {

            $sessionId = $request->input('session_id')
                ?? session('consent_session_id');

            if (!$sessionId) {
                return response()->json([
                    'error' => 'Session not found'
                ], 404);
            }

            // Generate PDF and get path
            $pdfPath = $this->pdfService->generateConsentPDF($sessionId);

            if (!$pdfPath) {
                return response()->json([
                    'error' => 'Failed to generate PDF'
                ], 500);
            }

            // Full storage path
            $fullPath = storage_path('app/public/' . $pdfPath);

            if (!file_exists($fullPath)) {
                return response()->json([
                    'error' => 'PDF file not found'
                ], 404);
            }

            return response()->download(
                $fullPath,
                'consent_form_' . $sessionId . '.pdf',
                [
                    'Content-Type' => 'application/pdf',
                ]
            );
        } catch (\Exception $e) {

            Log::error('Error downloading PDF: ' . $e->getMessage());

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * View PDF in browser
     */

    /**
     * Get specific step data (for autosave recovery)
     */
    public function getStepData(Request $request, $step)
    {
        try {
            $sessionId = $request->input('session_id') ?? session('consent_session_id');

            if (!$sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No session found'
                ], 404);
            }

            $consentData = $this->consentService->getConsentData($sessionId);
            $stepKey = "step{$step}";

            return response()->json([
                'success' => true,
                'data' => $consentData[$stepKey] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching step data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch step data'
            ], 500);
        }
    }

    /**
     * Complete consent process and redirect to rental application
     */
    public function completeConsent(Request $request)
    {
        // dd($request->all());
        try {
            $sessionId = $request->input('session_id') ?? session('consent_session_id');

            if ($sessionId) {
                $access = $this->checkConsentAccessAndPayment($sessionId, true);
                if (!$access['allowed']) {
                    if ($request->wantsJson()) {
                        return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
                    }
                    return redirect()->route('dashboard')->with('error', $access['message']);
                }
            }

            if (!$sessionId) {
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => 'Session not found'], 404);
                }
                return redirect()->route('consent.index')
                    ->with('error', 'Session not found. Please start over.');
            }

            // Get applicant type
            $applicant = null;
            $applicantType = 'admin';
            if (auth()->check()) {
                $applicant = \App\Models\Applicant::where('user_id', auth()->id())->latest()->first();
            }

            if (!$applicant && session('current_applicant_id')) {
                $applicant = \App\Models\Applicant::find(session('current_applicant_id'));
            }

            if (!$applicant) {
                $tenantConsent = \App\Models\ApplicantTenantConsent::where('session_id', $sessionId)->first();
                if ($tenantConsent) {
                    $fullName = $tenantConsent->applicant_name;
                    $parts = explode(' ', $fullName);
                    if (count($parts) >= 2) {
                        $firstName = $parts[0];
                        $lastName = $parts[count($parts) - 1];
                        $personalInfo = \App\Models\PersonalInformation::where('first_name', $firstName)
                            ->where('last_name', $lastName)
                            ->latest()
                            ->first();
                        if ($personalInfo) {
                            $applicant = $personalInfo->applicant;
                        }
                    }
                }
            }

            if ($applicant) {
                $applicantType = $applicant->type;
            }

            // Verify that all steps have data
            $consentData = $this->consentService->getConsentData($sessionId);

            $isExcel = ($applicantType === 'superadmin') || $request->input('is_excel');

            if ($isExcel) {
                $isComplete = $consentData['step1']['applicant_tenant'] !== null;
            } else {
                $isComplete = $consentData['step1']['applicant_tenant'] !== null &&
                    !empty($consentData['step2']['applicants']) &&
                    $consentData['step3']['head_of_household'] !== null;
            }

            if (!$isComplete) {
                Log::info("Consent not complete for session " . $sessionId);
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => 'Please complete all consent forms before proceeding.'], 400);
                }
                return redirect()->route('consent.index')
                    ->with('warning', 'Please complete all consent forms before proceeding.');
            }

            // Update ConsentRecord
            // $record = ConsentRecord::where('session_id', $sessionId)->first();
            // if (!$record) {
            //     $record = ConsentRecord::create([
            //         'session_id' => $sessionId,
            //         'applicant_id' => $applicant ? $applicant->id : null,
            //         'status' => 'pending'
            //     ]);
            // }
            Log::info("Updating consent record for session " . $sessionId . ", applicant ID: " . ($applicant ? $applicant->id : 'None'));

            // Fetch any existing record first so we can preserve the pdf path
            $record = ConsentRecord::where('session_id', $sessionId)->first();

            if ($applicant) {
                $recordByApplicant = ConsentRecord::where('applicant_id', $applicant->id)->first();
                if ($recordByApplicant) {
                    if ($record) {
                        if ($record->id !== $recordByApplicant->id) {
                            $recordByApplicant->delete();
                        }
                    } else {
                        $record = $recordByApplicant;
                    }
                }
            } else {
                if ($record && $record->applicant_id) {
                    $applicant = \App\Models\Applicant::find($record->applicant_id);
                    if ($applicant) {
                        $applicantType = $applicant->type ?? 'admin';
                    }
                }
            }

            $pdfPath = session('consent_pdf_path') ?? $record?->consent_pdf_path;

            if ($record) {
                $record->update([
                    'session_id' => $sessionId,
                    'applicant_id' => $applicant ? $applicant->id : null,
                    'status' => 'completed',
                    'completed_at' => now(),
                    'consent_pdf_path' => $pdfPath
                ]);
            } else {
                $record = ConsentRecord::create([
                    'session_id' => $sessionId,
                    'applicant_id' => $applicant ? $applicant->id : null,
                    'status' => 'completed',
                    'completed_at' => now(),
                    'consent_pdf_path' => $pdfPath
                ]);
            }
                // Clean up any stale pending rows for the same applicant so hasOne
                // never returns a pending record instead of the completed one.
                $finalApplicantId = $applicant ? $applicant->id : $record->applicant_id;
                if ($finalApplicantId) {
                    ConsentRecord::where('applicant_id', $finalApplicantId)
                        ->where('status', 'pending')
                        ->where('id', '!=', $record->id)
                        ->delete();
                    // Also clean up any NULL-applicant rows sharing the same session family
                    // (created before the applicant was resolved)
                    ConsentRecord::whereNull('applicant_id')
                        ->where('status', 'pending')
                        ->where('session_id', '!=', $sessionId)
                        ->whereIn('session_id', function ($q) use ($finalApplicantId) {
                            // session IDs previously linked to this applicant (now orphaned)
                            $q->select('session_id')
                              ->from('consent_records')
                              ->where('applicant_id', $finalApplicantId);
                        })
                        ->delete();
                }

                // Send emails if application is also submitted
                if ($applicant && $applicant->status === 'submitted') {
                    $emailService = app(\App\Services\EmailService::class);
                    $emailService->sendAllApplicationEmails($applicant, $applicantType);
                    Log::info("Email sent from completeConsent for applicant " . $applicant->id);
                } else {
                    Log::info("Email not sent from completeConsent. Applicant exists: " . ($applicant ? 'Yes' : 'No') . ", Status: " . ($applicant ? $applicant->status : 'N/A') . " for session " . $sessionId);
                }

            // Store consent session ID in regular session for rental application
            session(['consent_completed' => true]);
            session(['consent_session_id' => $sessionId]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Consent completed successfully',
                    'applicant_id' => $applicant ? $applicant->id : ($record ? $record->applicant_id : null)
                ]);
            }

            // Redirect to dashboard
            return redirect()->route('dashboard');
        } catch (\Exception $e) {
            Log::error('Error completing consent: ' . $e->getMessage());
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Error completing consent'], 500);
            }
            return redirect()->route('consent.index')
                ->with('error', 'Unable to complete consent process. Please try again.');
        }
    }

    /**
     * Get consent status for a session
     */
    public function getStatus(Request $request)
    {
        try {
            $sessionId = $request->input('session_id') ?? session('consent_session_id');

            if (!$sessionId) {
                return response()->json([
                    'has_data' => false,
                    'completed_steps' => []
                ]);
            }

            $consentData = $this->consentService->getConsentData($sessionId);

            $completedSteps = [];
            if ($consentData['step1']['applicant_tenant']) $completedSteps[] = 1;
            if (!empty($consentData['step2']['applicants'])) $completedSteps[] = 2;
            if ($consentData['step3']['head_of_household']) $completedSteps[] = 3;

            return response()->json([
                'has_data' => count($completedSteps) > 0,
                'completed_steps' => $completedSteps
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting consent status: ' . $e->getMessage());
            return response()->json([
                'has_data' => false,
                'completed_steps' => []
            ]);
        }
    }

    /**
     * View PDF in browser
     */
    public function viewPdf(\App\Models\Applicant $applicant)
    {
        // Only allow if authorized
        if (Auth::id() !== $applicant->user_id && Auth::user()->role !== 'admin' && Auth::user()->role !== 'superadmin') {
            abort(403);
        }

        $record = $applicant->consentRecord;
        if (!$record || !$record->session_id) {
            abort(404, 'Consent record not found');
        }

        // Check if it's excel or normal
        if ($applicant->type === 'superadmin') {
            $pdfPath = $this->pdfService->generateConsentexcelPDF($record->session_id);
        } else {
            $pdfPath = $this->pdfService->generateConsentPDF($record->session_id);
        }

        if (!$pdfPath) {
            abort(500, 'Failed to generate PDF');
        }

        $fullPath = storage_path('app/public/' . $pdfPath);
        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="consent_' . $applicant->id . '.pdf"'
        ]);
    }
}
