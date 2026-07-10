<?php

namespace App\Http\Controllers\Console;

use App\Models\Client;
use App\Services\Admin\ImpersonationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait ClientContext
{
    /**
     * The client whose account this request is about.
     *
     * Precedence: an active impersonation, then the user's own client, then
     * self-heal for an owner who somehow has none. An admin with no client and no
     * impersonation gets 403 — RequireClientContext should already have redirected
     * them to /admin, so reaching here means a route is missing that middleware.
     */
    protected function client(Request $request): Client
    {
        $impersonation = app(ImpersonationService::class);

        if ($impersonation->active()) {
            if ($client = $impersonation->client()) {
                return $client;
            }
            $impersonation->stop(); // the impersonated client was deleted underneath us
        }

        $user = $request->user();

        if ($user->client) {
            return $user->client;
        }

        abort_if($user->isAdmin(), 403, 'Admins have no client account. Use the admin portal, or view as a client.');

        $client = Client::create([
            'name' => $user->name,
            'slug' => Str::slug($user->name).'-'.Str::lower(Str::random(5)),
        ]);
        $user->forceFill(['client_id' => $client->id])->save();

        return $client;
    }

    protected function money(int $cents): string
    {
        return '$'.number_format($cents / 100, 2);
    }
}
