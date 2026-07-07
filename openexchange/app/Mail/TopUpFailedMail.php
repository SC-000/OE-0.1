<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TopUpFailedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Client $client, public string $reason) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Action needed — your Open Exchange top-up failed');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.message', with: [
            'title' => 'Top-up failed',
            'tone' => 'danger',
            'badge' => 'Payment failed',
            'heading' => 'Your balance top-up didn’t go through',
            'lines' => [
                "We tried to top up <strong>{$this->client->name}</strong>’s prepaid balance, but the charge was declined.",
                'Until it’s resolved, requests may be interrupted once your balance runs out. Updating your card usually fixes it right away.',
            ],
            'details' => [
                'Current balance' => '$'.number_format($this->client->balance_cents / 100, 2),
                'Attempted top-up' => '$'.number_format($this->client->topup_amount_cents / 100, 2),
                'Reason' => $this->reason,
            ],
            'action' => ['label' => 'Update payment method', 'url' => config('app.url').'/console/billing/add-card'],
            'outro' => ['If you believe this is a mistake, reply to this email and we’ll take a look.'],
        ]);
    }
}
