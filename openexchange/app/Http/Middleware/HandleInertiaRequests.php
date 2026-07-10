<?php

namespace App\Http\Middleware;

use App\Services\Admin\ImpersonationService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $impersonation = app(ImpersonationService::class);
        $viewingAs = $impersonation->active() ? $impersonation->client() : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            // Drives the persistent "viewing as" banner. Never null-checked away: an
            // admin must always be able to tell whose data is on screen.
            'impersonation' => $viewingAs ? [
                'client' => ['id' => $viewingAs->id, 'name' => $viewingAs->name],
                'admin' => $request->user()?->name,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
