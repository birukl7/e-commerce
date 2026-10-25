
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye,
    Receipt,
    Search,
    ShieldCheck,
    TrendingUp,
    X,
    XCircle,
} from 'lucide-react';

interface PaymentStats {
    total_transactions: number;
    fully_completed: number;
    pending_approval: number;
    awaiting_approval: number;
    unseen_payments: number;
    rejected_payments: number;
    total_revenue: number;
    pending_revenue: number;
    gateway_paid: number;
    offline_count: number;
    chapa_count: number;
}

interface PaymentRow {
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
    gateway_payload?: any;
    product_request_id?: number | null;
}

interface AdminPaymentIndexProps {
    stats: PaymentStats;
    filters: {
        search?: string;
        gateway_status?: string;
        admin_status?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
        priority?: string;
    };
    recentChapaPayments: PaymentRow[];
    recentOfflinePayments: PaymentRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin-dashboard' },
    { title: 'Payment Management', href: '/admin/payment' },
];

export default function AdminPaymentIndex({
    stats,
    filters,
    recentChapaPayments = [],
    recentOfflinePayments = [],
}: AdminPaymentIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [gatewayStatusFilter, setGatewayStatusFilter] = useState(filters.gateway_status || 'all');
    const [adminStatusFilter, setAdminStatusFilter] = useState(filters.admin_status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [dateFromFilter, setDateFromFilter] = useState(filters.date_from || '');
    const [dateToFilter, setDateToFilter] = useState(filters.date_to || '');
    const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [activeTab, setActiveTab] = useState<'offline' | 'chapa'>('offline');
    const [primaryColor, setPrimaryColor] = useState<string>('#1E5338');

    const bulkActionForm = useForm({
        action: '',
        payment_ids: [] as number[],
    });

    useEffect(() => {
        try {
            const saved = localStorage.getItem('serdo_dashboard_primary_color');
            if (saved) setPrimaryColor(saved);
        } catch {
            // Ignore
        }

        const handleThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handleThemeChange);
        return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
    }, []);

    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
            maximumFractionDigits: 0,
        })
            .format(amount)
            .replace('$', currency + ' ');
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (gatewayStatusFilter !== 'all') params.append('gateway_status', gatewayStatusFilter);
        if (adminStatusFilter !== 'all') params.append('admin_status', adminStatusFilter);
        if (paymentMethodFilter !== 'all') params.append('payment_method', paymentMethodFilter);
        if (dateFromFilter) params.append('date_from', dateFromFilter);
        if (dateToFilter) params.append('date_to', dateToFilter);

        router.get('/admin/payment', Object.fromEntries(params), {
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
        router.get('/admin/payment', {}, { preserveState: true, preserveScroll: true });
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
        });
        setShowBulkActions(true);
    };

    const submitBulkAction = () => {
        bulkActionForm.post('/admin/payments/bulk-action', {
            onSuccess: () => {
                setSelectedPayments([]);
                setShowBulkActions(false);
                bulkActionForm.reset();
            },
        });
    };

    const getPaymentType = (payment: PaymentRow): string => {
        if (payment.gateway_payload) {
            const payload =
                typeof payment.gateway_payload === 'string'
                    ? (() => {
                          try {
                              return JSON.parse(payment.gateway_payload);
                          } catch {
                              return {};
                          }
                      })()
                    : payment.gateway_payload;

            if (payload?.payment_type) {
                if (payload.payment_type === 'product_request_advance' || payload.payment_type === 'advance') {
                    return 'Request Advance';
                } else if (payload.payment_type === 'product_request_final' || payload.payment_type === 'final') {
                    return 'Request Final';
                }
            }
        }
        if (payment.product_request_id) {
            const txRef = payment.tx_ref;
            if (txRef.startsWith('ADV-')) return 'Request Advance';
            if (txRef.startsWith('FINAL-')) return 'Request Final';
            return 'Request Advance';
        }
        return 'Standard Checkout';
    };

    const getCustomerAvatarColor = (name: string) => {
        const list = [
            'bg-emerald-100 text-emerald-800 border-emerald-200',
            'bg-blue-100 text-blue-800 border-blue-200',
            'bg-purple-100 text-purple-800 border-purple-200',
            'bg-amber-100 text-amber-800 border-amber-200',
            'bg-rose-100 text-rose-800 border-rose-200',
        ];
        return list[(name || 'U').charCodeAt(0) % list.length];
    };

    const activeList = activeTab === 'offline' ? recentOfflinePayments : recentChapaPayments;

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Payment Verification & Audit | Donezo Style" />

            <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
                <div className="max-w-[1440px] mx-auto space-y-6">

                    {/* Title Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                                    Payments & Receipts
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                    <ShieldCheck className="w-3 h-3 text-neutral-500" />
                                    Verification Hub
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
                                Audit Chapa gateway payments, review offline bank receipts, and authorize customer purchases.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {selectedPayments.length > 0 && (
                                <button
                                    onClick={() => handleBulkAction('mark_seen')}
                                    className="px-4 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
                                >
                                    Mark Seen ({selectedPayments.length})
                                </button>
                            )}

                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
                            >
                                <Download className="w-4 h-4 text-neutral-500" />
                                <span>Export CSV</span>
                            </button>

                            <Link
                                href="/admin/sales"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Sales Hub</span>
                            </Link>
                        </div>
                    </div>

                    {/* Metric Strip (Signature 4-Card Style) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Primary Accent (Confirmed Revenue) */}
                        <div
                            className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-medium text-white/80">Confirmed Revenue</span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                                    <ArrowUpRight className="w-4 h-4" style={{ color: primaryColor }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    {formatCurrency(stats.total_revenue || 0)}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium text-white backdrop-blur-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{stats.fully_completed} verified transactions</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: White Card (Pending Approval Revenue) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Pending Review Slip</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    stats.awaiting_approval > 0
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'border border-neutral-200 text-neutral-400'
                                }`}>
                                    {stats.awaiting_approval}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {formatCurrency(stats.pending_revenue || 0)}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                                    <Clock className="w-3 h-3" />
                                    <span>{stats.awaiting_approval} slips waiting for approval</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: White Card (Needs Attention / Unseen) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Needs Attention</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    stats.unseen_payments > 0
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : 'border border-neutral-200 text-neutral-400'
                                }`}>
                                    {stats.unseen_payments}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.unseen_payments}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Unseen incoming submissions</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: White Card (Gateway Paid Total) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Gateway Confirmed</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                                    <CreditCard className="w-4 h-4 text-emerald-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.gateway_paid}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                                    <DollarSign className="w-3 h-3 text-emerald-600" />
                                    <span>{stats.chapa_count} Chapa • {stats.offline_count} Offline</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-5">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search by tx ref, customer name, order #..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 rounded-full border-neutral-200/80 text-xs py-2 bg-neutral-50/60 focus:bg-white"
                                />
                            </div>

                            <div className="w-full sm:w-44">
                                <Select value={gatewayStatusFilter} onValueChange={setGatewayStatusFilter}>
                                    <SelectTrigger className="rounded-full border-neutral-200/80 text-xs py-2 bg-white">
                                        <SelectValue placeholder="Gateway Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="all">All Gateway Status</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="proof_uploaded">Proof Uploaded</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-44">
                                <Select value={adminStatusFilter} onValueChange={setAdminStatusFilter}>
                                    <SelectTrigger className="rounded-full border-neutral-200/80 text-xs py-2 bg-white">
                                        <SelectValue placeholder="Admin Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="all">All Admin Status</SelectItem>
                                        <SelectItem value="unseen">Unseen</SelectItem>
                                        <SelectItem value="seen">Seen</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-44">
                                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                                    <SelectTrigger className="rounded-full border-neutral-200/80 text-xs py-2 bg-white">
                                        <SelectValue placeholder="Payment Method" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="offline">Bank Transfer / Offline</SelectItem>
                                        <SelectItem value="chapa">Chapa Gateway</SelectItem>
                                        <SelectItem value="telebirr">Telebirr</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateFromFilter}
                                    onChange={(e) => setDateFromFilter(e.target.value)}
                                    className="rounded-full border-neutral-200/80 text-xs py-2 w-36 bg-white"
                                />
                                <Input
                                    type="date"
                                    value={dateToFilter}
                                    onChange={(e) => setDateToFilter(e.target.value)}
                                    className="rounded-full border-neutral-200/80 text-xs py-2 w-36 bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="px-5 py-2 text-white text-xs font-semibold rounded-full shadow-xs transition-colors hover:opacity-95"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="p-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700 transition-colors"
                                    title="Clear Filters"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Method Tabs Switcher */}
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center bg-white p-1 rounded-full border border-neutral-200/80 shadow-xs">
                            <button
                                onClick={() => setActiveTab('offline')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                    activeTab === 'offline' ? 'text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                                style={activeTab === 'offline' ? { backgroundColor: primaryColor } : {}}
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Offline & Bank Receipts</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                        activeTab === 'offline' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                >
                                    {recentOfflinePayments.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('chapa')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                    activeTab === 'chapa' ? 'text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                                style={activeTab === 'chapa' ? { backgroundColor: primaryColor } : {}}
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Chapa Online Gateway</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                        activeTab === 'chapa' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                >
                                    {recentChapaPayments.length}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                                        <th className="py-3.5 px-5 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={activeList.length > 0 && selectedPayments.length === activeList.length}
                                                onChange={() => {
                                                    if (selectedPayments.length === activeList.length) {
                                                        setSelectedPayments([]);
                                                    } else {
                                                        setSelectedPayments(activeList.map((p) => p.id));
                                                    }
                                                }}
                                                className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                                            />
                                        </th>
                                        <th className="py-3.5 px-4">Type</th>
                                        <th className="py-3.5 px-4">Transaction / Method</th>
                                        <th className="py-3.5 px-4">Order Link</th>
                                        <th className="py-3.5 px-4">Customer</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">Gateway Status</th>
                                        <th className="py-3.5 px-4">Admin Status</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {activeList.map((p) => {
                                        const pType = getPaymentType(p);
                                        const avatarClass = getCustomerAvatarColor(p.customer_name);

                                        return (
                                            <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors group">
                                                <td className="py-4 px-5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPayments.includes(p.id)}
                                                        onChange={() => {
                                                            setSelectedPayments((prev) =>
                                                                prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                                                            );
                                                        }}
                                                        className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                                                    />
                                                </td>

                                                {/* Type */}
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                            pType === 'Request Advance'
                                                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                                : pType === 'Request Final'
                                                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                                        }`}
                                                    >
                                                        {pType}
                                                    </span>
                                                </td>

                                                {/* Tx Ref */}
                                                <td className="py-4 px-4">
                                                    <div className="font-mono text-[11px] font-bold text-neutral-800">
                                                        #{p.tx_ref}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400 capitalize">
                                                        {p.payment_method.replace('_', ' ')}
                                                    </div>
                                                </td>

                                                {/* Order Link */}
                                                <td className="py-4 px-4">
                                                    {p.order_id ? (
                                                        <Link
                                                            href={`/admin/orders/${p.order_id}`}
                                                            className="font-mono text-[11px] font-bold hover:underline"
                                                            style={{ color: primaryColor }}
                                                        >
                                                            #{p.order_id}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-neutral-300 font-mono text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Customer */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`w-7 h-7 rounded-full ${avatarClass} border flex items-center justify-center font-bold text-[10px] shrink-0`}
                                                        >
                                                            {(p.customer_name || 'U').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-neutral-800 truncate">
                                                                {p.customer_name}
                                                            </p>
                                                            <p className="text-[10px] text-neutral-400 truncate">
                                                                {p.customer_email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Amount */}
                                                <td className="py-4 px-4">
                                                    <span className="font-extrabold text-neutral-900 text-xs">
                                                        {formatCurrency(p.amount, p.currency)}
                                                    </span>
                                                </td>

                                                {/* Gateway Status */}
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            p.gateway_status === 'paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                                : p.gateway_status === 'proof_uploaded'
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                                : p.gateway_status === 'pending'
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                        }`}
                                                    >
                                                        {p.gateway_status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                                                        {p.gateway_status === 'proof_uploaded' && <Clock className="w-3 h-3" />}
                                                        {p.gateway_status === 'pending' && <Clock className="w-3 h-3" />}
                                                        {p.gateway_status === 'failed' && <XCircle className="w-3 h-3" />}
                                                        <span className="capitalize">{p.gateway_status.replace('_', ' ')}</span>
                                                    </span>
                                                </td>

                                                {/* Admin Status */}
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                            p.admin_status === 'approved'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                                : p.admin_status === 'seen'
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                                : p.admin_status === 'rejected'
                                                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                        }`}
                                                    >
                                                        <span className="capitalize">{p.admin_status}</span>
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-4 px-4 text-neutral-400 text-[11px]">
                                                    {new Date(p.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-5 text-right">
                                                    <Link
                                                        href={`/admin/payments/${p.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-[11px] font-semibold shadow-xs transition-all active:scale-95"
                                                    >
                                                        <Eye className="w-3 h-3 text-neutral-500" />
                                                        <span>View Details</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {activeList.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="py-16 text-center text-neutral-400">
                                                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="text-sm font-semibold text-neutral-700">No payment records found</p>
                                                <p className="text-xs text-neutral-400 mt-0.5">
                                                    No transactions match the selected filter criteria.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bulk Action Confirmation Modal */}
                    {showBulkActions && bulkActionForm.data.action === 'mark_seen' && (
                        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                            <div className="w-full max-w-md bg-white rounded-[26px] p-6 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95">
                                <h3 className="text-base font-extrabold text-neutral-900">Mark Payments as Seen</h3>
                                <p className="text-xs text-neutral-500 mt-1">
                                    You are about to acknowledge <strong>{selectedPayments.length}</strong> selected payments.
                                </p>
                                <div className="flex gap-2.5 mt-5">
                                    <button
                                        type="button"
                                        onClick={submitBulkAction}
                                        disabled={bulkActionForm.processing}
                                        className="flex-1 py-2 rounded-full text-white text-xs font-semibold shadow-xs transition-colors hover:opacity-95"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkActions(false)}
                                        className="flex-1 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}