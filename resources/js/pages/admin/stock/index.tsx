'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, PackageCheck, PackageX, PackageMinus, History, Bell, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    return (
        <AdminLayout>
            <Head title="Stock Management" />
            
            <div className="px-4 sm:px-6 lg:px-8 w-full max-w-none">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Monitor and manage your inventory levels and notifications</p>
                    </div>
                </div>
                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold flex items-center gap-2"><Package className="h-4 w-4 text-gray-500" />{stats?.totalProducts ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-amber-600 flex items-center gap-2"><PackageMinus className="h-4 w-4" />{stats?.lowStockCount ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-red-600 flex items-center gap-2"><PackageX className="h-4 w-4" />{stats?.outOfStockCount ?? 0}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                            <Link href={buildHref('alerts')} className="flex items-center gap-2 hover:underline">
                                <Bell className="h-4 w-4" />{stats?.pendingNotifications ?? 0}
                            </Link>
                            <span className="ml-auto text-xs text-muted-foreground">Alerts: {stats?.pendingAlerts ?? 0}</span>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="mt-8">
                    <Tabs defaultValue={activeTab || 'alerts'} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <TabsList className="w-full justify-start">
                                {tabs.map((tab) => (
                                    <TabsTrigger 
                                        key={tab.key}
                                        value={tab.key}
                                        asChild
                                    >
                                        <Link href={tab.href} className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4" />
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
                                className="space-y-4"
                            >
                                {tab.component}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
}

// Placeholder components for each tab
function StockAlerts({ lowStock = [] as any[], outOfStock = [] as any[], notifications = [] as any[] }) {
    const pendingNotifications = notifications.filter((n: any) => !n.is_notified)
    return (
        <div className="rounded-lg border bg-card p-6 space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><PackageX className="h-4 w-4" /> Out of Stock</h2>
                {outOfStock.length === 0 ? (
                    <p className="text-muted-foreground">No out of stock products.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-muted-foreground">
                                    <th className="py-2 pr-4">Product</th>
                                    <th className="py-2 pr-4">SKU</th>
                                    <th className="py-2 pr-4">Stock</th>
                                    <th className="py-2 pr-4">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outOfStock.map((p: any) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="py-2 pr-4">{p.name}</td>
                                        <td className="py-2 pr-4">{p.sku}</td>
                                        <td className="py-2 pr-4 text-red-600">{p.stock_quantity}</td>
                                        <td className="py-2 pr-4">{new Date(p.updated_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><PackageMinus className="h-4 w-4" /> Low Stock</h2>
                {lowStock.length === 0 ? (
                    <p className="text-muted-foreground">No low stock products.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-muted-foreground">
                                    <th className="py-2 pr-4">Product</th>
                                    <th className="py-2 pr-4">SKU</th>
                                    <th className="py-2 pr-4">Stock</th>
                                    <th className="py-2 pr-4">Threshold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map((p: any) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="py-2 pr-4">{p.name}</td>
                                        <td className="py-2 pr-4">{p.sku}</td>
                                        <td className="py-2 pr-4 text-amber-600">{p.stock_quantity}</td>
                                        <td className="py-2 pr-4">{p.low_stock_threshold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bell className="h-4 w-4" /> Pending Notifications</h2>
                {pendingNotifications.length === 0 ? (
                    <p className="text-muted-foreground">No pending notifications.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-muted-foreground">
                                    <th className="py-2 pr-4">Product</th>
                                    <th className="py-2 pr-4">Subscriber</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingNotifications.map((n: any) => (
                                    <tr key={n.id} className="border-t">
                                        <td className="py-2 pr-4">{n.product?.name ?? '—'}</td>
                                        <td className="py-2 pr-4">{n.user?.name ?? 'Guest'}</td>
                                        <td className="py-2 pr-4">{n.email}</td>
                                        <td className="py-2 pr-4">{new Date(n.created_at).toLocaleString()}</td>
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
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Out of Stock Items</h2>
            {products.length === 0 ? (
                <p className="text-muted-foreground">No out of stock products.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="py-2 pr-4">Product</th>
                                <th className="py-2 pr-4">SKU</th>
                                <th className="py-2 pr-4">Stock</th>
                                <th className="py-2 pr-4">Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p: any) => (
                                <tr key={p.id} className="border-t">
                                    <td className="py-2 pr-4">{p.name}</td>
                                    <td className="py-2 pr-4">{p.sku}</td>
                                    <td className="py-2 pr-4 text-red-600">{p.stock_quantity}</td>
                                    <td className="py-2 pr-4">{new Date(p.updated_at).toLocaleString()}</td>
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
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Low Stock Items</h2>
            {products.length === 0 ? (
                <p className="text-muted-foreground">No low stock products.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="py-2 pr-4">Product</th>
                                <th className="py-2 pr-4">SKU</th>
                                <th className="py-2 pr-4">Stock</th>
                                <th className="py-2 pr-4">Threshold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p: any) => (
                                <tr key={p.id} className="border-t">
                                    <td className="py-2 pr-4">{p.name}</td>
                                    <td className="py-2 pr-4">{p.sku}</td>
                                    <td className="py-2 pr-4 text-amber-600">{p.stock_quantity}</td>
                                    <td className="py-2 pr-4">{p.low_stock_threshold}</td>
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
