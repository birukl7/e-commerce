import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    BarChart3, 
    CreditCard, 
    DollarSign, 
    Eye, 
    FileText, 
    Search, 
    ShoppingCart, 
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    Ban,
    ExternalLink,
    Filter,
    Tags,
    MessageSquare,
    Users,
    Settings
} from 'lucide-react';

const adminNavItems = [
    { title: 'Dashboard', href: '/admin-dashboard', icon: BarChart3 },
    { title: 'Products', href: '/admin/products', icon: ShoppingCart },
    { title: 'Sales Dashboard', href: '/admin/sales', icon: BarChart3, isActive: true },
    { title: 'Categories & Brands', href: '/admin/categories', icon: Tags },
    { title: 'Product Requests', href: '/admin/product-requests', icon: MessageSquare },
    { title: 'Customers', href: '/admin/customers', icon: Users },
    { title: 'Site Configuration', href: '/site-config', icon: Settings },
];

interface PaymentTransaction {
    id: number;
    tx_ref: string;
    order_id: string | null;
    customer_name: string;
    customer_email: string;
    amount: number;
    currency: string;
    payment_method: string;
    gateway_status: 'pending' | 'proof_uploaded' | 'paid' | 'failed' | 'refunded';
    admin_status: 'unseen' | 'seen' | 'approved' | 'rejected';
    created_at: string;
    order_total?: number;
}

