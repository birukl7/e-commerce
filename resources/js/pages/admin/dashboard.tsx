import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, NavItem } from '@/types';
import { Head } from '@inertiajs/react';
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
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
];


export default function AdminDashboard({
    stats,
    recentOrders,
    topSellingProducts,
    salesByCategory,
    productRequestSummary,
    customerRegistrationTrends,
    paymentStats,
}: AdminDashboardProps) {
    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    // Custom tooltip formatter for charts
    const formatTooltipValue = (value: number, name: string) => {
        if (name === 'sales') {
            return [`ETB ${value}`, 'Sales'];
        }
        if (name === 'registrations') {
            return [`${value} users`, 'Registrations'];
        }
        return [value, name];
    };

    const categoryChartData = salesByCategory.map((category) => ({
        category: category.category_name,
        sales: category.total_sales,
    }));

    const requestStatusData = [
        { name: 'Pending', value: productRequestSummary?.pending || 0, fill: 'hsl(var(--chart-2))' },
        { name: 'Reviewed', value: productRequestSummary?.reviewed || 0, fill: 'hsl(var(--chart-3))' },
        { name: 'Approved', value: productRequestSummary?.approved || 0, fill: 'hsl(var(--chart-4))' },
        { name: 'Rejected', value: productRequestSummary?.rejected || 0, fill: 'hsl(var(--chart-5))' },
    ].filter(item => item.value > 0); // Only show segments with data

    const registrationTrendData = customerRegistrationTrends.map((trend) => ({
        month: trend.month,
        registrations: trend.count,
    }));

    // Chart configurations with theme-aware colors
    const categoryChartConfig = {
        sales: {
            label: "Sales",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    const requestStatusChartConfig = {
        pending: {
            label: "Pending",
            color: "hsl(var(--chart-2))",
        },
        reviewed: {
            label: "Reviewed", 
            color: "hsl(var(--chart-3))",
        },
        approved: {
            label: "Approved",
            color: "hsl(var(--chart-4))",
        },
        rejected: {
            label: "Rejected",
            color: "hsl(var(--chart-5))",
        },
    } satisfies ChartConfig;

    const registrationChartConfig = {
        registrations: {
            label: "Registrations",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={[]} footerNavItems={[]}>
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
                            <ChartContainer config={categoryChartConfig} className="h-[200px]">
                                <BarChart data={categoryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="category" 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + '...' : value}
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        tickFormatter={(value) => `ETB ${value}`}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="sales" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Product Request Status */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Product Requests</CardTitle>
                            <CardDescription>Status breakdown of product requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {requestStatusData.length > 0 ? (
                                <ChartContainer config={requestStatusChartConfig} className="h-[200px]">
                                    <PieChart>
                                        <Pie
                                            data={requestStatusData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={60}
                                            innerRadius={20}
                                            paddingAngle={2}
                                            label={false}
                                        >
                                            {requestStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend 
                                            verticalAlign="bottom" 
                                            height={36}
                                            content={<ChartLegendContent />} 
                                        />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                    <p>No product request data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer Registration Trends */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Customer Growth</CardTitle>
                            <CardDescription>Monthly customer registrations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={registrationChartConfig} className="h-[200px]">
                                <BarChart data={registrationTrendData.slice(-6)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="month" 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="registrations" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
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