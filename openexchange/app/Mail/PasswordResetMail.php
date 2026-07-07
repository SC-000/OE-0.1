<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $resetUrl, public int $expiresMinutes = 60) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Reset your Open Exchange password');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.message', with: [
            'title' => 'Reset your password',
            'tone' => 'brand',
            'badge' => 'Account security',
            'heading' => 'Reset your password',
            'lines' => [
                'We received a request to reset the password for your Open Exchange account. Click the button below to choose a new one.',
            ],
            'action' => ['label' => 'Reset password', 'url' => $this->resetUrl],
            'outro' => [
                "This link expires in {$this->expiresMinutes} minutes.",
                'If you didn’t request a password reset, you can safely ignore this email — your password won’t change.',
            ],
        ]);
    }
}
