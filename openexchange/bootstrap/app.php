<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Webhooks (HMAC) and the gateway (bearer access key) authenticate without CSRF.
        $middleware->validateCsrfTokens(except: ['webhooks/*', 'v1/*']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('metering:pull')->hourly()->withoutOverlapping();
        $schedule->command('oe:billings:reconcile')->hourly()->withoutOverlapping();
        // Discover new models + auto-price them before the day's traffic bills at $0.
        $schedule->command('models:sync')->dailyAt('00:05')->withoutOverlapping();
        // Recurring fees. Idempotent per period, so a missed or repeated run is safe.
        $schedule->command('charges:run')->dailyAt('00:15')->withoutOverlapping();
    })
    ->create();
