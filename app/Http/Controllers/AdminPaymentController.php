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
                'u.email as customer_email',
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

        // Get page from request, default to 1
        $page = $request->get('page', 1);
        $perPage = 15;

        $payments = $query->latest('pt.created_at')->paginate($perPage, ['*'], 'page', $page);

        // Add query parameters to pagination links
        $payments->appends($request->query());

        // Calculate summary statistics
        $stats = [
            'total_transactions' => DB::table('payment_transactions')->count(),
            'successful_payments' => DB::table('payment_transactions')->where('status', 'completed')->count(),
            'failed_payments' => DB::table('payment_transactions')->where('status', 'failed')->count(),
            'pending_payments' => DB::table('payment_transactions')->where('status', 'pending')->count(),
            'total_revenue' => (float) DB::table('payment_transactions')->where('status', 'completed')->sum('amount'),
            'today_revenue' => (float) DB::table('payment_transactions')
                ->where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('amount'),
        ];

        return Inertia::render('admin/payment/index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => (object) $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to'])
        ]);
    }

    private function getRecentPayments($limit = 4)
    {
        // Fixed typo: payment_transactios -> payment_transactions
        return DB::table('payment_transactions as pt')
        ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
        ->select([
            'pt.id',
            'pt.tx_ref',
            'pt.order_id',
            'pt.amount',
            'pt.currency',
            'pt.status',
            'pt.payment_method',
            'pt.created_at',
            'pt.customer_name',
            'pt.customer_email',
            'u.name as user_name',
        ])
        ->orderBy('pt.created_at', 'desc')
        ->limit($limit)
        ->get()
        ->map(function ($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'tx_ref' => $payment->tx_ref,
                'customer_name' => $payment->user_name ?: $payment->customer_name,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'created_at' => $payment->created_at,
                'formatted_amount' => number_format($payment->amount, 2),
            ];
        });
    }
    
    /**
     * Display the specified payment.
     */
    public function show($paymentId)
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
            ->where('pt.id', $paymentId)
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

        // Get customer's payment history
        $customerPaymentHistory = DB::table('payment_transactions')
            ->where('customer_email', $payment->customer_email)
            ->where('id', '!=', $paymentId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/payment/show', [
            'payment' => $payment,
            'orderItems' => $orderItems,
            'customerPaymentHistory' => $customerPaymentHistory
        ]);
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