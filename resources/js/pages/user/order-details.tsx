import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/app/main-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    MapPin,
    RotateCcw,
    XCircle,
    Copy,
    Check,
    CreditCard,
    ShoppingBag,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OrderItem {
    id: number;
    product_name: string;
    product_slug?: string;
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
    customer_name?: string;
    customer_email?: string;
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
    taxBreakdown?: Array<{
        id: number;
        name: string;
        type: 'percentage' | 'fixed';
        rate: number;
        amount: number;
        formatted_rate: string;
        description?: string;
    }>;
    paymentTransaction?: PaymentTransaction | null;
}

export default function OrderDetails({
    order,
    paymentTransaction,
}: OrderDetailsProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency === 'ETB' ? 'USD' : order.currency,
        })
            .format(price)
            .replace('$', order.currency + ' ');
    };

    const formatDate = (dateString: string) => {
        let date: Date;
        if (dateString.includes('T') && (dateString.endsWith('Z') || dateString.includes('+'))) {
            date = new Date(dateString);
        } else {
            const utcString = dateString.replace(' ', 'T') + 'Z';
            date = new Date(utcString);
        }

        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(date);
    };

    const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(order.order_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isPaid = order.payment_status.toLowerCase() === 'paid';
    const isPendingApproval =
        order.payment_status.toLowerCase() === 'pending_approval' ||
        order.payment_status.toLowerCase() === 'pending_payment_approval';
    const isRejected = order.payment_status.toLowerCase() === 'rejected';

    const customerInitial = (order.customer_name || 'U').slice(0, 2).toUpperCase();

    return (
        <MainLayout title={`Order #${order.order_number} - Serdo`}>
            <Head title={`Order #${order.order_number}`} />

            <div className="min-h-screen bg-[#F6F8FA] py-10 px-4 sm:px-6">
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Navigation bar */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-200/60"
                        >
                            <Link href={route('user.orders')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('orders.backToOrders', 'Back to orders')}
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-white border-neutral-200 shadow-xs hover:bg-neutral-50 text-xs text-neutral-700"
                            onClick={() => {
                                try {
                                    const receiptUrl = route('user.orders.receipt', order.id);
                                    window.open(receiptUrl, '_blank');
                                } catch (error) {
                                    console.error('Error downloading receipt:', error);
                                }
                            }}
                        >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            {t('downloadReceipt', 'Receipt')}
                        </Button>
                    </div>

                    {/* ========================================================= */}
                    {/* TICKET / ORDER RECEIPT CARD (Signature Design)             */}
                    {/* ========================================================= */}
                    <div className="relative bg-white rounded-[32px] shadow-xl border border-neutral-200/80 overflow-hidden">
                        {/* Top Celebration Section */}
                        <div className="pt-10 pb-6 px-8 text-center flex flex-col items-center">
                            {/* Party Popper / Celebration Icon */}
                            <div className="relative mb-4 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center shadow-inner">
                                    <span className="text-3xl select-none" role="img" aria-label="party">
                                        🎉
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                                {isPaid
                                    ? 'Thank you!'
                                    : isPendingApproval
                                    ? 'Payment Submitted!'
                                    : isRejected
                                    ? 'Payment Attention Needed'
                                    : 'Order Confirmed!'}
                            </h1>
                            <p className="text-sm text-neutral-500 mt-1 max-w-sm">
                                {isPaid
                                    ? 'Your payment was successful and your order is confirmed'
                                    : isPendingApproval
                                    ? 'Your payment receipt was received and is awaiting quick admin approval'
                                    : isRejected
                                    ? 'There was an issue verifying your payment proof'
                                    : 'Your order has been recorded and is ready for fulfillment'}
                            </p>
                        </div>

                        {/* Ticket Perforated Divider with Side Cutouts */}
                        <div className="relative flex items-center px-4 my-2">
                            {/* Left cutout circle */}
                            <div className="absolute -left-4 w-8 h-8 rounded-full bg-[#F6F8FA] border-r border-neutral-200/80" />
                            {/* Dashed line */}
                            <div className="w-full border-t-2 border-dashed border-neutral-200 mx-5" />
                            {/* Right cutout circle */}
                            <div className="absolute -right-4 w-8 h-8 rounded-full bg-[#F6F8FA] border-l border-neutral-200/80" />
                        </div>

                        {/* Ticket Meta Section */}
                        <div className="px-8 pt-5 pb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                                        Order Number
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <p className="font-extrabold text-neutral-900 text-sm sm:text-base tracking-tight font-mono">
                                            {order.order_number}
                                        </p>
                                        <button
                                            onClick={handleCopyOrderNumber}
                                            className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
                                            title="Copy Order Number"
                                        >
                                            {copied ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                                        Amount
                                    </span>
                                    <p className="font-extrabold text-emerald-700 text-lg sm:text-xl tracking-tight mt-0.5">
                                        {formatPrice(order.total_amount)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
                                    Date & Time
                                </span>
                                <p className="font-semibold text-neutral-800 text-sm mt-0.5">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>

                            {/* Customer Profile Pill (Ticket Style) */}
                            <div className="mt-6 flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-neutral-200/80">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0">
                                        {customerInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-neutral-900 truncate">
                                            {order.customer_name || 'Customer'}
                                        </p>
                                        <p className="text-xs text-neutral-400 truncate">
                                            {order.customer_email || '••••••••'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-neutral-200 text-neutral-700">
                                        <CreditCard className="w-3 h-3 text-neutral-500" />
                                        <span className="capitalize">{order.payment_method}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Products Bought Section */}
                        <div className="px-8 pb-6">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-neutral-500" />
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Purchased Products ({order.items.length})
                                    </h2>
                                </div>
                            </div>

                            <div className="divide-y divide-neutral-100">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="py-3.5 flex items-center justify-between gap-3"
                                    >
                                        {/* Product Image & Name */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-xl border border-neutral-200/80 bg-neutral-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {item.primary_image ? (
                                                    <img
                                                        src={item.primary_image}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg">📦</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                {item.product_slug ? (
                                                    <Link
                                                        href={`/products/${item.product_slug}`}
                                                        className="text-xs sm:text-sm font-bold text-neutral-900 hover:text-emerald-700 transition-colors line-clamp-1"
                                                    >
                                                        {item.product_name}
                                                    </Link>
                                                ) : (
                                                    <p className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-1">
                                                        {item.product_name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-neutral-400 mt-0.5">
                                                    Qty: <span className="font-semibold text-neutral-700">{item.quantity}</span> × {formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total Item Price */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs sm:text-sm font-bold text-neutral-900">
                                                {formatPrice(item.total)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-xs">
                                <div className="flex justify-between text-neutral-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-neutral-800">
                                        {formatPrice(order.subtotal)}
                                    </span>
                                </div>

                                {order.tax_amount > 0 && (
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Tax</span>
                                        <span className="font-semibold text-neutral-800">
                                            {formatPrice(order.tax_amount)}
                                        </span>
                                    </div>
                                )}

                                {order.shipping_amount > 0 && (
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Shipping</span>
                                        <span className="font-semibold text-neutral-800">
                                            {formatPrice(order.shipping_amount)}
                                        </span>
                                    </div>
                                )}

                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount</span>
                                        <span>-{formatPrice(order.discount_amount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-baseline pt-3 border-t border-neutral-200">
                                    <span className="text-sm font-bold text-neutral-900">Total</span>
                                    <span className="text-lg font-extrabold text-neutral-900">
                                        {formatPrice(order.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rejection Notice (if applicable) */}
                        {paymentTransaction?.admin_status === 'rejected' && (
                            <div className="mx-8 mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                                    <p className="text-xs font-bold text-rose-900">Payment Rejected</p>
                                </div>
                                {paymentTransaction.rejection_reason && (
                                    <p className="text-xs text-rose-700">
                                        Reason: {paymentTransaction.rejection_reason.reason_text}
                                    </p>
                                )}
                                {paymentTransaction.admin_notes && (
                                    <p className="text-xs text-rose-600">
                                        Notes: {paymentTransaction.admin_notes}
                                    </p>
                                )}
                                <Button
                                    size="sm"
                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                                    onClick={() => {
                                        router.post(
                                            route('payments.retry', paymentTransaction.id),
                                            {},
                                            { preserveScroll: true }
                                        );
                                    }}
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                    Retry Payment Proof
                                </Button>
                            </div>
                        )}

                        {/* Bottom Barcode / Ticket Cutout Section */}
                        <div className="relative pt-4 pb-8 px-8 flex flex-col items-center justify-center bg-white border-t border-dashed border-neutral-200">
                            {/* Realistic Barcode Graphic */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="h-12 w-52 flex items-stretch justify-center gap-[2.5px] px-2 py-1 select-none"
                                    aria-hidden="true"
                                >
                                    {/* Procedural Barcode lines matching the ticket style */}
                                    {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2].map(
                                        (width, i) => (
                                            <span
                                                key={i}
                                                className="bg-neutral-900"
                                                style={{ width: `${width}px` }}
                                            />
                                        )
                                    )}
                                </div>
                                <span className="font-mono text-[11px] text-neutral-500 tracking-[0.25em] mt-1 select-all">
                                    {order.order_number.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}
                                </span>
                            </div>

                            {/* Scalloped ticket bottom cutouts */}
                            <div className="absolute -bottom-2.5 left-0 right-0 flex justify-between px-3 overflow-hidden pointer-events-none">
                                {Array.from({ length: 14 }).map((_, idx) => (
                                    <span
                                        key={idx}
                                        className="w-5 h-5 rounded-full bg-[#F6F8FA] border-t border-neutral-200/80 flex-shrink-0"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                            variant="outline"
                            asChild
                            className="rounded-full bg-white border-neutral-200 shadow-xs hover:bg-neutral-50 text-xs text-neutral-700"
                        >
                            <Link href={`/user/orders/${order.id}/track`}>
                                <MapPin className="mr-1.5 h-3.5 w-3.5 text-neutral-500" />
                                {t('orders.trackOrder', 'Track Order')}
                            </Link>
                        </Button>

                        <Button
                            asChild
                            className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-5 shadow-xs"
                        >
                            <Link href="/">
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