interface Order {
    id: number;
    order_number: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    total_amount: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface SalesStats {
    total_transactions: number;
    awaiting_approval: number;
    total_revenue: number;
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    today_orders: number;
}

interface AdminSalesProps {
    payments: {
        data: PaymentTransaction[];
        links: any[];
        meta: any;
    };
    orders: {
        data: Order[];
        links: any[];
        meta: any;
    };
    stats: SalesStats;
    filters: {
        tab?: string;
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Sales Dashboard',
        href: '/admin/sales',
    },
];

export default function AdminSalesIndex({ payments, orders, stats, filters }: AdminSalesProps) {
    const searchForm = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/sales', {
            search: searchForm.data.search,
            tab: filters.tab || 'payments',
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePaymentAction = (paymentId: number, action: 'approve' | 'reject' | 'mark-seen') => {
        const endpoint = action === 'mark-seen' ? 'mark-seen' : action;
        router.post(`/admin/payments/${paymentId}/${endpoint}`, {}, {
            onSuccess: () => {
                router.reload({ only: ['payments', 'orders', 'stats'] });
            },
        });
    };

    const getStatusBadge = (status: string, type: 'gateway' | 'admin') => {
        const baseClasses = "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full";
        
        if (type === 'gateway') {
            switch (status) {
                case 'paid':
                    return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-3 w-3"/>Paid</Badge>;
                case 'pending':
                    return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}><AlertTriangle className="h-3 w-3"/>Pending</Badge>;
                case 'proof_uploaded':
                    return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}><FileText className="h-3 w-3"/>Proof Uploaded</Badge>;
                case 'failed':
                    return <Badge className={`${baseClasses} bg-red-100 text-red-800`}><Ban className="h-3 w-3"/>Failed</Badge>;
                default:
                    return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>;
            }
        } else {
            switch (status) {
                case 'unseen':
                    return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}><AlertTriangle className="h-3 w-3"/>Unseen</Badge>;
                case 'seen':
                    return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}><Eye className="h-3 w-3"/>Seen</Badge>;
                case 'approved':
                    return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-3 w-3"/>Approved</Badge>;
                case 'rejected':
                    return <Badge className={`${baseClasses} bg-red-100 text-red-800`}><Ban className="h-3 w-3"/>Rejected</Badge>;
                default:
                    return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>;
            }
        }
    };

    const getOrderStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full";
        
        switch (status) {
            case 'processing':
                return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}><AlertTriangle className="h-3 w-3"/>Processing</Badge>;
            case 'shipped':
                return <Badge className={`${baseClasses} bg-purple-100 text-purple-800`}><TrendingUp className="h-3 w-3"/>Shipped</Badge>;
            case 'delivered':
                return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-3 w-3"/>Delivered</Badge>;
            case 'cancelled':
                return <Badge className={`${baseClasses} bg-red-100 text-red-800`}><Ban className="h-3 w-3"/>Cancelled</Badge>;
            default:
                return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Sales Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex w-full flex-col p-6 font-sans max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <BarChart3 className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Sales Dashboard
                                </h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Comprehensive view of payments and orders with consolidated management
                                </p>
                            </div>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-lg font-bold text-gray-900">ETB {stats.total_revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.total_transactions}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Awaiting Approval</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.awaiting_approval}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <ShoppingCart className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-lg font-bold text-gray-900">{stats.total_orders}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by customer name, transaction reference, or order number..."
                                            value={searchForm.data.search}
                                            onChange={(e) => searchForm.setData('search', e.target.value)}
                                            className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={searchForm.processing}>
                                    {searchForm.processing ? 'Searching...' : 'Search'}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Main Content Tabs */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                        <Tabs defaultValue="payments" className="w-full">
                            <div className="border-b border-gray-200/50 bg-white/30 px-6 py-4">
                                <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1 rounded-xl">
                                    <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                        <CreditCard className="h-4 w-4" />
                                        <span>Payments ({payments.meta.total})</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all cursor-pointer">
                                        <ShoppingCart className="h-4 w-4" />
                                        <span>Orders ({orders.meta.total})</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Payments Tab */}
                            <TabsContent value="payments" className="space-y-6 mt-0">
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Transaction</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Order</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Customer</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Amount</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Gateway Status</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Admin Status</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.data.map((payment) => (
                                                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                        <td className="py-3 px-2">
                                                            <div className="font-mono text-xs">#{payment.tx_ref}</div>
                                                            <div className="text-xs text-gray-500">{payment.payment_method}</div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            {payment.order_id ? (
                                                                <Link 
                                                                    href={`/admin/orders/${payment.order_id}`}
                                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    #{payment.order_id}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{payment.customer_name}</span>
                                                                <span className="text-xs text-gray-500">{payment.customer_email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="font-medium">
                                                                {new Intl.NumberFormat('en-US', { 
                                                                    style: 'currency', 
                                                                    currency: payment.currency === 'ETB' ? 'USD' : payment.currency 
                                                                }).format(payment.amount).replace('$', payment.currency + ' ')}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            {getStatusBadge(payment.gateway_status, 'gateway')}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            {getStatusBadge(payment.admin_status, 'admin')}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(payment.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex gap-1">
                                                                {payment.admin_status === 'unseen' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handlePaymentAction(payment.id, 'mark-seen')}
                                                                        className="text-xs"
                                                                    >
                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                        Seen
                                                                    </Button>
                                                                )}
                                                                {payment.admin_status !== 'approved' && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handlePaymentAction(payment.id, 'approve')}
                                                                        className="text-xs bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                )}
                                                                {payment.admin_status !== 'rejected' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handlePaymentAction(payment.id, 'reject')}
                                                                        className="text-xs"
                                                                    >
                                                                        <Ban className="h-3 w-3 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {payments.data.length === 0 && (
                                                    <tr>
                                                        <td colSpan={8} className="py-8 text-center text-gray-500">
                                                            No payments found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Pagination */}
                                    {payments.links && payments.links.length > 3 && (
                                        <div className="flex justify-center mt-6">
                                            <div className="flex gap-2">
                                                {payments.links.map((link, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => link.url && router.get(link.url)}
                                                        disabled={!link.url}
                                                        className="text-xs"
                                                    >
                                                        {link.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Orders Tab */}
                            <TabsContent value="orders" className="space-y-6 mt-0">
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Order</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Customer</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Amount</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                                                    <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.data.map((order) => (
                                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                                        <td className="py-3 px-2">
                                                            <div className="font-mono text-sm font-medium">#{order.order_number}</div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{order.user.name}</span>
                                                                <span className="text-xs text-gray-500">{order.user.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="font-medium">
                                                                ETB {order.total_amount.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            {getOrderStatusBadge(order.status)}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    asChild
                                                                    className="text-xs"
                                                                >
                                                                    <Link href={`/admin/orders/${order.id}`}>
                                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                                        View Details
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {orders.data.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                                            No orders found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Pagination */}
                                    {orders.links && orders.links.length > 3 && (
                                        <div className="flex justify-center mt-6">
                                            <div className="flex gap-2">
                                                {orders.links.map((link, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => link.url && router.get(link.url)}
                                                        disabled={!link.url}
                                                        className="text-xs"
                                                    >
                                                        {link.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
