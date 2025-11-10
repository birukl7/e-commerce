import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/main-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, DollarSign, MapPin, Package, Truck, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

interface PaymentTransaction {
    id: number;
    admin_status: string;
    rejection_reason_code: string | null;
    rejection_reason: {
        reason_text: string;
        description?: string;
    } | null;
    admin_notes: string | null;
}

interface OrderDetailsProps {
    order: Order;
    taxBreakdown?: Array<{ id: number; name: string; type: 'percentage' | 'fixed'; rate: number; amount: number; formatted_rate: string; description?: string }>;
    paymentTransaction?: PaymentTransaction | null;
}

export default function OrderDetails({ order, taxBreakdown = [], paymentTransaction }: OrderDetailsProps) {
    const { t } = useTranslation()
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency === 'ETB' ? 'USD' : order.currency,
        })
            .format(price)
            .replace('$', order.currency + ' ');
    };

    const formatDate = (dateString: string) => {
        // Backend sends dates in UTC format (without timezone indicator)
        // We need to explicitly parse it as UTC, then convert to user's local timezone
        let date: Date;
        if (dateString.includes('T') && (dateString.endsWith('Z') || dateString.includes('+'))) {
            // Already has timezone info
            date = new Date(dateString);
        } else {
            // No timezone info - assume UTC and append 'Z'
            const utcString = dateString.replace(' ', 'T') + 'Z';
            date = new Date(utcString);
        }
        
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: tz, // Use user's local timezone (GMT+3)
        }).format(date);
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
            case 'pending_payment_approval':
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
            case 'pending_payment_approval':
                return 'Pending Payment Approval';
            default:
                return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        }
    };

    return (
        <MainLayout title={`${t('orders.order')} #${order.order_number} - Serdo`}>
            <Head title={`${t('orders.order')} #${order.order_number}`} />

            <div className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('user.orders')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('orders.backToOrders')}
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('orders.order')} #{order.order_number}</h1>
                            <p className="text-gray-600">{t('orders.placedOn')} {formatDate(order.created_at)}</p>
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
                                    {t('orders.orderItems')}
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
                                                <span>{t('orders.qty')} {item.quantity}</span>
                                                <span>{t('orders.price')} {formatPrice(item.price)}</span>
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
                                    {t('orders.orderSummary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>{t('orders.subtotal')}</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                {/* Show only total tax to customers; see breakdown link below */}
                                {order.tax_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>{t('orders.tax')}</span>
                                        <span>{formatPrice(order.tax_amount)}</span>
                                    </div>
                                )}
                                {order.tax_amount > 0 && (
                                    <div className="text-xs text-gray-500">
                                        <Link className="underline hover:text-gray-700" href={route('tax.info')}>
                                            {t('checkout.howWeCalculateTax')}
                                        </Link>
                                    </div>
                                )}
                                {order.shipping_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>{t('orders.shipping')}</span>
                                        <span>{formatPrice(order.shipping_amount)}</span>
                                    </div>
                                )}
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>{t('orders.discount')}</span>
                                        <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-3 font-semibold">
                                    <span>{t('orders.total')}</span>
                                    <span>{formatPrice(order.total_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    {t('orders.paymentDetails')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.paymentMethod')}</span>
                                        <span className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.paymentType')}</span>
                                        <span className="font-medium">{order.payment_method_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.paymentStatus')}</span>
                                        <Badge className={getPaymentStatusColor(order.payment_status)}>
                                            {formatPaymentStatus(order.payment_status)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orders.totalAmount')}</span>
                                        <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>

                                {/* Payment Rejection Information */}
                                {paymentTransaction?.admin_status === 'rejected' && (
                                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            <p className="font-medium text-red-800">Payment Rejected</p>
                                        </div>
                                        {paymentTransaction.rejection_reason && (
                                            <div className="text-sm text-red-700">
                                                <p className="font-medium">Reason: {paymentTransaction.rejection_reason.reason_text}</p>
                                                {paymentTransaction.rejection_reason.description && (
                                                    <p className="text-xs mt-1 text-red-600">{paymentTransaction.rejection_reason.description}</p>
                                                )}
                                            </div>
                                        )}
                                        {paymentTransaction.admin_notes && (
                                            <p className="text-sm text-red-700">Additional notes: {paymentTransaction.admin_notes}</p>
                                        )}
                                        <Button
                                            className="w-full bg-red-600 hover:bg-red-700"
                                            onClick={() => {
                                                router.post(route('payments.retry', paymentTransaction.id), {}, {
                                                    preserveScroll: true,
                                                })
                                            }}
                                        >
                                            Retry Payment
                                        </Button>
                                    </div>
                                )}

                                {/* Order Items in Payment Details */}
                            </CardContent>
                        </Card>

                        {/* Shipping Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    {t('orders.shippingDetails')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>{t('orders.shippingMethod')}</span>
                                    <span className="capitalize">{order.shipping_method}</span>
                                </div>
                                {order.shipped_at && (
                                    <div className="flex justify-between text-sm">
                                        <span>{t('orders.shippedAt')}</span>
                                        <span>{formatDate(order.shipped_at)}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex justify-between text-sm">
                                        <span>{t('orders.deliveredAt')}</span>
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
                                    {t('orders.trackOrder')}
                                </Link>
                            </Button>

                            {order.payment_status === 'failed' && !paymentTransaction && (
                                <Button variant="outline" className="w-full">
                                    {t('orders.retryPayment')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
