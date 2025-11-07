import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import MainLayout from '@/layouts/app/main-layout';
import { BreadcrumbItem, NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Bookmark,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    LayoutDashboard,
    Loader2,
    MessageSquare,
    Package,
    Package2,
    Settings,
    ShoppingBag,
    Truck,
    XCircle,
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    product_slug: string;
    quantity: number;
    price: number;
    total: number;
    primary_image?: string;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    payment_type: string;
    tx_ref: string;
    currency: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    item_count: number;
    product_summary: string;
    first_item_image?: string;
}

interface TrackingTimelineItem {
    status: string;
    title: string;
    description: string;
    date?: string | null;
    completed: boolean;
    error?: boolean;
}

interface TrackingOrderSummary {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    payment_method_type: string;
    total_amount: number;
    currency: string;
    created_at: string;
}

interface TrackingData {
    order: TrackingOrderSummary;
    timeline: TrackingTimelineItem[];
}

interface UserOrdersProps {
    orders: Order[];
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/user-dashboard',
    },
    {
        title: 'Orders',
        href: '/user-orders',
    },
];
const defaultMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/user-dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'BookMarked Products',
        href: '/user-wishlist',
        icon: Bookmark,
    },
    {
        title: 'Orders',
        href: '/user-order',
        icon: ShoppingBag,
    },
    {
        title: 'Requests',
        href: '/user-request',
        icon: MessageSquare,
    },
    {
        title: 'Bought Products',
        href: '/user-products',
        icon: Package2,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];
