<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioService
{
    protected string $sid;
    protected string $token;
    protected string $from;

    public function __construct()
    {
        $this->sid = (string) (config('services.twilio.sid') ?: env('TWILIO_SID', ''));
        $this->token = (string) (config('services.twilio.token') ?: env('TWILIO_AUTH_TOKEN', ''));
        $this->from = (string) (config('services.twilio.from') ?: env('TWILIO_FROM', ''));
    }

    /**
     * Send an SMS message using Twilio REST API.
     *
     * @param string $to Recipient phone number
     * @param string $message Message body
     * @return array Result array with status and details
     */
    public function sendSms(string $to, string $message): array
    {
        $normalizedTo = $this->formatPhoneNumber($to);

        if (empty($normalizedTo)) {
            return [
                'success' => false,
                'error' => 'Invalid recipient phone number.',
            ];
        }

        if (empty(trim($message))) {
            return [
                'success' => false,
                'error' => 'Message text cannot be empty.',
            ];
        }

        $url = "https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json";

        try {
            $response = Http::withBasicAuth($this->sid, $this->token)
                ->asForm()
                ->timeout(15)
                ->post($url, [
                    'To' => $normalizedTo,
                    'From' => $this->from,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Twilio SMS sent successfully', [
                    'to' => $normalizedTo,
                    'sid' => $data['sid'] ?? null,
                    'status' => $data['status'] ?? null,
                ]);

                return [
                    'success' => true,
                    'to' => $normalizedTo,
                    'from' => $this->from,
                    'message_sid' => $data['sid'] ?? null,
                    'status' => $data['status'] ?? 'queued',
                    'data' => $data,
                ];
            }

            $errorData = $response->json();
            $errorMessage = $errorData['message'] ?? 'Twilio API error (Status: ' . $response->status() . ')';

            Log::error('Twilio SMS sending failed', [
                'to' => $normalizedTo,
                'status' => $response->status(),
                'error' => $errorData,
            ]);

            return [
                'success' => false,
                'error' => $errorMessage,
                'details' => $errorData,
            ];
        } catch (\Throwable $e) {
            Log::error('Twilio SMS exception: ' . $e->getMessage(), [
                'to' => $normalizedTo,
                'exception' => $e,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Normalize a phone number to standard E.164 format.
     * E.g. (213) 326-9036 -> +12133269036
     */
    public function formatPhoneNumber(string $phone): string
    {
        $phone = trim($phone);
        if (empty($phone)) {
            return '';
        }

        // If it starts with +, preserve the +, remove all other non-digits
        if (str_starts_with($phone, '+')) {
            $digits = preg_replace('/[^\d]/', '', substr($phone, 1));
            return '+' . $digits;
        }

        // Strip non-digit characters
        $digits = preg_replace('/[^\d]/', '', $phone);

        if (empty($digits)) {
            return '';
        }

        // 10 digits (US number without country code) -> prepend +1
        if (strlen($digits) === 10) {
            return '+1' . $digits;
        }

        // 11 digits starting with 1 (US number with country code) -> prepend +
        if (strlen($digits) === 11 && str_starts_with($digits, '1')) {
            return '+' . $digits;
        }

        // Fallback: prepend + if missing
        return '+' . $digits;
    }
}
