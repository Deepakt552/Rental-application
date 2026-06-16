<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessful extends Notification
{
    use Queueable;

    protected $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = new MailMessage;
        $message->subject('Payment Successful - Rental Application Fee')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your payment of $' . $this->payment->amount . ' for the rental application fee has been successfully processed.')
            ->line('Transaction ID: #PAY-' . $this->payment->id)
            ->action('View Dashboard', url('/dashboard'))
            ->line('Thank you for choosing Rental Application!');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'message' => 'Payment of $' . $this->payment->amount . ' was successful.',
            'type' => 'payment_success'
        ];
    }
}
