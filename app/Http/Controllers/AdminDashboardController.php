<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\PaymentTransaction; // Import the PaymentTransaction model
use App\Models\User; // Assuming User model for customer count
use App\Models\Product; // Assuming Product model for low stock count
use App\Models\Order; // Assuming Order model for total orders
use App\Models\OrderItem; // Assuming OrderItem model for top selling products
use App\Models\Category; // Assuming Category model for sales by category
use App\Models\ProductRequest; // Assuming ProductRequest model for summary

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with fetched statistics and payment transactions.
     */
    public function index(Request $request)
    {
        // 1. Fetch Key Metrics
        $totalSales = PaymentTransaction::where('status', 'completed')->sum('amount');
        $totalOrders = Order::count();
        $activeCustomers = User::count();
        $lowStockProducts = Product::where('stock_quantity', '<', 10)->count();

        $todaySales = PaymentTransaction::where('status', 'completed')
                                        ->whereDate('created_at', Carbon::today())
                                        ->sum('amount');

        $lastMonthSales = PaymentTransaction::where('status', 'completed')
                                            ->whereBetween('created_at', [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()])
                                            ->sum('amount');

        $currentMonthSales = PaymentTransaction::where('status', 'completed')
                                               ->whereMonth('created_at', Carbon::now()->month)
                                               ->whereYear('created_at', Carbon::now()->year)
                                               ->sum('amount');
        
        $salesChange = ($lastMonthSales > 0) ? (($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100 : 0;
        $salesChange = round($salesChange, 2);

        // 2. Fetch Recent Orders
        $recentOrders = Order::join('users', 'orders.user_id', '=', 'users.id')
                            ->select('orders.order_number', 'users.name as customer_name', 'orders.total_amount', 'orders.payment_status')
                            ->orderBy('orders.created_at', 'desc')
                            ->limit(4)
                            ->get();

        // 3. Fetch Top Selling Products (by quantity sold)
        $topSellingProducts = OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
                                ->select(
                                    'products.name as product_name',
                                    'products.category_id',
                                    DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                                    DB::raw('SUM(order_items.total) as total_revenue_generated')
                                )
                                ->groupBy('products.id', 'products.name', 'products.category_id')
                                ->orderBy('total_quantity_sold', 'desc')
                                ->limit(4)
                                ->get();
        
        // 4. Data for Radar Chart: Sales by Category
        $salesByCategory = Category::leftJoin('products', 'categories.id', '=', 'products.category_id')
                                ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                                ->leftJoin('orders', 'order_items.order_id', '=', 'orders.id')
                                ->where('orders.payment_status', 'paid')
                                ->select('categories.name as category_name', DB::raw('COALESCE(SUM(order_items.total), 0) as total_sales'))
                                ->groupBy('categories.id', 'categories.name')
                                ->get();

        // 5. Product Request Summary
        $productRequestSummary = ProductRequest::select('status', DB::raw('COUNT(*) as count'))
                                    ->groupBy('status')
                                    ->get()
                                    ->keyBy('status')
                                    ->map->count
                                    ->toArray();

        $allRequestStatuses = ['pending', 'reviewed', 'approved', 'rejected'];
        foreach ($allRequestStatuses as $status) {
            if (!isset($productRequestSummary[$status])) {
                $productRequestSummary[$status] = 0;
            }
        }

        // 6. Customer Registration Trends (DB-agnostic month formatting)
        $driver = DB::connection()->getDriverName();
        if ($driver === 'sqlite') {
            $monthFormat = "strftime('%Y-%m', created_at)";
        } elseif ($driver === 'pgsql') {
            $monthFormat = "to_char(created_at, 'YYYY-MM')";
        } else { // mysql, mariadb, etc.
            $monthFormat = "DATE_FORMAT(created_at, '%Y-%m')";
        }

        $customerRegistrationTrends = User::select(
                                                DB::raw("{$monthFormat} as month"),
                                                DB::raw('COUNT(*) as count')
                                            )
                                            ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
                                            ->groupBy(DB::raw($monthFormat))
                                            ->orderBy('month')
                                            ->get();

        // --- Payment Transactions Listing (Moved from AdminPaymentController) ---
        $paymentQuery = PaymentTransaction::query()
            ->leftJoin('users as u', 'payment_transactions.customer_email', '=', 'u.email')
            ->leftJoin('orders as o', 'payment_transactions.order_id', '=', 'o.id')
            ->select([
                'payment_transactions.*',
                'u.name as customer_name',
                'u.phone as customer_phone',
                'u.id as customer_id',
                'o.total_amount as order_total',
                'o.status as order_status',
                'o.created_at as order_date'
            ]);

        // Apply filters
        if ($request->has('payment_search') && $request->payment_search) {
            $paymentQuery->where(function($q) use ($request) {
                $q->where('payment_transactions.customer_name', 'like', '%' . $request->payment_search . '%')
                  ->orWhere('payment_transactions.customer_email', 'like', '%' . $request->payment_search . '%')
                  ->orWhere('payment_transactions.tx_ref', 'like', '%' . $request->payment_search . '%')
                  ->orWhere('payment_transactions.order_id', 'like', '%' . $request->payment_search . '%');
            });
        }

        if ($request->has('payment_status') && $request->payment_status) {
            $paymentQuery->where('payment_transactions.status', $request->payment_status);
        }

        if ($request->has('payment_method') && $request->payment_method) {
            $paymentQuery->where('payment_transactions.payment_method', $request->payment_method);
        }

        if ($request->has('payment_date_from') && $request->payment_date_from) {
            $paymentQuery->whereDate('payment_transactions.created_at', '>=', $request->payment_date_from);
        }
        if ($request->has('payment_date_to') && $request->payment_date_to) {
            $paymentQuery->whereDate('payment_transactions.created_at', '<=', $request->payment_date_to);
        }

        $payments = $paymentQuery->latest('payment_transactions.created_at')->paginate(5, ['*'], 'payment_page'); // Paginate with a custom page parameter name

        // Calculate summary statistics for payments (now included in dashboard stats)
        $paymentStats = [
            'total_transactions' => PaymentTransaction::count(),
            'successful_payments' => PaymentTransaction::where('status', 'completed')->count(),
            'failed_payments' => PaymentTransaction::where('status', 'failed')->count(),
            'pending_payments' => PaymentTransaction::where('status', 'pending')->count(),
            'total_revenue' => PaymentTransaction::where('status', 'completed')->sum('amount'),
            'today_revenue' => PaymentTransaction::where('status', 'completed')
                                ->whereDate('created_at', today())
                                ->sum('amount'),
        ];


        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalSales' => $totalSales,
                'totalOrders' => $totalOrders,
                'activeCustomers' => $activeCustomers,
                'lowStockProducts' => $lowStockProducts,
                'todaySales' => $todaySales,
                'salesChange' => $salesChange,
            ],
            'recentOrders' => $recentOrders,
            'topSellingProducts' => $topSellingProducts,
            'salesByCategory' => $salesByCategory,
            'productRequestSummary' => $productRequestSummary,
            'customerRegistrationTrends' => $customerRegistrationTrends,
            'payments' => $payments, // Pass paginated payments
            'paymentStats' => $paymentStats, // Pass payment summary stats
            'paymentFilters' => $request->only(['payment_search', 'payment_status', 'payment_method', 'payment_date_from', 'payment_date_to']) // Pass filters
        ]);
    }
}
