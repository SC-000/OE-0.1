<?php

use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\ChargesController;
use App\Http\Controllers\Admin\ClientsController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Admin\ModelsController;
use App\Http\Controllers\Admin\PlatformController;
use App\Http\Controllers\Admin\RatesController;
use App\Http\Controllers\BillingsWebhookController;
use App\Http\Controllers\Console\BillingController;
use App\Http\Controllers\Console\DashboardController;
use App\Http\Controllers\Console\SourcesController;
use App\Http\Controllers\Console\UsageController;
use App\Http\Controllers\GatewayController;
use App\Http\Middleware\AuthenticateAccessKey;
use App\Http\Middleware\DenyWhileImpersonating;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\RequireClientContext;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public marketing site
Route::inertia('/', 'welcome')->name('home');

Route::inertia('/products/ai-router', 'marketing/products/ai-router')->name('products.ai-router');
Route::inertia('/products/hyperquay', 'marketing/products/hyperquay')->name('products.hyperquay');
Route::inertia('/products/exchange', 'marketing/products/exchange')->name('products.exchange');
Route::inertia('/products/openexchange', 'marketing/products/openexchange')->name('products.openexchange');
Route::inertia('/products/data', 'marketing/products/data')->name('products.data');
Route::inertia('/products/services', 'marketing/products/services')->name('products.services');

Route::inertia('/pricing', 'marketing/pricing')->name('pricing');
Route::inertia('/markets', 'marketing/markets')->name('markets');
Route::inertia('/developers', 'marketing/developers')->name('developers');
Route::inertia('/whitepaper', 'marketing/whitepaper')->name('whitepaper');
Route::inertia('/company', 'marketing/company')->name('company');
Route::inertia('/blog', 'marketing/blog')->name('blog');
Route::get('/blog/{slug}', fn (string $slug) => Inertia::render('marketing/article', ['slug' => $slug]))->name('blog.article');

// Inbound provider webhooks (HMAC-verified, CSRF-exempt)
Route::post('/webhooks/billings', BillingsWebhookController::class)->name('webhooks.billings');

// Inference gateway — access-key auth, real-time metering
Route::middleware(AuthenticateAccessKey::class)->group(function () {
    Route::post('/v1/chat', [GatewayController::class, 'chat'])->name('v1.chat');
    Route::get('/v1/models', [GatewayController::class, 'models'])->name('v1.models');
});

/*
|--------------------------------------------------------------------------
| Client console — /console
|--------------------------------------------------------------------------
| Always scoped to exactly one client: the signed-in user's, or the one an
| admin is impersonating. RequireClientContext sends a context-less admin to
| the admin portal rather than quietly showing them someone else's account.
*/
Route::middleware(['auth', 'verified', RequireClientContext::class])->group(function () {
    Route::redirect('dashboard', '/console')->name('dashboard');

    Route::get('/console', DashboardController::class)->name('console');
    Route::get('/console/usage', UsageController::class)->name('console.usage');
    Route::get('/console/sources', [SourcesController::class, 'index'])->name('console.sources');
    Route::get('/console/billing', [BillingController::class, 'index'])->name('console.billing');

    // Anything that moves the client's money is refused while impersonating.
    Route::middleware(DenyWhileImpersonating::class)->group(function () {
        Route::post('/console/sources', [SourcesController::class, 'store'])->name('console.sources.store');
        Route::post('/console/sources/{source}/label', [SourcesController::class, 'updateLabel'])->name('console.sources.label');
        Route::post('/console/sources/{source}/revoke', [SourcesController::class, 'revoke'])->name('console.sources.revoke');

        Route::post('/console/billing/settings', [BillingController::class, 'updateSettings'])->name('console.billing.settings');
        Route::post('/console/billing/topup', [BillingController::class, 'topup'])->name('console.billing.topup');
        Route::get('/console/billing/add-card', [BillingController::class, 'addCard'])->name('console.add-card');
        Route::post('/console/billing/card', [BillingController::class, 'storeCard'])->name('console.billing.card');
    });
});

// Ending an impersonation must never require admin rights to re-check — only an
// admin could have started one, and they must always be able to get back out.
Route::post('/impersonate/stop', [ImpersonationController::class, 'stop'])
    ->middleware('auth')->name('impersonate.stop');

