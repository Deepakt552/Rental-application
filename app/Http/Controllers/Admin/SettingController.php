<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Show settings edit page.
     */
    public function edit()
    {
        $adultApplicationFee = Setting::get('adult_application_fee', 50);
        $enableHoldingDeposit = Setting::get('enable_holding_deposit', '0') === '1';
        $holdingDepositAmount = Setting::get('holding_deposit_amount', 200);
        $enableEmailNotifications = Setting::get('enable_email_notifications', '1') === '1';
        $enableConsentReminders = Setting::get('enable_consent_reminders', '1') === '1';
        $enablePaymentReminders = Setting::get('enable_payment_reminders', '1') === '1';
        $enableAutomatedReminders = Setting::get('enable_automated_reminders', '1') === '1';
        $reminderStartDate = Setting::get('reminder_start_date', '');

        $properties = \App\Models\Property::orderBy('property_name')->get();
        $admins = \App\Models\User::whereIn('role', ['admin', 'superadmin'])->orderBy('name')->get();

        return Inertia::render('Admin/Settings', [
            'adultApplicationFee' => (float) $adultApplicationFee,
            'enableHoldingDeposit' => $enableHoldingDeposit,
            'holdingDepositAmount' => (float) $holdingDepositAmount,
            'enableEmailNotifications' => $enableEmailNotifications,
            'enableConsentReminders' => $enableConsentReminders,
            'enablePaymentReminders' => $enablePaymentReminders,
            'enableAutomatedReminders' => $enableAutomatedReminders,
            'reminderStartDate' => $reminderStartDate ?: '',
            'properties' => $properties,
            'admins' => $admins,
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'adult_application_fee' => 'required|numeric|min:0',
            'enable_holding_deposit' => 'nullable|boolean',
            'holding_deposit_amount' => 'nullable|numeric|min:0',
            'enable_email_notifications' => 'nullable|boolean',
            'enable_consent_reminders' => 'nullable|boolean',
            'enable_payment_reminders' => 'nullable|boolean',
            'enable_automated_reminders' => 'nullable|boolean',
            'reminder_start_date' => 'nullable|string',
            'property_settings' => 'nullable|array',
            'property_settings.*.id' => 'required|exists:properties,id',
            'property_settings.*.app_notification_recipients' => 'nullable|array',
            'property_settings.*.reminder_notification_recipients' => 'nullable|array',
        ]);

        Setting::set('adult_application_fee', $validated['adult_application_fee']);
        Setting::set('enable_holding_deposit', !empty($validated['enable_holding_deposit']) ? '1' : '0');
        Setting::set('holding_deposit_amount', !empty($validated['holding_deposit_amount']) ? (string) $validated['holding_deposit_amount'] : '0');
        Setting::set('enable_email_notifications', !empty($validated['enable_email_notifications']) ? '1' : '0');
        Setting::set('enable_consent_reminders', !empty($validated['enable_consent_reminders']) ? '1' : '0');
        Setting::set('enable_payment_reminders', !empty($validated['enable_payment_reminders']) ? '1' : '0');
        Setting::set('enable_automated_reminders', !empty($validated['enable_automated_reminders']) ? '1' : '0');

        $cleanDate = '';
        if (!empty($validated['reminder_start_date'])) {
            $ts = strtotime($validated['reminder_start_date']);
            if ($ts !== false) {
                $cleanDate = date('Y-m-d', $ts);
            }
        }
        Setting::set('reminder_start_date', $cleanDate);

        if (!empty($validated['property_settings'])) {
            foreach ($validated['property_settings'] as $propSetting) {
                $property = \App\Models\Property::find($propSetting['id']);
                if ($property) {
                    $property->update([
                        'app_notification_recipients' => $propSetting['app_notification_recipients'] ?? [],
                        'reminder_notification_recipients' => $propSetting['reminder_notification_recipients'] ?? [],
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
}
