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
        $enableConsentReminders = Setting::get('enable_consent_reminders', '1') === '1';
        $enablePaymentReminders = Setting::get('enable_payment_reminders', '1') === '1';

        $properties = \App\Models\Property::orderBy('property_name')->get();
        $admins = \App\Models\User::whereIn('role', ['admin', 'superadmin'])->orderBy('name')->get();

        return Inertia::render('Admin/Settings', [
            'adultApplicationFee' => (float) $adultApplicationFee,
            'enableHoldingDeposit' => $enableHoldingDeposit,
            'holdingDepositAmount' => (float) $holdingDepositAmount,
            'enableConsentReminders' => $enableConsentReminders,
            'enablePaymentReminders' => $enablePaymentReminders,
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
            'enable_holding_deposit' => 'required|boolean',
            'holding_deposit_amount' => 'required_if:enable_holding_deposit,true|numeric|min:0',
            'enable_consent_reminders' => 'required|boolean',
            'enable_payment_reminders' => 'required|boolean',
            'property_settings' => 'nullable|array',
            'property_settings.*.id' => 'required|exists:properties,id',
            'property_settings.*.app_notification_recipients' => 'nullable|array',
            'property_settings.*.app_notification_recipients.*' => 'exists:users,id',
            'property_settings.*.reminder_notification_recipients' => 'nullable|array',
            'property_settings.*.reminder_notification_recipients.*' => 'exists:users,id',
        ]);

        Setting::set('adult_application_fee', $validated['adult_application_fee']);
        Setting::set('enable_holding_deposit', $validated['enable_holding_deposit'] ? '1' : '0');
        Setting::set('holding_deposit_amount', $validated['holding_deposit_amount'] ?? '0');
        Setting::set('enable_consent_reminders', $validated['enable_consent_reminders'] ? '1' : '0');
        Setting::set('enable_payment_reminders', $validated['enable_payment_reminders'] ? '1' : '0');

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
