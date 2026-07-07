<?php

namespace App\Mail;

use App\Models\Client;
use App\Models\TopUp;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TopUpReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Client $client, public TopUp $topup) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Receipt — balance topped up (+$'.number_format($this->topup->amount_cents / 100, 2).')');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.message', with: [
            'title' => 'Top-up receipt',
            'tone' => 'success',
            'badge' => 'Payment received',
            'heading' => 'Your balance has been topped up',
            'lines' => [
                ucfirst($this->topup->trigger).' top-up completed — your gateway keeps running without interruption.',
            ],
            'details' => [
                'Amount' => '+$'.number_format($this->topup->amount_cents / 100, 2),
                'New balance' => '$'.number_format($this->client->balance_cents / 100, 2),
                'Reference' => $this->topup->billings_invoice_id ?: ('topup:'.$this->topup->id),
            ],
            'action' => ['label' => 'View billing', 'url' => config('app.url').'/console/billing'],
        ]);
    }
}
