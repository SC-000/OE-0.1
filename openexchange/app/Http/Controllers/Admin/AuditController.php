<?php

namespace App\Http\Controllers\Admin;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditController
{
    public function index(Request $request): Response
    {
        $logs = AuditLog::with(['user:id,name,email', 'client:id,name'])
            ->when($request->string('action')->toString(), fn ($q, $a) => $q->where('action', 'like', "{$a}%"))
            ->when($request->integer('client_id'), fn ($q, $id) => $q->where('client_id', $id))
            ->latest()->limit(300)->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'at' => $l->created_at->format('M j, Y H:i'),
                'action' => $l->action,
                'actor' => $l->user?->name ?? 'system',
                'actor_email' => $l->user?->email,
                'client' => $l->client?->name,
                'client_id' => $l->client_id,
                'summary' => $l->summary,
                'meta' => $l->meta,
                'ip' => $l->ip,
            ]);

        return Inertia::render('admin/audit', [
            'logs' => $logs,
            'actions' => AuditLog::distinct()->orderBy('action')->pluck('action'),
            'filters' => ['action' => $request->string('action')->toString(), 'client_id' => $request->integer('client_id') ?: null],
        ]);
    }
}
