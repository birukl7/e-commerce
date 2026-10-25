/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, PackageX, PackageMinus, Bell, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import { adminNavItems } from '@/constants/adminNavItems';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Stock Management',
        href: '/admin/stock',
    },
];

type Tab = {
    name: string;
    key: string;
    href: string;
    icon: any;
    component: React.ReactNode;
};

export default function StockManagement() {
    const { activeTab, lowStockProducts = [], outOfStockProducts = [], recentNotifications = [], stats = {} } = usePage<any>().props;

    const buildHref = (key: string) => `/admin/stock?tab=${key}`;

    const tabs: Tab[] = [
        {
            name: 'Stock Alerts',
            key: 'alerts',
            href: buildHref('alerts'),
            icon: AlertTriangle,
            component: <StockAlerts lowStock={lowStockProducts} outOfStock={outOfStockProducts} notifications={recentNotifications} />,
        },
        {
            name: 'Out of Stock',
            key: 'out_of_stock',
            href: buildHref('out_of_stock'),
            icon: PackageX,
            component: <OutOfStock products={outOfStockProducts} />,
        },
        {
            name: 'Low Stock',
            key: 'low_stock',
            href: buildHref('low_stock'),
            icon: PackageMinus,
            component: <LowStock products={lowStockProducts} />,
        },
        // Stock History tab removed per request
    ];

    const [primaryColor, setPrimaryColor] = React.useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
        }
        return '#1E5338';
    });

    React.useEffect(() => {
        const handler = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handler);
        return () => window.removeEventListener('serdo:theme-color-changed', handler);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Stock Management" />
            
            <div className="min-h-screen bg-[#F6F8FA] p-6 lg:p-8 font-sans">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inventory Control</span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-medium text-emerald-600">Live</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mt-1">Stock Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Monitor stock health, critical low inventory alerts, and customer restock alerts</p>
                    </div>
                </div>

                {/* 4 Donezo Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Primary Hero Metric */}
                    <div 
                        className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Catalog Size</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-3xl font-black tracking-tight text-white">{stats?.totalProducts ?? 0}</h3>
                            <p className="text-xs font-medium text-white/80 mt-1">Total active SKUs tracked</p>
                        </div>
                    </div>

                    {/* Low Stock Warning Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Low Stock Alert</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                                <PackageMinus className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-amber-600">{stats?.lowStockCount ?? 0}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Items below threshold</p>
                        </div>
                    </div>

                    {/* Out of Stock Critical Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Out of Stock</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
                                <PackageX className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-red-600">{stats?.outOfStockCount ?? 0}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Immediate restock required</p>
                        </div>
                    </div>

                    {/* Pending Notifications Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Restock Requests</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
                                <Bell className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <h3 className="text-3xl font-black tracking-tight text-blue-600">{stats?.pendingNotifications ?? 0}</h3>
                            <span className="text-xs font-medium text-gray-400">Alerts: {stats?.pendingAlerts ?? 0}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-1">Subscribers awaiting back-in-stock</p>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="space-y-6">
                    <Tabs defaultValue={activeTab || 'alerts'} className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <TabsList className="h-11 bg-gray-200/60 p-1 rounded-2xl border border-gray-200/50">
                                {tabs.map((tab) => (
                                    <TabsTrigger 
                                        key={tab.key}
                                        value={tab.key}
                                        asChild
                                        className="rounded-xl px-4 py-2 font-semibold text-xs tracking-wide data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                                    >
                                        <Link href={tab.href} className="flex items-center gap-2">
                                            <tab.icon className="h-3.5 w-3.5" />
                                            {tab.name}
                                        </Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        
                        {tabs.map((tab) => (
                            <TabsContent 
                                key={tab.key}
                                value={tab.key}
                                className="space-y-4 outline-none"
                            >
                                {tab.component}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}

// Placeholder components for each tab
function StockAlerts({ lowStock = [] as any[], outOfStock = [] as any[], notifications = [] as any[] }) {
    const pendingNotifications = notifications.filter((n: any) => !n.is_notified);
    return (
        <div className="space-y-6 w-full">
            {/* Out of Stock Section */}
            <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <PackageX className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Critical: Out of Stock</h2>
                            <p className="text-xs text-gray-500">Products currently with zero available inventory</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {outOfStock.length} items
                    </span>
                </div>
                {outOfStock.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                        All items have inventory. No out of stock products!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                    <th className="py-3 pr-4 font-semibold">Product Name</th>
                                    <th className="py-3 pr-4 font-semibold">SKU</th>
                                    <th className="py-3 pr-4 font-semibold">Stock</th>
                                    <th className="py-3 pr-4 font-semibold">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {outOfStock.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="py-3 pr-4 text-xs font-mono text-gray-500">{p.sku}</td>
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                                                0 units
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-xs text-gray-500">{new Date(p.updated_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Low Stock Section */}
            <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <PackageMinus className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Low Stock Warnings</h2>
                            <p className="text-xs text-gray-500">Products operating below configured safety thresholds</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {lowStock.length} items
                    </span>
                </div>
                {lowStock.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                        No products are currently under their threshold limit.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                    <th className="py-3 pr-4 font-semibold">Product Name</th>
                                    <th className="py-3 pr-4 font-semibold">SKU</th>
                                    <th className="py-3 pr-4 font-semibold">Remaining</th>
                                    <th className="py-3 pr-4 font-semibold">Threshold</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lowStock.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="py-3 pr-4 text-xs font-mono text-gray-500">{p.sku}</td>
                                        <td className="py-3 pr-4">
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                                {p.stock_quantity} left
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-xs text-gray-500">{p.low_stock_threshold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pending Notifications */}
            <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Bell className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Restock Waiting List</h2>
                            <p className="text-xs text-gray-500">Customers registered for back-in-stock alerts</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {pendingNotifications.length} subscribers
                    </span>
                </div>
                {pendingNotifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                        No pending restock notifications requested.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                    <th className="py-3 pr-4 font-semibold">Product</th>
                                    <th className="py-3 pr-4 font-semibold">Customer</th>
                                    <th className="py-3 pr-4 font-semibold">Contact Email</th>
                                    <th className="py-3 pr-4 font-semibold">Requested At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingNotifications.map((n: any) => (
                                    <tr key={n.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-gray-900">{n.product?.name ?? '—'}</td>
                                        <td className="py-3 pr-4 text-gray-700">{n.user?.name ?? 'Guest'}</td>
                                        <td className="py-3 pr-4 text-xs font-mono text-gray-500">{n.email}</td>
                                        <td className="py-3 pr-4 text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function OutOfStock({ products = [] as any[] }) {
    return (
        <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-sm w-full">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Out of Stock Items</h2>
                    <p className="text-xs text-gray-500">Detailed list of all catalog items needing restock</p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    {products.length} items
                </span>
            </div>
            {products.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">No out of stock products.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                <th className="py-3 pr-4 font-semibold">Product Name</th>
                                <th className="py-3 pr-4 font-semibold">SKU</th>
                                <th className="py-3 pr-4 font-semibold">Stock</th>
                                <th className="py-3 pr-4 font-semibold">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                                    <td className="py-3 pr-4 text-xs font-mono text-gray-500">{p.sku}</td>
                                    <td className="py-3 pr-4">
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                                            0 units
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-xs text-gray-500">{new Date(p.updated_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function LowStock({ products = [] as any[] }) {
    return (
        <div className="rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-sm w-full">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Low Stock Items</h2>
                    <p className="text-xs text-gray-500">Products operating below configured minimum stock threshold</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {products.length} items
                </span>
            </div>
            {products.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">No low stock products.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                <th className="py-3 pr-4 font-semibold">Product Name</th>
                                <th className="py-3 pr-4 font-semibold">SKU</th>
                                <th className="py-3 pr-4 font-semibold">Remaining Units</th>
                                <th className="py-3 pr-4 font-semibold">Alert Threshold</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                                    <td className="py-3 pr-4 text-xs font-mono text-gray-500">{p.sku}</td>
                                    <td className="py-3 pr-4">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                            {p.stock_quantity} left
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-xs text-gray-500">{p.low_stock_threshold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// StockHistory component removed
