<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReminderOptOutController extends Controller
{
    /**
     * Opt-out / Deactivate automated reminders for a tenant application.
     */
    public function optOut(Request $request, $applicant)
    {
        $applicantModel = $applicant instanceof Applicant
            ? $applicant
            : Applicant::with('personalInformation')->findOrFail($applicant);

        $token = $request->query('token');
        $hasValidSignature = $request->hasValidSignature();
        $hasValidToken = $applicantModel->verifyReminderOptOutToken($token);

        if (!$hasValidSignature && !$hasValidToken) {
            abort(403, 'Invalid or expired reminder opt-out link.');
        }

        $applicantModel->update([
            'reminders_opted_out' => true,
            'reminder_opt_out_at' => now(),
        ]);

        Log::info("Applicant #{$applicantModel->id} ({$applicantModel->email}) deactivated automated email reminders.");

        $formType = $applicantModel->type ?? 'admin';
        $isExcel = ($formType === 'superadmin' || str_contains(strtolower($applicantModel->company_name ?? ''), 'excel'));
        $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';

        return view('reminders.opt-out-status', [
            'applicant' => $applicantModel,
            'brandName' => $brandName,
            'isExcel' => $isExcel,
            'action' => 'deactivated',
            'reactivateUrl' => route('reminders.opt-in', [
                'applicant' => $applicantModel->id,
                'token' => $applicantModel->getReminderOptOutToken(),
            ]),
            'loginUrl' => url('/login'),
        ]);
    }

    /**
     * Re-activate automated reminders if the applicant clicked opt-out by mistake.
     */
    public function optIn(Request $request, $applicant)
    {
        $applicantModel = $applicant instanceof Applicant
            ? $applicant
            : Applicant::with('personalInformation')->findOrFail($applicant);

        $token = $request->query('token');
        $hasValidSignature = $request->hasValidSignature();
        $hasValidToken = $applicantModel->verifyReminderOptOutToken($token);

        if (!$hasValidSignature && !$hasValidToken) {
            abort(403, 'Invalid or expired reminder link.');
        }

        $applicantModel->update([
            'reminders_opted_out' => false,
            'reminder_opt_out_at' => null,
        ]);

        Log::info("Applicant #{$applicantModel->id} ({$applicantModel->email}) re-activated automated email reminders.");

        $formType = $applicantModel->type ?? 'admin';
        $isExcel = ($formType === 'superadmin' || str_contains(strtolower($applicantModel->company_name ?? ''), 'excel'));
        $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';

        return view('reminders.opt-out-status', [
            'applicant' => $applicantModel,
            'brandName' => $brandName,
            'isExcel' => $isExcel,
            'action' => 'reactivated',
            'deactivateUrl' => route('reminders.opt-out', [
                'applicant' => $applicantModel->id,
                'token' => $applicantModel->getReminderOptOutToken(),
            ]),
            'loginUrl' => url('/login'),
        ]);
    }

}
