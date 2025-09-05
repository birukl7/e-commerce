<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
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
        $query = DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->leftJoin('orders as o', 'pt.order_id', '=', 'o.id')
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
        $recentChapaPayments = DB::table('payment_transactions')
            ->where('tx_ref', 'like', 'TX-%')
            ->select(['id', 'tx_ref', 'order_id', 'customer_name', 'customer_email', 'amount', 'currency', 'payment_method', 'gateway_status', 'admin_status', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentOfflinePayments = DB::table('payment_transactions')
            ->where('tx_ref', 'like', 'OFFLINE-%')
            ->select(['id', 'tx_ref', 'order_id', 'customer_name', 'customer_email', 'amount', 'currency', 'payment_method', 'gateway_status', 'admin_status', 'created_at'])
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
        $payment = PaymentTransaction::with(['admin', 'order'])
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

        // Get additional data same as before...
        $orderItems = [];
        if ($payment->order_id) {
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
                ->where('oi.order_id', $payment->order_id)
                ->get();
        }

        $customerPaymentHistory = PaymentTransaction::where('customer_email', $payment->customer_email)
            ->where('id', '!=', $paymentId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/payment/show', [
            'payment' => $payment,
            'orderItems' => $orderItems,
            'customerPaymentHistory' => $customerPaymentHistory,
            'canApprove' => $payment->canBeApproved(),
            'canReject' => $payment->canBeRejected(),
            'orderStatus' => $this->paymentFinalizer->getOrderStatusForPayment($payment)
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
            'notes' => 'required|string|max:1000'
        ]);

        $payment = PaymentTransaction::findOrFail($paymentId);
        
        if (!$payment->canBeRejected()) {
            return back()->with('error', 'Payment cannot be rejected at this time.');
        }

        $success = $this->paymentFinalizer->handleAdminRejection(
            $payment, 
            Auth::user(), 
            $request->input('notes')
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
            'notes' => 'nullable|string|max:1000'
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
                        if ($this->paymentFinalizer->handleAdminRejection($payment, $admin, $request->notes)) {
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