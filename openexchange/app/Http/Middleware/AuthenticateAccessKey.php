<?php

namespace App\Http\Middleware;

use App\Models\AccessKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAccessKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $key = $token ? AccessKey::resolve($token) : null;

        if (! $key) {
            return response()->json(['error' => ['code' => 'unauthorized', 'message' => 'Invalid or missing API key.']], 401);
        }

        $key->loadMissing('client');
        if (! $key->client) {
            return response()->json(['error' => ['code' => 'forbidden', 'message' => 'Account not found.']], 403);
        }

        $request->attributes->set('access_key', $key);

        return $next($request);
    }
}
