<?php

namespace App\Http\Middleware;

use App\Services\Admin\ImpersonationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards the actions an admin must never take while wearing a client's face:
 * anything that moves the client's money or changes their credentials.
 *
 * Reading their portal is the point of impersonation. Charging their card is not.
 */
class DenyWhileImpersonating
{
    public function __construct(private ImpersonationService $impersonation) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->impersonation->active()) {
            return $next($request);
        }

        $message = 'Blocked while viewing as a client. Stop impersonating to perform billing or security actions.';

        if ($request->expectsJson()) {
            abort(403, $message);
        }

        return back()->withErrors(['impersonation' => $message]);
    }
}
