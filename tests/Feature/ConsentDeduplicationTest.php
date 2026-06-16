<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\ConsentRecord;
use App\Models\User;
use App\Models\ApplicantTenantConsent;
use App\Models\CriminalBackgroundCheck;
use App\Models\AffordableHousingConsent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ConsentDeduplicationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Seeds the minimum required consent tables to bypass validation.
     */
    private function seedConsentData(string $sessionId): void
    {
        ApplicantTenantConsent::create([
            'session_id' => $sessionId,
            'applicant_name' => 'John Doe',
            'signature' => 'data:image/png;base64,...',
            'consent_date' => now()
        ]);

        CriminalBackgroundCheck::create([
            'session_id' => $sessionId,
            'applicant_name' => 'John Doe',
            'social_security_no' => '000-00-0000',
            'date_of_birth' => '1990-01-01',
            'today_date' => '2026-05-25',
            'signature' => 'data:image/png;base64,...'
        ]);

        AffordableHousingConsent::create([
            'session_id' => $sessionId,
            'member_type' => 'head_household',
            'name' => 'John Doe',
            'signature' => 'data:image/png;base64,...',
            'consent_date' => now()
        ]);
    }

    /**
     * Test completeConsent with no applicant (Excel mode)
     */
    public function test_complete_consent_excel_mode(): void
    {
        $sessionId = (string) Str::uuid();

        // Create a pending consent record
        ConsentRecord::create([
            'session_id' => $sessionId,
            'applicant_id' => null,
            'status' => 'pending'
        ]);

        $this->seedConsentData($sessionId);

        $response = $this->postJson(route('consent.complete'), [
            'session_id' => $sessionId,
            'is_excel' => true
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('consent_records', [
            'session_id' => $sessionId,
            'applicant_id' => null,
            'status' => 'completed'
        ]);
    }

    /**
     * Test completeConsent with an applicant, resolving a session record (Triumph mode)
     */
    public function test_complete_consent_triumph_mode_updates_existing_session_record(): void
    {
        $user = User::factory()->create();
        $applicant = Applicant::create([
            'email' => 'john@example.com',
            'user_id' => $user->id
        ]);

        $sessionId = (string) Str::uuid();

        // There is an existing record for the session, but it doesn't have an applicant_id yet
        ConsentRecord::create([
            'session_id' => $sessionId,
            'applicant_id' => null,
            'status' => 'pending'
        ]);

        $this->seedConsentData($sessionId);

        $response = $this->actingAs($user)
            ->postJson(route('consent.complete'), [
                'session_id' => $sessionId
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('consent_records', [
            'session_id' => $sessionId,
            'applicant_id' => $applicant->id,
            'status' => 'completed'
        ]);

        // Assert only one record exists in database
        $this->assertEquals(1, ConsentRecord::count());
    }

    /**
     * Test completeConsent with an applicant where a record for the applicant already exists
     */
    public function test_complete_consent_triumph_mode_updates_existing_applicant_record(): void
    {
        $user = User::factory()->create();
        $applicant = Applicant::create([
            'email' => 'john@example.com',
            'user_id' => $user->id
        ]);

        $oldSessionId = (string) Str::uuid();
        $newSessionId = (string) Str::uuid();

        // Existing record for the applicant (maybe pending from a previous session)
        ConsentRecord::create([
            'session_id' => $oldSessionId,
            'applicant_id' => $applicant->id,
            'status' => 'pending'
        ]);

        $this->seedConsentData($newSessionId);

        $response = $this->actingAs($user)
            ->postJson(route('consent.complete'), [
                'session_id' => $newSessionId
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('consent_records', [
            'session_id' => $newSessionId,
            'applicant_id' => $applicant->id,
            'status' => 'completed'
        ]);

        // Old session record should be updated to new session ID
        $this->assertDatabaseMissing('consent_records', [
            'session_id' => $oldSessionId
        ]);

        // Only one record should remain
        $this->assertEquals(1, ConsentRecord::count());
    }

    /**
     * Test resolving conflicts when BOTH session record (with no applicant) and applicant record exist
     */
    public function test_complete_consent_resolves_conflict_when_both_records_exist(): void
    {
        $user = User::factory()->create();
        $applicant = Applicant::create([
            'email' => 'john@example.com',
            'user_id' => $user->id
        ]);

        $oldSessionId = (string) Str::uuid();
        $newSessionId = (string) Str::uuid();

        // Row A: record matching the new session, but without applicant
        ConsentRecord::create([
            'session_id' => $newSessionId,
            'applicant_id' => null,
            'status' => 'pending'
        ]);

        // Row B: record matching the applicant, but with old session
        ConsentRecord::create([
            'session_id' => $oldSessionId,
            'applicant_id' => $applicant->id,
            'status' => 'pending'
        ]);

        $this->seedConsentData($newSessionId);

        $response = $this->actingAs($user)
            ->postJson(route('consent.complete'), [
                'session_id' => $newSessionId
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        // Row A should be updated to complete with the applicant ID
        $this->assertDatabaseHas('consent_records', [
            'session_id' => $newSessionId,
            'applicant_id' => $applicant->id,
            'status' => 'completed'
        ]);

        // Row B should have been deleted to avoid unique key constraints
        $this->assertDatabaseMissing('consent_records', [
            'session_id' => $oldSessionId
        ]);

        // Assert only one record remains
        $this->assertEquals(1, ConsentRecord::count());
    }
}
