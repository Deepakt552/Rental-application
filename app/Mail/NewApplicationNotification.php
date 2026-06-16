<?php

namespace App\Mail;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewApplicationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $applicant;
    public $adminEmail;

    public function __construct(Applicant $applicant, $adminEmail)
    {
        $this->applicant = $applicant;
        $this->adminEmail = $adminEmail;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Rental Application Submitted - #' . $this->applicant->id,
            to: [$this->adminEmail],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-application',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}