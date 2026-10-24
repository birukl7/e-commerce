<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LinksEtService
{
    protected string $baseUrl;
    protected ?string $apiKey;
    protected int $timeout;
    protected ?int $waitMs;

    public function __construct()
    {
        $this->apiKey = config('links_et.api_key') ?? config('services.links_et.api_key');
        $this->baseUrl = rtrim(config('links_et.base_url') ?? config('services.links_et.base_url', 'https://links.et'), '/');
        $this->timeout = (int) (config('links_et.timeout') ?? config('services.links_et.timeout', 45));
        $this->waitMs = config('links_et.wait_ms') ?? config('services.links_et.wait_ms', 15000);
    }

    /**
     * Check if links.et API is configured with an API key.
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Health check for links.et service (no key required).
     *
     * @return array{ok: bool, ts?: string, error?: string}
     */
    public function checkHealth(): array
    {
        try {
            $response = Http::timeout(10)->get("{$this->baseUrl}/api/verify");
            return $response->json() ?? ['ok' => false, 'error' => 'Invalid response'];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Check status of links.et and upstream banks (no key required).
     *
     * @return array
     */
    public function checkStatus(): array
    {
        try {
            $response = Http::timeout(15)->get("{$this->baseUrl}/api/status");
            $json = $response->json();
            if ($json) {
                return $json;
            }
            return ['ok' => false, 'status' => 'down'];
        } catch (\Throwable $e) {
            return ['ok' => false, 'status' => 'down', 'error' => $e->getMessage()];
        }
    }

    /**
     * Verify a payment receipt by URL or telebirr reference.
     *
     * @param string $urlOrRef Either full receipt URL or Telebirr reference (e.g. ABCD1234EF)
     * @param array $options Optional settings: ['waitMs' => int, 'idempotencyKey' => string]
     * @return array Standardized verification envelope
     */
    public function verify(string $urlOrRef, array $options = []): array
    {
        $this->ensureConfigured();

        $trimmed = trim($urlOrRef);
        $payload = [];

        // Check if input is full URL or shorthand telebirr reference
        if (filter_var($trimmed, FILTER_VALIDATE_URL) || str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            $payload['url'] = $trimmed;
        } else {
            $payload['reference'] = $trimmed;
        }

        $waitMs = $options['waitMs'] ?? $this->waitMs;
        if ($waitMs !== null) {
            // Clamped to 30000ms per links.et documentation
            $payload['waitMs'] = min((int) $waitMs, 30000);
        }

        $idempotencyKey = $options['idempotencyKey'] ?? Str::uuid()->toString();

        return $this->executeWithRetry(function () use ($payload, $idempotencyKey) {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'content-type' => 'application/json',
                'Idempotency-Key' => $idempotencyKey,
            ])
            ->timeout($this->timeout)
            ->post("{$this->baseUrl}/api/verify", $payload);

            return $this->handleResponse($response, $payload['url'] ?? null);
        }, $payload['url'] ?? null);
    }

    /**
     * Poll async verification status if initial request returned 202 Accepted.
     *
     * @param string $statusUrlOrRequestId Status URL (e.g. /api/verify/{id}) or UUID requestId
     * @return array
     */
    public function pollStatus(string $statusUrlOrRequestId): array
    {
        $this->ensureConfigured();

        $path = str_starts_with($statusUrlOrRequestId, '/')
            ? $statusUrlOrRequestId
            : "/api/verify/{$statusUrlOrRequestId}";

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
            ])
            ->timeout(15)
            ->get("{$this->baseUrl}{$path}");

            return $response->json() ?? [
                'ok' => false,
                'error' => ['code' => 'invalid_response', 'message' => 'Invalid JSON from links.et'],
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'error' => ['code' => 'connection_error', 'message' => $e->getMessage()],
            ];
        }
    }

    /**
     * Verify payment proof screenshot using links.et AI detector + upstream bank verify.
     *
     * @param string|array $images Either absolute file path, raw binary content, base64 string, or array of them
     * @param array $options
     * @return array
     */
    public function verifyImage(string|array $images, array $options = []): array
    {
        $this->ensureConfigured();

        $imagePayloads = [];
        $imageList = is_array($images) ? $images : [$images];

        // Maximum 5 images per request per docs
        $imageList = array_slice($imageList, 0, 5);

        foreach ($imageList as $item) {
            $base64 = $this->normalizeImageToBase64($item);
            if ($base64) {
                $imagePayloads[] = ['imageBase64' => $base64];
            }
        }

        if (empty($imagePayloads)) {
            return [
                'ok' => false,
                'error' => [
                    'code' => 'invalid_request',
                    'message' => 'No valid image data provided for verification.',
                ],
            ];
        }

        $payload = ['images' => $imagePayloads];

        return $this->executeWithRetry(function () use ($payload) {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'content-type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->post("{$this->baseUrl}/api/verify-image", $payload);

            return $this->handleResponse($response);
        });
    }

    /**
     * Convert various image representations (path, binary string, base64) to clean base64 string.
     */
    protected function normalizeImageToBase64(string $imageInput): ?string
    {
        // 1. If it's a file on the local filesystem
        if (file_exists($imageInput) && is_file($imageInput)) {
            $content = file_get_contents($imageInput);
            return base64_encode($content);
        }

        // 2. If it's a data URL like data:image/png;base64,...
        if (preg_match('/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/', $imageInput, $matches)) {
            return $matches[1];
        }

        // 3. If it is already a base64 string
        if (base64_encode(base64_decode($imageInput, true)) === $imageInput) {
            return $imageInput;
        }

        // 4. Otherwise assume raw binary string
        return base64_encode($imageInput);
    }

    /**
     * Handle HTTP response from links.et following agents.md error codes and retry rules.
     */
    protected function handleResponse($response, ?string $requestUrl = null): array
    {
        $status = $response->status();
        $json = $response->json();

        // 202 Accepted: async follow-up
        if ($status === 202) {
            return [
                'ok' => false,
                'async' => true,
                'processingStatus' => $json['processingStatus'] ?? 'queued',
                'requestId' => $json['requestId'] ?? null,
                'statusUrl' => $json['statusUrl'] ?? null,
                'eventsUrl' => $json['eventsUrl'] ?? null,
                'data' => $json,
            ];
        }

        // 200 OK: success response envelope
        if ($response->successful()) {
            return $json ?? ['ok' => true];
        }

        // 502 Bad Gateway: parsed but didn't look like a valid receipt
        if ($status === 502) {
            return [
                'ok' => false,
                'status' => 502,
                'retryable' => true,
                'error' => [
                    'code' => 'bad_gateway',
                    'message' => $json['error'] ?? 'Bank answered but receipt failed upstream validation.',
                ],
                'receipt' => $json['receipt'] ?? null,
            ];
        }

        // 429: rate_limited or quota_exceeded
        if ($status === 429) {
            $errorCode = $json['error']['code'] ?? 'rate_limited';
            $retryAfter = $response->header('Retry-After');

            return [
                'ok' => false,
                'status' => 429,
                'retryable' => ($errorCode === 'rate_limited' || $errorCode === 'ocr_daily_cap_reached'),
                'retry_after' => $retryAfter,
                'error' => [
                    'code' => $errorCode,
                    'message' => $json['error']['message'] ?? 'Rate limit or quota exceeded.',
                    'used' => $json['error']['used'] ?? null,
                    'cap' => $json['error']['cap'] ?? null,
                ],
            ];
        }

        // 400 Bad Request
        if ($status === 400) {
            $errorCode = $json['error']['code'] ?? null;
            // Rule: 400 with no code is retryable (timeout or upstream busy bank). 400 with invalid_json/invalid_request is NOT retryable.
            $retryable = empty($errorCode);

            return [
                'ok' => false,
                'status' => 400,
                'retryable' => $retryable,
                'error' => [
                    'code' => $errorCode ?? 'upstream_timeout',
                    'message' => $json['error']['message'] ?? ($json['error'] ?? 'Upstream bank timed out or invalid request.'),
                ],
            ];
        }

        // 401 Unauthorized: missing_key, invalid_key, revoked_key
        if ($status === 401) {
            return [
                'ok' => false,
                'status' => 401,
                'retryable' => false,
                'error' => [
                    'code' => $json['error']['code'] ?? 'unauthorized',
                    'message' => $json['error']['message'] ?? 'Authentication failed. Check LINKS_ET_API_KEY.',
                ],
            ];
        }

        // 503 Service Unavailable: AI not configured
        if ($status === 503) {
            return [
                'ok' => false,
                'status' => 503,
                'retryable' => false,
                'error' => [
                    'code' => $json['error']['code'] ?? 'ai_not_configured',
                    'message' => $json['error']['message'] ?? 'Service unavailable or AI detector not configured.',
                ],
            ];
        }

        return [
            'ok' => false,
            'status' => $status,
            'retryable' => ($status >= 500),
            'error' => [
                'code' => $json['error']['code'] ?? 'unknown_error',
                'message' => $json['error']['message'] ?? ($response->body() ?: "HTTP error {$status}"),
            ],
        ];
    }

    /**
     * Retry policy adhering to links.et rules:
     * - Do NOT retry Siinqee links (destroy receipt)
     * - Do NOT retry 400 invalid_request / invalid_json, 401, or 429 quota_exceeded
     * - Retry 400 without code (busy bank) or 502 up to 2 times with jitter
     */
    protected function executeWithRetry(callable $callback, ?string $url = null): array
    {
        // Rule 2: Never retry a Siinqee link
        $isSiinqee = $url && (str_contains(strtolower($url), 'siinqee') || str_contains($url, ':871'));
        $maxAttempts = $isSiinqee ? 1 : 2;

        $lastResult = null;
        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $result = $callback();

                if (($result['ok'] ?? false) || !($result['retryable'] ?? false)) {
                    return $result;
                }

                $lastResult = $result;

                // Handle Retry-After header for rate_limited if provided
                if (($result['status'] ?? null) === 429 && !empty($result['retry_after'])) {
                    $retrySeconds = min((int) $result['retry_after'], 5);
                    if ($retrySeconds > 0 && $attempt < $maxAttempts) {
                        sleep($retrySeconds);
                        continue;
                    }
                }

                // If retryable (e.g. 502 or busy-bank 400), wait with 1-2s jitter
                if ($attempt < $maxAttempts) {
                    $sleepMicroseconds = rand(1000000, 2000000); // 1-2 seconds with jitter
                    usleep($sleepMicroseconds);
                }
            } catch (\Throwable $e) {
                Log::warning("links.et call failed on attempt {$attempt}: " . $e->getMessage());
                if ($attempt >= $maxAttempts) {
                    return [
                        'ok' => false,
                        'error' => [
                            'code' => 'connection_failed',
                            'message' => $e->getMessage(),
                        ],
                    ];
                }
                usleep(1500000);
            }
        }

        return $lastResult ?? [
            'ok' => false,
            'error' => ['code' => 'request_failed', 'message' => 'Request failed after retries.'],
        ];
    }

    /**
     * Safely parse amount from provider receipt (rule 6: amount types differ).
     *
     * @param array $receipt
     * @return float|null
     */
    public static function extractAmount(array $receipt): ?float
    {
        $source = $receipt['source'] ?? '';

        switch ($source) {
            case 'cbe-pdf':
                return isset($receipt['totalAmount']) ? (float) $receipt['totalAmount'] : (isset($receipt['transferredAmount']) ? (float) $receipt['transferredAmount'] : null);

            case 'mb-json':
                return isset($receipt['totalAmount']) ? (float) $receipt['totalAmount'] : (isset($receipt['transferredAmount']) ? (float) $receipt['transferredAmount'] : null);

            case 'telebirr-html':
                $amountStr = $receipt['settledAmount'] ?? ($receipt['totalPaidAmount'] ?? null);
                if ($amountStr && preg_match('/([\d,]+(?:\.\d+)?)/', str_replace(',', '', (string) $amountStr), $matches)) {
                    return (float) $matches[1];
                }
                return null;

            case 'awash-html':
                $amountStr = $receipt['transaction']['amount'] ?? null;
                if ($amountStr && preg_match('/([\d,]+(?:\.\d+)?)/', str_replace(',', '', (string) $amountStr), $matches)) {
                    return (float) $matches[1];
                }
                return null;

            case 'boa-json':
                return isset($receipt['totalAmount']) ? (float) $receipt['totalAmount'] : (isset($receipt['transferredAmount']) ? (float) $receipt['transferredAmount'] : null);

            case 'zemen-pdf':
                return isset($receipt['totalAmountPaid']) ? (float) $receipt['totalAmountPaid'] : (isset($receipt['settledAmount']) ? (float) $receipt['settledAmount'] : null);

            default:
                // Fallback search across common keys
                foreach (['totalAmount', 'transferredAmount', 'settledAmount', 'amount', 'totalAmountPaid'] as $key) {
                    if (isset($receipt[$key])) {
                        if (is_numeric($receipt[$key])) {
                            return (float) $receipt[$key];
                        }
                        if (is_string($receipt[$key]) && preg_match('/([\d,]+(?:\.\d+)?)/', str_replace(',', '', $receipt[$key]), $matches)) {
                            return (float) $matches[1];
                        }
                    }
                }
                return null;
        }
    }

    /**
     * Safely extract the authoritative reference token from a verified receipt.
     */
    public static function extractReference(array $receipt): ?string
    {
        $source = $receipt['source'] ?? '';

        switch ($source) {
            case 'telebirr-html':
                return $receipt['receiptNo'] ?? null;

            case 'cbe-pdf':
            case 'mb-json':
                return $receipt['reference'] ?? ($receipt['vatReceiptNo'] ?? null);

            case 'boa-json':
                return $receipt['transactionReference'] ?? ($receipt['paymentReference'] ?? null);

            case 'zemen-pdf':
                return $receipt['reference'] ?? ($receipt['invoiceNo'] ?? null);

            case 'awash-html':
                return $receipt['transaction']['transactionId'] ?? null;

            default:
                return $receipt['reference'] ?? ($receipt['receiptNo'] ?? ($receipt['transactionReference'] ?? null));
        }
    }

    /**
     * Safely extract payer/sender name from a verified receipt.
     */
    public static function extractPayerName(array $receipt): ?string
    {
        $source = $receipt['source'] ?? '';

        switch ($source) {
            case 'telebirr-html':
            case 'cbe-pdf':
            case 'mb-json':
            case 'zemen-pdf':
                return $receipt['payerName'] ?? null;

            case 'awash-html':
                return $receipt['transaction']['senderName'] ?? ($receipt['customer']['customerName'] ?? null);

            default:
                return $receipt['payerName'] ?? ($receipt['senderName'] ?? null);
        }
    }

    protected function ensureConfigured(): void
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('LINKS_ET_API_KEY is not configured in .env.');
        }
    }
}
