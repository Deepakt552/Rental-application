<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Applicant extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    protected $fillable = [
        'email',
        'session_id',
        'consent_status',
        'current_step',
        'type',
        'status',
        'user_id',
        'payment_status',

           // Property Fields
    'company_name',
    'property_id',
    'property_name',
    'property_type',
    'desired_move_date',

    // Reminder & Comment Fields
    'admin_comment',
    'reminder_sent_count',
    'last_reminder_sent_at'
    ];

    public function personalInformation(): HasOne
    {
        return $this->hasOne(PersonalInformation::class);
    }

    public function currentAddress(): HasOne
    {
        return $this->hasOne(CurrentAddress::class);
    }

    public function previousAddress(): HasOne
    {
        return $this->hasOne(PreviousAddress::class);
    }

    public function employment(): HasOne
    {
        return $this->hasOne(Employment::class);
    }

    public function previousEmployment(): HasOne
    {
        return $this->hasOne(PreviousEmployment::class);
    }

    public function screening(): HasOne
    {
        return $this->hasOne(Screening::class);
    }

    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function emergencyContact(): HasOne
    {
        return $this->hasOne(EmergencyContact::class);
    }
    public function householdMembers(): HasMany
    {
        return $this->hasMany(HouseholdMember::class);
    }


    public function documents(): HasMany
    {
        return $this->hasMany(ApplicantDocument::class);
    }





    public function applicantTenantConsents()
    {
        return $this->hasMany(ApplicantTenantConsent::class, 'application_id');
    }

    public function coApplicantConsents()
    {
        return $this->hasMany(CoApplicantConsent::class, 'application_id');
    }

    public function criminalBackgroundChecks()
    {
        return $this->hasMany(CriminalBackgroundCheck::class, 'application_id');
    }

    public function affordableHousingConsents()
    {
        return $this->hasMany(AffordableHousingConsent::class, 'application_id');
    }


    public function consentRecord()
    {
        // Return the completed record first; if none, return latest by id
        return $this->hasOne(ConsentRecord::class)
            ->orderByRaw("CASE WHEN status = 'completed' THEN 0 ELSE 1 END")
            ->orderByDesc('id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class, 'applicant_id');
    }

    public function loadFullFormData()
    {
        return [
            'applicant_id' => $this->id,
            'email' => $this->email,
            'session_id' => $this->session_id,
            'current_step' => $this->current_step ?? 1,
            'status' => $this->status,

            // Step 1: Personal Info
            'personal_info' => $this->personalInformation ? $this->personalInformation->toArray() : [
                'title' => '',
                'first_name' => '',
                'middle_name' => '',
                'last_name' => '',
                'preferred_name' => '',
                'marital_status' => '',
                'phone' => '',
                'email' => $this->email ?? ''
            ],

            // Step 2: Current Address
            'current_address' => $this->currentAddress ? $this->currentAddress->toArray() : [
                'country' => 'United States',
                'address_line_1' => '',
                'address_line_2' => '',
                'city' => '',
                'state' => '',
                'zip_code' => '',
                'apartment_community' => '',
                'residency_from_date' => '',
                'monthly_rent' => '',
                'reason_for_moving' => '',
                'notice_given' => false
            ],

            // Step 3: Previous Address
            'previous_address' => $this->previousAddress ? $this->previousAddress->toArray() : [
                'previous_country' => '',
                'previous_address_line_1' => '',
                'previous_address_line_2' => '',
                'previous_city' => '',
                'previous_state' => '',
                'previous_zip_code' => '',
                'previous_apartment' => '',
                'previous_from_date' => '',
                'previous_to_date' => '',
                'previous_rent' => '',
                'previous_reason' => ''
            ],

            // Step 4: Employment
            'employment' => $this->employment ? $this->employment->toArray() : [
                'employment_country' => 'United States',
                'employment_status' => '',
                'job_title' => '',
                'employer_name' => '',
                'supervisor_name' => '',
                'employed_since' => '',
                'monthly_income' => '',
                'additional_income' => '',
                'additional_income_source' => '',
                'employer_address_1' => '',
                'employer_address_2' => '',
                'employer_city' => '',
                'employer_state' => '',
                'employer_zip' => '',
                'employer_phone' => ''
            ],

            // Step 5: Previous Employment
            'previous_employment' => $this->previousEmployment ? $this->previousEmployment->toArray() : [
                'previous_employer_name' => '',
                'previous_supervisor_name' => '',
                'previous_job_title' => '',
                'previous_monthly_income' => '',
                'previous_additional_income' => '',
                'previous_income_source' => '',
                'previous_start_date' => '',
                'previous_end_date' => '',
                'previous_employer_address_1' => '',
                'previous_employer_address_2' => '',
                'previous_employer_city' => '',
                'previous_employer_state' => '',
                'previous_employer_zip' => '',
                'previous_employer_phone' => ''
            ],

            // Step 6: Screening
            'screening' => $this->screening ? $this->screening->toArray() : [
                'date_of_birth' => '',
                'screening_country' => '',
                'has_ssn' => false,
                'ssn' => '',
                'government_id' => '',
                'issuing_entity' => '',
                'evicted' => false,
                'eviction_reason' => '',
                'felony' => false,
                'felony_reason' => '',
                'legal_case' => false,
                'legal_case_details' => ''
            ],

            // Step 7: Pets
            'pets' => $this->pets ? $this->pets->toArray() : [],

            // Step 8: Vehicles
            'vehicles' => $this->vehicles ? $this->vehicles->toArray() : [],

            // Step 9: Emergency Contact
            'emergency_contact' => $this->emergencyContact ? $this->emergencyContact->toArray() : [
                'full_name' => '',
                'relationship' => '',
                'phone' => '',
                'email' => '',
                'country' => '',
                'address_line_1' => '',
                'address_line_2' => '',
                'city' => '',
                'state' => '',
                'zip_code' => ''
            ],

            // Additional Persons
            'additional_persons' => $this->householdMembers ? $this->householdMembers->toArray() : [],
        ];
    }

    /**
     * Update current step
     */
    public function updateCurrentStep($step)
    {
        $this->update([
            'current_step' => $step,
            'status' => 'draft'
        ]);
    }

    /**
     * Get or create draft by email
     */
    public static function getOrCreateDraft($email, $type = 'admin')
    {
        $applicant = self::where('email', $email)
            ->where('status', 'draft')
            ->first();

        if (!$applicant) {
            $applicant = self::create([
                'email' => $email,
                'session_id' => (string) \Illuminate\Support\Str::uuid(),
                'current_step' => 1,
                'status' => 'draft',
                'type' => $type
            ]);
        }

        return $applicant;
    }




    public static function getStepValidationRules($step)
    {
        $rules = [
            1 => [
                'email' => 'required|email',
                'personal_info.first_name' => 'required|string|max:255',
                'personal_info.last_name' => 'required|string|max:255',
                'personal_info.phone' => 'required|string|max:20',
                'personal_info.email' => 'required|email',
            ],
            2 => [
                'current_address.country' => 'required|string|max:100',
                'current_address.address_line_1' => 'required|string|max:255',
                'current_address.city' => 'required|string|max:100',
                'current_address.state' => 'required|string|max:100',
                'current_address.zip_code' => 'required|string|max:20',
            ],
            3 => [], // Optional step
            4 => [
                'employment.employment_country' => 'required|string|max:100',
            ],
            5 => [], // Optional step
            6 => [
                'screening.date_of_birth' => 'required|date|before:today|after:-100 years',
            ],
            7 => [], // Optional step
            8 => [], // Optional step
            9 => [
                'emergency_contact.full_name' => 'required|string|max:255',
                'emergency_contact.relationship' => 'required|string|max:100',
                'emergency_contact.phone' => 'required|string|max:20',
            ],
            10 => [
                'documents.driving_license' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'documents.pay_check' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'documents.bank_statement' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'documents.social_security_card' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            ],
        ];

        return $rules[$step] ?? [];
    }

    /**
     * Check if a step has all required data
     */
    public function isStepComplete($step)
    {
        if ($step == 3 || $step == 5 || $step == 7 || $step == 8) {
            return true; // Optional steps are always complete
        }

        $data = $this->loadFullFormData();

        switch ($step) {
            case 1:
                return !empty($data['personal_info']['first_name'])
                    && !empty($data['personal_info']['last_name'])
                    && !empty($data['personal_info']['phone'])
                    && !empty($data['personal_info']['email']);
            case 2:
                return !empty($data['current_address']['country'])
                    && !empty($data['current_address']['address_line_1'])
                    && !empty($data['current_address']['city'])
                    && !empty($data['current_address']['state'])
                    && !empty($data['current_address']['zip_code']);
            case 4:
                return !empty($data['employment']['employment_country']);
            case 6:
                return !empty($data['screening']['date_of_birth']);
            case 9:
                return !empty($data['emergency_contact']['full_name'])
                    && !empty($data['emergency_contact']['relationship'])
                    && !empty($data['emergency_contact']['phone']);
            case 10:
                return $this->documents()->count() >= 4;
            default:
                return true;
        }
    }

    /**
     * Get first incomplete step
     */
    public function getFirstIncompleteStep()
    {
        for ($step = 1; $step <= 10; $step++) {
            if (!$this->isStepComplete($step) && $step != 3 && $step != 5 && $step != 7 && $step != 8) {
                return $step;
            }
        }
        return null;
    }

    /**
     * Validate entire application before final submit
     */
    public function validateFullApplication()
    {
        $errors = [];

        // Check each required step
        for ($step = 1; $step <= 10; $step++) {
            if ($step == 3 || $step == 5 || $step == 7 || $step == 8) {
                continue; // Skip optional steps
            }

            if (!$this->isStepComplete($step)) {
                $stepNames = [
                    1 => 'Personal Information',
                    2 => 'Current Address',
                    4 => 'Employment',
                    6 => 'Screening Information',
                    9 => 'Emergency Contact',
                    10 => 'Documents'
                ];
                $errors[$step] = "Step {$step} ({$stepNames[$step]}) is incomplete. Please complete all required fields.";
            }
        }

        // Phone number validation
        $personalInfo = $this->personalInformation;
        if ($personalInfo && $personalInfo->phone) {
            $digits = preg_replace('/\D/', '', $personalInfo->phone);
            if (strlen($digits) != 10) {
                $errors['personal_info.phone'] = 'Phone number must be exactly 10 digits';
            }
        }

        $emergencyContact = $this->emergencyContact;
        if ($emergencyContact && $emergencyContact->phone) {
            $digits = preg_replace('/\D/', '', $emergencyContact->phone);
            if (strlen($digits) != 10) {
                $errors['emergency_contact.phone'] = 'Emergency contact phone must be exactly 10 digits';
            }
        }

        return $errors;
    }
}
