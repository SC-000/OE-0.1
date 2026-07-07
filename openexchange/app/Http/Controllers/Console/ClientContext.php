<?php

namespace App\Http\Controllers\Console;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait ClientContext
{
    /** The client whose account we're viewing; every owner is guaranteed one. */
    protected function client(Request $request): Client
    {
        $user = $request->user();

        if ($user->client) {
            return $user->client;
        }

        // Admins preview the first account; owners always get their own.
        if ($user->isAdmin()) {
            return Client::query()->firstOrFail();
        }

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
