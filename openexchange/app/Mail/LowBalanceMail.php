<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowBalanceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Client $client) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Open Exchange balance is running low');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.message', with: [
            'title' => 'Low balance',
            'tone' => 'warning',
            'badge' => 'Low balance',
            'heading' => 'Your prepaid balance is running low',
            'lines' => [
                "<strong>{$this->client->name}</strong>’s balance has dropped below your minimum, and auto top-up is off.",
                'Turn on auto top-up or add credit to avoid any interruption to routing.',
            ],
            'details' => [
                'Current balance' => '$'.number_format($this->client->balance_cents / 100, 2),
                'Minimum' => '$'.number_format($this->client->min_balance_cents / 100, 2),
            ],
            'action' => ['label' => 'Manage top-up', 'url' => config('app.url').'/console/billing'],
        ]);
    }
}
