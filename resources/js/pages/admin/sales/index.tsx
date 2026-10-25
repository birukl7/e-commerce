import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    CreditCard,
    ShoppingCart,
    TrendingUp,
    Search,
    ChevronDown,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Eye,
    Palette,
    X,
    Filter,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Calendar,
    Check,
    DollarSign,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

interface PaymentTransaction {
    id: number;
    tx_ref: string;
    order_id: string | null;
    product_request_id: number | null;
    customer_name: string;
    customer_email: string;
    amount: number;
    currency: string;
    payment_method: string;
    gateway_status: 'pending' | 'proof_uploaded' | 'paid' | 'failed' | 'refunded';
    admin_status: 'unseen' | 'seen' | 'approved' | 'rejected';
    created_at: string;
    order_total?: number;
    gateway_payload?: any;
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
        title: 'Sales & Transactions',
        href: '/admin/sales',
    },
];

// Curated primary color presets inspired by Donezo & modern luxury design
const COLOR_PRESETS = [
    { name: 'Donezo Forest', hex: '#1E5338' },
    { name: 'Pine Emerald', hex: '#0D9488' },
    { name: 'Royal Indigo', hex: '#4338CA' },
    { name: 'Ocean Cyan', hex: '#0284C7' },
    { name: 'Sunset Amber', hex: '#D97706' },
    { name: 'Crimson Rose', hex: '#BE123C' },
    { name: 'Obsidian Noir', hex: '#18181B' },
];

