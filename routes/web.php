<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\ConsentController;
use App\Http\Controllers\PropertyController;
// use App\Http\Controllers\Admin\PropertyController as AdminPropertyController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/phpinfo', function () {
    phpinfo();
});

Route::get('/test-gd', function () {
    return [
        'gd_loaded'  => extension_loaded('gd'),
        'gd_info'    => extension_loaded('gd') ? gd_info() : 'Not available',
        'php_version' => phpversion(),
    ];
});
// Consent Form Routes (Add this before your existing routes)
Route::prefix('consent')->name('consent.')->group(function () {
    Route::get('/', [ConsentController::class, 'index'])->name('index');
    Route::get('/excel', [ConsentController::class, 'indexExcel'])->name('index.excel');
    Route::post('/step1', [ConsentController::class, 'saveStep1'])->name('step1.save');
    Route::post('/excel/step1', [ConsentController::class, 'saveExcel'])->name('excel.save');
    Route::post('/step2', [ConsentController::class, 'saveStep2'])->name('step2.save');
    Route::post('/step3', [ConsentController::class, 'saveStep3'])->name('step3.save');
    Route::get('/step/{step}/data', [ConsentController::class, 'getStepData'])->name('step.data');
    Route::post('/complete-and-download', [ConsentController::class, 'completeAndDownload'])->name('complete.download');

    Route::post('/complete', [ConsentController::class, 'completeConsent'])->name('complete');
    Route::get('/status', [ConsentController::class, 'getStatus'])->name('status');
});
// Public routes - Rental Application Form
Route::get('/rental-application', [ApplicationController::class, 'index'])->name('home');
Route::get('/rental-application-excel', [ApplicationController::class, 'indexExcel'])->name('home.excel');

Route::post('/application', [ApplicationController::class, 'store'])->name('application.store');
Route::get('/application/success', [ApplicationController::class, 'success'])->name('application.success');







// Multi-step form routes (if needed)
Route::prefix('application')->group(function () {
    Route::get('/', [ApplicationController::class, 'index'])->name('application.form');
    Route::get('/step1', [ApplicationController::class, 'step1'])->name('application.step1');
    Route::get('/step2', [ApplicationController::class, 'step2'])->name('application.step2');
    Route::get('/step3', [ApplicationController::class, 'step3'])->name('application.step3');
    Route::get('/step4', [ApplicationController::class, 'step4'])->name('application.step4');
    Route::get('/step5', [ApplicationController::class, 'step5'])->name('application.step5');
    Route::get('/step6', [ApplicationController::class, 'step6'])->name('application.step6');
    Route::get('/step7', [ApplicationController::class, 'step7'])->name('application.step7');
    Route::get('/step8', [ApplicationController::class, 'step8'])->name('application.step8');
    Route::get('/step9', [ApplicationController::class, 'step9'])->name('application.step9');
    Route::get('/step10', [ApplicationController::class, 'step10'])->name('application.step10');
    Route::get('/success', [ApplicationController::class, 'success'])->name('application.success');

    Route::post('/step1', [ApplicationController::class, 'storeStep1'])->name('application.store.step1');
    Route::post('/step2', [ApplicationController::class, 'storePersonalInfo'])->name('application.store.step2');
    Route::post('/step3', [ApplicationController::class, 'storeCurrentAddress'])->name('application.store.step3');
    Route::post('/step4', [ApplicationController::class, 'storePreviousAddress'])->name('application.store.step4');
    Route::post('/step5', [ApplicationController::class, 'storeEmployment'])->name('application.store.step5');
    Route::post('/step6', [ApplicationController::class, 'storePreviousEmployment'])->name('application.store.step6');
    Route::post('/step7', [ApplicationController::class, 'storeScreening'])->name('application.store.step7');
    Route::post('/step8', [ApplicationController::class, 'storePets'])->name('application.store.step8');
    Route::post('/step9', [ApplicationController::class, 'storeVehicles'])->name('application.store.step9');
    Route::post('/step10', [ApplicationController::class, 'storeEmergencyContact'])->name('application.store.step10');
});
Route::prefix('api/application')->group(function () {
    Route::post('/init', [App\Http\Controllers\ApplicationController::class, 'initApplication']);
    Route::post('/check-email', [App\Http\Controllers\ApplicationController::class, 'checkEmail']);
    Route::post('/resume', [App\Http\Controllers\ApplicationController::class, 'resumeByEmail']);
    Route::get('/resume/{email}', [App\Http\Controllers\ApplicationController::class, 'resumeByEmail']);
    Route::get('/applicant/{id}', [App\Http\Controllers\ApplicationController::class, 'getApplicantById']);
    Route::post('/step/current', [App\Http\Controllers\ApplicationController::class, 'updateCurrentStep']);
    Route::post('/step1/save', [App\Http\Controllers\ApplicationController::class, 'saveStep1']);
    Route::post('/step2/save', [App\Http\Controllers\ApplicationController::class, 'saveStep2']);
    Route::post('/step3/save', [App\Http\Controllers\ApplicationController::class, 'saveStep3']);
    Route::post('/step4/save', [App\Http\Controllers\ApplicationController::class, 'saveStep4']);
    Route::post('/step5/save', [App\Http\Controllers\ApplicationController::class, 'saveStep5']);
    Route::post('/step6/save', [App\Http\Controllers\ApplicationController::class, 'saveStep6']);
    Route::post('/step7/save', [App\Http\Controllers\ApplicationController::class, 'saveStep7']);
    Route::post('/step8/save', [App\Http\Controllers\ApplicationController::class, 'saveStep8']);
    Route::post('/step9/save', [App\Http\Controllers\ApplicationController::class, 'saveStep9']);
    Route::post('/step10/save', [App\Http\Controllers\ApplicationController::class, 'saveStep10']);
    Route::post('/final-submit', [App\Http\Controllers\ApplicationController::class, 'finalSubmit']);

    Route::get('/ping', function () {
        return response()->json(['success' => true]);
    });

    Route::get('/{applicant}/pdf', [App\Http\Controllers\ApplicationController::class, 'viewPdf'])->name('application.pdf');
    Route::get('/{applicant}/consent/pdf', [App\Http\Controllers\ConsentController::class, 'viewPdf'])->name('application.consent.pdf');
});

