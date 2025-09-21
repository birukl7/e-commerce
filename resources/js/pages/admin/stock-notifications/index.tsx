import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    AlertTriangle, 
    Bell, 
    BellOff, 
    Eye, 
    Mail, 
    Package, 
    Search, 
    Trash2,
    Users,
    Calendar,
    Filter
} from 'lucide-react';

interface OutOfStockNotification {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        sku: string;
        stock_quantity: number;
    };
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    email: string;
    is_notified: boolean;
    notified_at: string | null;
    created_at: string;
}

interface ProductWithNotifications {
    product: {
        id: number;
        name: string;
        slug: string;
        sku: string;
        stock_quantity: number;
    };
    notification_count: number;
    notifications: OutOfStockNotification[];
}

interface PageProps extends InertiaPageProps {
    notifications: {
        data: OutOfStockNotification[];
        links: any[];
        meta: any;
    };
    stats: {
        total_notifications: number;
        pending_notifications: number;
        notified_count: number;
        products_with_notifications: number;
    };
    productsWithPendingNotifications: ProductWithNotifications[];
    filters: {
        product_search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

const StockNotificationsIndex = () => {
    const { notifications, stats, productsWithPendingNotifications, filters } = usePage<PageProps>().props;
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const handleBulkDelete = () => {
        if (selectedNotifications.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${selectedNotifications.length} notification subscriptions?`)) {
            router.post(route('admin.stock-notifications.bulk-delete'), {
                notification_ids: selectedNotifications
            }, {
                onSuccess: () => {
                    setSelectedNotifications([]);
                }
            });
        }
    };

    const handleTriggerNotifications = (productId: number) => {
        router.post(route('admin.stock-notifications.trigger', productId), {}, {
            onSuccess: () => {
                // Refresh the page to show updated data
                router.reload();
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title="Stock Notifications" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="h-8 w-8 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Stock Notifications</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage out of stock notification subscriptions and track user engagement
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_notifications}</div>
                                <p className="text-xs text-muted-foreground">
                                    All notification subscriptions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
                                <BellOff className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">{stats.pending_notifications}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting back in stock
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Notified Users</CardTitle>
                                <Mail className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.notified_count}</div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully notified
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Products</CardTitle>
                                <Package className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.products_with_notifications}</div>
                                <p className="text-xs text-muted-foreground">
                                    With active subscriptions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products with Pending Notifications */}
                    {productsWithPendingNotifications.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Products with Pending Notifications
                                </CardTitle>
                                <CardDescription>
                                    Products that are back in stock but haven't notified subscribers yet
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {productsWithPendingNotifications.map((item) => (
                                        <div key={item.product.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {item.product.sku} • Stock: {item.product.stock_quantity} • 
                                                    {item.notification_count} subscribers
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => handleTriggerNotifications(item.product.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Mail className="h-4 w-4 mr-2" />
                                                Notify Subscribers
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Filters and Actions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters & Actions
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                            </div>
                        </CardHeader>
                        {showFilters && (
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="product_search">Search Products</Label>
                                        <Input
                                            id="product_search"
                                            placeholder="Product name or SKU..."
                                            defaultValue={filters.product_search}
                                            onChange={(e) => {
                                                router.get(route('admin.stock-notifications.index'), {
                                                    ...filters,
                                                    product_search: e.target.value
                                                }, {
                                                    preserveState: true,
                                                    replace: true
                                                });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={filters.status || ''}
                                            onValueChange={(value) => {
                                                router.get(route('admin.stock-notifications.index'), {
                                                    ...filters,
                                                    status: value || undefined
                                                }, {
                                                    preserveState: true,
                                                    replace: true
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="notified">Notified</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="date_from">From Date</Label>
                                        <Input
                                            id="date_from"
                                            type="date"
                                            defaultValue={filters.date_from}
                                            onChange={(e) => {
                                                router.get(route('admin.stock-notifications.index'), {
                                                    ...filters,
                                                    date_from: e.target.value
                                                }, {
                                                    preserveState: true,
                                                    replace: true
                                                });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="date_to">To Date</Label>
                                        <Input
                                            id="date_to"
                                            type="date"
                                            defaultValue={filters.date_to}
                                            onChange={(e) => {
                                                router.get(route('admin.stock-notifications.index'), {
                                                    ...filters,
                                                    date_to: e.target.value
                                                }, {
                                                    preserveState: true,
                                                    replace: true
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                        {selectedNotifications.length > 0 && (
                            <CardContent className="border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedNotifications.length} notifications selected
                                    </span>
                                    <Button
                                        variant="destructive"
                                        onClick={handleBulkDelete}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Selected
                                    </Button>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Notifications List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Subscriptions</CardTitle>
                            <CardDescription>
                                Manage user subscriptions for out of stock notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.data.map((notification) => (
                                    <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <Checkbox
                                                checked={selectedNotifications.includes(notification.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedNotifications([...selectedNotifications, notification.id]);
                                                    } else {
                                                        setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                                                    }
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Link
                                                        href={route('products.show', notification.product.slug)}
                                                        className="font-medium hover:text-primary"
                                                    >
                                                        {notification.product.name}
                                                    </Link>
                                                    <Badge variant="outline" className="text-xs">
                                                        {notification.product.sku}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {notification.email}
                                                    </span>
                                                    {notification.user && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {notification.user.name}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={notification.is_notified ? "default" : "secondary"}>
                                                {notification.is_notified ? 'Notified' : 'Pending'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this notification subscription?')) {
                                                        router.delete(route('admin.stock-notifications.destroy', notification.id));
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {notifications.links && notifications.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex space-x-2">
                                        {notifications.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(link.url, {}, { preserveState: true });
                                                    }
                                                }}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : link.url
                                                        ? 'bg-background border hover:bg-muted'
                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default StockNotificationsIndex;
