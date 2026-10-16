<?php

namespace App\Services;

use App\Models\Applicant;
use App\Models\ConsentRecord;
use App\Models\EmailLog;
use App\Models\ApplicantDocument;
use iio\libmergepdf\Merger;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EmailService
{
    protected $pdfService;
    protected $PDFConsentService;

    public function __construct(PDFService $pdfService, PDFConsentService $PDFConsentService)
    {
        $this->pdfService = $pdfService;
        $this->PDFConsentService = $PDFConsentService;
    }

    /**
     * Send application notification to admin with PDF
     */
    // public function sendApplicationNotification(Applicant $applicant, $adminEmail, $recipientType = 'admin')
    // {
    //     $sessionId = $applicant->session_id;
    //     try {
    //         // Generate PDF
    //         $pdf = $this->pdfService->generateApplicationPDF($applicant);

    //         // Check if PDF was created successfully
    //         if (!file_exists($pdf['path'])) {
    //             throw new \Exception("PDF file not found at: {$pdf['path']}");
    //         }

    //         // Send email with PDF attachment
    //         Mail::send('emails.admin-notification', ['applicant' => $applicant], function ($message) use ($adminEmail, $applicant, $pdf, $recipientType) {
    //             $message->to($adminEmail)
    //                 ->subject('New Rental Application Submitted - #' . $applicant->id)
    //                 ->attach($pdf['path'], [
    //                     'as' => $pdf['filename'],
    //                     'mime' => 'application/pdf',
    //                 ]);

    //         });

    //         // Delete temp PDF after sending
    //         $this->pdfService->deleteTempPDF($pdf['path']);

    //         // Log success
    //         EmailLog::create([
    //             'applicant_id' => $applicant->id,
    //             'recipient_email' => $adminEmail,
    //             'recipient_name' => ucfirst($recipientType),
    //             'recipient_type' => $recipientType,
    //             'subject' => 'New Rental Application Submitted - #' . $applicant->id,
    //             'message' => 'New application notification sent to ' . ucfirst($recipientType) . ' with PDF',
    //             'status' => 'sent',
    //             'sent_at' => now(),
    //         ]);

    //         return true;
    //     } catch (\Exception $e) {
    //         // Log failure
    //         EmailLog::create([
    //             'applicant_id' => $applicant->id,
    //             'recipient_email' => $adminEmail,
    //             'recipient_name' => ucfirst($recipientType),
    //             'recipient_type' => $recipientType,
    //             'subject' => 'New Rental Application Submitted - #' . $applicant->id,
    //             'message' => 'Failed to send email to ' . ucfirst($recipientType),
    //             'status' => 'failed',
    //             'error_message' => $e->getMessage(),
    //         ]);

    //         Log::error('Failed to send ' . $recipientType . ' email: ' . $e->getMessage());

    //         return false;
    //     }
    // }
    protected function isEmailEnabled(): bool
    {
        return \App\Models\Setting::get('enable_email_notifications', '1') === '1';
    }

    public function sendApplicationNotification(
        Applicant $applicant,
        $adminEmail,
        $recipientType = 'admin'
    ) {
        if (!$this->isEmailEnabled()) {
            Log::info("Email notifications are globally disabled. Skipping sendApplicationNotification to: {$adminEmail}");
            return false;
        }

        try {

            // Generate Application PDF
            $pdf = $this->pdfService
                ->generateApplicationPDF($applicant);

            // Check Application PDF
            if (!file_exists($pdf['path'])) {

                throw new \Exception(
                    "Application PDF not found at: {$pdf['path']}"
                );
            }
            Log::info(
                "Generated application PDF at: {$pdf['path']}"
            );

            // Initialize PDF Merger using TcpdiDriver to support PDF 1.5+ compression
            $merger = new Merger(new \App\Pdf\CustomTcpdiDriver());
            $merger->addFile($pdf['path']);

            // Get Consent Record
            $consentRecord = ConsentRecord::where('applicant_id', $applicant->id)
                ->whereNotNull('consent_pdf_path')
                ->latest()
                ->first();
            $consentPdfPath = $consentRecord?->consent_pdf_path;

            if ($consentPdfPath && Storage::disk('public')->exists($consentPdfPath)) {
                $merger->addFile(storage_path('app/public/' . $consentPdfPath));
            } else {
                Log::warning("Consent PDF not found at: " . ($consentPdfPath ?? 'NULL') . " for applicant " . $applicant->id);
            }

            // Get Uploaded Documents
            $documents = ApplicantDocument::where('applicant_id', $applicant->id)->get();
            $tempImagePdfs = [];

            foreach ($documents as $doc) {
                $decryptedContent = $doc->getDecryptedContent();
                if ($decryptedContent !== null) {
                    $mime = strtolower($doc->mime_type ?? '');
                    $ext = strtolower(pathinfo($doc->original_filename ?: $doc->file_path, PATHINFO_EXTENSION));

                    try {
                        if (str_contains($mime, 'pdf') || $ext === 'pdf') {
                            $tempDocPdf = storage_path('app/temp_doc_' . uniqid() . '.pdf');
                            file_put_contents($tempDocPdf, $decryptedContent);
                            $merger->addFile($tempDocPdf);
                            $tempImagePdfs[] = $tempDocPdf;
                        } elseif (in_array($ext, ['jpg', 'jpeg', 'png', 'webp']) || str_contains($mime, 'image')) {
                            $imgData = base64_encode($decryptedContent);
                            $src = 'data:' . ($mime ?: 'image/jpeg') . ';base64,' . $imgData;
                            $html = '<div style="text-align: center; margin-top: 20px;"><h3 style="font-family: sans-serif;">Document: ' . htmlspecialchars($doc->original_filename) . '</h3><img src="' . $src . '" style="max-width: 100%; max-height: 900px;" /></div>';

                            $tempPdfPath = storage_path('app/temp_img_' . uniqid() . '.pdf');
                            \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->save($tempPdfPath);

                            $merger->addFile($tempPdfPath);
                            $tempImagePdfs[] = $tempPdfPath;
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to merge document: ' . $doc->original_filename . ' - ' . $e->getMessage());
                    }
                }
            }

            // Create combined PDF
            $combinedPdfContent = $merger->merge();
            $combinedPdfPath = storage_path('app/combined_application_' . $applicant->id . '.pdf');
            file_put_contents($combinedPdfPath, $combinedPdfContent);

            Log::info('APPLICANT ID => ' . $applicant->id);

            // Send Email
            Mail::send(
                'emails.admin-notification',
                [
                    'applicant' => $applicant
                ],
                function ($message) use (
                    $adminEmail,
                    $applicant,
                    $combinedPdfPath,
                    $recipientType
                ) {

                    $message->to($adminEmail)
                        ->subject(
                            'New Rental Application Submitted - #' .
                                $applicant->id
                        );

                    // Attach Combined PDF
                    $message->attach(
                        $combinedPdfPath,
                        [
                            'as' => 'Complete_Application_' . $applicant->id . '.pdf',
                            'mime' => 'application/pdf',
                        ]
                    );
                }
            );

            // Clean up temporary files
            $this->pdfService->deleteTempPDF($pdf['path']);
            if (file_exists($combinedPdfPath)) {
                unlink($combinedPdfPath);
            }
            foreach ($tempImagePdfs as $tempImgPdf) {
                if (file_exists($tempImgPdf)) {
                    unlink($tempImgPdf);
                }
            }

            // Log Success
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $adminEmail,
                'recipient_name' => ucfirst($recipientType),
                'recipient_type' => ($recipientType === 'superadmin') ? 'admin' : $recipientType,
                'subject' => 'New Rental Application Submitted - #' . $applicant->id,
                'message' => 'Application email sent successfully with PDFs',
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            Log::info(
                '✅ Email sent successfully to: ' .
                    $adminEmail
            );

            return true;
        } catch (\Exception $e) {

            // Log Failure
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $adminEmail,
                'recipient_name' => ucfirst($recipientType),
                'recipient_type' => ($recipientType === 'superadmin') ? 'admin' : $recipientType,
                'subject' => 'New Rental Application Submitted - #' . $applicant->id,
                'message' => 'Failed to send email',
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error(
                '❌ Failed to send email: ' .
                    $e->getMessage()
            );

            Log::error($e->getTraceAsString());

            return false;
        }
    }








    /**
     * Send thank you email to user with PDF
     */
    public function sendUserThankYouEmail(Applicant $applicant)
    {
        if (!$this->isEmailEnabled()) {
            Log::info("Email notifications are globally disabled. Skipping sendUserThankYouEmail.");
            return false;
        }

        try {
            $userEmail = $applicant->personalInformation->email ?? $applicant->email;
            $userName = $applicant->personalInformation->first_name ?? 'Valued Applicant';

            // Generate PDF
            $pdf = $this->pdfService->generateApplicationPDF($applicant);

            // Check if PDF was created successfully
            if (!file_exists($pdf['path'])) {
                throw new \Exception("PDF file not found at: {$pdf['path']}");
            }

            // Send email with PDF attachment
            Mail::send('emails.user-thankyou', ['applicant' => $applicant, 'userName' => $userName], function ($message) use ($userEmail, $applicant, $pdf) {
                $message->to($userEmail)
                    ->subject('Thank You for Your Rental Application - #' . $applicant->id)
                    ->attach($pdf['path'], [
                        'as' => $pdf['filename'],
                        'mime' => 'application/pdf',
                    ]);
            });

            // Delete temp PDF after sending
            $this->pdfService->deleteTempPDF($pdf['path']);

            // Log success
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $userEmail,
                'recipient_name' => $userName,
                'recipient_type' => 'user',
                'subject' => 'Thank You for Your Rental Application - #' . $applicant->id,
                'message' => 'Thank you email sent to applicant with PDF',
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            // Log failure
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $applicant->email,
                'recipient_name' => $applicant->personalInformation->first_name ?? 'Applicant',
                'recipient_type' => 'user',
                'subject' => 'Thank You for Your Rental Application - #' . $applicant->id,
                'message' => 'Failed to send thank you email to user',
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Failed to send user thank you email: ' . $e->getMessage());

            return false;
        }
    }

    /**
     * Send both admin and user emails with PDF attachments
     */
    // public function sendAllApplicationEmails(Applicant $applicant, $formType = 'admin')
    // {
    //     $results = [
    //         'admin' => false,
    //         'user' => false
    //     ];

    //     // Get all admin users
    //     if ($formType === 'superadmin') {

    //         // ✅ ONLY SUPER ADMIN
    //         $superAdmins = \App\Models\User::where('role', 'superadmin')->get();

    //         foreach ($superAdmins as $admin) {
    //             $results['admin'] = $this->sendApplicationNotification($applicant, $admin->email);
    //         }
    //     } else {

    //         // ✅ NORMAL ADMIN (OLD FLOW)
    //         $admins = \App\Models\User::where('role', 'admin')->get();

    //         foreach ($admins as $admin) {
    //             $results['admin'] = $this->sendApplicationNotification($applicant, $admin->email);
    //         }
    //     }


    //     // Send to all admins
    //     foreach ($admins as $admin) {
    //         $results['admin'] = $this->sendApplicationNotification($applicant, $admin->email);
    //     }

    //     // Send thank you to user
    //     $results['user'] = $this->sendUserThankYouEmail($applicant);

    //     return $results;
    // }
    public function sendAllApplicationEmails(Applicant $applicant, $formType = 'admin')
    {
        $results = [
            'admin' => false,
            'user' => false
        ];

        $users = collect();

        // Check if applicant has a selected property and it has mapped recipients
        if ($applicant->property_id) {
            $property = \App\Models\Property::find($applicant->property_id);
            if ($property && !empty($property->app_notification_recipients)) {
                $users = \App\Models\User::whereIn('id', $property->app_notification_recipients)
                    ->whereIn('role', ['admin', 'superadmin'])
                    ->get();
            }
        }

        // Fallback to role-based default if no property-specific recipients are assigned
        if ($users->isEmpty()) {
            if ($formType === 'superadmin') {
                $users = \App\Models\User::where('role', 'superadmin')->get();
            } else {
                $users = \App\Models\User::where('role', 'admin')->get();
            }
        }

        // Send to mapped admins
        foreach ($users as $user) {
            $results['admin'] = $this->sendApplicationNotification($applicant, $user->email, $formType);
        }

        // Send thank you to user
        $results['user'] = $this->sendUserThankYouEmail($applicant);

        return $results;
    }

    public function getEmailLogs($applicantId)
    {
        return EmailLog::where('applicant_id', $applicantId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getEmailStats()
    {
        $totalSent = EmailLog::where('status', 'sent')->count();
        $totalFailed = EmailLog::where('status', 'failed')->count();
        $total = $totalSent + $totalFailed;

        $successRate = $total > 0 ? round(($totalSent / $total) * 100) : 100;

        return [
            'total_sent' => $totalSent,
            'total_failed' => $totalFailed,
            'admin_emails' => EmailLog::where('recipient_type', 'admin')->where('status', 'sent')->count(),
            'user_emails' => EmailLog::where('recipient_type', 'user')->where('status', 'sent')->count(),
            'success_rate' => $successRate,
        ];
    }

    /**
     * Send consent reminder to Excel/Triumph admin
     */
    public function sendConsentReminder(Applicant $applicant, $adminEmail, $formType = 'admin')
    {
        if (!$this->isEmailEnabled()) {
            Log::info("Email notifications are globally disabled. Skipping sendConsentReminder to: {$adminEmail}");
            return false;
        }

        try {
            Mail::send('emails.consent-reminder', [
                'applicant' => $applicant,
                'formType' => $formType
            ], function ($message) use ($adminEmail, $applicant, $formType) {
                $propertyName = $formType === 'superadmin' ? 'Excel' : 'Triumph';
                $message->to($adminEmail)
                    ->subject("Follow-up: Incomplete Consent Form for Applicant #{$applicant->id} - {$propertyName}");
            });

            // Log Success
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $adminEmail,
                'recipient_name' => $formType === 'superadmin' ? 'Excel Admin' : 'Triumph Admin',
                'recipient_type' => ($formType === 'superadmin') ? 'admin' : $formType,
                'subject' => "Follow-up: Incomplete Consent Form for Applicant #{$applicant->id}",
                'message' => 'Consent form reminder email sent to ' . ($formType === 'superadmin' ? 'Excel' : 'Triumph') . ' admin',
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            // Log Failure
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $adminEmail,
                'recipient_name' => $formType === 'superadmin' ? 'Excel Admin' : 'Triumph Admin',
                'recipient_type' => ($formType === 'superadmin') ? 'admin' : $formType,
                'subject' => "Follow-up: Incomplete Consent Form for Applicant #{$applicant->id}",
                'message' => 'Failed to send consent reminder email',
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::error('Failed to send consent reminder email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send tenant reminder email (automated or manual) to complete application / consent / payment
     */
    public function sendTenantReminder(
        Applicant $applicant,
        ?string $customSubject = null,
        ?string $customMessage = null,
        int $reminderNumber = 1,
        bool $isAuto = false
    ): bool {
        if (!$this->isEmailEnabled()) {
            Log::info("Email notifications are globally disabled. Skipping sendTenantReminder for Applicant #{$applicant->id}");
            return false;
        }

        // If tenant opted out, do not send
        if ($applicant->reminders_opted_out) {
            Log::info("Skipping reminder for Applicant #{$applicant->id}: Tenant opted out of automated reminders.");
            return false;
        }

        $email = trim($applicant->email ?: ($applicant->personalInformation?->email ?? ''));
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Log::warning("Cannot send tenant reminder for Applicant #{$applicant->id}: No valid email found.");
            return false;
        }

        $firstName = $applicant->personalInformation?->first_name ?? 'Applicant';
        $lastName = $applicant->personalInformation?->last_name ?? '';
        $recipientName = trim("{$firstName} {$lastName}") ?: 'Applicant';

        $formType = $applicant->type ?? 'admin';
        $isExcel = ($formType === 'superadmin' || str_contains(strtolower($applicant->company_name ?? ''), 'excel'));
        $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';
        $propertyName = $applicant->property_name ?: 'your selected property';

        $isConsentCompleted = $applicant->is_consent_completed;
        $isPaymentCompleted = in_array(strtolower($applicant->payment_status ?? ''), ['paid', 'completed']);
        $isAppCompleted = in_array(strtolower($applicant->status ?? ''), ['submitted', 'approved']);

        // Determine missing items
        $missingItems = [];
        if (!$isConsentCompleted) {
            $missingItems[] = 'Tenant Consent & Background Check Authorization';
        }
        if (!$isPaymentCompleted) {
            $missingItems[] = 'Screening Application Fee Payment';
        }
        if (!$isAppCompleted) {
            $missingItems[] = 'Application Form Details & Required Documents';
        }

        // Direct action URL
        $actionUrl = null;
        if (!$isConsentCompleted) {
            $actionUrl = $isExcel ? url('/consent/excel') : url('/consent');
        } elseif (!$isPaymentCompleted) {
            $actionUrl = url('/dashboard');
        } else {
            $actionUrl = $isExcel
                ? url('/rental-application-excel?applicant_id=' . $applicant->id)
                : url('/rental-application?applicant_id=' . $applicant->id);
        }

        $loginUrl = url('/login');
        $token = $applicant->getReminderOptOutToken();
        $optOutUrl = route('reminders.opt-out', ['applicant' => $applicant->id, 'token' => $token]);

        $stagePrefix = $reminderNumber >= 3 ? 'Final Reminder (3 of 3)' : "Reminder ({$reminderNumber} of 3)";

        // Set subject
        if (!empty($customSubject)) {
            $subject = $customSubject;
        } else {
            if (!$isConsentCompleted) {
                $subject = "{$stagePrefix}: Complete Your Consent Form - {$brandName}";
            } elseif (!$isPaymentCompleted) {
                $subject = "{$stagePrefix}: Application Fee Pending - {$brandName}";
            } else {
                $subject = "{$stagePrefix}: Incomplete Application Notice - {$brandName}";
            }
        }

        // Set message body
        if (!empty($customMessage)) {
            $messageBody = $customMessage;
        } else {
            $bulletPoints = !empty($missingItems) ? ("\n• " . implode("\n• ", $missingItems)) : '';
            $messageBody = "This is a friendly follow-up ({$stagePrefix}) regarding your rental application for {$propertyName}.\n\n"
                . "We noticed the following item(s) are still pending to complete your file:{$bulletPoints}\n\n"
                . "Please click the button below to complete the remaining steps, or log in to your tenant account using your registered email ({$email}) at any time.\n\n"
                . ($reminderNumber >= 3 
                    ? "This is our final scheduled reminder for this application. If you have any questions or require assistance, please feel free to reach out to our leasing office." 
                    : "This reminder was automatically generated. A total of up to 3 reminders will be sent 24 hours apart until your submission is completed.");
        }

        try {
            Mail::send('emails.tenant-reminder', [
                'applicant' => $applicant,
                'subject' => $subject,
                'messageBody' => $messageBody,
                'actionUrl' => $actionUrl,
                'loginUrl' => $loginUrl,
                'optOutUrl' => $optOutUrl,
                'reminderNumber' => $reminderNumber,
                'formType' => $formType,
                'brandName' => $brandName,
                'isExcel' => $isExcel,
                'missingItems' => $missingItems,
            ], function ($m) use ($email, $subject, $brandName) {
                $m->to($email)
                  ->subject($subject);
            });

            // Log Success in email_logs
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $email,
                'recipient_name' => $recipientName,
                'recipient_type' => 'user',
                'subject' => $subject,
                'message' => $messageBody,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            // Update applicant reminder metadata
            $applicant->increment('reminder_sent_count');
            $applicant->update([
                'last_reminder_sent_at' => now(),
            ]);

            Log::info("Tenant reminder ({$reminderNumber}/3) sent successfully to {$email} for Applicant #{$applicant->id}.");
            return true;
        } catch (\Throwable $e) {
            // Log Failure in email_logs
            EmailLog::create([
                'applicant_id' => $applicant->id,
                'recipient_email' => $email,
                'recipient_name' => $recipientName,
                'recipient_type' => 'user',
                'subject' => $subject,
                'message' => $messageBody,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'sent_at' => now(),
            ]);

            Log::error("Failed to send tenant reminder to {$email} for Applicant #{$applicant->id}: " . $e->getMessage());
            return false;
        }
    }
}

