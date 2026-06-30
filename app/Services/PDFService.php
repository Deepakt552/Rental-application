<?php

namespace App\Services;

use App\Models\Applicant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PDFService
{
    /**
     * Generate application PDF
     */
    public function generateApplicationPDF(Applicant $applicant)
    {
        // Ensure temp directory exists
        $tempPath = storage_path('app/temp');
        if (!file_exists($tempPath)) {
            mkdir($tempPath, 0777, true);
        }
        
        $data = [
            'applicant' => $applicant->load([
                'personalInformation',
                'householdMembers',
                'currentAddress',
                'previousAddress',
                'employment',
                'previousEmployment',
                'screening',
                'pets',
                'vehicles',
                'emergencyContact'
            ]),
            // 'generated_date' => now()->format('F j, Y, g:i a'),
            'generated_date' => $applicant->created_at ? $applicant->created_at->format('F j, Y, g:i a') : now()->format('F j, Y, g:i a'),
            'application_id' => $applicant->id,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('pdf.application', $data);
        $pdf->setPaper('A4', 'portrait');
        
        // Create filename
        $filename = "application_{$applicant->id}_" . time() . ".pdf";
        $fullPath = $tempPath . DIRECTORY_SEPARATOR . $filename;
        
        // Save PDF to temporary file
        $pdf->save($fullPath);
        
        // Verify file was created
        if (!file_exists($fullPath)) {
            throw new \Exception("Failed to create PDF file at: {$fullPath}");
        }
        
        return [
            'path' => $fullPath,
            'filename' => $filename,
            'content' => $pdf->output()
        ];
    }

    /**
     * Delete temporary PDF
     */
    public function deleteTempPDF($path)
    {
        if (file_exists($path)) {
            unlink($path);
            return true;
        }
        return false;
    }

    /**
     * Generate merged PDF of Application, Consent, and Documents
     */
    public function generateMergedPDF(Applicant $applicant)
    {
        $tempFiles = [];
        try {
            // 1. Generate core Application PDF
            $appPdf = $this->generateApplicationPDF($applicant);
            if (isset($appPdf['path'])) {
                $tempFiles[] = $appPdf['path'];
            }
            
            $merger = new \iio\libmergepdf\Merger(new \App\Pdf\CustomTcpdiDriver());
            
            $appPdfPath = $this->ensureCompatiblePdf($appPdf['path'], $tempFiles);
            $merger->addFile($appPdfPath);

            // 2. Add Consent PDF if available
            $record = $applicant->consentRecord;
            if ($record && $record->session_id) {
                $consentService = app(\App\Services\PDFConsentService::class);
                if ($applicant->type === 'superadmin') {
                    $consentPath = $consentService->generateConsentexcelPDF($record->session_id);
                } else {
                    $consentPath = $consentService->generateConsentPDF($record->session_id);
                }
                if ($consentPath) {
                    $fullConsentPath = storage_path('app/public/' . $consentPath);
                    if (file_exists($fullConsentPath)) {
                        $compatConsentPath = $this->ensureCompatiblePdf($fullConsentPath, $tempFiles);
                        $merger->addFile($compatConsentPath);
                    }
                }
            }

            // 3. Add uploaded Documents
           // 3. Add uploaded Documents
if ($applicant->documents) {
    $seenHashes = [];

    foreach ($applicant->documents as $doc) {
        // Skip rows whose content we've already merged in this run
        $key = $doc->file_hash ?? $doc->original_filename; // fallback if hash not backfilled yet
        if (isset($seenHashes[$key])) {
            continue;
        }
        $seenHashes[$key] = true;

        $fullDocPath = storage_path('app/public/' . $doc->file_path);
        if (file_exists($fullDocPath)) {
            $mime = strtolower($doc->mime_type);
            if ($mime === 'application/pdf') {
                $compatDocPath = $this->ensureCompatiblePdf($fullDocPath, $tempFiles);
                $merger->addFile($compatDocPath);
            } elseif (in_array($mime, ['image/jpeg', 'image/jpg', 'image/png'])) {
                $tempImagePdfPath = storage_path('app/temp/img_doc_' . uniqid() . '.pdf');
                $tempFiles[] = $tempImagePdfPath;
                $imageData = base64_encode(file_get_contents($fullDocPath));
                $src = 'data:' . $mime . ';base64,' . $imageData;

                $html = '<html><body style="margin:0;padding:20px;text-align:center;"><h3 style="font-family:sans-serif;color:#333;">Document: ' . htmlspecialchars($doc->original_filename) . '</h3><img src="' . $src . '" style="max-width:100%; max-height:850px; object-fit:contain;" /></body></html>';
                $imgPdf = Pdf::loadHTML($html)->setPaper('A4', 'portrait');
                $imgPdf->save($tempImagePdfPath);
                $merger->addFile($tempImagePdfPath);
            }
        }
    }
}

            // Merge all into one PDF
            $mergedContent = $merger->merge();

            $filename = "merged_application_{$applicant->id}_" . time() . ".pdf";
            $mergedPath = storage_path('app/temp/' . $filename);
            file_put_contents($mergedPath, $mergedContent);

            // --- Add Global Page Numbers using FPDI 2 ---
            try {
                $fpdi = new \App\Pdf\CustomTCPDI();
                $fpdi->setPrintHeader(false);
                $fpdi->setPrintFooter(false);
                $fpdi->SetAutoPageBreak(false);
                
                $pageCount = $fpdi->setSourceFile($mergedPath);
                for ($i = 1; $i <= $pageCount; $i++) {
                    $tplId = $fpdi->importPage($i);
                    $size = $fpdi->getTemplateSize($tplId);
                    
                    $w = $size['width'] ?? $size['w'];
                    $h = $size['height'] ?? $size['h'];
                    $orientation = $w > $h ? 'L' : 'P';
                    $fpdi->AddPage($orientation, [$w, $h]);
                    $fpdi->useTemplate($tplId);
                    
                    $fpdi->SetFont('helvetica', '', 9);
                    $fpdi->SetTextColor(100, 100, 100);
                    // Position 15mm from bottom
                    $fpdi->SetY(-15);
                    // Print centered
                    $fpdi->Cell(0, 10, "Page {$i} of {$pageCount}", 0, 0, 'C');
                }
                
                // Overwrite the merged PDF with the page numbers
                $fpdi->Output($mergedPath, 'F');
                $mergedContent = file_get_contents($mergedPath);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to add page numbers to merged PDF: ' . $e->getMessage());
            }

            return [
                'path' => $mergedPath,
                'filename' => $filename,
                'content' => $mergedContent
            ];
        } finally {
            // Clean up temporary compatibility and helper files
            foreach ($tempFiles as $file) {
                if (file_exists($file)) {
                    @unlink($file);
                }
            }
        }
    }

    /**
     * Convert PDF to version 1.4 using Ghostscript or pdftk if available,
     * to avoid FPDI compression errors with PDF v1.5+.
     */
    private function ensureCompatiblePdf(string $path, array &$tempFiles): string
    {
        if (!file_exists($path)) {
            return $path;
        }

        $handle = @fopen($path, 'rb');
        if (!$handle) {
            return $path;
        }
        $header = fread($handle, 20);
        fclose($handle);

        // Check PDF version in header (e.g. "%PDF-1.5")
        preg_match('/%PDF-(\d+\.\d+)/', $header, $matches);
        $version = isset($matches[1]) ? (float)$matches[1] : 1.4;

        if ($version <= 1.4) {
            return $path;
        }

        $tempOutPath = storage_path('app/temp/compat_' . uniqid() . '.pdf');
        $escapedInput = escapeshellarg($path);
        $escapedOutput = escapeshellarg($tempOutPath);

        // 1. Try Ghostscript (gs)
        $cmdGs = "gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOutputFile={$escapedOutput} {$escapedInput} 2>&1";
        @exec($cmdGs, $outputGs, $returnGs);

        if ($returnGs === 0 && file_exists($tempOutPath) && filesize($tempOutPath) > 0) {
            $tempFiles[] = $tempOutPath;
            return $tempOutPath;
        }

        // 2. Try pdftk as fallback
        $cmdPdftk = "pdftk {$escapedInput} output {$escapedOutput} 2>&1";
        @exec($cmdPdftk, $outputPdftk, $returnPdftk);

        if ($returnPdftk === 0 && file_exists($tempOutPath) && filesize($tempOutPath) > 0) {
            $tempFiles[] = $tempOutPath;
            return $tempOutPath;
        }

        if (file_exists($tempOutPath)) {
            @unlink($tempOutPath);
        }

        return $path;
    }
}