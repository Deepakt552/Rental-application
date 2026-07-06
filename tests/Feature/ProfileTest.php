<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    public function test_deleting_user_account_cleans_up_all_associated_application_records(): void
    {
        $user = User::factory()->create();
        
        $applicant = \App\Models\Applicant::create([
            'email' => $user->email,
            'user_id' => $user->id,
            'session_id' => 'test-session-123',
            'status' => 'draft',
            'current_step' => 1
        ]);

        $personalInfo = \App\Models\PersonalInformation::create([
            'applicant_id' => $applicant->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '1234567890',
            'email' => $user->email,
            'date_of_birth' => '1990-01-01'
        ]);

        $document = \App\Models\ApplicantDocument::create([
            'applicant_id' => $applicant->id,
            'session_id' => 'test-session-123',
            'document_type' => 'driving_license',
            'file_path' => 'documents/test-session-123/license.png',
            'original_filename' => 'license.png',
            'mime_type' => 'image/png',
            'size' => 100
        ]);

        // Fake the disk and write the file
        \Illuminate\Support\Facades\Storage::fake('public');
        \Illuminate\Support\Facades\Storage::disk('public')->put('documents/test-session-123/license.png', 'fake-image-content');

        $this->assertTrue(\Illuminate\Support\Facades\Storage::disk('public')->exists('documents/test-session-123/license.png'));

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertNull($user->fresh());
        
        // Assert applicant and related models are deleted
        $this->assertNull($applicant->fresh());
        $this->assertNull($personalInfo->fresh());
        $this->assertNull($document->fresh());

        // Assert file is deleted from disk
        $this->assertFalse(\Illuminate\Support\Facades\Storage::disk('public')->exists('documents/test-session-123/license.png'));
    }
}
