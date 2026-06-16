<?php

namespace App\Services;

use App\Models\ApplicantTenantConsent;
use App\Models\CoApplicantConsent;
use App\Models\CriminalBackgroundCheck;
use App\Models\AffordableHousingConsent;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PDFConsentService
{
    /**
     * Generate combined consent PDF
     */
    public function generateConsentPDF(string $sessionId): ?string
    {
        try {

            $data = $this->getConsentDataForPDF($sessionId);

            if (!view()->exists('pdf.consent-form')) {

                Log::error('PDF view not found: pdf.consent-form');

                return null;
            }

            $pdf = Pdf::loadView('pdf.consent-form', $data);

            $pdf->setPaper('A4', 'portrait');

            $fileName = "consent_form_{$sessionId}.pdf";

            $path = "consents/{$fileName}";

            // SAVE FILE
            Storage::disk('public')->put(
                $path,
                $pdf->output()
            );

            Log::info("PDF saved successfully: {$path}");

            // RETURN PDF BINARY CONTENT
            return $path;
        } catch (\Exception $e) {

            Log::error('PDF Generation failed: ' . $e->getMessage());

            return null;
        }
    }
    public function generateConsentexcelPDF(string $sessionId): ?string
    {
        try {
            $data = $this->getConsentDataForPDFexcel($sessionId);

            Log::info(
                ApplicantTenantConsent::where('session_id', $sessionId)->get()->toArray()
            );
            Log::info(
                CoApplicantConsent::where('session_id', $sessionId)->get()->toArray()
            );

            Log::info('Data for PDF: ' . json_encode($data));

            if (!view()->exists('pdf.consent-excel-form')) {
                Log::error('PDF view not found: pdf.consent-excel-form');
                return null;
            }

            $pdf = Pdf::loadView('pdf.consent-excel-form', $data);
            $pdf->setPaper('A4', 'portrait');

            $fileName = "consent_form_{$sessionId}.pdf";
            $path = "consents/{$fileName}";

            Storage::disk('public')->put(
                $path,
                $pdf->output()
            );

            Log::info("PDF saved successfully: {$path}");

            return $path;
        } catch (\Exception $e) {

            Log::error('PDF Generation failed: ' . $e->getMessage());

            return null;
        }
    }

    // Also update getConsentDataForPDF method to handle empty data
    public function getConsentDataForPDF(string $sessionId): array
    {
        $consentRecord = \App\Models\ConsentRecord::where('session_id', $sessionId)->first();
        $applicantId = $consentRecord?->applicant_id;
        $householdMembersData = [];
        
        if ($applicantId) {
            $householdMembers = \App\Models\HouseholdMember::where('applicant_id', $applicantId)->get();
            foreach ($householdMembers as $member) {
                $householdMembersData[] = [
                    'name' => $member->full_name,
                    'dob' => $member->date_of_birth ? $member->date_of_birth->format('Y-m-d') : '',
                    'relationship' => $member->relationship
                ];
            }
        }

        return [
            'applicant_tenant' => ApplicantTenantConsent::where('session_id', $sessionId)
                ->first(),

            'co_applicants' => CoApplicantConsent::where('session_id', $sessionId)
                ->get(),

            'criminal_checks' => CriminalBackgroundCheck::where('session_id', $sessionId)
                ->get(),

            'housing_consents' => AffordableHousingConsent::where('session_id', $sessionId)
                ->get(),

            'household_members' => $householdMembersData,

            'generated_date' => $consentRecord && $consentRecord->created_at ? $consentRecord->created_at->format('F j, Y g:i A') : now()->format('F j, Y g:i A'),
            'session_id' => $sessionId,
            'isExcel' => false,
            'org_name' => "Triumph Residential Services Inc."
        ];
    }
    private function getConsentDataForPDFexcel(string $sessionId): array
    {
        $consentRecord = \App\Models\ConsentRecord::where('session_id', $sessionId)->first();

        return [
            'applicant_tenant' => ApplicantTenantConsent::where('session_id', $sessionId)
                ->first(),

            'co_applicants' => CoApplicantConsent::where('session_id', $sessionId)
                ->get(),

            'generated_date' => $consentRecord && $consentRecord->created_at ? $consentRecord->created_at->format('F j, Y g:i A') : now()->format('F j, Y g:i A'),
            'session_id' => $sessionId,
            'isExcel' => true,
            'org_name' => "Excel Residential Services"
        ];
    }
    public function linkAndMovePDF(string $sessionId, int $applicationId): ?string
    {
        try {
            // Link all consents with application
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

            // Move temp PDF to permanent location
            $tempPath = storage_path("app/public/consents/temp_consent_{$sessionId}.pdf");
            $newPath = storage_path("app/public/consents/consent_form_{$applicationId}_{$sessionId}.pdf");

            if (file_exists($tempPath)) {
                rename($tempPath, $newPath);
                Log::info("PDF moved to permanent location for application {$applicationId}");
                return "consents/consent_form_{$applicationId}_{$sessionId}.pdf";
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to link consents: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate and download PDF
     */
    public function downloadConsentPDF(string $sessionId)
    {
        $data = $this->getConsentDataForPDF($sessionId);
        $pdf = Pdf::loadView('pdf.consent-form', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("consent_form_{$sessionId}.pdf");
    }
}
