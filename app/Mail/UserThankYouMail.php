<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserThankYouMail extends Mailable
{
    use Queueable, SerializesModels;

    public $applicant;

    public function __construct(Applicant $applicant)
    {
        $this->applicant = $applicant;
    }

    public function envelope(): Envelope
    {
        $isExcel = (($this->applicant->type ?? '') === 'superadmin' || str_contains(strtolower($this->applicant->company_name ?? ''), 'excel'));
        $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';

        return new Envelope(
            subject: 'Thank You for Your Rental Application - ' . $brandName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.user-thankyou',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}