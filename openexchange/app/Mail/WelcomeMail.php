<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Welcome to Open Exchange');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.message', with: [
            'title' => 'Welcome',
            'tone' => 'brand',
            'badge' => 'Welcome aboard',
            'heading' => 'Welcome to Open Exchange',
            'lines' => [
                "Hi {$this->user->name} — your billing account is ready. One API for every model, a single prepaid bill, and best-execution routing.",
                'Three quick steps to go live:',
            ],
            'details' => [
                '1 · Create a key' => 'Sources → Create key',
                '2 · Add a card' => 'Billing → Add card',
                '3 · Start calling' => 'POST /v1/chat',
            ],
            'action' => ['label' => 'Open your account', 'url' => config('app.url').'/console'],
            'outro' => ['Need a hand getting set up? Just reply to this email.'],
        ]);
    }
}
