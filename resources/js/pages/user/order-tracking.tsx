import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Package, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import MainLayout from '@/layouts/app/main-layout';

interface TimelineItem {
    status: string;
    title: string;
    description: string;
    date?: string;
    completed: boolean;
    error?: boolean;
}

interface Order {
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

interface OrderTrackingProps {
    order: Order;
    timeline: TimelineItem[];
}

export default function OrderTracking({ order, timeline }: OrderTrackingProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency === 'ETB' ? 'USD' : order.currency,
        }).format(price).replace('$', order.currency + ' ');
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

    const getStatusIcon = (item: TimelineItem) => {
        if (item.error) {
            return <XCircle className="h-5 w-5 text-red-500" />;
        }
        if (item.completed) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        return <Clock className="h-5 w-5 text-gray-400" />;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'awaiting_admin_approval':
                return 'bg-orange-100 text-orange-800';
            case 'payment_rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'pending_approval':
                return 'outline';
            case 'awaiting_admin_approval':
                return 'outline';
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'failed':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const formatPaymentStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending_approval':
                return 'Awaiting Approval';
            case 'awaiting_admin_approval':
                return 'Awaiting Admin Approval';
            default:
                return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    return (
        <MainLayout title={`Track Order #${order.order_number} - ShopHub`}>
            <Head title={`Track Order #${order.order_number}`} />
            
            <div className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/user/orders/${order.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Order Details
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Track Order</h1>
                            <p className="text-gray-600">Order #{order.order_number}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                            {order.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Order Tracking Timeline */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Order Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {timeline.map((item, index) => (
                                        <div key={item.status} className="flex gap-4">
                                            {/* Timeline Icon */}
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                                    item.completed 
                                                        ? item.error 
                                                            ? 'border-red-500 bg-red-50' 
                                                            : 'border-green-500 bg-green-50'
                                                        : 'border-gray-300 bg-gray-50'
                                                }`}>
                                                    {getStatusIcon(item)}
                                                </div>
                                                {index < timeline.length - 1 && (
                                                    <div className={`mt-2 h-12 w-0.5 ${
                                                        item.completed && !item.error ? 'bg-green-500' : 'bg-gray-300'
                                                    }`} />
                                                )}
                                            </div>

                                            {/* Timeline Content */}
                                            <div className="flex-1 pb-8">
                                                <div className="flex items-center gap-3">
                                                    <h3 className={`font-semibold ${
                                                        item.completed 
                                                            ? item.error 
                                                                ? 'text-red-900' 
                                                                : 'text-green-900'
                                                            : 'text-gray-600'
                                                    }`}>
                                                        {item.title}
                                                    </h3>
                                                    {item.date && (
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(item.date)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`mt-1 text-sm ${
                                                    item.completed 
                                                        ? item.error 
                                                            ? 'text-red-700' 
                                                            : 'text-green-700'
                                                        : 'text-gray-500'
                                                }`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Order Number:</span>
                                        <span className="font-medium">{order.order_number}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Order Date:</span>
                                        <span className="font-medium">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-medium">{formatPrice(order.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium">{order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Type:</span>
                                        <span className="font-medium">{order.payment_method_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Status:</span>
                                        <Badge className="text-xs" variant={getPaymentStatusColor(order.payment_status)}>
                                            {formatPaymentStatus(order.payment_status)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`/user/orders/${order.id}`}>
                                    <Package className="mr-2 h-4 w-4" />
                                    View Order Details
                                </Link>
                            </Button>
                            
                            <Button asChild className="w-full" variant="outline">
                                <Link href={route('user.orders')}>
                                    All Orders
                                </Link>
                            </Button>

                            {order.payment_status === 'failed' && (
                                <Button className="w-full" variant="destructive">
                                    Retry Payment
                                </Button>
                            )}
                        </div>

                        {/* Help Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Need Help?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-3">
                                    If you have questions about your order, please contact our support team.
                                </p>
                                <Button variant="outline" size="sm" className="w-full">
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}