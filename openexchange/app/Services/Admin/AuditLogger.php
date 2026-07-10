<?php

namespace App\Services\Admin;

use App\Models\AuditLog;
use App\Models\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/** Append-only record of privileged actions. Never blocks the action it records. */
class AuditLogger
{
    public function log(string $action, ?Client $client = null, ?string $summary = null, array $meta = []): void
    {
        try {
            AuditLog::create([
                'user_id' => Auth::id(),
                'client_id' => $client?->id,
                'action' => $action,
                'summary' => $summary,
                'meta' => $meta ?: null,
                'ip' => Request::ip(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
