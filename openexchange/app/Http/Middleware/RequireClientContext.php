<?php

namespace App\Http\Middleware;

use App\Services\Admin\ImpersonationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The client console needs a client. An admin has none of their own, so rather than
 * silently showing them the first account in the database — which is what used to
 * happen, and made /console read like a half-admin, half-client hybrid — send them
 * to the admin portal. To see a client's console they impersonate deliberately.
 */
class RequireClientContext
{
    public function __construct(private ImpersonationService $impersonation) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($this->impersonation->active()) {
            // The impersonated client may have been deleted from under the session.
            if ($this->impersonation->client()) {
                return $next($request);
            }
            $this->impersonation->stop();
        }

        if ($user?->client_id) {
            return $next($request);
        }

        if ($user?->isAdmin()) {
            return redirect('/admin');
        }

        return $next($request); // owner with no client yet — ClientContext self-heals
    }
}
