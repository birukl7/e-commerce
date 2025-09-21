import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import type { BreadcrumbItem, NavItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
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

interface TaxStats {
    total_tax_settings: number;
    active_tax_settings: number;
    total_tax_revenue: number;
}

interface StockNotificationStats {
    total_notifications: number;
    pending_notifications: number;
    notified_count: number;
    products_with_notifications: number;
}

interface AdminDashboardProps {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    topSellingProducts: TopSellingProduct[];
    salesByCategory: SalesByCategory[];
    productRequestSummary: ProductRequestSummary;
    customerRegistrationTrends: CustomerRegistrationTrend[];
    paymentStats: PaymentStats;
    taxStats: TaxStats;
    stockNotificationStats: StockNotificationStats;
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
    { title: 'Sales Dashboard', href: '/admin/sales', icon: BarChart3 },
    { title: 'Suppliers and Customers', href: '/admin/customers', icon: Users },
    { title: 'Categories and Brands', href: '/admin/categories', icon: Tags },
    { title: 'Product Requests', href: '/admin/product-requests', icon: MessageSquare },
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Tax Settings', href: '/tax-settings', icon: DollarSign },
    { title: 'Stock Notifications', href: '/admin/stock-notifications', icon: AlertTriangle },
    { title: 'Site Configuration', href: '/site-config', icon: Settings },
];

const AdminDashboard = ({
    stats = {
        totalSales: 0,
        totalOrders: 0,
        activeCustomers: 0,
        lowStockProducts: 0,
        todaySales: 0,
        salesChange: 0,
    },
    recentOrders = [],
    topSellingProducts = [],
    salesByCategory = [],
    productRequestSummary = {
        pending: 0,
        reviewed: 0,
        approved: 0,
        rejected: 0,
    },
    customerRegistrationTrends = [],
    paymentStats = {
        total_transactions: 0,
        successful_payments: 0,
        failed_payments: 0,
        pending_payments: 0,
        total_revenue: 0,
        today_revenue: 0,
    },
    taxStats = {
        total_tax_settings: 0,
        active_tax_settings: 0,
        total_tax_revenue: 0,
    },
    stockNotificationStats = {
        total_notifications: 0,
        pending_notifications: 0,
        notified_count: 0,
        products_with_notifications: 0,
    },
}: AdminDashboardProps) => {
    const formatCurrency = (amount: number, currency = 'ETB') => {
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
        <AdminLayout title="Admin Dashboard">
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

                {/* Tax & Stock Notification Widgets */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tax Settings</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{taxStats.active_tax_settings}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">of {taxStats.total_tax_settings} total</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tax Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(taxStats.total_tax_revenue)}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Total tax collected</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Notifications</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stockNotificationStats.pending_notifications}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Pending notifications</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Notified Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stockNotificationStats.notified_count}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Successfully notified</span>
                            </div>
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

                {/* Quick Actions */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                        <CardDescription className="text-muted-foreground">Manage your store settings and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Link
                                href={route('admin.tax-settings.index')}
                                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">Tax Settings</p>
                                    <p className="text-xs text-muted-foreground">Manage tax rates and fees</p>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.stock-notifications.index')}
                                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">Stock Notifications</p>
                                    <p className="text-xs text-muted-foreground">Manage out of stock alerts</p>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.products.index')}
                                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">Manage Products</p>
                                    <p className="text-xs text-muted-foreground">Add, edit, or remove products</p>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.site-config.index')}
                                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">Site Configuration</p>
                                    <p className="text-xs text-muted-foreground">General store settings</p>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
    state = { hasError: false, error: null as Error | null };

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('Dashboard Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    <h3 className="font-bold">Something went wrong</h3>
                    <p>Please refresh the page or try again later.</p>
                    <pre className="text-xs mt-2">{this.state.error?.toString()}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// Main Page Component
export default function DashboardPage(props: AdminDashboardProps) {
    return (
        <ErrorBoundary>
            <AdminDashboard {...props} />
        </ErrorBoundary>
    );
}
