<?php

namespace App\Http\Controllers;

use App\Models\AccessKey;
use App\Models\ModelCatalog;
use App\Services\Gateway\GatewayException;
use App\Services\Gateway\GatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class GatewayController
{
    public function __construct(private GatewayService $gateway) {}

    public function chat(Request $request): JsonResponse
    {
        /** @var AccessKey $key */
        $key = $request->attributes->get('access_key');

        try {
            $result = $this->gateway->chat($key, $request->all());
        } catch (GatewayException $e) {
            return response()->json(['error' => ['code' => $e->errorCode, 'message' => $e->getMessage()]], $e->status);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['error' => ['code' => 'gateway_error', 'message' => 'The gateway could not complete the request.']], 500);
        }

        return response()->json($result)
            ->withHeaders([
                'X-OX-Model' => $result['model'],
                'X-OX-Backend' => $result['backend'],
                'X-OX-Input-Tokens' => (string) $result['usage']['input_tokens'],
                'X-OX-Output-Tokens' => (string) $result['usage']['output_tokens'],
                'X-OX-Billed-Cents' => (string) $result['usage']['billed_cents'],
                'X-OX-Request-Id' => $result['request_id'],
            ]);
    }

    public function models(): JsonResponse
    {
        $models = ModelCatalog::where('active', true)->orderBy('provider')->orderBy('model')
            ->get(['provider', 'model'])
            ->map(fn ($m) => ['id' => $m->model, 'provider' => $m->provider]);

        return response()->json(['data' => $models]);
    }
}
