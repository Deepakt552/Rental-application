<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\PersonalInformation;
use App\Models\CurrentAddress;
use App\Models\PreviousAddress;
use App\Models\Employment;
use App\Models\PreviousEmployment;
use App\Models\Screening;
use App\Models\Pet;
use App\Models\Vehicle;
use App\Models\EmergencyContact;
use App\Models\HouseholdMember;
use App\Models\ApplicantDocument;
use App\Services\EmailService;
use App\Http\Requests\StoreApplicationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Services\PDFService;

class ApplicationController extends Controller
{
    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    private function checkApplicantAccessAndPayment($applicantId, $checkPayment = true)
    {
        $applicant = Applicant::find($applicantId);
        if (!$applicant) {
            return ['allowed' => false, 'error_code' => 404, 'message' => 'Applicant not found'];
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
            return ['allowed' => false, 'error_code' => 403, 'message' => 'You cannot modify your application after payment has been completed.'];
        }

        return ['allowed' => true, 'applicant' => $applicant];
    }

    public function index(Request $request)
    {
        $applicantId = $request->query('applicant_id');
        $applicant = null;
        if ($applicantId) {
            $access = $this->checkApplicantAccessAndPayment($applicantId, false);
            if (!$access['allowed']) {
                abort($access['error_code'], $access['message']);
            }
            $applicant = $access['applicant'];
        }

        if (!$applicant && Auth::check()) {
            $applicant = Applicant::where('user_id', Auth::id())
                ->where('status', 'draft')
                ->latest()
                ->first();
        }

        if ($applicant && $applicant->payment_status === 'paid' && !(Auth::check() && (Auth::user()->isAdmin() || Auth::user()->isSuperAdmin()))) {
            return redirect()->route('dashboard')->with('error', 'You cannot modify your application after payment has been completed.');
        }

        // Determine session ID
        if ($applicant) {
            $sessionId = $applicant->session_id;
            $consentSessionId = $applicant->consentRecord?->session_id ?? $applicant->session_id;
        } else {
            $sessionId = (string) Str::uuid();
            $consentSessionId = $sessionId;
        }

        session(['consent_session_id' => $consentSessionId]);

        return Inertia::render('Application/Form', [
            'type' => 'admin',
            'sessionId' => $sessionId,
            'initialApplicantId' => $applicant ? $applicant->id : null,
            'initialStep' => $applicant ? ($applicant->current_step > 10 ? 1 : $applicant->current_step) : null,
        ]);
    }

    public function indexExcel(Request $request)
    {
        $applicantId = $request->query('applicant_id');
        $applicant = null;
        if ($applicantId) {
            $access = $this->checkApplicantAccessAndPayment($applicantId, false);
            if (!$access['allowed']) {
                abort($access['error_code'], $access['message']);
            }
            $applicant = $access['applicant'];
        }

        if (!$applicant && Auth::check()) {
            $applicant = Applicant::where('user_id', Auth::id())
                ->where('status', 'draft')
                ->latest()
                ->first();
        }

        if ($applicant && $applicant->payment_status === 'paid' && !(Auth::check() && (Auth::user()->isAdmin() || Auth::user()->isSuperAdmin()))) {
            return redirect()->route('dashboard')->with('error', 'You cannot modify your application after payment has been completed.');
        }

        // Determine session ID
        if ($applicant) {
            $sessionId = $applicant->session_id;
            $consentSessionId = $applicant->consentRecord?->session_id ?? $applicant->session_id;
        } else {
            $sessionId = (string) Str::uuid();
            $consentSessionId = $sessionId;
        }

        session(['consent_session_id' => $consentSessionId]);

        return Inertia::render('Application/Form', [
            'type' => 'superadmin',
            'sessionId' => $sessionId,
            'initialApplicantId' => $applicant ? $applicant->id : null,
            'initialStep' => $applicant ? ($applicant->current_step > 10 ? 1 : $applicant->current_step) : null,
        ]);
    }

