<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class PaymentController extends Controller
{
    public function checkout(Request $request, $applicantId)
    {
        $applicant = Applicant::findOrFail($applicantId);
        
        if ($applicant->payment_status === 'paid') {
            return redirect()->route('dashboard')->with('success', 'Application fee already paid.');
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $adultCount = 0;
        
        // Primary applicant age
        if ($applicant->personalInformation && $applicant->personalInformation->date_of_birth) {
            $age = \Carbon\Carbon::parse($applicant->personalInformation->date_of_birth)->age;
            if ($age >= 18) {
                $adultCount++;
            }
        }

        // Household members age
        if ($applicant->householdMembers) {
            foreach ($applicant->householdMembers as $member) {
                if ($member->date_of_birth) {
                    $age = \Carbon\Carbon::parse($member->date_of_birth)->age;
                    if ($age >= 18) {
                        $adultCount++;
                    }
                }
            }
        }
        
        // Ensure at least 1 adult if somehow calculation fails, usually primary applicant is adult
        if ($adultCount === 0) {
            $adultCount = 1;
        }

        $feePerAdult = (float) \App\Models\Setting::get('adult_application_fee', 50);
        $appFee = $adultCount * $feePerAdult;
        
        $enableHoldingDeposit = \App\Models\Setting::get('enable_holding_deposit', '0') === '1';
        $holdingDepositAmount = $enableHoldingDeposit ? (float) \App\Models\Setting::get('holding_deposit_amount', 200) : 0.0;
        
        $totalAmount = $appFee + $holdingDepositAmount;
        $totalAmountCents = $totalAmount * 100;

        $lineItems = [];
        
        if ($enableHoldingDeposit && $holdingDepositAmount > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Rental Application Holding Deposit',
                    ],
                    'unit_amount' => (int) ($holdingDepositAmount * 100),
                ],
                'quantity' => 1,
            ];
        }
        
        $lineItems[] = [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => 'Rental Application Fee - Adult (' . $adultCount . ')',
                ],
                'unit_amount' => (int) ($feePerAdult * 100),
            ],
            'quantity' => $adultCount,
        ];

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => route('payment.success', ['applicant' => $applicant->id]) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('payment.cancel', ['applicant' => $applicant->id]),
            'client_reference_id' => $applicant->id,
            'customer_email' => $applicant->email,
        ]);

        Payment::create([
            'applicant_id' => $applicant->id,
            'user_id' => auth()->id(),
            'stripe_session_id' => $session->id,
            'amount' => $totalAmount,
            'status' => 'pending',
            'metadata' => [
                'fee_per_adult' => $feePerAdult,
                'adult_count' => $adultCount,
                'holding_deposit' => $holdingDepositAmount,
            ]
        ]);

        return Inertia::location($session->url);
    }

    public function success(Request $request, Applicant $applicant)
    {
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            return redirect()->route('dashboard');
        }

        Stripe::setApiKey(config('services.stripe.secret'));
        $session = Session::retrieve($sessionId);

        if ($session->payment_status === 'paid') {
            $payment = Payment::where('stripe_session_id', $sessionId)->first();
            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'stripe_payment_intent_id' => $session->payment_intent,
                ]);

                $applicant->update(['payment_status' => 'paid']);
                
                // Notify user
                auth()->user()->notify(new \App\Notifications\PaymentSuccessful($payment));
            }
        }

        return Inertia::render('Payment/Success', [
            'applicant' => $applicant,
            'payment' => Payment::where('stripe_session_id', $sessionId)->first()
        ]);
    }

    public function cancel(Applicant $applicant)
    {
        return Inertia::render('Payment/Cancel', [
            'applicant' => $applicant
        ]);
    }

    public function downloadInvoice($paymentId)
    {
        $payment = Payment::with(['applicant.personalInformation'])->findOrFail($paymentId);
        
        // Ensure the user owns this payment or is an administrator
        $user = auth()->user();
        if ($payment->user_id !== $user->id && !$user->isAdmin() && !$user->isSuperAdmin()) {
            abort(403);
        }

        $applicant = $payment->applicant;
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', compact('payment', 'applicant'));
        
        return $pdf->stream('invoice-' . $payment->id . '.pdf');
    }
}
