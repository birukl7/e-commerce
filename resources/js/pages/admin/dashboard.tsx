import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, NavItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CreditCard,
    DollarSign,
    LayoutDashboard,
    MessageSquare,
    Package,
    Settings,
    ShoppingCart,
    Tags,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';

interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    activeCustomers: number;
    lowStockProducts: number;
    todaySales: number;
    salesChange: number;
}

interface RecentOrder {
    order_number: string;
    customer_name: string;
    total_amount: string;
    payment_status: string;
}

interface TopSelligProduct {
    product_name: string;
    category_id: number;
    total_quantity_sold: number;
    total_revenue_generated: number;
}

interface AdminDashboardProps {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    topSellingProducts: TopSelligProduct[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
];

export const adminNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin-dashboard', icon: LayoutDashboard },
    { title: 'Products', href: '/admin/products', icon: Package },
    { title: 'Payments', href: '/admin/paymentStats', icon: CreditCard },
    { title: 'Suppliers and Customers', href: '/admin/customers', icon: Users },
    { title: 'Categories and Brands', href: '/admin/categories', icon: Tags },
    { title: 'Product Requests', href: '/admin/product-requests', icon: MessageSquare },
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Site Configuration', href: '/admin/site-config', icon: Settings },
];

interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    activeCustomers: number;
    lowStockProducts: number;
    todaySales: number;
    salesChange: number;
}

interface RecentOrder {
    order_number: string;
    customer_name: string;
    total_amount: string;
    payment_status: string;
}

interface TopSellingProduct {
    product_name: string;
    category_id: number;
    total_quantity_sold: number;
    total_revenue_generated: number;
}

interface SalesByCategory {
    category_name: string;
    total_sales: number;
}

interface ProductRequestSummary {
    pending: number;
    reviewed: number;
    approved: number;
    rejected: number;
}

interface CustomerRegistrationTrend {
    month: string;
    count: number;
}

interface PaymentStats {
    total_transactions: number;
    successful_payments: number;
    failed_payments: number;
    pending_payments: number;
    total_revenue: number;
    today_revenue: number;
}

interface AdminDashboardProps {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    topSellingProducts: TopSellingProduct[];
    salesByCategory: SalesByCategory[];
    productRequestSummary: ProductRequestSummary;
    customerRegistrationTrends: CustomerRegistrationTrend[];
    paymentStats: PaymentStats;
}

export default function AdminDashboard({
    stats,
    recentOrders,
    topSellingProducts,
    salesByCategory,
    productRequestSummary,
    customerRegistrationTrends,
    paymentStats,
}: AdminDashboardProps) {
    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const categoryChartData = salesByCategory.map((category) => ({
        category: category.category_name,
        sales: category.total_sales,
    }));

    const requestStatusData = [
        { name: 'Pending', value: productRequestSummary.pending, fill: '#f59e0b' },
        { name: 'Reviewed', value: productRequestSummary.reviewed, fill: '#3b82f6' },
        { name: 'Approved', value: productRequestSummary.approved, fill: '#10b981' },
        { name: 'Rejected', value: productRequestSummary.rejected, fill: '#ef4444' },
    ];

    const registrationTrendData = customerRegistrationTrends.map((trend) => ({
        month: trend.month,
        registrations: trend.count,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Admin Dashboard" />
            <div className="flex   flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalSales)}</div>
                            <div className="flex items-center gap-1 text-xs">
                                {stats.salesChange >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-primary" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-destructive" />
                                )}
                                <span className={`font-medium ${stats.salesChange >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                    {Math.abs(stats.salesChange)}%
                                </span>
                                <span className="text-muted-foreground">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="font-medium text-primary">Active</span>
                                <span className="text-muted-foreground">orders in system</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.activeCustomers}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="font-medium text-primary">Registered</span>
                                <span className="text-muted-foreground">users total</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{stats.lowStockProducts}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <TrendingDown className="h-3 w-3 text-destructive" />
                                <span className="text-muted-foreground">Products need restocking</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{paymentStats.total_transactions}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{paymentStats.successful_payments}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{paymentStats.failed_payments}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(paymentStats.today_revenue)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Sales by Category Chart */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
                            <CardDescription>Revenue breakdown by product categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {categoryChartData.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{category.category}</span>
                                        <span className="text-sm font-medium">{formatCurrency(category.sales)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Request Status */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Product Requests</CardTitle>
                            <CardDescription>Status breakdown of product requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {requestStatusData.map((status, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.fill }} />
                                            <span className="text-sm text-muted-foreground">{status.name}</span>
                                        </div>
                                        <span className="text-sm font-medium">{status.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Registration Trends */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Customer Growth</CardTitle>
                            <CardDescription>Monthly customer registrations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {registrationTrendData.slice(-6).map((trend, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{trend.month}</span>
                                        <span className="text-sm font-medium">{trend.registrations} users</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity and Top Products */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="text-lg font-semibold text-foreground">Recent Orders</CardTitle>
                            <CardDescription className="text-muted-foreground">Latest orders from customers</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground">#{order.order_number}</p>
                                                <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-sm font-medium text-foreground">ETB {order.total_amount}</p>
                                                <Badge
                                                    variant={
                                                        order.payment_status === 'paid'
                                                            ? 'default'
                                                            : order.payment_status === 'pending'
                                                              ? 'secondary'
                                                              : 'destructive'
                                                    }
                                                    className={
                                                        order.payment_status === 'paid'
                                                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                                            : order.payment_status === 'pending'
                                                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }
                                                >
                                                    {order.payment_status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No recent orders.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="text-lg font-semibold text-foreground">Top Selling Products</CardTitle>
                            <CardDescription className="text-muted-foreground">Best performing products by quantity sold</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {topSellingProducts.length > 0 ? (
                                    topSellingProducts.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-foreground">{product.product_name}</p>
                                                    <p className="text-xs text-muted-foreground">Category: {product.category_id}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-sm font-medium text-foreground">{product.total_quantity_sold} sold</p>
                                                <p className="text-xs text-muted-foreground">{formatCurrency(product.total_revenue_generated)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No top selling products found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