export default function AdminSalesIndex({ payments, orders, stats, filters }: AdminSalesProps) {
    const { unseenPaymentsCount } = usePage<SharedData & { unseenPaymentsCount?: number }>().props;

    // Theme color state with localStorage persistence
    const [primaryColor, setPrimaryColor] = useState<string>('#1E5338');
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    // Active tab state
    const [activeTab, setActiveTab] = useState<'payments' | 'orders'>(
        (filters.tab === 'orders' ? 'orders' : 'payments')
    );

    // Search query state
    const [searchQuery, setSearchQuery] = useState<string>(filters.search || '');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    // Load saved color preference on mount
    useEffect(() => {
        try {
            const savedColor = localStorage.getItem('serdo_dashboard_primary_color');
            if (savedColor) {
                setPrimaryColor(savedColor);
            }
        } catch (e) {
            // Ignore
        }

        const handleThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handleThemeChange);
        return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
    }, []);

    const handleColorChange = (hex: string) => {
        setPrimaryColor(hex);
        try {
            localStorage.setItem('serdo_dashboard_primary_color', hex);
        } catch (e) {
            // Ignore
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        router.get(
            '/admin/sales',
            {
                search: searchQuery,
                tab: activeTab,
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const handleTabChange = (tab: 'payments' | 'orders') => {
        setActiveTab(tab);
        router.get(
            '/admin/sales',
            {
                tab,
                search: searchQuery || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
            maximumFractionDigits: 0,
        }).format(amount).replace('$', currency + ' ');
    };

    const getPaymentType = (payment: PaymentTransaction): string => {
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
            if (txRef.startsWith('ADV-')) {
                return 'Request Advance';
            } else if (txRef.startsWith('FINAL-')) {
                return 'Request Final';
            }
            return 'Request Advance';
        }
        return 'Standard Order';
    };

    // Color avatars generator
    const getAvatarColors = (name: string) => {
        const colors = [
            { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
            { bg: 'bg-blue-100 text-blue-800 border-blue-200' },
            { bg: 'bg-purple-100 text-purple-800 border-purple-200' },
            { bg: 'bg-amber-100 text-amber-800 border-amber-200' },
            { bg: 'bg-rose-100 text-rose-800 border-rose-200' },
            { bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
        ];
        const code = (name || 'U').charCodeAt(0);
        return colors[code % colors.length];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={[]} footerNavItems={[]}>
            <Head title="Sales & Payments | Donezo Style" />

            <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
                <div className="max-w-[1440px] mx-auto space-y-6">

                    {/* ========================================================== */}
                    {/* TOP HEADER: Search Bar & Actions                           */}
                    {/* ========================================================== */}
                    <header className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Search Bar with Shortcut Pill */}
                        <form onSubmit={handleSearch} className="relative w-full md:w-[420px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by customer, tx reference, order #..."
                                className="w-full bg-white pl-11 pr-24 py-2.5 rounded-full text-sm text-neutral-800 placeholder-neutral-400 border border-neutral-200/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-400/30 transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            router.get('/admin/sales', { tab: activeTab }, { preserveState: true });
                                        }}
                                        className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold rounded-full shadow-xs transition-colors"
                                >
                                    {isSearching ? '...' : 'Search'}
                                </button>
                            </div>
                        </form>

                        {/* Top Right Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            {/* Direct Link to Main Admin Dashboard */}
                            <Link
                                href="/admin-dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95"
                            >
                                <BarChart3 className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Overview</span>
                            </Link>
                        </div>
                    </header>

                    {/* ========================================================== */}
                    {/* TITLE ROW: Sales Header + Action Buttons                   */}
                    {/* ========================================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                                    Sales & Revenue
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                    <Sparkles className="w-3 h-3 text-neutral-500" />
                                    Live Stream
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
                                Consolidated audit of customer payments, receipts, and order fulfillments.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Link
                                href="/admin/orders"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4 text-neutral-500" />
                                <span>Manage Orders</span>
                            </Link>

                            <Link
                                href="/admin/payment"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Offline Approval</span>
                            </Link>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ROW 1: 4 TOP METRIC CARDS (Signature Donezo style)         */}
                    {/* ========================================================== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Primary Colored Card (Total Revenue) */}
                        <div
                            className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-medium text-white/80">Total Revenue</span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                                    <ArrowUpRight className="w-4 h-4" style={{ color: primaryColor }} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    {formatCurrency(stats.total_revenue || 0)}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium text-white backdrop-blur-xs">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Verified cleared store earnings</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: White Card (Total Transactions) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Total Transactions</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.total_transactions}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                                    <DollarSign className="w-3 h-3 text-emerald-600" />
                                    <span>Recorded gateway & offline checkouts</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: White Card (Awaiting Approval) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Awaiting Approval</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    stats.awaiting_approval > 0 
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                        : 'border border-neutral-200 text-neutral-400'
                                }`}>
                                    {stats.awaiting_approval}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.awaiting_approval}
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    stats.awaiting_approval > 0
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                        : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                    <Clock className="w-3 h-3" />
                                    <span>Receipt slips awaiting admin signoff</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: White Card (Total Store Orders) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Total Orders</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                                    <ShoppingCart className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats.total_orders}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                                    <span>{stats.completed_orders || 0} fulfilled • {stats.pending_orders || 0} active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ROW 2: TABS SWITCHER (Payments vs Orders)                   */}
                    {/* ========================================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Rounded Pill Tabs */}
                        <div className="inline-flex items-center bg-white p-1 rounded-full border border-neutral-200/80 shadow-xs">
                            <button
                                onClick={() => handleTabChange('payments')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                    activeTab === 'payments'
                                        ? 'text-white shadow-xs'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                                style={activeTab === 'payments' ? { backgroundColor: primaryColor } : {}}
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Payments</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                        activeTab === 'payments'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                >
                                    {payments.meta.total}
                                </span>
                            </button>

                            <button
                                onClick={() => handleTabChange('orders')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                    activeTab === 'orders'
                                        ? 'text-white shadow-xs'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                                style={activeTab === 'orders' ? { backgroundColor: primaryColor } : {}}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Orders</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                        activeTab === 'orders'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                >
                                    {orders.meta.total}
                                </span>
                            </button>
                        </div>

                        {/* Search Feedback Info */}
                        {filters.search && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span>Filtering by: <strong className="text-neutral-800">"{filters.search}"</strong></span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        router.get('/admin/sales', { tab: activeTab }, { preserveState: true });
                                    }}
                                    className="text-neutral-400 hover:text-neutral-700 underline text-[11px]"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ========================================================== */}
                    {/* ROW 3: MODERN DATA TABLE CONTAINER                          */}
                    {/* ========================================================== */}
                    <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs overflow-hidden">
                        {activeTab === 'payments' ? (
                            /* PAYMENTS TABLE */
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                                            <th className="py-3.5 px-5">Type</th>
                                            <th className="py-3.5 px-4">Transaction / Ref</th>
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
                                        {payments.data.map((payment) => {
                                            const pType = getPaymentType(payment);
                                            const avatar = getAvatarColors(payment.customer_name);

                                            return (
                                                <tr
                                                    key={payment.id}
                                                    className="hover:bg-neutral-50/70 transition-colors group"
                                                >
                                                    {/* Type */}
                                                    <td className="py-4 px-5">
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

                                                    {/* Transaction Ref */}
                                                    <td className="py-4 px-4">
                                                        <div className="font-mono text-[11px] font-bold text-neutral-800">
                                                            #{payment.tx_ref}
                                                        </div>
                                                        <div className="text-[10px] text-neutral-400 capitalize">
                                                            {payment.payment_method.replace('_', ' ')}
                                                        </div>
                                                    </td>

                                                    {/* Order Link */}
                                                    <td className="py-4 px-4">
                                                        {payment.order_id ? (
                                                            <Link
                                                                href={`/admin/orders/${payment.order_id}`}
                                                                className="inline-flex items-center gap-1 font-mono text-[11px] font-bold hover:underline"
                                                                style={{ color: primaryColor }}
                                                            >
                                                                #{payment.order_id}
                                                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                            </Link>
                                                        ) : (
                                                            <span className="text-neutral-300 font-mono text-xs">—</span>
                                                        )}
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className={`w-7 h-7 rounded-full ${avatar.bg} ${avatar.border} border flex items-center justify-center font-bold text-[10px] shrink-0`}
                                                            >
                                                                {(payment.customer_name || 'U').slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-neutral-800 truncate">
                                                                    {payment.customer_name}
                                                                </p>
                                                                <p className="text-[10px] text-neutral-400 truncate">
                                                                    {payment.customer_email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="py-4 px-4">
                                                        <span className="font-extrabold text-neutral-900 text-xs">
                                                            {formatCurrency(payment.amount, payment.currency)}
                                                        </span>
                                                    </td>

                                                    {/* Gateway Status */}
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                payment.gateway_status === 'paid'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                                    : payment.gateway_status === 'pending'
                                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                                    : payment.gateway_status === 'proof_uploaded'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                            }`}
                                                        >
                                                            {payment.gateway_status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                                                            {payment.gateway_status === 'pending' && <Clock className="w-3 h-3" />}
                                                            {payment.gateway_status === 'proof_uploaded' && <ArrowDownLeft className="w-3 h-3" />}
                                                            {payment.gateway_status === 'failed' && <XCircle className="w-3 h-3" />}
                                                            <span className="capitalize">{payment.gateway_status.replace('_', ' ')}</span>
                                                        </span>
                                                    </td>

                                                    {/* Admin Status */}
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                payment.admin_status === 'approved'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                                    : payment.admin_status === 'seen'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                                    : payment.admin_status === 'rejected'
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                            }`}
                                                        >
                                                            <span className="capitalize">{payment.admin_status}</span>
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="py-4 px-4 text-neutral-400 text-[11px]">
                                                        {new Date(payment.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-5 text-right">
                                                        <Link
                                                            href={`/paymentStats/${payment.id}`}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-[11px] font-semibold shadow-xs transition-all active:scale-95"
                                                        >
                                                            <Eye className="w-3 h-3 text-neutral-500" />
                                                            <span>Details</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {payments.data.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="py-16 text-center text-neutral-400">
                                                    <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm font-semibold text-neutral-700">No payment records found</p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">
                                                        Try adjusting your search query or clear the filter.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* ORDERS TABLE */
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                                            <th className="py-3.5 px-5">Order #</th>
                                            <th className="py-3.5 px-4">Customer</th>
                                            <th className="py-3.5 px-4">Total Amount</th>
                                            <th className="py-3.5 px-4">Fulfillment Status</th>
                                            <th className="py-3.5 px-4">Created Date</th>
                                            <th className="py-3.5 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {orders.data.map((order) => {
                                            const avatar = getAvatarColors(order.user?.name || '');
                                            const isDelivered = order.status === 'delivered';
                                            const isProcessing = order.status === 'processing';
                                            const isShipped = order.status === 'shipped';
                                            const isCancelled = order.status === 'cancelled';

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-neutral-50/70 transition-colors group"
                                                >
                                                    {/* Order # */}
                                                    <td className="py-4 px-5">
                                                        <div className="font-mono text-xs font-bold text-neutral-900">
                                                            #{order.order_number}
                                                        </div>
                                                    </td>

                                                    {/* Customer */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className={`w-7 h-7 rounded-full ${avatar.bg} ${avatar.border} border flex items-center justify-center font-bold text-[10px] shrink-0`}
                                                            >
                                                                {(order.user?.name || 'U').slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-neutral-800 truncate">
                                                                    {order.user?.name || 'Customer'}
                                                                </p>
                                                                <p className="text-[10px] text-neutral-400 truncate">
                                                                    {order.user?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Total Amount */}
                                                    <td className="py-4 px-4">
                                                        <span className="font-extrabold text-neutral-900 text-xs">
                                                            {formatCurrency(order.total_amount)}
                                                        </span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                isDelivered
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                                    : isShipped
                                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                                                    : isProcessing
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                                                    : isCancelled
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                            }`}
                                                        >
                                                            {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                                                            {isShipped && <TrendingUp className="w-3 h-3" />}
                                                            {isProcessing && <Clock className="w-3 h-3" />}
                                                            {isCancelled && <XCircle className="w-3 h-3" />}
                                                            <span className="capitalize">{order.status}</span>
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="py-4 px-4 text-neutral-400 text-[11px]">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-5 text-right">
                                                        <Link
                                                            href={`/admin/orders/${order.order_number || order.id}`}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-[11px] font-semibold shadow-xs transition-all active:scale-95"
                                                        >
                                                            <Eye className="w-3 h-3 text-neutral-500" />
                                                            <span>Manage</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {orders.data.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-16 text-center text-neutral-400">
                                                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm font-semibold text-neutral-700">No orders found</p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">
                                                        Try adjusting your search query or clear the filter.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Bar */}
                        {((activeTab === 'payments' && payments.links && payments.links.length > 3) ||
                            (activeTab === 'orders' && orders.links && orders.links.length > 3)) && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
                                <span className="text-xs text-neutral-400 font-medium">
                                    Showing{' '}
                                    <strong className="text-neutral-700">
                                        {activeTab === 'payments' ? payments.data.length : orders.data.length}
                                    </strong>{' '}
                                    of{' '}
                                    <strong className="text-neutral-700">
                                        {activeTab === 'payments' ? payments.meta.total : orders.meta.total}
                                    </strong>{' '}
                                    records
                                </span>

                                <div className="flex items-center gap-1.5">
                                    {(activeTab === 'payments' ? payments.links : orders.links).map((link, idx) => {
                                        // Clean label
                                        const label = link.label
                                            .replace('&laquo; Previous', 'Prev')
                                            .replace('Next &raquo;', 'Next');

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                disabled={!link.url}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                                    link.active
                                                        ? 'text-white shadow-xs'
                                                        : link.url
                                                        ? 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                                                        : 'bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200/50'
                                                }`}
                                                style={link.active ? { backgroundColor: primaryColor } : {}}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
