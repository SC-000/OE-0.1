<?php

return [
    // OpenAI organization-level usage/costs pull
    'openai' => [
        'admin_key' => env('OPENAI_ADMIN_KEY'),
        'base' => env('OPENAI_BASE', 'https://api.openai.com'),
    ],

    // Google Cloud Monitoring usage pull (Gemini / generativelanguage)
    'google' => [
        // Path to a service-account JSON file, OR the raw JSON string.
        'credentials' => env('GOOGLE_CREDENTIALS_JSON'),
        'monitoring_base' => env('GOOGLE_MONITORING_BASE', 'https://monitoring.googleapis.com'),
        // Metric that reports token/request counts for the Gemini API. Adjust to
        // your environment; grouped by resource project + the "model" label.
        'input_token_metric' => env('GOOGLE_INPUT_TOKEN_METRIC', 'generativelanguage.googleapis.com/model/input_token_count'),
        'output_token_metric' => env('GOOGLE_OUTPUT_TOKEN_METRIC', 'generativelanguage.googleapis.com/model/output_token_count'),
        'model_label' => env('GOOGLE_MODEL_LABEL', 'model'),
    ],

    // billings.systems (Stripe-on-top) money rail
    'billings' => [
        'base' => env('BILLINGS_BASE_URL', 'https://billings.systems'),
        'token' => env('BILLINGS_TOKEN'),               // server-side bearer
        'publishable' => env('BILLINGS_PUBLISHABLE'),   // browser SetupWidget key (zero scopes)
        'webhook_secret' => env('BILLINGS_WEBHOOK_SECRET'),
        'currency' => env('BILLINGS_CURRENCY', 'USD'),
    ],

    'metering' => [
        // pull window + reliability guards
        'pull_lookback_hours' => (int) env('METERING_LOOKBACK_HOURS', 48),
        'autotopup_min_interval_minutes' => (int) env('AUTOTOPUP_MIN_INTERVAL', 15),
        'autotopup_max_per_day' => (int) env('AUTOTOPUP_MAX_PER_DAY', 3),
        // hard cap on how far negative a balance may go before access is refused
        'debt_limit_cents' => (int) env('DEBT_LIMIT_CENTS', 5000),
    ],
];
