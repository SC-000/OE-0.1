<?php

namespace App\Services\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Mints a short-lived Google OAuth2 access token from a service-account JSON
 * using the JWT-bearer grant (RS256), with no heavy SDK dependency.
 */
class GoogleAccessToken
{
    public function forScope(array $credentials, string $scope): string
    {
        $email = $credentials['client_email'] ?? null;
        $privateKey = $credentials['private_key'] ?? null;
        $tokenUri = $credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token';
        if (! $email || ! $privateKey) {
            throw new RuntimeException('Invalid Google service-account credentials.');
        }

        $cacheKey = 'goog_tok:'.md5($email.'|'.$scope);

        return Cache::remember($cacheKey, 3300, function () use ($email, $privateKey, $tokenUri, $scope) {
            $now = time();
            $claims = [
                'iss' => $email,
                'scope' => $scope,
                'aud' => $tokenUri,
                'iat' => $now,
                'exp' => $now + 3600,
            ];
            $assertion = $this->sign($claims, $privateKey);

            $res = Http::asForm()->post($tokenUri, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $assertion,
            ]);
            if ($res->failed() || ! $res->json('access_token')) {
                throw new RuntimeException('Google token exchange failed: '.$res->body());
            }

            return (string) $res->json('access_token');
        });
    }

    private function sign(array $claims, string $privateKey): string
    {
        $header = $this->b64(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $payload = $this->b64(json_encode($claims));
        $signingInput = $header.'.'.$payload;

        $signature = '';
        if (! openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('Failed to sign Google JWT (check private_key).');
        }

        return $signingInput.'.'.$this->b64($signature);
    }

    private function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