    /**
     * Initialize application - Create applicant on first step
     */
    public function initApplication(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'nullable|string',
            'company_name' => 'nullable|string',
            'property_id' => 'nullable',
            'property_name' => 'nullable|string',
            'property_type' => 'nullable|string',
            'desired_move_date' => 'nullable|date',
        ]);

        // Check duplicate email
        $existingApplicant = Applicant::where('email', $request->email)
            ->where('status', '!=', 'draft')
            ->first();

        if ($existingApplicant) {
            return response()->json([
                'success' => false,
                'message' => 'An application with this email has already been submitted. Please use a different email address.'
            ], 422);
        }

        // If a draft already exists, reuse it
        $draft = Applicant::where('email', $request->email)
            ->where('status', 'draft')
            ->first();

        if ($draft) {
            $user = Auth::user();
            if ($draft->user_id !== null && (!$user || $draft->user_id !== $user->id) && !($user && ($user->isAdmin() || $user->isSuperAdmin()))) {
                return response()->json([
                    'success' => false,
                    'message' => 'An application with this email already exists.'
                ], 422);
            }
            session(['current_applicant_id' => $draft->id]);
            return response()->json([
                'success' => true,
                'applicant_id' => $draft->id,
                'session_id' => $draft->session_id,
                'current_step' => $draft->current_step ?? 1
            ]);
        }

        // Create new applicant
        $applicant = Applicant::create([
            'email' => $request->email,
            'session_id' => (string) Str::uuid(),
            'current_step' => 1,
            'status' => 'draft',
            'type' => $request->type ?? 'admin',


            'company_name' => $request->company_name,
            'property_id' => $request->property_id,
            'property_name' => $request->property_name,
            'property_type' => $request->property_type,
            'desired_move_date' => $request->desired_move_date,
        ]);

        session(['current_applicant_id' => $applicant->id]);

        return response()->json([
            'success' => true,
            'applicant_id' => $applicant->id,
            'session_id' => $applicant->session_id,
            'current_step' => $applicant->current_step ?? 1
        ]);
    }

    /**
     * Check if email exists (for real-time validation)
     */
    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $exists = Applicant::where('email', $request->email)
            ->where('status', '!=', 'draft')
            ->exists();

        $hasDraft = Applicant::where('email', $request->email)
            ->where('status', 'draft')
            ->exists();

        return response()->json([
            'exists' => $exists,
            'has_draft' => $hasDraft,
            'message' => $exists ? 'This email has already been submitted.' : ($hasDraft ? 'A draft already exists for this email.' : '')
        ]);
    }

    /**
     * Save Step 1: Personal Information
     */
    public function saveStep1(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'title' => 'nullable|string',
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'preferred_name' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'date_of_birth' => 'required|date|before:today|after_or_equal:-100 years',
            'phone' => 'required|string',
            'email' => 'required|email|unique:applicants,email,' . $request->applicant_id,
            'password' => Auth::check() ? 'nullable' : 'required|string|min:8|confirmed',
            'additional_persons.*.date_of_birth' => 'nullable|date|before:today|after_or_equal:-100 years',
        ], [
            'email.unique' => 'This email is already associated with another application. Please use a different email or use the "Resume" feature to continue your existing application.',
            'password.required' => 'A password is required to save your progress and allow you to resume later.'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }
        $applicant = $access['applicant'];

        try {
            DB::beginTransaction();

            // Create or Update User if not logged in
            $currentUser = Auth::user();
            $userId = $currentUser ? $currentUser->id : null;
            if (!$userId) {
                // Check if user already exists with this email
                $existingUser = User::where('email', $request->email)->first();

                if ($existingUser) {
                    // If user exists, verify password and log them in
                    if (Hash::check($request->password, $existingUser->password)) {
                        Auth::login($existingUser);
                        $userId = $existingUser->id;
                    } else {
                        return response()->json([
                            'success' => false,
                            'errors' => ['password' => ['This email is already registered. Please enter the correct password or log in first.']]
                        ], 422);
                    }
                } else {
                    $user = User::create([
                        'name' => $request->first_name . ' ' . $request->last_name,
                        'email' => $request->email,
                        'password' => Hash::make($request->password),
                        'role' => 'user'
                    ]);
                    $userId = $user->id;
                    Auth::login($user);
                }
            }

            // Update applicant with user_id
            $updateData = [
                'email' => $request->email,
                'current_step' => 2
            ];
            $currentAuthUser = Auth::user();
            $isAdminUser = $currentAuthUser && ($currentAuthUser->isAdmin() || $currentAuthUser->isSuperAdmin());
            if (!$applicant->user_id && !$isAdminUser) {
                $updateData['user_id'] = $userId;
            }
            $applicant->update($updateData);

            PersonalInformation::updateOrCreate(
                ['applicant_id' => $request->applicant_id],
                [
                    'title' => $request->title,
                    'first_name' => $request->first_name,
                    'middle_name' => $request->middle_name,
                    'last_name' => $request->last_name,
                    'preferred_name' => $request->preferred_name,
                    'marital_status' => $request->marital_status,
                    'date_of_birth' => $request->date_of_birth,
                    'phone' => $request->phone,
                    'email' => $request->email
                ]
            );

            // Save additional persons (household members)
            if ($request->has('additional_persons') && is_array($request->additional_persons)) {
                HouseholdMember::where('applicant_id', $request->applicant_id)->delete();
                foreach ($request->additional_persons as $person) {
                    if (!empty($person['full_name'])) {
                        HouseholdMember::create([
                            'applicant_id' => $request->applicant_id,
                            'full_name' => $person['full_name'] ?? null,
                            'date_of_birth' => $person['date_of_birth'] ?? null,
                            'relationship' => $person['relationship'] ?? null,
                            'phone' => $person['phone'] ?? null,
                            'email' => $person['email'] ?? null,
                            'occupation' => $person['occupation'] ?? null,
                            'is_emergency_contact' => $person['is_emergency_contact'] ?? false,
                            'notes' => $person['notes'] ?? null,
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Step 1 saved and account created successfully',
                'current_step' => 2
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Step 1 save error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 2: Current Address
     */
    public function saveStep2(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'country' => 'required|string',
            'address_line_1' => 'required|string',
            'address_line_2' => 'nullable|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip_code' => 'required|string',
            'apartment_community' => 'nullable|string',

            'residency_from_date' => 'nullable',
            'monthly_rent' => 'nullable',
            'reason_for_moving' => 'nullable|string',
            'notice_given' => 'nullable'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            CurrentAddress::updateOrCreate(
                ['applicant_id' => $request->applicant_id],
                [
                    'country' => $request->country,
                    'address_line_1' => $request->address_line_1,
                    'address_line_2' => $request->address_line_2,
                    'city' => $request->city,
                    'state' => $request->state,
                    'zip_code' => $request->zip_code,
                    'apartment_community' => $request->apartment_community,

                    'residency_from_date' => $request->residency_from_date,
                    'monthly_rent' => $request->monthly_rent,
                    'reason_for_moving' => $request->reason_for_moving,
                    'notice_given' => $request->notice_given ?? false
                ]
            );

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 3]);

            return response()->json(['success' => true, 'current_step' => 3]);
        } catch (\Exception $e) {
            Log::error('Step 2 save error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 3: Previous Address
     */
    public function saveStep3(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'previous_country' => 'nullable|string',
            'previous_address_line_1' => 'nullable|string',
            'previous_address_line_2' => 'nullable|string',
            'previous_city' => 'nullable|string',
            'previous_state' => 'nullable|string',
            'previous_zip_code' => 'nullable|string',
            'previous_apartment' => 'nullable|string',

            'previous_from_date' => 'nullable|date',
            'previous_to_date' => 'nullable|date',
            'previous_rent' => 'nullable|numeric',
            'previous_reason' => 'nullable|string'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            $data = $request->except(['applicant_id']);

            // Only save if there's data
            $hasData = !empty($data['previous_address_line_1']) || !empty($data['previous_city']);

            if ($hasData) {
                PreviousAddress::updateOrCreate(
                    ['applicant_id' => $request->applicant_id],
                    $data
                );
            }

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 4]);

            return response()->json(['success' => true, 'current_step' => 4]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 4: Employment
     */
    public function saveStep4(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'employment_country' => 'required|string',
            'employment_status' => 'nullable|string',
            'job_title' => 'nullable|string',
            'employer_name' => 'nullable|string',
            'supervisor_name' => 'nullable|string',
            'employed_since' => 'nullable',
            'monthly_income' => 'nullable',
            'additional_income' => 'nullable',
            'additional_income_source' => 'nullable|string',
            'employer_address_1' => 'nullable|string',
            'employer_address_2' => 'nullable|string',
            'employer_city' => 'nullable|string',
            'employer_state' => 'nullable|string',
            'employer_zip' => 'nullable|string',
            'employer_phone' => 'nullable|string'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            Employment::updateOrCreate(
                ['applicant_id' => $request->applicant_id],
                $request->except(['applicant_id'])
            );

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 5]);

            return response()->json(['success' => true, 'current_step' => 5]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 5: Previous Employment
     */
    public function saveStep5(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'previous_employer_name' => 'nullable|string',
            'previous_supervisor_name' => 'nullable|string',
            'previous_job_title' => 'nullable|string',
            'previous_monthly_income' => 'nullable|numeric',
            'previous_additional_income' => 'nullable|numeric',
            'previous_income_source' => 'nullable|string',
            'previous_start_date' => 'nullable|date',
            'previous_end_date' => 'nullable|date',
            'previous_employer_address_1' => 'nullable|string',
            'previous_employer_address_2' => 'nullable|string',
            'previous_employer_city' => 'nullable|string',
            'previous_employer_state' => 'nullable|string',
            'previous_employer_zip' => 'nullable|string',
            'previous_employer_phone' => 'nullable|string'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            $data = $request->except(['applicant_id']);
            $hasData = !empty($data['previous_employer_name']);

            if ($hasData) {
                PreviousEmployment::updateOrCreate(
                    ['applicant_id' => $request->applicant_id],
                    $data
                );
            }

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 6]);

            return response()->json(['success' => true, 'current_step' => 6]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 6: Screening
     */
    public function saveStep6(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'date_of_birth' => 'required|date|before:today|after:-100 years',
            'screening_country' => 'nullable|string',
            'has_ssn' => 'boolean',
            'ssn' => 'nullable|string',
            'government_id' => 'nullable|string',
            'issuing_entity' => 'nullable|string',
            'evicted' => 'boolean',
            'eviction_reason' => 'nullable|string',
            'felony' => 'boolean',
            'felony_reason' => 'nullable|string',
            'legal_case' => 'boolean',
            'legal_case_details' => 'nullable|string'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            Screening::updateOrCreate(
                ['applicant_id' => $request->applicant_id],
                $request->except(['applicant_id'])
            );

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 7]);

            return response()->json(['success' => true, 'current_step' => 7]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 7: Pets
     */
    public function saveStep7(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'pets' => 'nullable|array|max:2'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            Pet::where('applicant_id', $request->applicant_id)->delete();

            foreach ($request->pets as $pet) {
                if (!empty($pet['pet_name'])) {
                    Pet::create([
                        'applicant_id' => $request->applicant_id,
                        'pet_type' => $pet['pet_type'] ?? null,
                        'pet_name' => $pet['pet_name'] ?? null,
                        'breed' => $pet['breed'] ?? null,
                        'age' => $pet['age'] ?? null,
                        'weight' => $pet['weight'] ?? null,
                        'color' => $pet['color'] ?? null,
                        'vaccinated' => $pet['vaccinated'] ?? false,
                        'special_notes' => $pet['special_notes'] ?? null
                    ]);
                }
            }

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 8]);

            return response()->json(['success' => true, 'current_step' => 8]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 8: Vehicles
     */
    public function saveStep8(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'vehicles' => 'nullable|array|max:4'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            Vehicle::where('applicant_id', $request->applicant_id)->delete();

            foreach ($request->vehicles as $vehicle) {
                if (!empty($vehicle['model'])) {
                    Vehicle::create([
                        'applicant_id' => $request->applicant_id,
                        'vehicle_type' => $vehicle['vehicle_type'] ?? null,
                        'model' => $vehicle['model'] ?? null,
                        'plate_number' => $vehicle['plate_number'] ?? null
                    ]);
                }
            }

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 9]);

            return response()->json(['success' => true, 'current_step' => 9]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 9: Emergency Contact
     */
    public function saveStep9(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'full_name' => 'required|string',
            'relationship' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'country' => 'nullable|string',
            'address_line_1' => 'nullable|string',
            'address_line_2' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'zip_code' => 'nullable|string'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            EmergencyContact::updateOrCreate(
                ['applicant_id' => $request->applicant_id],
                $request->except(['applicant_id'])
            );

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 10]);

            return response()->json(['success' => true, 'current_step' => 10]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Save Step 10: Documents (with file upload)
     */
    public function saveStep10(Request $request)
    {
  
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'documents.driving_license' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.pay_check.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.bank_statement.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.social_security_card' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.other_source_of_income.file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.other_source_of_income.description' => 'nullable|string',
            'documents.other.file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.other.description' => 'nullable|string'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        try {
            $applicant = Applicant::find($request->applicant_id);
            $sessionId = $applicant->session_id;

            $documentConfigs = [
                'driving_license' => [
                    'has_description' => false,
                    'multiple' => false
                ],

                'pay_check' => [
                    'has_description' => false,
                    'multiple' => true
                ],

                'bank_statement' => [
                    'has_description' => false,
                    'multiple' => true
                ],

                'social_security_card' => [
                    'has_description' => false,
                    'multiple' => false
                ],

                'other_source_of_income' => [
                    'has_description' => true,
                    'multiple' => false,
                    'description_key' => 'description'
                ],

                'other' => [
                    'has_description' => true,
                    'multiple' => false,
                    'description_key' => 'description'
                ]
            ];

            foreach ($documentConfigs as $documentType => $config) {

                $description = null;

                if ($config['has_description']) {
                    $files = [$request->file("documents.{$documentType}.file")];
                    $description = $request->input("documents.{$documentType}.description");
                } else {

                    if (!empty($config['multiple'])) {
                        $files = $request->file("documents.{$documentType}", []);
                    } else {
                        $singleFile = $request->file("documents.{$documentType}");
                        $files = $singleFile ? [$singleFile] : [];
                    }
                }

                // Single document old delete - only if a new file is actually uploaded
                $newFile = $config['has_description']
                    ? $request->file("documents.{$documentType}.file")
                    : $request->file("documents.{$documentType}");

                if (empty($config['multiple']) && $newFile instanceof \Illuminate\Http\UploadedFile && $newFile->isValid()) {

                    $oldDocuments = ApplicantDocument::where('applicant_id', $request->applicant_id)
                        ->where('document_type', $documentType)
                        ->get();

                    foreach ($oldDocuments as $oldDocument) {
                        if ($oldDocument->file_path) {
                            Storage::disk('public')->delete($oldDocument->file_path);
                        }

                        $oldDocument->delete();
                    }
                }

                foreach ($files as $index => $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {

                        $originalName = $file->getClientOriginalName();
                        $extension    = $file->getClientOriginalExtension();
                        $fileHash     = hash_file('sha256', $file->getRealPath());

                        // If a file with the same name OR same content hash already exists for this
                        // applicant + document_type, just skip it — no error, it's already stored.
                        $alreadyExists = ApplicantDocument::where('applicant_id', $request->applicant_id)
                            ->where('document_type', $documentType)
                            ->where(function ($q) use ($originalName, $fileHash) {
                                $q->where('original_filename', $originalName)
                                  ->orWhere('file_hash', $fileHash);
                            })
                            ->exists();

                        if ($alreadyExists) {
                            continue;
                        }

                        $fileName = time() . '_' . Str::random(10) . '_' .
                            (Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) ?: 'file')
                            . '.' . strtolower($extension);

                        $filePath = $file->storeAs(
                            'documents/' . $sessionId,
                            $fileName,
                            'public'
                        );

                        ApplicantDocument::create([
                            'applicant_id'      => $request->applicant_id,
                            'session_id'        => $sessionId,
                            'document_type'     => $documentType,
                            'file_path'         => $filePath,
                            'original_filename' => $originalName,
                            'mime_type'         => $file->getMimeType(),
                            'size'              => $file->getSize(),
                            'file_hash'         => $fileHash,
                            'description'       => $description
                        ]);
                    }
                }

            }

            Applicant::where('id', $request->applicant_id)->update(['current_step' => 11]);

            return response()->json(['success' => true, 'current_step' => 11]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Step 10 save error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a single uploaded document (called from Step 10 UI)
     */
    public function deleteDocument($documentId)
    {
        try {
            $document = ApplicantDocument::findOrFail($documentId);

            $access = $this->checkApplicantAccessAndPayment($document->applicant_id, true);
            if (!$access['allowed']) {
                return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
            }

            // Delete the physical file
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Delete document error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update current step only (when user clicks on step navigation)
     */
    public function updateCurrentStep(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id',
            'current_step' => 'required|integer|min:1|max:10'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }

        Applicant::where('id', $request->applicant_id)->update([
            'current_step' => $request->current_step
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Resume application by email - Load all data from all tables
     */
    public function resumeByEmail(Request $request)
    {
        $email = $request->email ?? $request->route('email');
        try {
            $applicant = Applicant::where('email', $email)
                ->where('status', 'draft')
                ->latest()
                ->first();

            if ($applicant) {
                $fullData = $applicant->loadFullFormData();

                // Build documents list at top level (not inside form_data)
                $documentsList = ApplicantDocument::where('applicant_id', $applicant->id)->get()
                    ->map(function ($doc) {
                        return [
                            'id'                => $doc->id,
                            'document_type'     => $doc->document_type,
                            'original_filename' => $doc->original_filename,
                            'file_url'          => asset(Storage::url($doc->file_path)),
                            'description'       => $doc->description
                        ];
                    })->values();

                return response()->json([
                    'success'        => true,
                    'applicant_id'   => $applicant->id,
                    'session_id'     => $applicant->session_id,
                    'current_step'   => $applicant->current_step ?? 1,
                    'form_data'      => $fullData,
                    'documents_list' => $documentsList
                ]);
            }

            return response()->json(['success' => false], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get applicant by ID (for page reload recovery)
     */
    public function getApplicantById($id)
    {
        try {
            $access = $this->checkApplicantAccessAndPayment($id, false);
            if (!$access['allowed']) {
                return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
            }
            $applicant = $access['applicant'];

            if ($applicant) {
                // Eager load details manually
                $applicant->load([
                    'personalInformation',
                    'currentAddress',
                    'previousAddress',
                    'employment',
                    'previousEmployment',
                    'screening',
                    'pets',
                    'vehicles',
                    'emergencyContact',
                    'householdMembers',
                    'documents'
                ]);

                $fullData = $applicant->loadFullFormData();

                // Build documents list at top level (not inside form_data)
                $documentsList = $applicant->documents->map(function ($doc) {
                    return [
                        'id'                => $doc->id,
                        'document_type'     => $doc->document_type,
                        'original_filename' => $doc->original_filename,
                        'file_url'          => asset(Storage::url($doc->file_path)),
                        'description'       => $doc->description
                    ];
                })->values();

                return response()->json([
                    'success'        => true,
                    'applicant_id'   => $applicant->id,
                    'session_id'     => $applicant->session_id,
                    'current_step'   => $applicant->current_step ?? 1,
                    'form_data'      => $fullData,
                    'documents_list' => $documentsList
                ]);
            }

            return response()->json(['success' => false], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Final Submit - Validate all and change status to completed
     */
    public function finalSubmit(Request $request)
    {
        $request->validate([
            'applicant_id' => 'required|exists:applicants,id'
        ]);

        $access = $this->checkApplicantAccessAndPayment($request->applicant_id, true);
        if (!$access['allowed']) {
            return response()->json(['success' => false, 'message' => $access['message']], $access['error_code']);
        }
        $applicant = $access['applicant'];

        try {

            // ✅ Validate entire application before submitting
            $validationErrors = $applicant->validateFullApplication();

            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please complete all required sections',
                    'errors' => $validationErrors,
                    'first_incomplete_step' => $applicant->getFirstIncompleteStep()
                ], 422);
            }

            // Also validate with FormRequest for final check
            $finalData = $applicant->loadFullFormData();

            // Create a request with all data for final validation
            $formRequest = new StoreApplicationRequest();
            $rules = $formRequest->rules();
            // Important: ignore the current applicant ID in unique check
            $rules['email'] = 'required|email|unique:applicants,email,' . $request->applicant_id;

            $validator = validator($finalData, $rules, $formRequest->messages());

            if ($validator->fails()) {
                $errors = $validator->errors()->toArray();

                // Find which step has error
                $stepWithError = $this->findStepFromError($errors);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed. Please check your inputs.',
                    'errors' => $errors,
                    'step_with_error' => $stepWithError
                ], 422);
            }

            // Update status to submitted
            $applicant->update([
                'status' => 'submitted'
            ]);

            // Send emails only if consent is also completed
            $consentSessionId = session('consent_session_id');
            $consentRecord = null;
            if ($consentSessionId) {
                $consentRecord = \App\Models\ConsentRecord::where('session_id', $consentSessionId)->first();
            }
            if (!$consentRecord) {
                $consentRecord = \App\Models\ConsentRecord::where('applicant_id', $applicant->id)->first();
            }

            if (!$consentRecord) {
                // Try to find by matching name in ApplicantTenantConsent
                $personalInfo = $applicant->personalInformation;
                if ($personalInfo) {
                    $fullName = $personalInfo->first_name . ' ' . $personalInfo->last_name;
                    $tenantConsent = \App\Models\ApplicantTenantConsent::where('applicant_name', $fullName)
                        ->latest()
                        ->first();
                    if ($tenantConsent) {
                        $consentRecord = \App\Models\ConsentRecord::where('session_id', $tenantConsent->session_id)->first();
                    }
                }
            }

            if (!$consentRecord && $consentSessionId) {
                $consentRecord = \App\Models\ConsentRecord::create([
                    'session_id' => $consentSessionId,
                    'applicant_id' => $applicant->id,
                    'status' => 'pending'
                ]);
            }

            if ($consentRecord) {
                // Link applicant if not set
                if (!$consentRecord->applicant_id) {
                    $consentRecord->update(['applicant_id' => $applicant->id]);
                }
            }

            $emailStatus = 'Deferred: Email will be sent after consent form is completed.';

            // Clear session and local storage keys (on next load)
            session()->forget('applicant_session_id');
            session()->forget('consent_session_id');

            return response()->json([
                'success' => true,
                'email_status' => $emailStatus,
                'redirect_url' => route('application.success')
            ]);
        } catch (\Exception $e) {
            Log::error('Final submit error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Find which step has validation error
     */
    private function findStepFromError($errors)
    {
        $errorFields = array_keys($errors);

        $stepMapping = [
            'email' => 1,
            'personal_info' => 1,
            'current_address' => 2,
            'previous_address' => 3,
            'employment' => 4,
            'previous_employment' => 5,
            'screening' => 6,
            'pets' => 7,
            'vehicles' => 8,
            'emergency_contact' => 9,
            'documents' => 10
        ];

        foreach ($errorFields as $field) {
            foreach ($stepMapping as $prefix => $step) {
                if (str_starts_with($field, $prefix)) {
                    return $step;
                }
            }
        }

        return 1;
    }

    public function success()
    {
        return Inertia::render('Application/Success');
    }

    public function store(StoreApplicationRequest $request)
    {
        // This is handled by the step-by-step API calls now
        // Keep for backward compatibility
        return redirect()->route('home');
    }

    /**
     * View PDF in browser
     */
    public function viewPdf(\App\Models\Applicant $applicant)
    {
        // Only allow if authorized (owner or admin)
        $user = Auth::user();
        if (!$user || (Auth::id() !== $applicant->user_id && $user->role !== 'admin' && $user->role !== 'superadmin')) {
            abort(403);
        }

        // Save original memory limit for restoration
        $originalMemoryLimit = @ini_get('memory_limit');
        
        // Increase memory temporarily for safe PDF generation
        @ini_set('memory_limit', '1024M');
        @set_time_limit(300);
        
        $pdfService = new PDFService();
        $result = null;
        
        // Generate the merged PDF (application + consent + documents)
        try {
            $result = $pdfService->generateMergedPDF($applicant);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('viewPdf failed for applicant ' . $applicant->id . ': ' . $e->getMessage());
            @ini_set('memory_limit', $originalMemoryLimit);
            abort(500, 'Failed to generate PDF');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('viewPdf threw for applicant ' . $applicant->id . ': ' . $e->getMessage());
            @ini_set('memory_limit', $originalMemoryLimit);
            abort(500, 'Failed to generate PDF');
        }
        
        if (!$result || !isset($result['path'])) {
            @ini_set('memory_limit', $originalMemoryLimit);
            abort(500, 'Failed to generate PDF - no result');
        }

        @ini_set('memory_limit', $originalMemoryLimit);

        return response()->file($result['path'], [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="application_' . $applicant->id . '.pdf"'
        ])->deleteFileAfterSend(true);
    }
}
