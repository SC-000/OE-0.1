<?php

namespace App\Http\Controllers\Admin;

use App\Models\Client;
use App\Models\ModelCatalog;
use App\Services\Admin\CommercialMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function __invoke(Request $request, CommercialMetrics $metrics): Response
    {
        $range = $request->query('range', '30d');

        return Inertia::render('admin/dashboard', [
            'overview' => $metrics->overview(),
            'series' => $metrics->series(is_string($range) ? $range : '30d'),
            'seriesOptions' => $metrics->seriesOptions(),
            'leaks' => array_slice($metrics->marginLeaks(), 0, 8),
            'topModels' => $metrics->topModels(8),
            'clients' => $metrics->clientPerformance(),
            'risk' => $metrics->collectionRisk(),
            'churn' => $metrics->churnSignals(),
            'attention' => $metrics->attention(),
            'counts' => [
                'clients' => Client::count(),
                'active_models' => ModelCatalog::where('active', true)->count(),
            ],
            'lastPull' => Cache::get('oe.metering.last_run'),
            'lastCharges' => Cache::get('oe.charges.last_run'),
        ]);
    }
}
