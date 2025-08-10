<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminPaymentController extends Controller
{
    /**
     * Display a listing of payment summaries.
     */
    public function index(Request $request)
    {
        $query = DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->leftJoin('orders as o', 'pt.order_id', '=', 'o.id')
            ->select([
                'pt.*',
                'u.name as customer_name',
                'u.phone as customer_phone',
                'u.id as customer_id',
                'o.total_amount as order_total',
                'o.status as order_status',
                'o.created_at as order_date'
            ]);

        // Add search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('pt.customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('pt.customer_email', 'like', '%' . $request->search . '%')
                  ->orWhere('pt.tx_ref', 'like', '%' . $request->search . '%')
                  ->orWhere('pt.order_id', 'like', '%' . $request->search . '%');
            });
        }

        // Add status filter
        if ($request->has('status') && $request->status) {
            $query->where('pt.status', $request->status);
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

        $payments = $query->latest('pt.created_at')->paginate(15);

        // Calculate summary statistics
        $stats = [
            'total_transactions' => DB::table('payment_transactions')->count(),
            'successful_payments' => DB::table('payment_transactions')->where('status', 'completed')->count(),
            'failed_payments' => DB::table('payment_transactions')->where('status', 'failed')->count(),
            'pending_payments' => DB::table('payment_transactions')->where('status', 'pending')->count(),
            'total_revenue' => DB::table('payment_transactions')->where('status', 'completed')->sum('amount'),
            'today_revenue' => DB::table('payment_transactions')
                ->where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('amount'),
        ];

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Display the specified payment.
     */
    public function show($id)
    {
        $payment = DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->leftJoin('orders as o', 'pt.order_id', '=', 'o.id')
            ->leftJoin('user_addresses as ua', function($join) {
                $join->on('u.id', '=', 'ua.user_id')
                     ->where('ua.is_default', true);
            })
            ->select([
                'pt.*',
                'u.name as customer_name',
                'u.phone as customer_phone',
                'u.id as customer_id',
                'u.email_verified_at',
                'u.created_at as customer_since',
                'o.total_amount as order_total',
                'o.status as order_status',
                'o.created_at as order_date',
                'ua.address_line_1',
                'ua.city',
                'ua.state',
                'ua.country'
            ])
            ->where('pt.id', $id)
            ->first();

        if (!$payment) {
            return redirect()->route('admin.payments.index')
                           ->with('error', 'Payment not found.');
        }

        // Get order items if order exists
        $orderItems = [];
        if ($payment->order_id) {
            $orderItems = DB::table('order_items as oi')
                ->join('products as p', 'oi.product_id', '=', 'p.id')
                ->select([
                    'oi.*',
                    'p.name as product_name',
                    'p.slug as product_slug',
                    'p.primary_image'
                ])
                ->where('oi.order_id', $payment->order_id)
                ->get();
        }

        // Get customer's payment history
        $customerPaymentHistory = DB::table('payment_transactions')
            ->where('customer_email', $payment->customer_email)
            ->where('id', '!=', $id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/payments/show', [
            'payment' => $payment,
            'orderItems' => $orderItems,
            'customerPaymentHistory' => $customerPaymentHistory
        ]);
    }

    /**
     * Update payment status (for manual adjustments)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
            'notes' => 'nullable|string|max:500'
        ]);

        DB::table('payment_transactions')
            ->where('id', $id)
            ->update([
                'status' => $request->status,
                'admin_notes' => $request->notes,
                'updated_at' => now()
            ]);

        return redirect()->route('admin.payments.show', $id)
                         ->with('success', 'Payment status updated successfully.');
    }

    /**
     * Export payments to CSV
     */
    public function export(Request $request)
    {
        $query = DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->select([
                'pt.tx_ref',
                'pt.order_id',
                'pt.customer_name',
                'pt.customer_email',
                'pt.amount',
                'pt.currency',
                'pt.payment_method',
                'pt.status',
                'pt.created_at'
            ]);

        // Apply same filters as index
        if ($request->has('status') && $request->status) {
            $query->where('pt.status', $request->status);
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
                'Status',
                'Date'
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
                    $payment->status,
                    $payment->created_at
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
