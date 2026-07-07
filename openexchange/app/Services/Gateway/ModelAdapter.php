<?php

namespace App\Services\Gateway;

use App\Models\ProviderBackend;

interface ModelAdapter
{
    /**
     * @param  array<int, array{role:string, content:string}>  $messages
     * @param  array<string, mixed>  $options
     */
    public function chat(ProviderBackend $backend, string $model, array $messages, array $options = []): AdapterResult;
}
