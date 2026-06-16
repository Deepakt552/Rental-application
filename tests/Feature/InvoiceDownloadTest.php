<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Payment;
use App\Models\User;
use App\Models\PersonalInformation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceDownloadTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Seeds the minimum required applicant data including personal information.
     */
    private function createApplicantWithPersonalInfo(User $user): Applicant
    {
        $applicant = Applicant::create([
            'email' => $user->email,
            'user_id' => $user->id
        ]);

        PersonalInformation::create([
            'applicant_id' => $applicant->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => $user->email,
            'phone' => '123-456-7890',
            'date_of_birth' => '1990-01-01'
        ]);

        return $applicant;
    }

    /**
     * Test owner can download invoice.
     */
    public function test_owner_can_download_invoice(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $applicant = $this->createApplicantWithPersonalInfo($user);

        $payment = Payment::create([
            'applicant_id' => $applicant->id,
            'user_id' => $user->id,
            'amount' => 50.00,
            'status' => 'completed',
            'metadata' => [
                'fee_per_adult' => 50,
                'adult_count' => 1,
                'holding_deposit' => 0
            ]
        ]);

        $response = $this->actingAs($user)
            ->get(route('payment.invoice', $payment->id));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /**
     * Test admin can download invoice.
     */
    public function test_admin_can_download_invoice(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $admin = User::factory()->create(['role' => 'admin']);
        $applicant = $this->createApplicantWithPersonalInfo($user);

        $payment = Payment::create([
            'applicant_id' => $applicant->id,
            'user_id' => $user->id,
            'amount' => 50.00,
            'status' => 'completed',
            'metadata' => [
                'fee_per_adult' => 50,
                'adult_count' => 1,
                'holding_deposit' => 0
            ]
        ]);

        $response = $this->actingAs($admin)
            ->get(route('payment.invoice', $payment->id));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /**
     * Test superadmin can download invoice.
     */
    public function test_superadmin_can_download_invoice(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $superadmin = User::factory()->create(['role' => 'superadmin']);
        $applicant = $this->createApplicantWithPersonalInfo($user);

        $payment = Payment::create([
            'applicant_id' => $applicant->id,
            'user_id' => $user->id,
            'amount' => 50.00,
            'status' => 'completed',
            'metadata' => [
                'fee_per_adult' => 50,
                'adult_count' => 1,
                'holding_deposit' => 0
            ]
        ]);

        $response = $this->actingAs($superadmin)
            ->get(route('payment.invoice', $payment->id));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /**
     * Test unrelated user cannot download invoice (gets 403).
     */
    public function test_unrelated_user_cannot_download_invoice(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $otherUser = User::factory()->create(['role' => 'user']);
        $applicant = $this->createApplicantWithPersonalInfo($user);

        $payment = Payment::create([
            'applicant_id' => $applicant->id,
            'user_id' => $user->id,
            'amount' => 50.00,
            'status' => 'completed',
            'metadata' => [
                'fee_per_adult' => 50,
                'adult_count' => 1,
                'holding_deposit' => 0
            ]
        ]);

        $response = $this->actingAs($otherUser)
            ->get(route('payment.invoice', $payment->id));

        $response->assertStatus(403);
    }
}
