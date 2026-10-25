import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
    ArrowUpRight,
    Search,
    Bell,
    Mail,
    Plus,
    Palette,
    Play,
    Pause,
    RotateCcw,
    Clock,
    AlertCircle,
    Package,
    TrendingUp,
    ChevronDown,
    X,
    Check,
    CheckCheck,
    ShoppingBag,
} from 'lucide-react';
import { useAdminNotifications, requestBrowserPermission } from '@/hooks/useAdminNotifications';

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

// Curated primary color presets inspired by Donezo & modern luxury design
const COLOR_PRESETS = [
    { name: 'Donezo Forest', hex: '#1E5338', text: 'text-emerald-950', border: 'border-[#1E5338]' },
    { name: 'Pine Emerald', hex: '#0D9488', text: 'text-teal-950', border: 'border-[#0D9488]' },
    { name: 'Royal Indigo', hex: '#4338CA', text: 'text-indigo-950', border: 'border-[#4338CA]' },
    { name: 'Ocean Cyan', hex: '#0284C7', text: 'text-sky-950', border: 'border-[#0284C7]' },
    { name: 'Sunset Amber', hex: '#D97706', text: 'text-amber-950', border: 'border-[#D97706]' },
    { name: 'Crimson Rose', hex: '#BE123C', text: 'text-rose-950', border: 'border-[#BE123C]' },
    { name: 'Obsidian Noir', hex: '#18181B', text: 'text-zinc-950', border: 'border-[#18181B]' },
];

