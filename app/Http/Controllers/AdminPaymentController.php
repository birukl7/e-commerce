<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Events\PaymentApproved;
use App\Services\PaymentFinalizer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminPaymentController extends Controller
{
    public function __construct(
        private PaymentFinalizer $paymentFinalizer
    ) {}

    /**
     * Display a listing of payment summaries.
     */
    public function index(Request $request)
    {
        \Log::info('AdminPaymentController@index hit', [
            'path' => $request->path(),
            'full_url' => $request->fullUrl(),
            'query' => $request->query(),
            'intended_component' => 'admin/payment/index',
        ]);
        
        try {
        // Note: Using leftJoin on order_id may fail if order_id is stored as order_number string
        // The join will work for numeric IDs, but for string order_numbers, the relationship won't match
        // This is acceptable for listing purposes - individual payment views use OrderLookupService
        // We use a raw join condition to handle both numeric IDs and order_number strings
        $query = DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->leftJoin('orders as o', function($join) {
                // Try to join on numeric ID first, then fallback to order_number
                $join->on(DB::raw('CAST(pt.order_id AS UNSIGNED)'), '=', 'o.id')
                     ->orOn('pt.order_id', '=', 'o.order_number');
            })
            ->leftJoin('users as admin', 'pt.admin_id', '=', 'admin.id')
            ->select([
                'pt.*',
                'u.name as customer_name',
                'u.email as customer_email',
                'u.phone as customer_phone',
                'u.id as customer_id',
                'o.total_amount as order_total',
                'o.status as order_status',
                'o.created_at as order_date',
                'admin.name as admin_name'
            ]);

        // Add search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('u.name', 'like', '%' . $request->search . '%')
                  ->orWhere('u.email', 'like', '%' . $request->search . '%')
                  ->orWhere('pt.tx_ref', 'like', '%' . $request->search . '%')
                  ->orWhere('pt.order_id', 'like', '%' . $request->search . '%');
            });
        }

        // Gateway status filter
        if ($request->has('gateway_status') && $request->gateway_status) {
            $query->where('pt.gateway_status', $request->gateway_status);
        }

        // Admin status filter
        if ($request->has('admin_status') && $request->admin_status) {
            $query->where('pt.admin_status', $request->admin_status);
        }

        // Add payment method filter
        if ($request->has('payment_method') && $request->payment_method) {
            $query->where('pt.payment_method', $request->payment_method);
        }

        // Add date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('pt.created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('pt.created_at', '<=', $request->date_to);
        }

        // Priority filter - show items needing attention first
        $orderBy = 'pt.created_at';
        $orderDirection = 'desc';
        
        if ($request->get('priority') === 'needs_attention') {
            $query->orderByRaw("
                CASE 
                    WHEN pt.gateway_status IN ('paid', 'proof_uploaded') AND pt.admin_status = 'unseen' THEN 1
                    WHEN pt.gateway_status IN ('paid', 'proof_uploaded') AND pt.admin_status = 'seen' THEN 2
                    ELSE 3
                END ASC
            ");
        }

        $page = $request->get('page', 1);
        $perPage = 15;

        $payments = $query->orderBy($orderBy, $orderDirection)->paginate($perPage, ['*'], 'page', $page);
        $payments->appends($request->query());

        // Calculate enhanced statistics
        $stats = [
            'total_transactions' => DB::table('payment_transactions')->count(),
            'gateway_paid' => DB::table('payment_transactions')->where('gateway_status', 'paid')->count(),
            'awaiting_approval' => DB::table('payment_transactions')
                ->whereIn('gateway_status', ['paid', 'proof_uploaded'])
                ->where('admin_status', '!=', 'approved')
                ->where('admin_status', '!=', 'rejected')
                ->count(),
            'fully_completed' => DB::table('payment_transactions')
                ->where('gateway_status', 'paid')
                ->where('admin_status', 'approved')
                ->count(),
            'unseen_payments' => DB::table('payment_transactions')->where('admin_status', 'unseen')->count(),
            'total_revenue' => (float) DB::table('payment_transactions')
                ->where('gateway_status', 'paid')
                ->where('admin_status', 'approved')
                ->sum('amount'),
            'pending_revenue' => (float) DB::table('payment_transactions')
                ->whereIn('gateway_status', ['paid', 'proof_uploaded'])
                ->where('admin_status', '!=', 'approved')
                ->sum('amount'),
        ];

        // Recent payments lists (match Site Config payments tab UI)
        // Include product_request_id and gateway_payload to identify product request payments
        $recentChapaPayments = DB::table('payment_transactions')
            ->where(function($query) {
                $query->where('tx_ref', 'like', 'TX-%')
                      ->orWhere('tx_ref', 'like', 'ADV-%')
                      ->orWhere('tx_ref', 'like', 'FINAL-%');
            })
            ->select(['id', 'tx_ref', 'order_id', 'product_request_id', 'customer_name', 'customer_email', 'amount', 'currency', 'payment_method', 'gateway_status', 'admin_status', 'created_at', 'gateway_payload'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentOfflinePayments = DB::table('payment_transactions')
            ->where('payment_method', '=', 'offline')
            ->select(['id', 'tx_ref', 'order_id', 'product_request_id', 'customer_name', 'customer_email', 'amount', 'currency', 'payment_method', 'gateway_status', 'admin_status', 'created_at', 'gateway_payload'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $response = Inertia::render('admin/payment/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => (object) $request->only([
                'search', 'gateway_status', 'admin_status', 'payment_method', 
                'date_from', 'date_to', 'priority'
            ]),
            // Provide the same props as Site Config payments tab for UI parity
            'recentChapaPayments' => $recentChapaPayments,
            'recentOfflinePayments' => $recentOfflinePayments,
        ]);

        \Log::info('AdminPaymentController@index returning component', [
            'component' => 'admin/payment/index',
            'payments_count' => $payments->total(),
            'response_type' => get_class($response),
        ]);

        return $response;
        } catch (\Throwable $e) {
            \Log::error('AdminPaymentController@index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Display the specified payment.
     */
    public function show($paymentId)
    {
        $payment = PaymentTransaction::with(['admin', 'productRequest'])
            ->where('id', $paymentId)
            ->first();

        if (!$payment) {
            return redirect()->route('admin.payments.index')
                           ->with('error', 'Payment not found.');
        }

        // Mark as seen if unseen
        if ($payment->isAdminUnseen()) {
            $payment->markSeen(Auth::user());
        }

        // Get order using OrderLookupService (handles both numeric ID and order_number string)
        $orderLookupService = app(\App\Services\OrderLookupService::class);
        $order = $orderLookupService->getOrderForPayment($payment);

        // Determine if this is a product request payment
        $isProductRequestPayment = $payment->product_request_id !== null;
        
        // Determine payment type (advance or final)
        $paymentType = null;
        if ($isProductRequestPayment) {
            $txRef = $payment->tx_ref;
            if (str_starts_with($txRef, 'ADV-')) {
                $paymentType = 'advance';
            } elseif (str_starts_with($txRef, 'FINAL-')) {
                $paymentType = 'final';
            }
        }

        // Get additional data same as before...
        $orderItems = [];
        if ($order && !$isProductRequestPayment) {
            // Only load order items for regular orders, not product requests
            // Use numeric order ID (order->id) for the query
            $orderItems = DB::table('order_items as oi')
                ->join('products as p', 'oi.product_id', '=', 'p.id')
                ->leftJoin('product_images as pi', function($join) {
                    $join->on('p.id', '=', 'pi.product_id')
                         ->where('pi.is_primary', true);
                })
                ->select([
                    'oi.*',
                    'p.name as product_name',
                    'p.slug as product_slug',
                    'pi.image_path as primary_image',
                ])
                ->where('oi.order_id', $order->id)
                ->get();
        }

        $customerPaymentHistory = PaymentTransaction::where('customer_email', $payment->customer_email)
            ->where('id', '!=', $paymentId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Load product request with user relationship if it's a product request payment
        $productRequest = null;
        if ($isProductRequestPayment && $payment->productRequest) {
            $productRequest = $payment->productRequest->load('user');
        }

        // Get rejection reasons for this payment type
        $paymentTypeForReasons = $isProductRequestPayment ? 'product_request' : 'normal_purchase';
        $rejectionReasons = \App\Models\PaymentRejectionReason::active()
            ->forPaymentType($paymentTypeForReasons)
            ->ordered()
            ->get(['id', 'reason_code', 'reason_text', 'description']);

        // Load customer profile image (if user exists)
        $customer = \App\Models\User::where('email', $payment->customer_email)->first();

        return Inertia::render('admin/payment/show', [
            'payment' => $payment,
            'orderItems' => $orderItems,
            'customerPaymentHistory' => $customerPaymentHistory,
            'canApprove' => $payment->canBeApproved(),
            'canReject' => $payment->canBeRejected(),
            'orderStatus' => $this->paymentFinalizer->getOrderStatusForPayment($payment),
            'isProductRequestPayment' => $isProductRequestPayment,
            'paymentType' => $paymentType,
            'productRequest' => $productRequest,
            'rejectionReasons' => $rejectionReasons,
            'customerProfileImage' => $customer?->profile_image_url,
        ]);
    }

    /**
     * Approve a payment
     */
    public function approve(Request $request, $paymentId)
    {
        try {
            $request->validate([
                'notes' => 'nullable|string|max:1000'
            ]);

            $payment = PaymentTransaction::findOrFail($paymentId);
            
            \Log::info('Before approve:', [
                'payment_id' => $payment->id,
                'admin_status' => $payment->admin_status,
                'gateway_status' => $payment->gateway_status,
                'can_be_approved' => $payment->canBeApproved()
            ]);
            
            if (!$payment->canBeApproved()) {
                return back()->with('error', 'Payment cannot be approved at this time.');
            }

            $success = $this->paymentFinalizer->handleAdminApproval(
                $payment, 
                Auth::user(), 
                $request->input('notes')
            );

            \Log::info('After approve:', [
                'payment_id' => $payment->id,
                'admin_status' => $payment->fresh()->admin_status,
                'gateway_status' => $payment->fresh()->gateway_status,
                'success' => $success
            ]);

            if ($success) {
                // Dispatch domain event for admin approval
                $context = ($payment->product_request_id !== null) ? 'advance' : 'checkout';
                event(new PaymentApproved($payment->fresh(), $context));
                return back()->with('success', 'Payment approved successfully.');
            }

            return back()->with('error', 'Failed to approve payment.');
        } catch (\Exception $e) {
            \Log::error('approve failed:', ['error' => $e->getMessage(), 'payment_id' => $paymentId]);
            return back()->with('error', 'Failed to approve payment: ' . $e->getMessage());
        }
    }

    /**
     * Reject a payment
     */
    public function reject(Request $request, $paymentId)
    {
        $request->validate([
            'rejection_reason_code' => 'required|string|exists:payment_rejection_reasons,reason_code',
            'notes' => 'nullable|string|max:1000'
        ]);

        $payment = PaymentTransaction::findOrFail($paymentId);
        
        if (!$payment->canBeRejected()) {
            return back()->with('error', 'Payment cannot be rejected at this time.');
        }

        $success = $this->paymentFinalizer->handleAdminRejection(
            $payment, 
            Auth::user(), 
            $request->input('notes'),
            $request->input('rejection_reason_code')
        );

        if ($success) {
            return back()->with('success', 'Payment rejected.');
        }

        return back()->with('error', 'Failed to reject payment.');
    }

    /**
     * Mark payment as seen
     */
    public function markSeen($paymentId)
    {
        try {
            $payment = PaymentTransaction::findOrFail($paymentId);
            
            \Log::info('Before markSeen:', [
                'payment_id' => $payment->id,
                'admin_status' => $payment->admin_status,
                'gateway_status' => $payment->gateway_status
            ]);
            
            $payment->markSeen(Auth::user());
            
            \Log::info('After markSeen:', [
                'payment_id' => $payment->id,
                'admin_status' => $payment->admin_status,
                'gateway_status' => $payment->gateway_status
            ]);
            
            return back()->with('success', 'Payment marked as seen.');
        } catch (\Exception $e) {
            \Log::error('markSeen failed:', ['error' => $e->getMessage(), 'payment_id' => $paymentId]);
            return back()->with('error', 'Failed to mark payment as seen.');
        }
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:mark_seen,approve,reject',
            'payment_ids' => 'required|array',
            'payment_ids.*' => 'exists:payment_transactions,id',
            'notes' => 'nullable|string|max:1000',
            'rejection_reason_code' => 'required_if:action,reject|string|exists:payment_rejection_reasons,reason_code'
        ]);

        $payments = PaymentTransaction::whereIn('id', $request->payment_ids)->get();
        $successCount = 0;
        $admin = Auth::user();

        foreach ($payments as $payment) {
            switch ($request->action) {
                case 'mark_seen':
                    if ($payment->isAdminUnseen()) {
                        $payment->markSeen($admin);
                        $successCount++;
                    }
                    break;

                case 'approve':
                    if ($payment->canBeApproved()) {
                        if ($this->paymentFinalizer->handleAdminApproval($payment, $admin, $request->notes)) {
                            $successCount++;
                        }
                    }
                    break;

                case 'reject':
                    if ($payment->canBeRejected()) {
                        if ($this->paymentFinalizer->handleAdminRejection(
                            $payment, 
                            $admin, 
                            $request->notes,
                            $request->rejection_reason_code
                        )) {
                            $successCount++;
                        }
                    }
                    break;
            }
        }

        return back()->with('success', "{$successCount} payments processed successfully.");
    }

    /**
     * Export payments to CSV
     */
    public function export(Request $request)
    {
        $query = DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->leftJoin('users as admin', 'pt.admin_id', '=', 'admin.id')
            ->select([
                'pt.tx_ref',
                'pt.order_id',
                'pt.customer_name',
                'pt.customer_email',
                'pt.amount',
                'pt.currency',
                'pt.payment_method',
                'pt.gateway_status',
                'pt.admin_status',
                'admin.name as admin_name',
                'pt.admin_action_at',
                'pt.created_at'
            ]);

        // Apply same filters as index
        if ($request->has('gateway_status') && $request->gateway_status) {
            $query->where('pt.gateway_status', $request->gateway_status);
        }

        if ($request->has('admin_status') && $request->admin_status) {
            $query->where('pt.admin_status', $request->admin_status);
        }

        if ($request->has('payment_method') && $request->payment_method) {
            $query->where('pt.payment_method', $request->payment_method);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('pt.created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('pt.created_at', '<=', $request->date_to);
        }

        $payments = $query->get();

        $filename = 'payments_export_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($payments) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, [
                'Transaction ID',
                'Order ID', 
                'Customer Name',
                'Customer Email',
                'Amount',
                'Currency',
                'Payment Method',
                'Gateway Status',
                'Admin Status',
                'Reviewed By',
                'Review Date',
                'Transaction Date'
            ]);

            // Add data rows
            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->tx_ref,
                    $payment->order_id,
                    $payment->customer_name,
                    $payment->customer_email,
                    $payment->amount,
                    $payment->currency,
                    $payment->payment_method,
                    $payment->gateway_status,
                    $payment->admin_status,
                    $payment->admin_name,
                    $payment->admin_action_at,
                    $payment->created_at
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}