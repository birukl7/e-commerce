/* eslint-disable @typescript-eslint/no-explicit-any */
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAdminNotifications, requestBrowserPermission } from '@/hooks/useAdminNotifications';
import { type BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    CheckCheck,
    ChevronDown,
    Palette,
    ShoppingBag,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const COLOR_PRESETS = [
    { name: 'Donezo Forest', hex: '#1E5338' },
    { name: 'Pine Emerald', hex: '#0D9488' },
    { name: 'Royal Indigo', hex: '#4338CA' },
    { name: 'Ocean Cyan', hex: '#0284C7' },
    { name: 'Sunset Amber', hex: '#D97706' },
    { name: 'Crimson Rose', hex: '#BE123C' },
    { name: 'Obsidian Noir', hex: '#18181B' },
];

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

    const [primaryColor, setPrimaryColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
            } catch {
                return '#1E5338';
            }
        }
        return '#1E5338';
    });
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const notifPanelRef = useRef<HTMLDivElement>(null);
    const colorPanelRef = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, markRead, markAllRead } = useAdminNotifications();

    useEffect(() => {
        try {
            const savedColor = localStorage.getItem('serdo_dashboard_primary_color');
            if (savedColor) {
                setPrimaryColor(savedColor);
                document.documentElement.style.setProperty('--primary', savedColor);
                document.documentElement.style.setProperty('--serdo-primary', savedColor);
            }
        } catch {
            // Ignore
        }
        requestBrowserPermission();

        const handleExternalThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) {
                setPrimaryColor(color);
            }
        };
        window.addEventListener('serdo:theme-color-changed', handleExternalThemeChange);
        return () => window.removeEventListener('serdo:theme-color-changed', handleExternalThemeChange);
    }, []);

    // Close popups on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (colorPanelRef.current && !colorPanelRef.current.contains(e.target as Node)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleColorChange = (hex: string) => {
        setPrimaryColor(hex);
        try {
            localStorage.setItem('serdo_dashboard_primary_color', hex);
            document.documentElement.style.setProperty('--primary', hex);
            document.documentElement.style.setProperty('--serdo-primary', hex);

            // Dispatch custom events with both object and string details for seamless backward and forward compatibility
            window.dispatchEvent(new CustomEvent('serdo:theme-color-changed', {
                detail: { color: hex, hex }
            }));
            window.dispatchEvent(new CustomEvent('theme-color-changed', {
                detail: { color: hex, hex }
            }));
            // Also dispatch with plain string detail
            window.dispatchEvent(new CustomEvent('serdo:theme-color', { detail: hex }));
        } catch {
            // Ignore
        }
    };

    const formatNotifTime = (timestamp: string) => {
        try {
            const diffMs = Date.now() - new Date(timestamp).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-4 md:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white/70 backdrop-blur-md sticky top-0 z-40">
            {/* Left: Sidebar toggle + Breadcrumbs */}
            <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right: Theme Selector, Notifications & User Chip */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Color Theme Switcher Pill */}
                <div className="relative" ref={colorPanelRef}>
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95"
                        title="Change Theme Color"
                    >
                        <span
                            className="w-3.5 h-3.5 rounded-full shadow-xs border border-white shrink-0"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <span className="hidden sm:inline">Theme</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {showColorPicker && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-neutral-600" />
                                    <span className="text-xs font-bold text-neutral-800">Global Theme Color</span>
                                </div>
                                <button
                                    onClick={() => setShowColorPicker(false)}
                                    className="text-neutral-400 hover:text-neutral-600 p-1"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-[11px] text-neutral-500 mt-2 mb-3">
                                Pick a primary accent color for all admin pages, badges, and cards.
                            </p>

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

                            {/* Custom Shade */}
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

                            <button
                                onClick={() => handleColorChange('#1E5338')}
                                className="w-full mt-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                                Reset to Donezo Forest Green
                            </button>
                        </div>
                    )}
                </div>

                {/* Notifications Bell with Live Dropdown */}
                <div className="relative" ref={notifPanelRef}>
                    <button
                        onClick={() => setShowNotifications((v) => !v)}
                        className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors shadow-xs active:scale-95"
                        title="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-[340px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-neutral-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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

                            <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-50">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                                        <p className="text-xs">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const notifData = n.data && typeof n.data === 'object' ? (n.data as Record<string, any>) : {};
                                        const targetUrl =
                                            notifData.review_url ||
                                            (notifData.payment_id ? `/admin/payments/${notifData.payment_id}` : '/admin/payment');

                                        const handleItemClick = () => {
                                            if (!n.is_read) {
                                                markRead(n.id);
                                            }
                                            setShowNotifications(false);
                                            router.visit(targetUrl);
                                        };

                                        return (
                                            <div
                                                key={n.id}
                                                onClick={handleItemClick}
                                                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                                                    n.is_read
                                                        ? 'bg-white hover:bg-neutral-50'
                                                        : 'bg-emerald-50/60 hover:bg-emerald-50'
                                                }`}
                                            >
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

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-semibold truncate ${
                                                        n.is_read ? 'text-neutral-600' : 'text-neutral-900 group-hover:text-emerald-900'
                                                    }`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    {notifData.customer_phone && (
                                                        <a
                                                            href={`tel:${notifData.customer_phone}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                                                        >
                                                            📞 {String(notifData.customer_phone)}
                                                        </a>
                                                    )}
                                                    <p className="text-[10px] text-neutral-400 mt-1">{formatNotifTime(n.created_at)}</p>
                                                </div>

                                                {!n.is_read && (
                                                    <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

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

                {/* User Profile Chip - Clicking navigates to Admin Profile Settings */}
                <Link
                    href="/settings/admin/profile"
                    className="flex items-center gap-2 pl-1.5 py-1 pr-2.5 sm:pr-3 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 shadow-xs transition-all active:scale-95 group"
                    title="Admin Profile & Settings"
                >
                    <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0 group-hover:opacity-90 transition-opacity bg-neutral-900"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {user?.avatar || (user as any)?.profile_image_url ? (
                            <img
                                src={user?.avatar || (user as any)?.profile_image_url}
                                alt={user?.name || 'Admin'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'
                        )}
                    </div>
                    <div className="hidden md:block text-left pr-1 leading-tight">
                        <p className="text-xs font-bold text-neutral-800 group-hover:text-neutral-950 truncate max-w-[120px]">
                            {user?.name || 'Admin'}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                            {user?.email || 'admin@store.com'}
                        </p>
                    </div>
                </Link>
            </div>
        </header>
    );
}