export default function AdminDashboard({
    stats,
    recentOrders = [],
    topSellingProducts = [],
}: AdminDashboardProps) {
    const { auth } = usePage<{ auth?: { user?: { name?: string; email?: string } } }>().props;
    const user = auth?.user;

    // Theme color state with localStorage persistence
    const [primaryColor, setPrimaryColor] = useState<string>('#1E5338');
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month'>('week');
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const notifPanelRef = useRef<HTMLDivElement>(null);

    // Real-time admin notifications
    const { notifications, unreadCount, markRead, markAllRead } = useAdminNotifications();

    // Live session timer state
    const [timerSeconds, setTimerSeconds] = useState<number>(5048); // 01:24:08 initially
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

    // Load saved color preference on mount + request browser notification permission
    useEffect(() => {
        try {
            const savedColor = localStorage.getItem('serdo_dashboard_primary_color');
            if (savedColor) {
                setPrimaryColor(savedColor);
            }
        } catch (e) {
            // Ignore localStorage errors
        }
        // Ask for browser push notification permission
        requestBrowserPermission();
    }, []);

    // Close notification panel when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    const formatNotifTime = useCallback((dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }, []);

    // Save color to localStorage and update CSS variable
    const handleColorChange = (hex: string) => {
        setPrimaryColor(hex);
        try {
            localStorage.setItem('serdo_dashboard_primary_color', hex);
        } catch (e) {
            // Ignore
        }
    };

    // Live timer ticking
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning]);

    const formatTimer = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return [
            hrs.toString().padStart(2, '0'),
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0'),
        ].join(':');
    };

    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Fallback/enrich top products if empty for demo presentation
    const displayTopProducts = useMemo(() => {
        if (topSellingProducts && topSellingProducts.length > 0) {
            return topSellingProducts.slice(0, 5);
        }
        return [
            { product_name: 'TP-Link Archer AX73 Wi-Fi 6 Router', category_id: 10, total_quantity_sold: 45, total_revenue_generated: 6749 },
            { product_name: 'Apple MacBook Pro 14-inch M3 Pro', category_id: 6, total_quantity_sold: 22, total_revenue_generated: 41778 },
            { product_name: 'Authentic Black Clay Jebena Coffee Pot', category_id: 14, total_quantity_sold: 45, total_revenue_generated: 2475 },
            { product_name: 'Handwoven Colorful Habesha Sefed', category_id: 13, total_quantity_sold: 40, total_revenue_generated: 2600 },
            { product_name: 'Ethiopian Orthodox Cross String Art', category_id: 12, total_quantity_sold: 25, total_revenue_generated: 3000 },
        ];
    }, [topSellingProducts]);

    // Fallback/enrich recent orders for demo presentation
    const displayRecentOrders = useMemo(() => {
        if (recentOrders && recentOrders.length > 0) {
            return recentOrders.slice(0, 4);
        }
        return [
            { order_number: 'ORDER-1024', customer_name: 'Alexandra Deff', total_amount: '4,200', payment_status: 'paid' },
            { order_number: 'ORDER-1023', customer_name: 'Edwin Adenike', total_amount: '1,350', payment_status: 'processing' },
            { order_number: 'ORDER-1022', customer_name: 'Isaac Oluwatemilorun', total_amount: '890', payment_status: 'pending' },
            { order_number: 'ORDER-1021', customer_name: 'David Oshodi', total_amount: '2,450', payment_status: 'processing' },
        ];
    }, [recentOrders]);

    // Icons colors matching Donezo screenshot
    const productIconStyles = [
        { bg: 'bg-blue-100 text-blue-600', symbol: '⫽' },
        { bg: 'bg-teal-100 text-teal-600', symbol: '◍' },
        { bg: 'bg-emerald-100 text-emerald-600', symbol: '✤' },
        { bg: 'bg-amber-100 text-amber-600', symbol: '⬢' },
        { bg: 'bg-purple-100 text-purple-600', symbol: '❖' },
    ];

    // Customer avatars with Donezo-styled colorful backgrounds
    const customerAvatars = [
        { initial: 'AD', bg: 'bg-pink-100 text-pink-700', border: 'border-pink-200' },
        { initial: 'EA', bg: 'bg-amber-100 text-amber-800', border: 'border-amber-200' },
        { initial: 'IO', bg: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
        { initial: 'DO', bg: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={[]} footerNavItems={[]}>
            <Head title="Admin Dashboard | Donezo Style" />

            {/* Custom CSS for striped capsule bars and color variables */}
            <style>{`
                :root {
                    --dash-primary: ${primaryColor};
                }
                .striped-capsule {
                    background-image: repeating-linear-gradient(
                        45deg,
                        rgba(0, 0, 0, 0.05),
                        rgba(0, 0, 0, 0.05) 4px,
                        rgba(255, 255, 255, 0.4) 4px,
                        rgba(255, 255, 255, 0.4) 8px
                    );
                }
                .striped-arc {
                    stroke-dasharray: 4, 3;
                }
            `}</style>

            <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
                <div className="max-w-[1440px] mx-auto space-y-6">

                    {/* ========================================================== */}
                    {/* TOP HEADER: Search, Notifications, Profile & Color Switcher */}
                    {/* ========================================================== */}
                    <header className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Search Bar with Shortcut Pill */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search orders, products, customers..."
                                className="w-full bg-white pl-11 pr-14 py-2.5 rounded-full text-sm text-neutral-800 placeholder-neutral-400 border border-neutral-200/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-400/30 transition-all"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-neutral-100 border border-neutral-200/70 px-1.5 py-0.5 rounded-md pointer-events-none">
                                <kbd>⌘</kbd>
                                <kbd>F</kbd>
                            </div>
                        </div>

                        {/* Actions: Theme Color Switcher, Notifications, Messages & User Profile */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            {/* Color Theme Switcher Pill */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95"
                                    title="Change Dashboard Primary Color"
                                >
                                    <span
                                        className="w-3.5 h-3.5 rounded-full shadow-xs border border-white"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                    <span>Theme</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Theme Customizer Dropdown Panel */}
                                {showColorPicker && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-neutral-600" />
                                                <span className="text-xs font-bold text-neutral-800">Dashboard Theme</span>
                                            </div>
                                            <button
                                                onClick={() => setShowColorPicker(false)}
                                                className="text-neutral-400 hover:text-neutral-600 p-1"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-neutral-500 mt-2 mb-3">
                                            Pick a primary accent color for your dashboard cards, charts, and buttons.
                                        </p>

                                        {/* Presets Grid */}
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            {COLOR_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.hex}
                                                    onClick={() => handleColorChange(preset.hex)}
                                                    className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                                                        primaryColor.toLowerCase() === preset.hex.toLowerCase()
                                                            ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                                                            : 'border-neutral-200/60 hover:border-neutral-300 bg-white'
                                                    }`}
                                                    title={preset.name}
                                                >
                                                    <span
                                                        className="w-6 h-6 rounded-full shadow-xs border border-black/10 flex items-center justify-center text-white text-[10px]"
                                                        style={{ backgroundColor: preset.hex }}
                                                    >
                                                        {primaryColor.toLowerCase() === preset.hex.toLowerCase() && '✓'}
                                                    </span>
                                                    <span className="text-[9px] font-medium text-neutral-600 mt-1 truncate max-w-full">
                                                        {preset.name.split(' ')[0]}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Color Input */}
                                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                                            <label className="text-[11px] font-medium text-neutral-600">Custom Shade:</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={primaryColor}
                                                    onChange={(e) => handleColorChange(e.target.value)}
                                                    className="w-7 h-7 rounded-lg cursor-pointer border border-neutral-200 p-0.5 bg-white"
                                                />
                                                <span className="text-[11px] font-mono text-neutral-700 uppercase bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                                                    {primaryColor}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Reset Button */}
                                        <button
                                            onClick={() => handleColorChange('#1E5338')}
                                            className="w-full mt-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                                        >
                                            Reset to Donezo Forest Green
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mail / Inbox Icon */}
                            <button
                                className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors shadow-xs active:scale-95"
                                title="Messages"
                            >
                                <Mail className="w-4 h-4" />
                            </button>

                            {/* Notifications Bell with Live Dropdown */}
                            <div className="relative" ref={notifPanelRef}>
                                <button
                                    onClick={() => setShowNotifications((v) => !v)}
                                    className="relative w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors shadow-xs active:scale-95"
                                    title="Notifications"
                                >
                                    <Bell className="w-4 h-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown Panel */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-neutral-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-neutral-600" />
                                                <span className="text-sm font-bold text-neutral-900">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                                                        {unreadCount} unread
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => markAllRead()}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                                        title="Mark all as read"
                                                    >
                                                        <CheckCheck className="w-3.5 h-3.5" />
                                                        All read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notification List */}
                                        <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-50">
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                                                    <Bell className="w-8 h-8 mb-2 opacity-30" />
                                                    <p className="text-xs">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => !n.is_read && markRead(n.id)}
                                                        className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                                            n.is_read
                                                                ? 'bg-white hover:bg-neutral-50'
                                                                : 'bg-emerald-50/60 hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        {/* Icon */}
                                                        <div
                                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs mt-0.5 ${
                                                                n.type === 'payment_review_required'
                                                                    ? 'bg-amber-500'
                                                                    : n.type === 'payment_approved'
                                                                    ? 'bg-emerald-500'
                                                                    : 'bg-neutral-400'
                                                            }`}
                                                        >
                                                            {n.type === 'payment_review_required' ? (
                                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                            ) : n.type === 'payment_approved' ? (
                                                                <Check className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Bell className="w-3.5 h-3.5" />
                                                            )}
                                                        </div>

                                                        {/* Text */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold truncate ${
                                                                n.is_read ? 'text-neutral-600' : 'text-neutral-900'
                                                            }`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                                                                {n.message}
                                                            </p>
                                                            {n.data?.customer_phone && (
                                                                <a
                                                                    href={`tel:${n.data.customer_phone}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                                                                >
                                                                    📞 {String(n.data.customer_phone)}
                                                                </a>
                                                            )}
                                                            <p className="text-[10px] text-neutral-400 mt-1">{formatNotifTime(n.created_at)}</p>
                                                        </div>

                                                        {/* Unread dot */}
                                                        {!n.is_read && (
                                                            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50">
                                            <Link
                                                href="/admin/payment"
                                                onClick={() => setShowNotifications(false)}
                                                className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                View all payments
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Chip */}
                            <div className="flex items-center gap-2.5 pl-2 py-1 pr-3 bg-white rounded-full border border-neutral-200 shadow-xs">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TM'}
                                </div>
                                <div className="hidden sm:block text-left pr-1 leading-tight">
                                    <p className="text-xs font-bold text-neutral-800 truncate max-w-[120px]">
                                        {user?.name || 'Totok Michael'}
                                    </p>
                                    <p className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                                        {user?.email || 'tmichael20@mail.com'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ========================================================== */}
                    {/* TITLE ROW: Dashboard Header + Primary & Secondary Actions */}
                    {/* ========================================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                                Dashboard
                            </h1>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
                                Plan, prioritize, and monitor your store performance with ease.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Link
                                href="/admin/products/create"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Product</span>
                            </Link>

                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
                            >
                                <Palette className="w-4 h-4 text-neutral-500" />
                                <span>Theme Color</span>
                            </button>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ROW 1: 4 TOP METRIC CARDS (Signature Donezo style)         */}
                    {/* ========================================================== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Primary Colored Card (Total Sales) */}
                        <div
                            className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-medium text-white/80">Total Sales</span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                                    <ArrowUpRight className="w-4 h-4" style={{ color: primaryColor }} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    {stats?.totalSales && stats.totalSales > 0 ? formatCurrency(stats.totalSales) : 'ETB 145,280'}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium text-white backdrop-blur-xs">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+{stats?.salesChange && stats.salesChange !== 0 ? Math.abs(stats.salesChange) : '14.8'}% Increased from last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: White Card (Total Orders) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Total Orders</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats?.totalOrders ?? 128}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                                    <span>+8.2% Increased from last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: White Card (Active Customers) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Active Customers</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats?.activeCustomers ?? 42}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                                    <span>+5.4% Increased from last month</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: White Card (Low Stock Items / Pending) */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[170px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Low Stock Alerts</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                                    {stats?.lowStockProducts ?? 2}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[11px] font-semibold text-amber-700 border border-amber-200/50">
                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                    <span>Needs Restocking</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ROW 2: BENTO GRID - Analytics, Reminders & Top Products     */}
                    {/* ========================================================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                        {/* Left: Project / Sales Analytics (Donezo vertical pill bar chart) (5 cols) */}
                        <div className="lg:col-span-5 rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-800">Sales Analytics</h2>
                                    <p className="text-[11px] text-neutral-400">Weekly revenue & order velocity</p>
                                </div>
                                <div className="flex items-center p-1 bg-neutral-100 rounded-full text-[11px] font-semibold text-neutral-600">
                                    <button
                                        onClick={() => setAnalyticsPeriod('week')}
                                        className={`px-3 py-1 rounded-full transition-all ${
                                            analyticsPeriod === 'week' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                                        }`}
                                    >
                                        Weekly
                                    </button>
                                    <button
                                        onClick={() => setAnalyticsPeriod('month')}
                                        className={`px-3 py-1 rounded-full transition-all ${
                                            analyticsPeriod === 'month' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                </div>
                            </div>

                            {/* The Signature Donezo Vertical Pill Bars */}
                            <div className="relative pt-8 pb-3">
                                <div className="flex items-end justify-between gap-3 h-48 px-2">
                                    {/* Sunday (Striped capsule) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[42px] h-[55%] rounded-full striped-capsule border border-neutral-200/80 transition-all hover:scale-105"
                                            title="Sunday: ETB 12,400"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">S</span>
                                    </div>

                                    {/* Monday (Medium tint capsule) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[42px] h-[78%] rounded-full transition-all hover:scale-105 shadow-xs"
                                            style={{ backgroundColor: `${primaryColor}CC` }}
                                            title="Monday: ETB 18,900"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">M</span>
                                    </div>

                                    {/* Tuesday (Light tint capsule with 74% Tooltip Pill) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative">
                                        {/* Floating Badge (Donezo 74% indicator) */}
                                        <div className="absolute -top-6 flex flex-col items-center animate-bounce duration-1000">
                                            <span className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-800 shadow-xs">
                                                74%
                                            </span>
                                            <div className="w-1.5 h-1.5 bg-neutral-200 rotate-45 -mt-0.5" />
                                        </div>
                                        <div
                                            className="w-full max-w-[42px] h-[65%] rounded-full transition-all hover:scale-105 shadow-xs"
                                            style={{ backgroundColor: `${primaryColor}88` }}
                                            title="Tuesday: 74% Target Reached"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">T</span>
                                    </div>

                                    {/* Wednesday (Dark solid primary capsule - Peak) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[42px] h-[94%] rounded-full transition-all hover:scale-105 shadow-md"
                                            style={{ backgroundColor: primaryColor }}
                                            title="Wednesday: ETB 28,500 (Peak)"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">W</span>
                                    </div>

                                    {/* Thursday (Striped capsule) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[42px] h-[45%] rounded-full striped-capsule border border-neutral-200/80 transition-all hover:scale-105"
                                            title="Thursday: ETB 9,800"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">T</span>
                                    </div>

                                    {/* Friday (Striped capsule) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[42px] h-[68%] rounded-full striped-capsule border border-neutral-200/80 transition-all hover:scale-105"
                                            title="Friday: ETB 15,200"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">F</span>
                                    </div>

                                    {/* Saturday (Striped capsule) */}
                                    <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[42px] h-[52%] rounded-full striped-capsule border border-neutral-200/80 transition-all hover:scale-105"
                                            title="Saturday: ETB 11,400"
                                        />
                                        <span className="text-[11px] font-semibold text-neutral-400">S</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Reminders / Priority Action Card (3 cols) */}
                        <div className="lg:col-span-3 rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs flex flex-col justify-between">
                            <div className="space-y-4">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Reminders
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                                        Courier Pickup &amp; Order Dispatch
                                    </h3>
                                    <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                        <span>Time : 02.00 pm - 04.00 pm</span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Link
                                    href="/admin/orders"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Package className="w-4 h-4" />
                                    <span>Process Shipments</span>
                                </Link>
                            </div>
                        </div>

                        {/* Right: Top Performing Products (Donezo "Project" widget) (4 cols) */}
                        <div className="lg:col-span-4 rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-neutral-800">Top Products</h2>
                                <Link
                                    href="/admin/products"
                                    className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 border border-neutral-200 px-2.5 py-1 rounded-full hover:bg-neutral-50 transition-colors"
                                >
                                    <span>+ View All</span>
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {displayTopProducts.map((product, idx) => {
                                    const iconStyle = productIconStyles[idx % productIconStyles.length];
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded-xl ${iconStyle.bg} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                                                    {iconStyle.symbol}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-neutral-900">
                                                        {product.product_name}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 truncate">
                                                        {product.total_quantity_sold} sold • {formatCurrency(product.total_revenue_generated)}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 transition-colors shrink-0 ml-2" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ========================================================== */}
                    {/* ROW 3: BENTO GRID - Orders, Gauge Fulfillment & Tracker   */}
                    {/* ========================================================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                        {/* Left: Recent Customer Orders (Donezo "Team Collaboration") (5 cols) */}
                        <div className="lg:col-span-5 rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-neutral-800">Recent Orders</h2>
                                    <p className="text-[11px] text-neutral-400">Latest customer purchases</p>
                                </div>
                                <Link
                                    href="/admin/orders"
                                    className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1 rounded-full hover:bg-neutral-50 transition-colors"
                                >
                                    + Manage
                                </Link>
                            </div>

                            <div className="space-y-3.5">
                                {displayRecentOrders.map((order, idx) => {
                                    const avatar = customerAvatars[idx % customerAvatars.length];
                                    const isCompleted = order.payment_status === 'paid';
                                    const isProcessing = order.payment_status === 'processing';

                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-neutral-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-9 h-9 rounded-full ${avatar.bg} ${avatar.border} border flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                                                    {avatar.initial}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-neutral-800 truncate">
                                                        {order.customer_name}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 truncate">
                                                        {order.order_number} • ETB {order.total_amount}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                                                    isCompleted
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                        : isProcessing
                                                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                }`}
                                            >
                                                {isCompleted ? 'Completed' : isProcessing ? 'In Progress' : 'Pending'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Middle: Order Fulfillment Semi-Circle Gauge (4 cols) */}
                        <div className="lg:col-span-4 rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs flex flex-col justify-between">
                            <div className="mb-2">
                                <h2 className="text-sm font-bold text-neutral-800">Fulfillment Progress</h2>
                                <p className="text-[11px] text-neutral-400">Current cycle order completion</p>
                            </div>

                            {/* SVG Semi-Circle Arch Gauge */}
                            <div className="relative flex flex-col items-center justify-center py-2">
                                <svg className="w-56 h-32 overflow-visible" viewBox="0 0 200 115">
                                    <defs>
                                        <pattern id="gaugeStripes" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                            <line x1="0" y1="0" x2="0" y2="6" stroke="#94A3B8" strokeWidth="2.5" />
                                        </pattern>
                                    </defs>

                                    {/* Background Track Arc */}
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                        fill="none"
                                        stroke="#F1F5F9"
                                        strokeWidth="22"
                                        strokeLinecap="round"
                                    />

                                    {/* Segment 3: Pending (Striped pattern arc) */}
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                        fill="none"
                                        stroke="url(#gaugeStripes)"
                                        strokeWidth="20"
                                        strokeDasharray="251.2"
                                        strokeDashoffset="0"
                                        strokeLinecap="round"
                                    />

                                    {/* Segment 2: In Progress (Medium tint) */}
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                        fill="none"
                                        stroke={`${primaryColor}88`}
                                        strokeWidth="22"
                                        strokeDasharray="251.2"
                                        strokeDashoffset="60"
                                        strokeLinecap="round"
                                    />

                                    {/* Segment 1: Completed (Solid primary) */}
                                    <path
                                        d="M 20 100 A 80 80 0 0 1 180 100"
                                        fill="none"
                                        stroke={primaryColor}
                                        strokeWidth="22"
                                        strokeDasharray="251.2"
                                        strokeDashoffset="120"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Center Big Percentage */}
                                <div className="absolute top-16 flex flex-col items-center">
                                    <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                                        82%
                                    </span>
                                    <span className="text-[10px] font-semibold text-neutral-400 -mt-0.5">
                                        Orders Fulfilled
                                    </span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-100 text-[11px] font-semibold text-neutral-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                    <span>Completed</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${primaryColor}88` }} />
                                    <span>In Progress</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-neutral-300 striped-capsule" />
                                    <span>Pending</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Live Session / Time Tracker (Donezo dark card) (3 cols) */}
                        <div
                            className="lg:col-span-3 rounded-[26px] p-6 text-white shadow-md flex flex-col justify-between relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor} 0%, #07170E 100%)`,
                            }}
                        >
                            {/* Organic Wavy Contour SVG Background Accent */}
                            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 200">
                                <path
                                    d="M-20,100 C40,40 100,160 220,100 C240,140 220,220 180,220 C100,220 20,220 -20,220 Z"
                                    fill="rgba(255,255,255,0.15)"
                                />
                                <circle cx="180" cy="40" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="30" />
                            </svg>

                            <div className="relative z-10">
                                <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                                    Time Tracker
                                </span>
                            </div>

                            {/* Big Digital Timer Display */}
                            <div className="relative z-10 py-4 text-center">
                                <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-wider text-white drop-shadow-sm">
                                    {formatTimer(timerSeconds)}
                                </div>
                                <p className="text-[10px] text-white/60 font-medium mt-1">
                                    {isTimerRunning ? '● Active Session Recording' : '❚❚ Session Paused'}
                                </p>
                            </div>

                            {/* Control Buttons (Pause/Play & Reset) */}
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                    className="w-11 h-11 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                                    title={isTimerRunning ? 'Pause Session' : 'Resume Session'}
                                >
                                    {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                </button>

                                <button
                                    onClick={() => {
                                        setIsTimerRunning(false);
                                        setTimerSeconds(0);
                                    }}
                                    className="w-11 h-11 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                                    title="Reset Counter"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}