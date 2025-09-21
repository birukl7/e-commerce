'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, PackageCheck, PackageX, PackageMinus, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Tab = {
    name: string;
    href: string;
    icon: any;
    component: React.ReactNode;
};

export default function StockManagement() {
    const tabs: Tab[] = [
        {
            name: 'Stock Alerts',
            href: '/admin/stock/alerts',
            icon: AlertTriangle,
            component: <StockAlerts />,
        },
        {
            name: 'Out of Stock',
            href: '/admin/stock/out-of-stock',
            icon: PackageX,
            component: <OutOfStock />,
        },
        {
            name: 'Low Stock',
            href: '/admin/stock/low-stock',
            icon: PackageMinus,
            component: <LowStock />,
        },
        {
            name: 'Stock History',
            href: '/admin/stock/history',
            icon: History,
            component: <StockHistory />,
        },
    ];

    return (
        <AdminLayout>
            <Head title="Stock Management" />
            
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Monitor and manage your inventory levels and stock alerts
                        </p>
                    </div>
                </div>
                
                <div className="mt-8">
                    <Tabs defaultValue="alerts" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <TabsList>
                                {tabs.map((tab) => (
                                    <TabsTrigger 
                                        key={tab.href} 
                                        value={tab.href.split('/').pop() || 'alerts'}
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
                                key={tab.href} 
                                value={tab.href.split('/').pop() || 'alerts'}
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
function StockAlerts() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Stock Alerts</h2>
            <p className="text-muted-foreground">
                View and manage all stock alerts and notifications.
            </p>
            {/* Stock alerts content will go here */}
        </div>
    );
}

function OutOfStock() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Out of Stock Items</h2>
            <p className="text-muted-foreground">
                View and manage products that are currently out of stock.
            </p>
            {/* Out of stock content will go here */}
        </div>
    );
}

function LowStock() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Low Stock Items</h2>
            <p className="text-muted-foreground">
                View and manage products that are running low on stock.
            </p>
            {/* Low stock content will go here */}
        </div>
    );
}

function StockHistory() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Stock History</h2>
            <p className="text-muted-foreground">
                View historical stock levels and changes over time.
            </p>
            {/* Stock history content will go here */}
        </div>
    );
}
