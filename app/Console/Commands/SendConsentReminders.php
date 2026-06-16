<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Applicant;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SendConsentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-consent-reminders {--force : Bypass the 24-hour delay check for testing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email reminders to Excel/Triumph admins for applicants who did not complete the consent form.';

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
        $this->info('Starting consent reminders check...');

        // Check if consent reminders are enabled in settings
        if (\App\Models\Setting::get('enable_consent_reminders', '1') !== '1') {
            $this->info('Consent reminders are disabled in settings. Skipping.');
            return;
        }

        $force = $this->option('force');

        // Find applicants who filled application form but incomplete without filling consent form
        $applicants = Applicant::with('personalInformation')
            ->where(function ($q) {
                $q->whereNull('admin_comment')
                  ->orWhere('admin_comment', '');
            })
            ->where('reminder_sent_count', '<', 3)
            ->whereHas('personalInformation')
            ->when(!$force, function ($query) {
                $query->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->whereNull('last_reminder_sent_at')
                            ->where('updated_at', '<=', now()->subHours(24));
                    })->orWhere(function ($sub) {
                        $sub->whereNotNull('last_reminder_sent_at')
                            ->where('last_reminder_sent_at', '<=', now()->subHours(24));
                    });
                });
            })
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('consent_records')
                    ->whereColumn('consent_records.applicant_id', 'applicants.id')
                    ->where('consent_records.status', 'completed');
            })
            ->get();

        $this->info('Found ' . $applicants->count() . ' matching incomplete applications.');

        foreach ($applicants as $applicant) {
            $this->info("Processing Applicant #{$applicant->id} ({$applicant->email})...");

            // Determine admin role based on applicant type
            $formType = $applicant->type;
            $admins = collect();

            if ($applicant->property_id) {
                $property = \App\Models\Property::find($applicant->property_id);
                if ($property && !empty($property->reminder_notification_recipients)) {
                    $admins = User::whereIn('id', $property->reminder_notification_recipients)
                        ->whereIn('role', ['admin', 'superadmin'])
                        ->get();
                }
            }

            if ($admins->isEmpty()) {
                if ($formType === 'superadmin') {
                    $admins = User::where('role', 'superadmin')->get();
                } else {
                    $admins = User::where('role', 'admin')->get();
                }
            }

            if ($admins->isEmpty()) {
                $this->warn("No administrators found for form type: {$formType}");
                continue;
            }

            $sentSuccessfully = false;
            foreach ($admins as $admin) {
                $this->info("Sending email to {$admin->email}...");
                $success = $this->emailService->sendConsentReminder($applicant, $admin->email, $formType);
                if ($success) {
                    $sentSuccessfully = true;
                }
            }

            if ($sentSuccessfully) {
                $applicant->increment('reminder_sent_count');
                $applicant->update([
                    'last_reminder_sent_at' => now()
                ]);
                $this->info("Successfully sent reminder for Applicant #{$applicant->id}.");
            } else {
                $this->error("Failed to send reminders for Applicant #{$applicant->id}.");
            }
        }

        $this->info('Consent reminders check completed.');
    }
}
