<?php

return [
    /*
    |--------------------------------------------------------------------------
    | links.et API Key
    |--------------------------------------------------------------------------
    |
    | Base URL and server-side secret key minted at https://links.et/dashboard/keys.
    | Starts with 'vk_live_'.
    |
    */
    'api_key' => env('LINKS_ET_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Base URL
    |--------------------------------------------------------------------------
    |
    | Base URL for links.et receipt verification service.
    |
    */
    'base_url' => env('LINKS_ET_BASE_URL', 'https://links.et'),

    /*
    |--------------------------------------------------------------------------
    | Connection and Request Timeouts
    |--------------------------------------------------------------------------
    |
    | Timeout in seconds for HTTP requests to links.et.
    | Uncached receipt verification can take up to 30-60s on busy upstream banks.
    |
    */
    'timeout' => (int) env('LINKS_ET_TIMEOUT', 45),

    /*
    |--------------------------------------------------------------------------
    | Default waitMs
    |--------------------------------------------------------------------------
    |
    | Optional waitMs passed to POST /api/verify.
    | If bank verification takes longer, links.et returns 202 with statusUrl.
    | Set to null for synchronous hold (up to timeout).
    |
    */
    'wait_ms' => env('LINKS_ET_WAIT_MS', 15000),

    /*
    |--------------------------------------------------------------------------
    | Auto-Verification on Customer Upload
    |--------------------------------------------------------------------------
    |
    | Automatically verify customer payment proofs (URL or screenshot)
    | asynchronously or synchronously upon checkout submission.
    |
    */
    'auto_verify' => env('LINKS_ET_AUTO_VERIFY', true),
];
