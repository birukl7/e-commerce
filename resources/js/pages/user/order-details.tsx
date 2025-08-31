import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/main-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard, DollarSign, MapPin, Package, Truck } from 'lucide-react';

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
    status: string;
    payment_status: string;
    payment_method: string;
    payment_method_type: string;
    currency: string;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    shipping_method: string;
    created_at: string;
    updated_at: string;
    shipped_at?: string;
    delivered_at?: string;
    items: OrderItem[];
}

interface OrderDetailsProps {
    order: Order;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency === 'ETB' ? 'USD' : order.currency,
        })
            .format(price)
            .replace('$', order.currency + ' ');
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
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending_approval':
                return 'bg-orange-100 text-orange-800';
            case 'awaiting_admin_approval':
                return 'bg-orange-100 text-orange-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPaymentStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending_approval':
                return 'Awaiting Approval';
            case 'awaiting_admin_approval':
                return 'Awaiting Admin Approval';
            default:
                return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        }
    };

    return (
        <MainLayout title={`Order #${order.order_number} - ShopHub`}>
            <Head title={`Order #${order.order_number}`} />

            <div className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('user.orders')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Orders
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
                            <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                        <img
                                            src={item.primary_image || '/placeholder.svg?height=80&width=80&query=product'}
                                            alt={item.product_name}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <Link href={`/products/${item.product_slug}`} className="font-medium hover:text-primary">
                                                {item.product_name}
                                            </Link>
                                            <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                                                <span>Qty: {item.quantity}</span>
                                                <span>Price: {formatPrice(item.price)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatPrice(item.total)}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary & Details */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                {order.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Tax:</span>
                                        <span>{formatPrice(order.tax_amount)}</span>
                                    </div>
                                )}
                                {order.shipping_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping:</span>
                                        <span>{formatPrice(order.shipping_amount)}</span>
                                    </div>
                                )}
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Discount:</span>
                                        <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-3 font-semibold">
                                    <span>Total:</span>
                                    <span>{formatPrice(order.total_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Type:</span>
                                        <span className="font-medium">{order.payment_method_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment Status:</span>
                                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                                            {formatPaymentStatus(order.payment_status)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>

                                {/* Order Items in Payment Details */}
                            </CardContent>
                        </Card>

                        {/* Shipping Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Shipping Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Shipping Method:</span>
                                    <span className="capitalize">{order.shipping_method}</span>
                                </div>
                                {order.shipped_at && (
                                    <div className="flex justify-between text-sm">
                                        <span>Shipped At:</span>
                                        <span>{formatDate(order.shipped_at)}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex justify-between text-sm">
                                        <span>Delivered At:</span>
                                        <span>{formatDate(order.delivered_at)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link href={`/user/orders/${order.id}/track`}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Track Order
                                </Link>
                            </Button>

                            {order.payment_status === 'failed' && (
                                <Button variant="outline" className="w-full">
                                    Retry Payment
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
