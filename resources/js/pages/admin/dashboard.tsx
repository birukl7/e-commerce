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

    // Define color palette for categories (only chart-1 through chart-5 are available)
    // Using actual color values that match the CSS variables
    const categoryColors = [
        'oklch(0.646 0.222 41.116)', // chart-1
        'oklch(0.6 0.118 184.704)', // chart-2
        'oklch(0.398 0.07 227.392)', // chart-3
        'oklch(0.828 0.189 84.429)', // chart-4
        'oklch(0.769 0.188 70.08)',  // chart-5
    ];

    const categoryChartData = salesByCategory.map((category, index) => ({
        category: category.category_name,
        sales: category.total_sales,
        fill: categoryColors[index % categoryColors.length],
    }));

    // Build category chart config dynamically
    const categoryChartConfig = salesByCategory.reduce((config, category, index) => {
        const key = category.category_name.toLowerCase().replace(/\s+/g, '_');
        config[key] = {
            label: category.category_name,
            color: categoryColors[index % categoryColors.length],
        };
        return config;
    }, {} as ChartConfig);

    const requestStatusData = [
        { name: 'Pending', value: productRequestSummary?.pending || 0, fill: 'oklch(0.6 0.118 184.704)' },
        { name: 'Reviewed', value: productRequestSummary?.reviewed || 0, fill: 'oklch(0.398 0.07 227.392)' },
        { name: 'Approved', value: productRequestSummary?.approved || 0, fill: 'oklch(0.828 0.189 84.429)' },
        { name: 'Rejected', value: productRequestSummary?.rejected || 0, fill: 'oklch(0.769 0.188 70.08)' },
    ].filter(item => item.value > 0); // Only show segments with data

    // Build request status chart config with proper keys matching the data
    const requestStatusChartConfig = requestStatusData.reduce((config, item) => {
        const key = item.name.toLowerCase();
        config[key] = {
            label: item.name,
            color: item.fill,
        };
        return config;
    }, {} as ChartConfig);

    // Format month labels properly
    const formatMonthLabel = (month: string) => {
        if (!month) return '';
        // Handle formats like "2024-01" or "2024-12"
        const parts = month.split('-');
        if (parts.length === 2) {
            const year = parts[0];
            const monthNum = parseInt(parts[1], 10);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[monthNum - 1]} ${year.slice(-2)}`;
        }
        return month.slice(0, 3);
    };

    const registrationTrendData = customerRegistrationTrends.map((trend) => ({
        month: trend.month,
        monthLabel: formatMonthLabel(trend.month),
        registrations: trend.count,
    }));

    const registrationChartConfig = {
        registrations: {
            label: "Registrations",
            color: "oklch(0.646 0.222 41.116)",
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
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalSales || 0)}</div>
                            <div className="flex items-center gap-1 text-xs">
                                {(stats?.salesChange ?? 0) >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-primary" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-destructive" />
                                )}
                                <span className={`font-medium ${(stats?.salesChange ?? 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                                    {Math.abs(stats?.salesChange ?? 0)}%
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
                            <div className="text-2xl font-bold text-foreground">{stats?.totalOrders ?? 0}</div>
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
                            <div className="text-2xl font-bold text-foreground">{stats?.activeCustomers ?? 0}</div>
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
                            <div className="text-2xl font-bold text-destructive">{stats?.lowStockProducts ?? 0}</div>
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
                            <div className="text-2xl font-bold text-foreground">{paymentStats?.total_transactions ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{paymentStats?.successful_payments ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{paymentStats?.failed_payments ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(paymentStats?.today_revenue || 0)}</div>
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
                                    <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="transparent">
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                            {/* Custom Legend for Categories */}
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                {categoryChartData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div 
                                            className="h-3 w-3 rounded-sm"
                                            style={{ backgroundColor: entry.fill }}
                                        />
                                        <span className="text-xs text-muted-foreground">{entry.category}</span>
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
                            {requestStatusData.length > 0 ? (
                                <>
                                    <ChartContainer config={requestStatusChartConfig} className="h-[200px]">
                                        <PieChart>
                                            <Pie
                                                data={requestStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="40%"
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
                                        </PieChart>
                                    </ChartContainer>
                                    {/* Custom Legend for Pie Chart */}
                                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                                        {requestStatusData.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div 
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: entry.fill }}
                                                />
                                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
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
                                        dataKey="monthLabel" 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        allowDecimals={false}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent />}
                                        formatter={(value: number) => [`${value} users`, 'Registrations']}
                                    />
                                    <Bar dataKey="registrations" fill="oklch(0.646 0.222 41.116)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                            {/* Custom Legend for Customer Growth */}
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <div 
                                    className="h-3 w-3 rounded-sm"
                                    style={{ backgroundColor: 'oklch(0.646 0.222 41.116)' }}
                                />
                                <span className="text-xs text-muted-foreground">Registrations</span>
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