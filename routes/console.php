<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Automatically check and send up to 3 reminders (24h gap) for tenants with incomplete applications/consent/payment
Schedule::command('app:send-tenant-reminders')->hourly();

// Admin notification for incomplete consents (daily)
Schedule::command('app:send-consent-reminders')->daily();

