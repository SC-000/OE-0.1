<?php

namespace App\Http\Controllers\Admin;

use App\Models\Client;
use App\Services\Admin\ImpersonationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ImpersonationController
{
    public function __construct(private ImpersonationService $impersonation) {}

    /** Admin only (route is behind EnsureAdmin) — drop into a client's console. */
    public function start(Request $request, Client $client): RedirectResponse
    {
        $this->impersonation->start($request->user(), $client);

        return redirect('/console');
    }

    /**
     * Deliberately NOT behind EnsureAdmin: only an admin can ever start an
     * impersonation, so anyone holding one must always be able to end it.
     */
    public function stop(): RedirectResponse
    {
        $this->impersonation->stop();

        return redirect('/admin');
    }
}