use App\Models\Applicant;

Route::get('/dashboard', function () {
    $user = auth()->user();
    $isAdmin = in_array($user->role, ['admin', 'superadmin']);

    if ($isAdmin) {
        return redirect()->route('admin.dashboard');
    } else {
        // User/Applicant Dashboard Data (Keep your existing logic)
        $applicant = \App\Models\Applicant::where('user_id', auth()->id())
            ->with(['payments', 'documents', 'consentRecord', 'emailLogs'])
            ->latest()
            ->first();

        if ($applicant && !$applicant->consentRecord) {
            $personalInfo = $applicant->personalInformation;
            if ($personalInfo) {
                $fullName = $personalInfo->first_name . ' ' . $personalInfo->last_name;
                $tenantConsent = \App\Models\ApplicantTenantConsent::where('applicant_name', $fullName)
                    ->latest()
                    ->first();
                if ($tenantConsent) {
                    $consentRecord = \App\Models\ConsentRecord::where('session_id', $tenantConsent->session_id)->first();
                    if ($consentRecord) {
                        $consentRecord->update(['applicant_id' => $applicant->id]);
                        $applicant->load('consentRecord');
                    }
                }
            }
        }

        $isConsentCompleted = $applicant
            ? \App\Models\ConsentRecord::where('applicant_id', $applicant->id)
            ->where('status', 'completed')
            ->exists()
            : false;

        return Inertia::render('Dashboard', [
            'applicant' => $applicant ? [
                'id' => $applicant->id,
                'company_name' => $applicant->company_name,
                'property_name' => $applicant->property_name,
                'property_type' => $applicant->property_type,
                'current_step' => $applicant->current_step,
                'status' => $applicant->status,
                'payment_status' => $applicant->payment_status,
                'is_consent_completed' => $isConsentCompleted,
                'updated_at' => $applicant->updated_at->diffForHumans(),
                'email_logs' => $applicant->emailLogs,
                'documents' => $applicant->documents->map(fn($doc) => [
                    'id' => $doc->id,
                    'name' => $doc->original_filename,
                    'type' => $doc->document_type,
                    'url' => asset('storage/' . $doc->file_path)
                ]),
                'payments' => $applicant->payments->map(fn($p) => [
                    'id' => $p->id,
                    'amount' => $p->amount / 100,
                    'status' => $p->status,
                    'created_at' => $p->created_at->format('M d, Y')
                ]),
                'summary' => $applicant->loadFullFormData(),
            ] : null,
            'notifications' => auth()->user()->notifications,
            'paymentSettings' => [
                'enable_holding_deposit' => \App\Models\Setting::get('enable_holding_deposit', '0') === '1',
                'adult_application_fee' => (float)\App\Models\Setting::get('adult_application_fee', 50),
                'holding_deposit_amount' => (float)\App\Models\Setting::get('holding_deposit_amount', 200),
            ],
            'auth' => [
                'user' => $user,
            ],
        ]);
    }
})->middleware(['auth', 'verified'])->name('dashboard');
Route::middleware(['auth'])->group(function () {
    Route::post('/payment/checkout/{applicant}', [\App\Http\Controllers\PaymentController::class, 'checkout'])->name('payment.checkout');
    Route::get('/payment/success/{applicant}', [\App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
    Route::get('/payment/cancel/{applicant}', [\App\Http\Controllers\PaymentController::class, 'cancel'])->name('payment.cancel');
    Route::get('/payment/invoice/{payment}', [\App\Http\Controllers\PaymentController::class, 'downloadInvoice'])->name('payment.invoice');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes (protected by admin middleware)
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminApplicationController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/applications', [AdminApplicationController::class, 'index'])->name('admin.applications.index');
    Route::get('/applications/export', [AdminApplicationController::class, 'export'])->name('admin.applications.export');
    Route::get('/applications/{id}', [AdminApplicationController::class, 'show'])->name('admin.applications.show');
    Route::post('/applications/{id}/resend', [AdminApplicationController::class, 'resend'])->name('admin.applications.resend');
    Route::post('/applications/{id}/comment', [AdminApplicationController::class, 'updateComment'])->name('admin.applications.comment');
    Route::delete('/applications/{id}', [AdminApplicationController::class, 'destroy'])->name('admin.applications.destroy');
    Route::get('/payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('admin.payments.index');
    Route::get('/payments/export', [\App\Http\Controllers\Admin\PaymentController::class, 'export'])->name('admin.payments.export');

    // Email Logs Routes
    Route::get('/email-logs/unread-count', [\App\Http\Controllers\Admin\EmailLogController::class, 'unreadCount'])->name('admin.email-logs.unread-count');
    Route::get('/email-logs', [\App\Http\Controllers\Admin\EmailLogController::class, 'index'])->name('admin.email-logs');
    Route::get('/email-logs/export', [\App\Http\Controllers\Admin\EmailLogController::class, 'export'])->name('admin.email-logs.export');
    Route::get('/email-logs/{id}', [\App\Http\Controllers\Admin\EmailLogController::class, 'show'])->name('admin.email-logs.show');
    Route::post('/email-logs/{id}/resend', [\App\Http\Controllers\Admin\EmailLogController::class, 'resend'])->name('admin.email-logs.resend');
    Route::delete('/email-logs/{id}', [\App\Http\Controllers\Admin\EmailLogController::class, 'destroy'])->name('admin.email-logs.destroy');


    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/export', [\App\Http\Controllers\Admin\UserController::class, 'export'])->name('admin.users.export');
    Route::get('/users/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{id}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
    Route::put('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::patch('/users/{id}/role', [\App\Http\Controllers\Admin\UserController::class, 'changeRole'])->name('admin.users.change-role');

    // Settings Routes
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'edit'])->name('admin.settings.edit');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('admin.settings.update');

   Route::get('properties/export', [\App\Http\Controllers\Admin\PropertyController::class, 'export'])->name('admin.properties.export');
   Route::resource('properties', \App\Http\Controllers\Admin\PropertyController::class)->names('admin.properties')->except(['show']);
});
// Route::prefix('properties')->group(function () {
//     Route::get('/list', [PropertyController::class, 'getProperties']);
//     Route::get('/types', [PropertyController::class, 'getPropertyTypes']);
//     Route::post('/store', [PropertyController::class, 'store']);
//     Route::get('/{id}', [PropertyController::class, 'show']);
//     Route::put('/{id}', [PropertyController::class, 'update']);
// });
Route::get('/properties/search', [PropertyController::class, 'search']);
Route::get('/properties/types/{id}', [PropertyController::class, 'getPropertyTypes']);

require __DIR__ . '/auth.php';