export default function UserOrders({ orders = [] }: UserOrdersProps) {
    const placeholderImage = '/placeholder.svg?height=100&width=100&query=product';
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const trackingRequestRef = useRef<number | null>(null);
    const hasProductShowRoute =
        typeof window !== 'undefined' &&
        Boolean(
            (window as typeof window & { Ziggy?: { routes?: Record<string, unknown> } }).Ziggy?.routes?.['products.show']
        );
    const hasTrackingDataRoute =
        typeof window !== 'undefined' &&
        Boolean(
            (window as typeof window & { Ziggy?: { routes?: Record<string, unknown> } }).Ziggy?.routes?.['user.orders.track-data']
        );

    const formatPrice = (price: number, currency = 'ETB') => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
            }).format(price);
        } catch (error) {
            return `${currency} ${price.toFixed(2)}`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    const formatStatusText = (status: string) => {
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('rejected') || statusLower === 'cancelled') {
            return 'bg-red-100 text-red-800';
        } else if (statusLower.includes('pending') || statusLower === 'awaiting') {
            return 'bg-yellow-100 text-yellow-800';
        } else if (statusLower === 'processing') {
            return 'bg-blue-100 text-blue-800';
        } else if (statusLower === 'shipped') {
            return 'bg-purple-100 text-purple-800';
        } else if (statusLower === 'delivered' || statusLower === 'completed') {
            return 'bg-green-100 text-green-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'paid' || statusLower === 'completed') {
            return 'bg-green-100 text-green-800';
        } else if (statusLower === 'pending_approval' || statusLower === 'awaiting_approval') {
            return 'bg-orange-100 text-orange-800';
        } else if (statusLower === 'pending') {
            return 'bg-yellow-100 text-yellow-800';
        } else if (statusLower === 'rejected' || statusLower === 'failed') {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    const getTimelineIcon = (item: TrackingTimelineItem) => {
        if (item.error) {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
        if (item.completed) {
            return <CheckCircle className="h-5 w-5 text-emerald-500" />;
        }
        return <Clock className="h-5 w-5 text-gray-400" />;
    };

    const getTimelineConnectorColor = (item: TrackingTimelineItem) => {
        if (item.error) {
            return 'bg-red-400';
        }
        if (item.completed) {
            return 'bg-emerald-500';
        }
        return 'bg-gray-300';
    };

    const getTrackingPaymentVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'pending_approval':
            case 'pending_payment_approval':
                return 'outline';
            case 'rejected':
            case 'failed':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const formatTrackingPaymentStatus = (status: string) => {
        const normalized = status.toLowerCase();
        if (normalized === 'pending_approval') {
            return 'Awaiting Approval';
        }
        if (normalized === 'pending_payment_approval') {
            return 'Pending Payment Approval';
        }
        return formatStatusText(status);
    };

    const getItemImage = (item: OrderItem, order: Order) => {
        if (item.primary_image) {
            return item.primary_image;
        }
        if (order.first_item_image) {
            return order.first_item_image;
        }
        return placeholderImage;
    };

    const getOrderPrimaryImage = (order: Order) => {
        if (order.first_item_image) {
            return order.first_item_image;
        }
        const firstWithImage = order.items.find((item) => item.primary_image);
        if (firstWithImage?.primary_image) {
            return firstWithImage.primary_image;
        }
        return placeholderImage;
    };

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setSelectedOrder(null);
        }
    };

    const handleTrackingDialogChange = (open: boolean) => {
        setIsTrackingDialogOpen(open);
        if (!open) {
            setTrackingData(null);
            setTrackingError(null);
            setTrackingOrder(null);
            setIsTrackingLoading(false);
            trackingRequestRef.current = null;
        }
    };

    const handleTrackClick = async (order: Order) => {
        setTrackingOrder(order);
        setIsTrackingDialogOpen(true);
        setTrackingError(null);
        setTrackingData(null);
        trackingRequestRef.current = order.id;

        try {
            setIsTrackingLoading(true);
            const fallbackUrl = `/user/orders/${order.id}/tracking-data`;
            const endpoint = hasTrackingDataRoute && typeof route === 'function' ? route('user.orders.track-data', order.id) : fallbackUrl;
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Tracking information is currently unavailable.');
            }

            const data: TrackingData = await response.json();
            if (trackingRequestRef.current === order.id) {
                setTrackingData(data);
            }
        } catch (error) {
            setTrackingError(error instanceof Error ? error.message : 'Unable to load tracking information.');
        } finally {
            if (trackingRequestRef.current === order.id) {
                setIsTrackingLoading(false);
            }
        }
    };

    return (
        <MainLayout title="My Orders - ShopHub" className={''} footerOff={false} contentMarginTop={'mt-[60px]'}>
            <AppLayout
                logoDisplay=" invisible"
                sidebarStyle="mt-[20px]"
                breadcrumbs={breadcrumbs}
                mainNavItems={defaultMainNavItems}
                footerNavItems={[]}
            >
                <div>
                    {/* Header */}

                    {orders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">No Orders Yet</h3>
                                <p className="mb-6 text-gray-600">You haven't placed any orders yet.</p>
                                <Button asChild>
                                    <Link href={route('home')}>Start Shopping</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card className="overflow-hidden border border-gray-100 shadow-sm">
                                <CardHeader className="border-b border-gray-100 bg-gray-50/70 py-5">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-semibold text-gray-900">Order History</CardTitle>
                                            <CardDescription>
                                                Review your orders, check statuses, and open any order for full details.
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="self-start border-dashed text-xs uppercase tracking-wide text-gray-600">
                                            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-0 pb-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[240px]">Order</TableHead>
                                                <TableHead className="min-w-[160px]">Placed</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow
                                                    key={order.id}
                                                    onClick={() => handleRowClick(order)}
                                                    className="cursor-pointer bg-white transition-colors hover:bg-muted/60"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={getOrderPrimaryImage(order)}
                                                                alt={order.product_summary || `Order ${order.order_number}`}
                                                                className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                                                            />
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-gray-900">Order #{order.order_number}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {order.item_count} {order.item_count === 1 ? 'item' : 'items'} • {order.product_summary}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">{formatDate(order.created_at)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(order.status)}>{formatStatusText(order.status)}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                                                            {formatStatusText(order.payment_status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-gray-900">{formatPrice(order.total_amount, order.currency)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="border-t border-gray-100 bg-white py-4 text-sm text-gray-500">
                                    Click any order row to open the detailed breakdown.
                                </CardFooter>
                            </Card>

                            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                                {selectedOrder && (
                                    <DialogContent className="w-[96vw] max-w-[1600px] gap-6 border border-gray-100 p-0 sm:w-[92vw] sm:max-w-none sm:p-8 lg:w-[88vw] xl:w-[85vw]">
                                        <DialogHeader className="space-y-3 border-b border-gray-100 pb-4">
                                            <DialogTitle className="text-2xl font-semibold text-gray-900">
                                                Order #{selectedOrder.order_number}
                                            </DialogTitle>
                                            <DialogDescription className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    Placed {formatDate(selectedOrder.created_at)}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                                    {formatPrice(selectedOrder.total_amount, selectedOrder.currency)}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                                        {formatStatusText(selectedOrder.status)}
                                                    </Badge>
                                                    <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                                                        {formatStatusText(selectedOrder.payment_status)}
                                                    </Badge>
                                                </span>
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                                                        Items ({selectedOrder.item_count})
                                                    </h3>
                                                    <span className="text-xs text-gray-400">{selectedOrder.product_summary}</span>
                                                </div>
                                                <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 bg-white">
                                                    {selectedOrder.items.map((item) => (
                                                        <div key={`${item.id}-${item.product_slug}`} className="flex gap-4 p-4">
                                                            <img
                                                                src={getItemImage(item, selectedOrder)}
                                                                alt={item.product_name}
                                                                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                                                            />
                                                            <div className="flex flex-1 flex-col gap-2">
                                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                                                    <Link
                                                                        href={hasProductShowRoute ? route('products.show', item.product_slug) : '#'}
                                                                        className="font-medium text-gray-900 hover:underline"
                                                                    >
                                                                        {item.product_name}
                                                                    </Link>
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        {formatPrice(item.price * item.quantity, selectedOrder.currency)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                    <span>Qty {item.quantity}</span>
                                                                    <span className="hidden sm:inline">•</span>
                                                                    <span>{formatPrice(item.price, selectedOrder.currency)} each</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Order Summary</h4>
                                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>Order total</span>
                                                        <span className="text-base font-semibold text-gray-900">
                                                            {formatPrice(selectedOrder.total_amount, selectedOrder.currency)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                        <span>
                                                            Payment reference:{' '}
                                                            <span className="font-medium text-gray-900">{selectedOrder.tx_ref || 'N/A'}</span>
                                                        </span>
                                                        <span>
                                                            Payment method:{' '}
                                                            <span className="font-medium text-gray-900">
                                                                {selectedOrder.payment_type} • {selectedOrder.payment_method}
                                                            </span>
                                                        </span>
                                                        <span>
                                                            Last updated:{' '}
                                                            <span className="font-medium text-gray-900">{formatDate(selectedOrder.updated_at)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Order Details</h4>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div className="flex justify-between">
                                                            <span>Order number</span>
                                                            <span className="font-medium text-gray-900">#{selectedOrder.order_number}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Payment status</span>
                                                            <span className="font-medium text-gray-900">{formatStatusText(selectedOrder.payment_status)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Order status</span>
                                                            <span className="font-medium text-gray-900">{formatStatusText(selectedOrder.status)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Currency</span>
                                                            <span className="font-medium text-gray-900">{selectedOrder.currency}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Transaction ref</span>
                                                            <span className="font-medium text-gray-900">{selectedOrder.tx_ref || '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500">
                                                    Need help with this order? Contact support with your reference{' '}
                                                    <span className="font-semibold text-gray-900">#{selectedOrder.order_number}</span>.
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                                            <Button
                                                size="sm"
                                                onClick={() => handleTrackClick(selectedOrder)}
                                                disabled={isTrackingLoading}
                                            >
                                                {isTrackingLoading && trackingOrder?.id === selectedOrder.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Package className="mr-2 h-4 w-4" />
                                                )}
                                                Track shipment
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                )}
                            </Dialog>

                            <Dialog open={isTrackingDialogOpen} onOpenChange={handleTrackingDialogChange}>
                                <DialogContent className="max-h-[90vh] w-[96vw] max-w-5xl gap-6 overflow-y-auto border border-gray-100 p-0 sm:w-[92vw] sm:max-w-none sm:p-8 lg:w-[80vw] xl:w-[70vw]">
                                    <DialogHeader className="space-y-3 border-b border-gray-100 pb-4">
                                        <DialogTitle className="text-2xl font-semibold text-gray-900">
                                            Track Order #{trackingData?.order.order_number ?? trackingOrder?.order_number ?? ''}
                                        </DialogTitle>
                                        <DialogDescription className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                            {trackingData?.order.created_at || trackingOrder?.created_at ? (
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    Placed {formatDate(trackingData?.order.created_at || trackingOrder?.created_at || '')}
                                                </span>
                                            ) : null}
                                            {trackingData ? (
                                                <>
                                                    <span className="flex items-center gap-2">
                                                        <Badge className={getStatusColor(trackingData.order.status)}>
                                                            {formatStatusText(trackingData.order.status)}
                                                        </Badge>
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Badge variant={getTrackingPaymentVariant(trackingData.order.payment_status)} className="text-xs">
                                                            {formatTrackingPaymentStatus(trackingData.order.payment_status)}
                                                        </Badge>
                                                    </span>
                                                </>
                                            ) : null}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {isTrackingLoading ? (
                                        <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-gray-500">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                            Loading tracking details...
                                        </div>
                                    ) : trackingError ? (
                                        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-sm text-red-600">
                                            <XCircle className="h-10 w-10 text-red-500" />
                                            <p>{trackingError}</p>
                                            <p className="text-xs text-gray-500">
                                                Please try again later or contact support with your order number.
                                            </p>
                                        </div>
                                    ) : trackingData ? (
                                        <div className="grid gap-6 lg:grid-cols-3">
                                            <div className="lg:col-span-2 space-y-6">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Truck className="h-5 w-5" />
                                                            Order Progress
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-8">
                                                            {trackingData.timeline.map((item, index) => (
                                                                <div key={`${item.status}-${index}`} className="flex gap-4">
                                                                    <div className="flex flex-col items-center">
                                                                        <div
                                                                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                                                                item.error
                                                                                    ? 'border-red-500 bg-red-50'
                                                                                    : item.completed
                                                                                    ? 'border-green-500 bg-green-50'
                                                                                    : 'border-gray-300 bg-gray-50'
                                                                            }`}
                                                                        >
                                                                            {getTimelineIcon(item)}
                                                                        </div>
                                                                        {index < trackingData.timeline.length - 1 && (
                                                                            <div className={`mt-2 h-12 w-0.5 ${getTimelineConnectorColor(item)}`} />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 pb-8">
                                                                        <div className="flex flex-wrap items-center gap-3">
                                                                            <h3
                                                                                className={`font-semibold ${
                                                                                    item.error
                                                                                        ? 'text-red-700'
                                                                                        : item.completed
                                                                                        ? 'text-green-700'
                                                                                        : 'text-gray-700'
                                                                                }`}
                                                                            >
                                                                                {item.title}
                                                                            </h3>
                                                                            {item.date ? (
                                                                                <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                                                                            ) : null}
                                                                        </div>
                                                                        <p
                                                                            className={`mt-1 text-sm ${
                                                                                item.error
                                                                                    ? 'text-red-600'
                                                                                    : item.completed
                                                                                    ? 'text-green-600'
                                                                                    : 'text-gray-500'
                                                                            }`}
                                                                        >
                                                                            {item.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            <div className="space-y-6">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Package className="h-5 w-5" />
                                                            Order Summary
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="space-y-2 text-sm text-gray-600">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Order Number</span>
                                                                <span className="font-medium text-gray-900">#{trackingData.order.order_number}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Order Date</span>
                                                                <span className="font-medium text-gray-900">{formatDate(trackingData.order.created_at)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Total Amount</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {formatPrice(trackingData.order.total_amount, trackingData.order.currency)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Payment Method</span>
                                                                <span className="font-medium text-gray-900">{trackingData.order.payment_method}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Payment Type</span>
                                                                <span className="font-medium text-gray-900">{trackingData.order.payment_method_type}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Payment Status</span>
                                                                <Badge variant={getTrackingPaymentVariant(trackingData.order.payment_status)} className="text-xs">
                                                                    {formatTrackingPaymentStatus(trackingData.order.payment_status)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="space-y-3">
                                                    <Button asChild className="w-full" variant="outline">
                                                        <Link href={`/user/orders/${trackingData.order.id}`}>
                                                            <Package className="mr-2 h-4 w-4" />
                                                            View Order Details
                                                        </Link>
                                                    </Button>
                                                    <Button asChild className="w-full" variant="outline">
                                                        <Link href={route('user.orders')}>
                                                            All Orders
                                                        </Link>
                                                    </Button>
                                                    {trackingData.order.payment_status === 'failed' && (
                                                        <Button className="w-full" variant="destructive">
                                                            Retry Payment
                                                        </Button>
                                                    )}
                                                </div>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-base">Need Help?</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="mb-3 text-sm text-gray-600">
                                                            If you have questions about your order, please contact our support team.
                                                        </p>
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            Contact Support
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                                            Tracking information is unavailable for this order.
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </AppLayout>
        </MainLayout>
    );
}
