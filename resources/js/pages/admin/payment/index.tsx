'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown, CreditCard, DollarSign, Download, Eye, Filter, Search, TrendingDown, TrendingUp, X, CheckCircle, Clock, AlertTriangle, Ban } from 'lucide-react';
import { useState } from 'react';
import { adminNavItems } from '../dashboard';

interface PaymentTransaction {
    id: number;
    tx_ref: string;
    order_id: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    customer_id: number | null;
    amount: number;
    currency: string;
    payment_method: string;
    gateway_status: 'pending' | 'proof_uploaded' | 'paid' | 'failed' | 'refunded';
    admin_status: 'unseen' | 'seen' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    order_total: number | null;
    order_status: string | null;
    order_date: string | null;
    admin_name: string | null;
    admin_action_at: string | null;
}

interface PaymentStats {
    total_transactions: number;
    gateway_paid: number;
    awaiting_approval: number;
    fully_completed: number;
    unseen_payments: number;
    total_revenue: number;
    pending_revenue: number;
}

interface PaymentFilters {
    search?: string;
    gateway_status?: string;
    admin_status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    priority?: string;
}

interface PaginatedPayments {
    data: PaymentTransaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface AdminPaymentIndexProps {
    payments: PaginatedPayments;
    stats: PaymentStats;
    filters: PaymentFilters;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Payment Statistics',
        href: '/admin/paymentStats',
    },
];

