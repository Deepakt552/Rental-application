<?php

namespace App\Services;


use App\Models\ApplicantTenantConsent;
use App\Models\CoApplicantConsent;
use App\Models\CriminalBackgroundCheck;
use App\Models\AffordableHousingConsent;
use App\Models\ConsentRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConsentService
{
    /**
     * Get all consent data for a session
     */
    public function getConsentData(string $sessionId): array
    {
        return [
            'step1' => $this->getStep1Data($sessionId),
            'step2' => $this->getStep2Data($sessionId),
            'step3' => $this->getStep3Data($sessionId),
        ];
    }

    /**
     * Get Step 1 data
     */
    private function getStep1Data(string $sessionId): array
    {
        $applicantTenant = ApplicantTenantConsent::where('session_id', $sessionId)
            ->whereNull('application_id')
            ->first();

        $coApplicants = CoApplicantConsent::where('session_id', $sessionId)
            ->whereNull('application_id')
            ->get();

        return [
            'applicant_tenant' => $applicantTenant ? [
                'applicant_name' => $applicantTenant->applicant_name,
                'signature' => $applicantTenant->signature,
                'consent_date' => $applicantTenant->consent_date?->format('Y-m-d'),
            ] : null,
            'co_applicants' => $coApplicants->map(fn($co) => [
                'name' => $co->name,
                'signature' => $co->signature,
                'consent_date' => $co->consent_date?->format('Y-m-d'),
            ])->toArray(),
        ];
    }

    /**
     * Get Step 2 data
     */
    private function getStep2Data(string $sessionId): array
    {
        $applicants = CriminalBackgroundCheck::where('session_id', $sessionId)
            ->whereNull('application_id')
            ->get();

        return [
            'applicants' => $applicants->map(fn($app) => [
                'applicant_name' => $app->applicant_name,
                'social_security_no' => $app->social_security_no,
                'date_of_birth' => $app->date_of_birth?->format('Y-m-d'),
                'today_date' => $app->today_date?->format('Y-m-d'),
                'signature' => $app->signature,
            ])->toArray(),
        ];
    }

    /**
     * Get Step 3 data
     */
    private function getStep3Data(string $sessionId): array
    {
        $consents = AffordableHousingConsent::where('session_id', $sessionId)
            ->whereNull('application_id')
            ->get();

        $data = [
            'head_of_household' => null,
            'co_head' => null,
            'adult_members' => [],
        ];

        foreach ($consents as $consent) {
            $memberData = [
                'name' => $consent->name,
                'signature' => $consent->signature,
                'consent_date' => $consent->consent_date?->format('Y-m-d'),
            ];

            match ($consent->member_type) {
                'head_household' => $data['head_of_household'] = $memberData,
                'co_head' => $data['co_head'] = $memberData,
                'adult_member' => $data['adult_members'][] = $memberData,
            };
        }

        return $data;
    }

    /**
     * Save Step 1 data
     */
    public function saveStep1(string $sessionId, array $data,  string $type = 'admin'): void
    {
        DB::beginTransaction();
        try {
            // Save or update applicant tenant consent
            ApplicantTenantConsent::updateOrCreate(
                [
                    'session_id' => $sessionId,
                    'application_id' => null
                ],
                [
                    'applicant_name' => $data['applicant_tenant']['applicant_name'],
                    'signature' => $data['applicant_tenant']['signature'],
                    'consent_date' => $data['applicant_tenant']['consent_date'],
                ]
            );

            // Delete existing co-applicants for this session
            CoApplicantConsent::where('session_id', $sessionId)
                ->whereNull('application_id')
                ->delete();

            // Save new co-applicants
            if (!empty($data['co_applicants'])) {
                foreach ($data['co_applicants'] as $coApplicant) {
                    if (!empty($coApplicant['name'])) {
                        CoApplicantConsent::create([
                            'session_id' => $sessionId,
                            'name' => $coApplicant['name'],
                            'signature' => $coApplicant['signature'],
                            'consent_date' => $coApplicant['consent_date'],
                        ]);
                    }
                }
            }


            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to save step 1 consent: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Save Step 2 data
     */
    public function saveStep2(string $sessionId, array $data): void
    {
        DB::beginTransaction();
        try {
            // Delete existing criminal background checks
            CriminalBackgroundCheck::where('session_id', $sessionId)
                ->whereNull('application_id')
                ->delete();

            // Save new checks
            foreach ($data['applicants'] as $applicant) {
                CriminalBackgroundCheck::create([
                    'session_id' => $sessionId,
                    'applicant_name' => $applicant['applicant_name'],
                    'social_security_no' => $applicant['social_security_no'],
                    'date_of_birth' => $applicant['date_of_birth'],
                    'today_date' => $applicant['today_date'],
                    'signature' => $applicant['signature'],
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to save step 2 consent: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Save Step 3 data
     */
    public function saveStep3(string $sessionId, array $data): void
    {
        DB::beginTransaction();
        try {
            // Delete existing affordable housing consents
            AffordableHousingConsent::where('session_id', $sessionId)
                ->whereNull('application_id')
                ->delete();

            // Save head of household
            AffordableHousingConsent::create([
                'session_id' => $sessionId,
                'member_type' => 'head_household',
                'name' => $data['head_of_household']['name'],
                'signature' => $data['head_of_household']['signature'],
                'consent_date' => $data['head_of_household']['consent_date'],
            ]);

            // Save co-head if provided
            if (!empty($data['co_head']['name'])) {
                AffordableHousingConsent::create([
                    'session_id' => $sessionId,
                    'member_type' => 'co_head',
                    'name' => $data['co_head']['name'],
                    'signature' => $data['co_head']['signature'],
                    'consent_date' => $data['co_head']['consent_date'],
                ]);
            }

            // Save adult members
            if (!empty($data['adult_members'])) {
                foreach ($data['adult_members'] as $member) {
                    AffordableHousingConsent::create([
                        'session_id' => $sessionId,
                        'member_type' => 'adult_member',
                        'name' => $member['name'],
                        'signature' => $member['signature'],
                        'consent_date' => $member['consent_date'],
                    ]);
                }
            }
           


            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to save step 3 consent: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Link all consents with application ID after rental application submission
     */
    public function linkConsentsWithApplication(string $sessionId, int $applicationId): void
    {
        DB::beginTransaction();
        try {
            $tables = [
                ApplicantTenantConsent::class,
                CoApplicantConsent::class,
                CriminalBackgroundCheck::class,
                AffordableHousingConsent::class,
            ];

            foreach ($tables as $table) {
                $table::where('session_id', $sessionId)
                    ->whereNull('application_id')
                    ->update(['application_id' => $applicationId]);
            }

            DB::commit();
            Log::info("Linked consents for session {$sessionId} to application {$applicationId}");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to link consents: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Check if session has any consent data
     */
    public function hasConsentData(string $sessionId): bool
    {
        return ApplicantTenantConsent::where('session_id', $sessionId)->exists() ||
            CoApplicantConsent::where('session_id', $sessionId)->exists() ||
            CriminalBackgroundCheck::where('session_id', $sessionId)->exists() ||
            AffordableHousingConsent::where('session_id', $sessionId)->exists();
    }
}
