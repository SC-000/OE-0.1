<?php

namespace App\Services\Admin;

use App\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\Session;

/**
 * "View as client" — a CLIENT-CONTEXT swap, not an auth-user swap.
 *
 * The authenticated user stays the admin throughout: `$request->user()` never changes,
 * so every audit trail, policy check and log line still names the real person. Only the
 * client whose data the console renders is swapped. That means an impersonated session
 * can never accidentally inherit the client's credentials or 2FA state, and revoking the
 * admin revokes the impersonation.
 *
 * Billing mutations are refused while impersonating (see DenyWhileImpersonating).
 */
class ImpersonationService
{
    private const KEY = 'impersonate.client_id';

    public function __construct(private AuditLogger $audit) {}

    public function start(User $admin, Client $client): void
    {
        if (! $admin->isAdmin()) {
            abort(403);
        }

        Session::put(self::KEY, $client->id);
        $this->audit->log('impersonate.start', $client, "{$admin->email} started viewing as {$client->name}");
    }

    public function stop(): void
    {
        $client = $this->client();
        Session::forget(self::KEY);

        if ($client) {
            $this->audit->log('impersonate.stop', $client, 'Stopped viewing as '.$client->name);
        }
    }

    public function active(): bool
    {
        return $this->clientId() !== null;
    }

    public function clientId(): ?int
    {
        $id = Session::get(self::KEY);

        return $id ? (int) $id : null;
    }

    public function client(): ?Client
    {
        $id = $this->clientId();

        return $id ? Client::find($id) : null;
    }
}