export default function AdminPaymentIndex({ payments, stats, filters }: AdminPaymentIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [gatewayStatusFilter, setGatewayStatusFilter] = useState(filters.gateway_status || 'all');
    const [adminStatusFilter, setAdminStatusFilter] = useState(filters.admin_status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || '');
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || '');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || '');
    
    // Bulk actions
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const bulkActionForm = useForm({
        action: '',
        payment_ids: [] as number[],
        notes: ''
    });

    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
            minimumFractionDigits: 2,
        })
            .format(amount)
            .replace('$', currency + ' ');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGatewayStatusBadge = (status: string) => {
        const variants = {
            'pending': { variant: 'secondary', class: 'bg-gray-100 text-gray-800', icon: Clock },
            'proof_uploaded': { variant: 'secondary', class: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
            'paid': { variant: 'default', class: 'bg-green-100 text-green-800', icon: CheckCircle },
            'failed': { variant: 'destructive', class: 'bg-red-100 text-red-800', icon: Ban },
            'refunded': { variant: 'outline', class: 'bg-purple-100 text-purple-800', icon: TrendingDown }
        };
        return variants[status as keyof typeof variants] || variants.pending;
    };

    const getAdminStatusBadge = (status: string) => {
        const variants = {
            'unseen': { variant: 'secondary', class: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle },
            'seen': { variant: 'secondary', class: 'bg-blue-100 text-blue-800', icon: Eye },
            'approved': { variant: 'default', class: 'bg-green-100 text-green-800', icon: CheckCircle },
            'rejected': { variant: 'destructive', class: 'bg-red-100 text-red-800', icon: Ban }
        };
        return variants[status as keyof typeof variants] || variants.unseen;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (gatewayStatusFilter !== 'all') params.append('gateway_status', gatewayStatusFilter);
        if (adminStatusFilter !== 'all') params.append('admin_status', adminStatusFilter);
        if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter);
        if (dateFromFilter) params.append('date_from', dateFromFilter);
        if (dateToFilter) params.append('date_to', dateToFilter);
        if (priorityFilter) params.append('priority', priorityFilter);

        router.get('/admin/paymentStats', Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setGatewayStatusFilter('all');
        setAdminStatusFilter('all');
        setPaymentMethodFilter('all');
        setDateFromFilter('');
        setDateToFilter('');
        setPriorityFilter('');
        router.get('/admin/paymentStats', {}, { preserveState: true, preserveScroll: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (gatewayStatusFilter !== 'all') params.append('gateway_status', gatewayStatusFilter);
        if (adminStatusFilter !== 'all') params.append('admin_status', adminStatusFilter);
        if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter);
        if (dateFromFilter) params.append('date_from', dateFromFilter);
        if (dateToFilter) params.append('date_to', dateToFilter);

        window.open(`/admin/payments/export?${params.toString()}`, '_blank');
    };

    const handleBulkAction = (action: string) => {
        if (selectedPayments.length === 0) return;
        
        bulkActionForm.setData({
            action,
            payment_ids: selectedPayments,
            notes: ''
        });
        setShowBulkActions(true);
    };

    const submitBulkAction = () => {
        bulkActionForm.post('/admin/payments/bulk-action', {
            onSuccess: () => {
                setSelectedPayments([]);
                setShowBulkActions(false);
                bulkActionForm.reset();
            }
        });
    };

    const togglePaymentSelection = (paymentId: number) => {
        setSelectedPayments(prev => 
            prev.includes(paymentId) 
                ? prev.filter(id => id !== paymentId)
                : [...prev, paymentId]
        );
    };

    const getPaymentPriority = (payment: PaymentTransaction) => {
        if ((payment.gateway_status === 'paid' || payment.gateway_status === 'proof_uploaded') && payment.admin_status === 'unseen') {
            return 'urgent';
        }
        if ((payment.gateway_status === 'paid' || payment.gateway_status === 'proof_uploaded') && payment.admin_status === 'seen') {
            return 'high';
        }
        return 'normal';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Payment Statistics" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans w-full max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Management</h1>
                        <p className="text-muted-foreground">Monitor gateway status and approve payments</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedPayments.length > 0 && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleBulkAction('mark_seen')}>
                                    Mark Seen ({selectedPayments.length})
                                </Button>
                                <Button variant="default" onClick={() => handleBulkAction('approve')}>
                                    Approve ({selectedPayments.length})
                                </Button>
                                <Button variant="destructive" onClick={() => handleBulkAction('reject')}>
                                    Reject ({selectedPayments.length})
                                </Button>
                            </div>
                        )}
                        <Button onClick={handleExport} className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Enhanced Key Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Revenue</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Fully completed: {stats.fully_completed}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pending_revenue)}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Awaiting approval: {stats.awaiting_approval}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Gateway Paid</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.gateway_paid}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Gateway confirmed payments</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle>
                            <Clock className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.unseen_payments}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground">Unseen payments</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Filters Section */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Filter className="h-5 w-5" />
                            Filters & Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <Select value={gatewayStatusFilter} onValueChange={setGatewayStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gateway Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Gateway Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="proof_uploaded">Proof Uploaded</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={adminStatusFilter} onValueChange={setAdminStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Admin Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Admin Status</SelectItem>
                                    <SelectItem value="unseen">Unseen</SelectItem>
                                    <SelectItem value="seen">Seen</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Payment Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="chapa">Chapa</SelectItem>
                                    <SelectItem value="telebirr">Telebirr</SelectItem>
                                    <SelectItem value="cbe">CBE</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Priorities</SelectItem>
                                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input type="date" placeholder="From Date" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />

                            <Input type="date" placeholder="To Date" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    Apply
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Payments Table */}
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Payment Transactions</CardTitle>
                        <CardDescription>
                            Showing {payments.from} to {payments.to} of {payments.total} transactions
                            {selectedPayments.length > 0 && (
                                <span className="ml-2 text-primary">({selectedPayments.length} selected)</span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="pb-3 text-left">
                                            <Checkbox
                                                checked={selectedPayments.length === payments.data.length && payments.data.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedPayments(payments.data.map(p => p.id));
                                                    } else {
                                                        setSelectedPayments([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                Transaction
                                                <ArrowUpDown className="h-3 w-3" />
                                            </div>
                                        </th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Method</th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Gateway Status</th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Admin Status</th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.map((payment) => {
                                        const priority = getPaymentPriority(payment);
                                        const gatewayBadge = getGatewayStatusBadge(payment.gateway_status);
                                        const adminBadge = getAdminStatusBadge(payment.admin_status);
                                        const GatewayIcon = gatewayBadge.icon;
                                        const AdminIcon = adminBadge.icon;
                                        
                                        return (
                                            <tr 
                                                key={payment.id} 
                                                className={`border-b border-border/30 hover:bg-muted/30 ${
                                                    priority === 'urgent' ? 'bg-red-50 border-red-200' : 
                                                    priority === 'high' ? 'bg-orange-50 border-orange-200' : ''
                                                }`}
                                            >
                                                <td className="py-4">
                                                    <Checkbox
                                                        checked={selectedPayments.includes(payment.id)}
                                                        onCheckedChange={() => togglePaymentSelection(payment.id)}
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">#{payment.tx_ref}</p>
                                                        {payment.order_id && <p className="text-xs text-muted-foreground">Order: {payment.order_id}</p>}
                                                        {priority === 'urgent' && (
                                                            <Badge variant="destructive" className="text-xs">URGENT</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-foreground">{payment.customer_name}</p>
                                                        <p className="text-xs text-muted-foreground">{payment.customer_email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {formatCurrency(payment.amount, payment.currency)}
                                                    </p>
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-sm text-foreground capitalize">{payment.payment_method}</p>
                                                </td>
                                                <td className="py-4">
                                                    <Badge className={`${gatewayBadge.class} flex items-center gap-1 w-fit`}>
                                                        <GatewayIcon className="h-3 w-3" />
                                                        {payment.gateway_status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-4">
                                                    <div className="space-y-1">
                                                        <Badge className={`${adminBadge.class} flex items-center gap-1 w-fit`}>
                                                            <AdminIcon className="h-3 w-3" />
                                                            {payment.admin_status}
                                                        </Badge>
                                                        {payment.admin_name && (
                                                            <p className="text-xs text-muted-foreground">by {payment.admin_name}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-sm text-foreground">{formatDate(payment.created_at)}</p>
                                                </td>
                                                <td className="py-4">
                                                    <Link
                                                        href={`/admin/paymentStats/${payment.id}`}
                                                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        Review
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {payments.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {payments.from} to {payments.to} of {payments.total} results
                                </p>
                                <div className="flex items-center gap-2">
                                    {payments.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded px-3 py-1 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : link.url
                                                      ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                      : 'cursor-not-allowed bg-muted/50 text-muted-foreground/50'
                                            }`}
                                            preserveState
                                            preserveScroll
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bulk Action Modal */}
                {showBulkActions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <CardHeader>
                                <CardTitle>Bulk Action: {bulkActionForm.data.action}</CardTitle>
                                <CardDescription>
                                    This will affect {selectedPayments.length} selected payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(bulkActionForm.data.action === 'approve' || bulkActionForm.data.action === 'reject') && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            {bulkActionForm.data.action === 'reject' ? 'Reason (Required)' : 'Notes (Optional)'}
                                        </label>
                                        <textarea
                                            value={bulkActionForm.data.notes}
                                            onChange={(e) => bulkActionForm.setData('notes', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                            rows={3}
                                            placeholder="Enter notes..."
                                            required={bulkActionForm.data.action === 'reject'}
                                        />
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={submitBulkAction}
                                        disabled={bulkActionForm.processing}
                                        className="flex-1"
                                        variant={bulkActionForm.data.action === 'reject' ? 'destructive' : 'default'}
                                    >
                                        Confirm {bulkActionForm.data.action}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowBulkActions(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}