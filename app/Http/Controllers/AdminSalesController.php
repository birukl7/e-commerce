<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Services\PaymentFinalizer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminSalesController extends Controller
{
    public function __construct(
        private PaymentFinalizer $paymentFinalizer
    ) {}

    public function index(Request $request)
    {
        // Get payments data
        $paymentsQuery = $this->buildPaymentsQuery($request);
        $payments = $paymentsQuery->paginate(10, ['*'], 'payments_page');

        // Get orders data  
        $ordersQuery = $this->buildOrdersQuery($request);
        $orders = $ordersQuery->paginate(10, ['*'], 'orders_page');

        // Get consolidated stats
        $stats = $this->getConsolidatedStats();

        return Inertia::render('admin/sales/index', [
            'payments' => [
                'data' => $payments->items(),
                'links' => $payments->toArray()['links'],
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ]
            ],
            'orders' => [
                'data' => $orders->items(),
                'links' => $orders->toArray()['links'],
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                ]
            ],
            'stats' => $stats,
            'filters' => $request->only(['tab', 'search', 'status', 'date_from', 'date_to'])
        ]);
    }

    private function buildPaymentsQuery(Request $request)
    {
        // Move payment query logic from AdminPaymentController::index here
        return DB::table('payment_transactions as pt')
            ->leftJoin('users as u', 'pt.customer_email', '=', 'u.email')
            ->leftJoin('orders as o', 'pt.order_id', '=', 'o.id')
            ->select([
                'pt.*',
                'u.name as customer_name',
                'o.total_amount as order_total'
            ])
            ->when($request->search, function($q) use ($request) {
                $q->where('u.name', 'like', '%' . $request->search . '%')
                  ->orWhere('pt.tx_ref', 'like', '%' . $request->search . '%');
            })
            ->orderBy('pt.created_at', 'desc');
    }

    private function buildOrdersQuery(Request $request)
    {
        // Move order query logic from AdminOrderController::index here
        return Order::with(['user:id,name,email'])
            ->when($request->search, function($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', "%{$request->search}%");
                  });
            })
            ->orderBy('created_at', 'desc');
    }

    public function showOrder(Request $request, Order $order)
    {
        // Load order with all related data
        $order->load([
            'user:id,name,email,phone',
            'orderItems.product.images',
            'paymentTransactions',
            'shippingAddress',
            'billingAddress'
        ]);

        return Inertia::render('admin/sales/order-details', [
            'order' => $order
        ]);
    }

    private function getConsolidatedStats()
    {
        return [
            // Payment stats
            'total_transactions' => PaymentTransaction::count(),
            'awaiting_approval' => PaymentTransaction::whereIn('gateway_status', ['paid', 'proof_uploaded'])
                ->where('admin_status', '!=', 'approved')->count(),
            'total_revenue' => PaymentTransaction::where('gateway_status', 'paid')
                ->where('admin_status', 'approved')->sum('amount'),
            
            // Order stats  
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'delivered')->count(),
            'today_orders' => Order::whereDate('created_at', today())->count(),
        ];
    }
}