/*
|--------------------------------------------------------------------------
| Platform admin — /admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', EnsureAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');

    // Clients
    Route::get('/clients', [ClientsController::class, 'index'])->name('clients');
    Route::post('/clients', [ClientsController::class, 'store'])->name('clients.store');
    Route::get('/clients/{client}', [ClientsController::class, 'show'])->name('clients.show');
    Route::patch('/clients/{client}', [ClientsController::class, 'update'])->name('clients.update');
    Route::delete('/clients/{client}', [ClientsController::class, 'destroy'])->name('clients.destroy');
    Route::post('/clients/{client}/balance', [ClientsController::class, 'adjustBalance'])->name('clients.balance');
    Route::post('/clients/{client}/staff', [ClientsController::class, 'addStaff'])->name('clients.staff.add');
    Route::delete('/clients/{client}/staff/{user}', [ClientsController::class, 'removeStaff'])->name('clients.staff.remove');
    Route::post('/clients/{client}/staff/{user}/invite', [ClientsController::class, 'resendInvite'])->name('clients.staff.invite');
    Route::post('/clients/{client}/impersonate', [ImpersonationController::class, 'start'])->name('clients.impersonate');
    // Re-bill this client's existing usage of one model at today's cost + rate.
    Route::post('/clients/{client}/recost/preview', [ClientsController::class, 'recostPreview'])->name('clients.recost.preview');
    Route::post('/clients/{client}/recost', [ClientsController::class, 'recost'])->name('clients.recost');

    // Models + pricing
    Route::get('/models', [ModelsController::class, 'index'])->name('models');
    Route::post('/models', [ModelsController::class, 'store'])->name('models.store');
    Route::patch('/models/{model}', [ModelsController::class, 'update'])->name('models.update');
    Route::patch('/models/{model}/presentation', [ModelsController::class, 'presentation'])->name('models.presentation');
    Route::post('/models/{model}/price-from-feed', [ModelsController::class, 'priceFromFeed'])->name('models.price-from-feed');
    Route::post('/models/{model}/rebill', [ModelsController::class, 'rebill'])->name('models.rebill');
    Route::post('/models/sync', [ModelsController::class, 'sync'])->name('models.sync');
    Route::post('/models/retier', [ModelsController::class, 'retier'])->name('models.retier');
    Route::post('/proposals/{proposal}/accept', [ModelsController::class, 'acceptProposal'])->name('proposals.accept');
    Route::post('/proposals/{proposal}/reject', [ModelsController::class, 'rejectProposal'])->name('proposals.reject');

    // Rate card
    Route::post('/rates', [RatesController::class, 'upsert'])->name('rates.upsert');
    Route::post('/rates/delete', [RatesController::class, 'destroy'])->name('rates.delete');
    Route::post('/rates/default', [RatesController::class, 'updateDefault'])->name('rates.default');
    Route::post('/rates/preview', [RatesController::class, 'preview'])->name('rates.preview');

    // Charges (fees, credits, off-platform AI cost)
    Route::post('/charges', [ChargesController::class, 'store'])->name('charges.store');
    Route::post('/charges/preview', [ChargesController::class, 'preview'])->name('charges.preview');
    Route::patch('/charges/{charge}', [ChargesController::class, 'update'])->name('charges.update');
    Route::delete('/charges/{charge}', [ChargesController::class, 'destroy'])->name('charges.destroy');
    Route::post('/charges/{charge}/run', [ChargesController::class, 'runNow'])->name('charges.run');

    // Provider plumbing
    Route::get('/platform', [PlatformController::class, 'index'])->name('platform');
    Route::post('/platform/backends', [PlatformController::class, 'storeBackend'])->name('backends.store');
    Route::delete('/platform/backends/{backend}', [PlatformController::class, 'destroyBackend'])->name('backends.destroy');
    Route::post('/platform/keys', [PlatformController::class, 'storeKey'])->name('keys.store');
    Route::post('/platform/discover', [PlatformController::class, 'discover'])->name('discover');
    Route::post('/platform/assign-project', [PlatformController::class, 'assignProject'])->name('assign-project');
    Route::post('/platform/toggle-project', [PlatformController::class, 'toggleProject'])->name('toggle-project');
    Route::post('/platform/access-keys', [PlatformController::class, 'createAccessKey'])->name('access-key.create');
    Route::delete('/platform/access-keys/{accessKey}', [PlatformController::class, 'revokeAccessKey'])->name('access-key.revoke');
    Route::post('/platform/sync', [PlatformController::class, 'sync'])->name('sync');
    Route::post('/platform/rebill', [PlatformController::class, 'rebill'])->name('rebill');

    Route::get('/audit', [AuditController::class, 'index'])->name('audit');
});

// The admin portal used to live under /console/admin.
Route::permanentRedirect('/console/admin', '/admin');

require __DIR__.'/settings.php';
