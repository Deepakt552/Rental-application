<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Applicant;
use App\Models\Setting;
use App\Services\EmailService;
use Illuminate\Support\Facades\Log;

class SendTenantReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-tenant-reminders {--force : Bypass the 24-hour delay check for testing} {--applicant= : Send reminder to a specific applicant ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically send up to 3 email reminders (24 hours apart) to tenants with incomplete applications, consent forms, or pending payments.';

    protected $emailService;

    public function __construct(EmailService $emailService)
    {
        parent::__construct();
        $this->emailService = $emailService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting automated tenant application reminders check...');

        // Check global settings for reminders
        $automatedRemindersEnabled = Setting::get('enable_automated_reminders', '1') === '1';
        $consentEnabled = Setting::get('enable_consent_reminders', '1') === '1';
        $paymentEnabled = Setting::get('enable_payment_reminders', '1') === '1';
        $notificationsEnabled = Setting::get('enable_email_notifications', '1') === '1';

        if (!$notificationsEnabled) {
            $this->warn('Email notifications are globally disabled in settings. Skipping.');
            return 0;
        }

        if (!$automatedRemindersEnabled) {
            $this->warn('Automated tenant reminders are disabled in settings. Skipping.');
            return 0;
        }

        if (!$consentEnabled && !$paymentEnabled) {
            $this->warn('Both consent and payment reminders are disabled in settings. Skipping.');
            return 0;
        }

        $force = $this->option('force');
        $specificApplicantId = $this->option('applicant');

        $query = Applicant::with(['personalInformation', 'consentRecord', 'payments'])
            ->where(function ($q) {
                $q->where('reminders_opted_out', false)
                  ->orWhereNull('reminders_opted_out');
            })
            ->where('reminder_sent_count', '<', 3)
            ->whereNotIn('status', ['rejected', 'declined', 'cancelled', 'withdrawn', 'approved'])
            ->where(function ($q) {
                $q->whereNull('admin_comment')
                  ->orWhere('admin_comment', '');
            });

        // Filter by reminder start date (cutoff date configured by admin)
        // Reminders will only be sent to applicants created on or after this date.
        $reminderStartDate = Setting::get('reminder_start_date');
        if (!empty($reminderStartDate)) {
            try {
                $cutoffDate = \Carbon\Carbon::parse($reminderStartDate)->startOfDay();
                $query->where('created_at', '>=', $cutoffDate);
                $this->info("Reminder cutoff active: Only applicants created on or after {$cutoffDate->toDateString()} will be processed.");
            } catch (\Exception $e) {
                Log::warning("Invalid reminder_start_date format: {$reminderStartDate}");
            }
        }

        if ($specificApplicantId) {
            $query->where('id', $specificApplicantId);
        }

        if (!$force) {
            $query->where(function ($q) {
                // First reminder: 24h after application creation or update
                $q->where(function ($sub) {
                    $sub->where(function ($c) {
                        $c->whereNull('reminder_sent_count')
                          ->orWhere('reminder_sent_count', 0);
                    })->where('created_at', '<=', now()->subHours(24));
                })
                // Subsequent reminders: at least 24h after last reminder
                ->orWhere(function ($sub) {
                    $sub->where('reminder_sent_count', '>', 0)
                        ->whereNotNull('last_reminder_sent_at')
                        ->where('last_reminder_sent_at', '<=', now()->subHours(24));
                });
            });
        }

        $candidates = $query->get();
        $this->info("Found {$candidates->count()} candidate applicant(s) for reminder verification.");

        $sentCount = 0;
        $skippedCount = 0;
        $failedCount = 0;

        foreach ($candidates as $applicant) {
            $email = trim($applicant->email ?: ($applicant->personalInformation?->email ?? ''));

            if (empty($email)) {
                $this->warn("Applicant #{$applicant->id} has no valid email address. Skipping.");
                $skippedCount++;
                continue;
            }

            // Verify whether anything is actually incomplete
            $isConsentCompleted = $applicant->is_consent_completed;
            $isPaymentCompleted = in_array(strtolower($applicant->payment_status ?? ''), ['paid', 'completed']);
            $isAppCompleted = in_array(strtolower($applicant->status ?? ''), ['submitted', 'approved']);

            // If everything is already complete, no reminder is needed
            if ($isConsentCompleted && $isPaymentCompleted && $isAppCompleted) {
                $this->line("Applicant #{$applicant->id} is fully completed (Consent, Payment & Application). Skipping.");
                $skippedCount++;
                continue;
            }

            // Respect specific settings if only one type of reminder is active
            if (!$consentEnabled && !$isConsentCompleted && $isPaymentCompleted && $isAppCompleted) {
                $this->line("Applicant #{$applicant->id} pending consent, but consent reminders disabled in settings. Skipping.");
                $skippedCount++;
                continue;
            }

            if (!$paymentEnabled && !$isPaymentCompleted && $isConsentCompleted && $isAppCompleted) {
                $this->line("Applicant #{$applicant->id} pending payment, but payment reminders disabled in settings. Skipping.");
                $skippedCount++;
                continue;
            }

            $nextReminderNumber = ($applicant->reminder_sent_count ?? 0) + 1;
            $this->info("Sending Reminder {$nextReminderNumber}/3 to Applicant #{$applicant->id} ({$email})...");

            $success = $this->emailService->sendTenantReminder(
                $applicant,
                null, // Use auto-generated dynamic subject
                null, // Use auto-generated dynamic message
                $nextReminderNumber,
                true  // isAuto
            );

            if ($success) {
                $this->info("✓ Successfully sent Reminder {$nextReminderNumber}/3 to {$email}.");
                $sentCount++;
            } else {
                $this->error("✗ Failed to send reminder to {$email}.");
                $failedCount++;
            }
        }

        $this->info("Automated tenant reminders run complete.");
        $this->table(
            ['Metric', 'Count'],
            [
                ['Candidates Checked', $candidates->count()],
                ['Reminders Sent', $sentCount],
                ['Skipped (Complete/No Email/Disabled)', $skippedCount],
                ['Failed', $failedCount],
            ]
        );

        Log::info("Automated tenant reminders job finished: Sent={$sentCount}, Skipped={$skippedCount}, Failed={$failedCount}");

        return 0;
    }
}
