import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Package, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import MainLayout from '@/layouts/app/main-layout';
import { useTranslation } from 'react-i18next';

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

interface OrderTrackingProps {
    order: Order;
    timeline: TimelineItem[];
    paymentTransaction?: PaymentTransaction | null;
}

export default function OrderTracking({ order, timeline, paymentTransaction }: OrderTrackingProps) {
    const { t } = useTranslation()
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
            case 'pending_payment_approval':
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
            case 'pending_payment_approval':
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
            case 'pending_payment_approval':
                return 'Pending Payment Approval';
            default:
                return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    return (
        <MainLayout title={`${t('orderTracking.trackOrder')} #${order.order_number} - ShopHub`}>
            <Head title={`${t('orderTracking.trackOrder')} #${order.order_number}`} />
            
            <div className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/user/orders/${order.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('orderTracking.backToOrderDetails')}
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('orderTracking.trackOrder')}</h1>
                            <p className="text-gray-600">{t('orders.order')} #{order.order_number}</p>
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
                                    {t('orderTracking.orderProgress')}
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
                                    {t('orderTracking.orderSummary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orderTracking.orderNumber')}</span>
                                        <span className="font-medium">{order.order_number}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orderTracking.orderDate')}</span>
                                        <span className="font-medium">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orderTracking.totalAmount')}</span>
                                        <span className="font-medium">{formatPrice(order.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orderTracking.paymentMethod')}</span>
                                        <span className="font-medium">{order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orderTracking.paymentType')}</span>
                                        <span className="font-medium">{order.payment_method_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('orderTracking.paymentStatus')}</span>
                                        <Badge className="text-xs" variant={getPaymentStatusColor(order.payment_status)}>
                                            {formatPaymentStatus(order.payment_status)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Rejection Information */}
                        {paymentTransaction?.admin_status === 'rejected' && (
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
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
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`/user/orders/${order.id}`}>
                                    <Package className="mr-2 h-4 w-4" />
                                    {t('orderTracking.viewOrderDetails')}
                                </Link>
                            </Button>
                            
                            <Button asChild className="w-full" variant="outline">
                                <Link href={route('user.orders')}>
                                    {t('orderTracking.allOrders')}
                                </Link>
                            </Button>

                            {order.payment_status === 'failed' && !paymentTransaction && (
                                <Button className="w-full" variant="destructive">
                                    {t('orders.retryPayment')}
                                </Button>
                            )}
                        </div>

                        {/* Help Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{t('orderTracking.needHelp')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-3">
                                    {t('orderTracking.questionsAboutOrder')}
                                </p>
                                <Button variant="outline" size="sm" className="w-full">
                                    {t('orderTracking.contactSupport')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}