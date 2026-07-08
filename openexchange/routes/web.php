<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\BillingsWebhookController;
use App\Http\Controllers\Console\BillingController;
use App\Http\Controllers\Console\DashboardController;
use App\Http\Controllers\Console\SourcesController;
use App\Http\Controllers\Console\UsageController;
use App\Http\Controllers\GatewayController;
use App\Http\Middleware\AuthenticateAccessKey;
use App\Http\Middleware\EnsureAdmin;
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

// Authenticated platform console
Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/console')->name('dashboard');

    Route::get('/console', DashboardController::class)->name('console');
    Route::get('/console/usage', UsageController::class)->name('console.usage');
    Route::get('/console/sources', [SourcesController::class, 'index'])->name('console.sources');
    Route::post('/console/sources', [SourcesController::class, 'store'])->name('console.sources.store');
    Route::post('/console/sources/{source}/label', [SourcesController::class, 'updateLabel'])->name('console.sources.label');
    Route::post('/console/sources/{source}/revoke', [SourcesController::class, 'revoke'])->name('console.sources.revoke');

    // Client billing account
    Route::get('/console/billing', [BillingController::class, 'index'])->name('console.billing');
    Route::post('/console/billing/settings', [BillingController::class, 'updateSettings'])->name('console.billing.settings');
    Route::post('/console/billing/topup', [BillingController::class, 'topup'])->name('console.billing.topup');
    Route::get('/console/billing/add-card', [BillingController::class, 'addCard'])->name('console.add-card');
    Route::post('/console/billing/card', [BillingController::class, 'storeCard'])->name('console.billing.card');

    // Platform admin
    Route::middleware(EnsureAdmin::class)->group(function () {
        Route::get('/console/admin', [AdminController::class, 'index'])->name('console.admin');
        Route::post('/console/admin/clients', [AdminController::class, 'storeClient'])->name('admin.clients.store');
        Route::post('/console/admin/keys', [AdminController::class, 'storeKey'])->name('admin.keys.store');
        Route::post('/console/admin/rate', [AdminController::class, 'updateRate'])->name('admin.rate.update');
        Route::post('/console/admin/backends', [AdminController::class, 'storeBackend'])->name('admin.backends.store');
        Route::post('/console/admin/balance', [AdminController::class, 'adjustBalance'])->name('admin.balance.adjust');
        Route::post('/console/admin/client', [AdminController::class, 'updateClient'])->name('admin.client.update');
        Route::post('/console/admin/model-rate', [AdminController::class, 'updateModelRate'])->name('admin.model-rate.update');
        Route::post('/console/admin/access-key', [AdminController::class, 'createAccessKey'])->name('admin.access-key.create');
        Route::post('/console/admin/usage', [AdminController::class, 'addUsage'])->name('admin.usage.add');
        Route::post('/console/admin/discover', [AdminController::class, 'discover'])->name('admin.discover');
        Route::post('/console/admin/assign-project', [AdminController::class, 'assignProject'])->name('admin.assign-project');
        Route::post('/console/admin/toggle-project', [AdminController::class, 'toggleProject'])->name('admin.toggle-project');
        Route::get('/console/admin/client/{client}', [AdminController::class, 'manageClient'])->name('admin.client.manage');
        Route::post('/console/admin/client/delete', [AdminController::class, 'destroyClient'])->name('admin.client.delete');
        Route::post('/console/admin/model', [AdminController::class, 'storeModel'])->name('admin.model.store');
        Route::post('/console/admin/model/update', [AdminController::class, 'updateModel'])->name('admin.model.update');
        Route::post('/console/admin/access-key/revoke', [AdminController::class, 'revokeAccessKey'])->name('admin.access-key.revoke');
        Route::post('/console/admin/client-model-rate', [AdminController::class, 'updateClientModelRate'])->name('admin.client-model-rate.update');
        Route::post('/console/admin/client-model-rate/delete', [AdminController::class, 'deleteClientModelRate'])->name('admin.client-model-rate.delete');
        Route::post('/console/admin/sync-models', [AdminController::class, 'syncModels'])->name('admin.sync-models');
        Route::post('/console/admin/sync', [AdminController::class, 'sync'])->name('admin.sync');
    });
});

require __DIR__.'/settings.php';
