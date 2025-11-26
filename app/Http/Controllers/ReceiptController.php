<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use App\Services\OrderLookupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ReceiptController extends Controller
{
    /**
     * Download receipt as PDF for an order
     */
    public function download($order)
    {
        // Handle both numeric ID and order_number string
        if (is_numeric($order)) {
            $order = Order::find($order);
        } else {
            $order = Order::where('order_number', $order)->first();
        }
        
        if (!$order) {
            \Log::warning('Order not found for receipt download', [
                'order_param' => $order,
                'user_id' => Auth::id(),
            ]);
            abort(404, 'Order not found');
        }
        
        // Check authorization: user must be authenticated AND own the order
        $isAuthenticated = Auth::check();
        $userId = $isAuthenticated ? Auth::id() : null;
        
        // Load order user relationship if not already loaded
        if (!$order->relationLoaded('user')) {
            $order->load('user');
        }
        
        // Check if user owns the order
        // Use type casting to handle string vs int differences
        $canAccess = false;
        if ($isAuthenticated && (int)$order->user_id === (int)$userId) {
            $canAccess = true;
            \Log::info('User authorized to download receipt', [
                'order_id' => $order->id,
                'user_id' => $userId,
            ]);
        } elseif (!$isAuthenticated) {
            // For email links: redirect to login with receipt redirect
            \Log::info('Unauthenticated user attempting to download receipt from email link', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);
            return redirect()->route('login')->with('redirect_after_login', route('user.orders.receipt', $order->id));
        }
        
        if (!$canAccess) {
            \Log::warning('User attempted to download receipt without permission', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'order_user_id' => $order->user_id,
                'authenticated_user_id' => $userId,
                'is_authenticated' => $isAuthenticated,
                'ip' => request()->ip(),
            ]);
            abort(403, 'You do not have permission to download this receipt. Please log in to access your receipts.');
        }

        // Get payment transaction for this order
        // Try to find payment transaction by numeric order_id first
        $paymentTransaction = PaymentTransaction::where('order_id', $order->id)->first();
        
        // If not found, try by order_number (for legacy data)
        if (!$paymentTransaction) {
            $paymentTransaction = PaymentTransaction::where('order_id', $order->order_number)->first();
        }
        
        // If still not found, try to find any payment transaction that might be linked
        if (!$paymentTransaction) {
            $paymentTransaction = PaymentTransaction::where('customer_email', $order->user->email)
                ->where('amount', $order->total_amount)
                ->whereBetween('created_at', [
                    $order->created_at->copy()->subHours(2),
                    $order->created_at->copy()->addHours(2)
                ])
                ->orderBy('created_at', 'desc')
                ->first();
        }

        // Load order relationships
        $order->load(['items.product', 'user']);

        // Prepare data for PDF
        $data = [
            'order' => $order,
            'paymentTransaction' => $paymentTransaction,
            'items' => $order->items,
            'customer' => $order->user,
            'date' => $order->created_at->format('F d, Y \a\t g:i A'),
            'isProductRequest' => false,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('receipts.order-receipt', $data);
        
        // Set PDF options for security
        $pdf->setOption('enable-local-file-access', false);
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', false);
        
        $filename = 'receipt-' . $order->order_number . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Download receipt as PDF using transaction ID
     */
    public function downloadByTransaction(Request $request, $txRef)
    {
        $paymentTransaction = PaymentTransaction::where('tx_ref', $txRef)->first();
        
        if (!$paymentTransaction) {
            abort(404, 'Transaction not found');
        }

        // Ensure user can only download their own receipts
        if ($paymentTransaction->customer_email !== Auth::user()->email) {
            abort(403, 'Unauthorized');
        }

        // Check if this is a product request payment
        if ($paymentTransaction->product_request_id) {
            return $this->downloadProductRequestReceipt($paymentTransaction);
        }

        // Use OrderLookupService to find the order
        $orderLookupService = app(OrderLookupService::class);
        $order = $orderLookupService->getOrderForPayment($paymentTransaction);

        if (!$order) {
            abort(404, 'Order not found for this transaction');
        }

        // Ensure user can only download their own receipts
        // Use type casting to handle string vs int differences
        if ((int)$order->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Load order relationships
        $order->load(['items.product', 'user']);

        // Prepare data for PDF
        $data = [
            'order' => $order,
            'paymentTransaction' => $paymentTransaction,
            'items' => $order->items,
            'customer' => $order->user,
            'date' => $paymentTransaction->created_at->format('F d, Y \a\t g:i A'),
            'isProductRequest' => false,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('receipts.order-receipt', $data);
        
        // Set PDF options for security
        $pdf->setOption('enable-local-file-access', false);
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', false);
        
        $filename = 'receipt-' . $order->order_number . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Download receipt for product request payment
     */
    public function downloadProductRequestReceipt(PaymentTransaction $paymentTransaction)
    {
        // Ensure user can only download their own receipts
        if ($paymentTransaction->customer_email !== Auth::user()->email) {
            abort(403, 'Unauthorized');
        }

        $productRequest = $paymentTransaction->productRequest;
        
        if (!$productRequest) {
            abort(404, 'Product request not found');
        }

        // Ensure user owns the product request
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Determine payment type from transaction
        // Check gateway_payload first, then tx_ref prefix
        $gatewayPayload = $paymentTransaction->gateway_payload ?? [];
        $payloadPaymentType = $gatewayPayload['payment_type'] ?? null;
        
        $isAdvancePayment = str_starts_with($paymentTransaction->tx_ref, 'ADV-') || 
                           $payloadPaymentType === 'advance' ||
                           ($productRequest->advance_payment_status === 'processing' || $productRequest->advance_payment_status === 'paid');
        $isFinalPayment = str_starts_with($paymentTransaction->tx_ref, 'FINAL-') || 
                         $payloadPaymentType === 'final' ||
                         ($productRequest->final_payment_status === 'processing' || $productRequest->final_payment_status === 'paid');
        
        // If both are true or both are false, check the product request status
        if ($isAdvancePayment && $isFinalPayment) {
            // If both statuses are set, prefer the one that matches the transaction
            if (str_starts_with($paymentTransaction->tx_ref, 'ADV-')) {
                $isFinalPayment = false;
            } else if (str_starts_with($paymentTransaction->tx_ref, 'FINAL-')) {
                $isAdvancePayment = false;
            } else {
                // Default to advance if we can't determine
                $isFinalPayment = false;
            }
        } else if (!$isAdvancePayment && !$isFinalPayment) {
            // If neither matches, check product request status
            if ($productRequest->advance_payment_status === 'processing' || $productRequest->advance_payment_status === 'paid') {
                $isAdvancePayment = true;
            } else if ($productRequest->final_payment_status === 'processing' || $productRequest->final_payment_status === 'paid') {
                $isFinalPayment = true;
            }
        }
        
        $paymentType = $isAdvancePayment ? 'advance' : ($isFinalPayment ? 'final' : 'unknown');

        // Get payment details from gateway_payload or calculate
        $subtotal = $gatewayPayload['subtotal'] ?? ($isAdvancePayment ? $productRequest->advance_amount : $productRequest->final_amount);
        $taxAmount = $gatewayPayload['tax_amount'] ?? 0;
        $totalAmount = $paymentTransaction->amount;

        // Prepare data for PDF
        $data = [
            'productRequest' => $productRequest,
            'paymentTransaction' => $paymentTransaction,
            'customer' => $productRequest->user,
            'date' => $paymentTransaction->created_at->format('F d, Y \a\t g:i A'),
            'paymentType' => $paymentType,
            'subtotal' => $subtotal,
            'taxAmount' => $taxAmount,
            'totalAmount' => $totalAmount,
            'currency' => $paymentTransaction->currency,
            'isProductRequest' => true,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('receipts.product-request-receipt', $data);
        
        // Set PDF options for security
        $pdf->setOption('enable-local-file-access', false);
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', false);
        
        $filename = $paymentType . '-payment-receipt-' . $productRequest->id . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Download receipt for product request by ID and payment type
     */
    public function downloadProductRequest(Request $request, ProductRequest $productRequest, $paymentType = 'advance')
    {
        // Ensure user can only download their own receipts
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Find the payment transaction for this product request and payment type
        // Try to find by payment type prefix first (for Chapa payments)
        $txRefPrefix = $paymentType === 'advance' ? 'ADV-' : 'FINAL-';
        $paymentTransaction = PaymentTransaction::where('product_request_id', $productRequest->id)
            ->where('tx_ref', 'like', $txRefPrefix . '%')
            ->latest()
            ->first();

        // If not found, try to find by payment status (for offline payments)
        if (!$paymentTransaction) {
            if ($paymentType === 'advance') {
                $paymentTransaction = PaymentTransaction::where('product_request_id', $productRequest->id)
                    ->where(function($query) {
                        $query->where('tx_ref', 'like', 'OFFLINE-%')
                              ->orWhere('tx_ref', 'like', 'ADV-%');
                    })
                    ->whereNotNull('product_request_id')
                    ->latest()
                    ->first();
            } else {
                $paymentTransaction = PaymentTransaction::where('product_request_id', $productRequest->id)
                    ->where(function($query) {
                        $query->where('tx_ref', 'like', 'OFFLINE-%')
                              ->orWhere('tx_ref', 'like', 'FINAL-%');
                    })
                    ->whereNotNull('product_request_id')
                    ->latest()
                    ->first();
            }
        }

        if (!$paymentTransaction) {
            abort(404, 'Payment transaction not found for this product request');
        }

        return $this->downloadProductRequestReceipt($paymentTransaction);
    }
}

