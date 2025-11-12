<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Log;

/**
 * Service for centralized order lookup and normalization.
 * 
 * Best Practice: Always use numeric order IDs for foreign key relationships.
 * Order numbers are for customer-facing purposes only.
 */
class OrderLookupService
{
    /**
     * Find an order from a payment transaction's order_id field.
     * Handles both numeric IDs and order number strings.
     * Also handles cases where order_id is NULL by matching by amount and time.
     * 
     * @param PaymentTransaction $payment
     * @return Order|null
     */
    public function findOrderFromPayment(PaymentTransaction $payment): ?Order
    {
        // Method 1: Try relationship first (works if order_id is numeric)
        if ($payment->order_id) {
            $order = $payment->order;
            if ($order) {
                return $order;
            }

            // Method 2: Try numeric ID lookup
            if (is_numeric($payment->order_id)) {
                $order = Order::find($payment->order_id);
                if ($order) {
                    return $order;
                }
            }

            // Method 3: Try order_number lookup (if order_id is stored as string)
            if (is_string($payment->order_id) && !is_numeric($payment->order_id)) {
                $order = Order::where('order_number', $payment->order_id)->first();
                if ($order) {
                    // Normalize payment transaction to store numeric ID
                    $this->normalizePaymentOrderId($payment, $order);
                    return $order;
                }
            }
        }

        // Method 4: Try gateway_payload for order_number
        if (!empty($payment->gateway_payload['order_number'])) {
            $order = Order::where('order_number', $payment->gateway_payload['order_number'])->first();
            if ($order) {
                // Normalize payment transaction to store numeric ID
                $this->normalizePaymentOrderId($payment, $order);
                return $order;
            }
        }

        // Method 5: If order_id is NULL, try to find by amount and time window
        // This handles cases where payment was created but order_id wasn't set
        if (!$payment->order_id && $payment->customer_email && $payment->amount) {
            $user = \App\Models\User::where('email', $payment->customer_email)->first();
            if ($user) {
                $timeWindowStart = $payment->created_at->copy()->subHours(2);
                $timeWindowEnd = $payment->created_at->copy()->addHours(2);
                
                $order = Order::where('user_id', $user->id)
                    ->where('total_amount', $payment->amount)
                    ->whereBetween('created_at', [$timeWindowStart, $timeWindowEnd])
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($order) {
                    // Link payment transaction to order
                    $this->normalizePaymentOrderId($payment, $order);
                    Log::info('Linked payment transaction to order by amount/time matching', [
                        'payment_id' => $payment->id,
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'amount' => $payment->amount,
                    ]);
                    return $order;
                }
            }
        }

        return null;
    }

    /**
     * Find an order by order_id value (handles both numeric and string).
     * 
     * @param mixed $orderId Can be numeric ID or order_number string
     * @param int|null $userId Optional user ID for additional validation
     * @return Order|null
     */
    public function findOrder($orderId, ?int $userId = null): ?Order
    {
        if (!$orderId) {
            return null;
        }

        // Try numeric ID first
        if (is_numeric($orderId)) {
            $order = Order::find($orderId);
            if ($order && (!$userId || $order->user_id === $userId)) {
                return $order;
            }
        }

        // Try order_number
        if (is_string($orderId)) {
            $query = Order::where('order_number', $orderId);
            if ($userId) {
                $query->where('user_id', $userId);
            }
            return $query->first();
        }

        return null;
    }

    /**
     * Normalize a payment transaction's order_id to store numeric ID.
     * Best Practice: Always store numeric IDs for foreign key relationships.
     * 
     * @param PaymentTransaction $payment
     * @param Order $order
     * @return bool True if normalization occurred, false if already normalized
     */
    public function normalizePaymentOrderId(PaymentTransaction $payment, Order $order): bool
    {
        $numericId = (string)$order->id;
        
        // Only update if order_id is not already the numeric ID
        if ($payment->order_id !== $numericId) {
            $oldOrderId = $payment->order_id;
            $payment->order_id = $numericId;
            $payment->save();

            Log::info('Normalized payment transaction order_id to numeric ID', [
                'payment_id' => $payment->id,
                'old_order_id' => $oldOrderId,
                'new_order_id' => $numericId,
                'order_number' => $order->order_number,
            ]);

            return true;
        }

        return false;
    }

    /**
     * Ensure payment transaction has correct numeric order_id.
     * If order_id is a string (order_number), looks up order and normalizes.
     * 
     * @param PaymentTransaction $payment
     * @return bool True if order was found and normalized, false otherwise
     */
    public function ensurePaymentOrderIdNormalized(PaymentTransaction $payment): bool
    {
        if (!$payment->order_id) {
            return false;
        }

        // If already numeric, check if it's valid
        if (is_numeric($payment->order_id)) {
            $order = Order::find($payment->order_id);
            if ($order) {
                return true; // Already normalized and valid
            }
            // Numeric ID doesn't exist, might need to look up by order_number
        }

        // Try to find order by order_number (if order_id is stored as string)
        $order = $this->findOrder($payment->order_id);
        if ($order) {
            $this->normalizePaymentOrderId($payment, $order);
            return true;
        }

        return false;
    }

    /**
     * Get the order for a payment transaction, with automatic normalization.
     * 
     * @param PaymentTransaction $payment
     * @return Order|null
     */
    public function getOrderForPayment(PaymentTransaction $payment): ?Order
    {
        $order = $this->findOrderFromPayment($payment);
        
        // If order found but payment not normalized (or order_id is NULL), normalize it
        if ($order && (!$payment->order_id || !is_numeric($payment->order_id))) {
            $this->normalizePaymentOrderId($payment, $order);
        }

        return $order;
    }
}

