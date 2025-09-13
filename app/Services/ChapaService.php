<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ChapaService
{
    protected $baseUrl;
    protected $secretKey;
    protected $publicKey;

    public function __construct()
    {
        $this->baseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1/');
        $this->secretKey = config('services.chapa.secret_key');
        $this->publicKey = config('services.chapa.public_key');
        
        if (empty($this->secretKey) || empty($this->publicKey)) {
            throw new \RuntimeException('Chapa API keys are not configured. Please set CHAPA_SECRET_KEY and CHAPA_PUBLIC_KEY in your .env file.');
        }
    }

    /**
     * Initialize a payment transaction
     *
     * @param array $paymentData
     * @return string URL to redirect to for payment
     * @throws \Exception
     */
    public function initializePayment(array $paymentData): string
    {
        $endpoint = $this->baseUrl . 'transaction/initialize';
        
        $response = Http::withToken($this->secretKey)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->post($endpoint, $paymentData);

        if ($response->successful()) {
            $data = $response->json();
            
            if (isset($data['status']) && $data['status'] === 'success' && isset($data['data']['checkout_url'])) {
                return $data['data']['checkout_url'];
            }
            
            throw new \Exception('Failed to initialize payment: ' . ($data['message'] ?? 'Unknown error'));
        }

        $error = $response->json();
        Log::error('Chapa payment initialization failed', [
            'status' => $response->status(),
            'error' => $error,
            'payment_data' => $paymentData,
        ]);

        throw new \Exception($error['message'] ?? 'Failed to initialize payment. Please try again.');
    }

    /**
     * Verify a payment transaction
     *
     * @param string $transactionReference
     * @return array
     * @throws \Exception
     */
    public function verifyPayment(string $transactionReference): array
    {
        $endpoint = $this->baseUrl . 'transaction/verify/' . $transactionReference;
        
        $response = Http::withToken($this->secretKey)
            ->withHeaders([
                'Accept' => 'application/json',
            ])
            ->get($endpoint);

        if ($response->successful()) {
            $data = $response->json();
            
            if (isset($data['status']) && $data['status'] === 'success' && isset($data['data'])) {
                return [
                    'status' => 'success',
                    'data' => $data['data'],
                ];
            }
            
            return [
                'status' => 'failed',
                'message' => $data['message'] ?? 'Payment verification failed',
            ];
        }

        $error = $response->json();
        Log::error('Chapa payment verification failed', [
            'status' => $response->status(),
            'error' => $error,
            'transaction_reference' => $transactionReference,
        ]);

        return [
            'status' => 'error',
            'message' => $error['message'] ?? 'Failed to verify payment',
        ];
    }

    /**
     * Verify webhook signature
     *
     * @param Request $request
     * @return bool
     */
    public function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('Chapa-Signature');
        
        if (empty($signature)) {
            return false;
        }

        $payload = $request->getContent();
        $computedSignature = hash_hmac('sha256', $payload, $this->secretKey);
        
        return hash_equals($signature, $computedSignature);
    }

    /**
     * Generate a unique transaction reference
     *
     * @param string $prefix
     * @return string
     */
    public function generateTransactionReference(string $prefix = 'TXN'): string
    {
        return strtoupper($prefix . '-' . Str::random(12) . '-' . time());
    }

    /**
     * Get list of banks for bank transfer
     *
     * @return array
     */
    public function getBanks(): array
    {
        $endpoint = $this->baseUrl . 'banks';
        
        $response = Http::withToken($this->secretKey)
            ->withHeaders([
                'Accept' => 'application/json',
            ])
            ->get($endpoint);

        if ($response->successful()) {
            return $response->json()['data'] ?? [];
        }

        Log::error('Failed to fetch banks from Chapa', [
            'status' => $response->status(),
            'error' => $response->json(),
        ]);

        return [];
    }
}
