'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import H1 from '@/components/ui/h1';
import MainLayout from '@/layouts/app/main-layout';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Download, Package, Mail, Truck, Clock, Sparkles, BrickWallIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductImages, { ProductItem } from '@/components/ProductImages';

interface PaymentSuccessProps {
    order_id: string | null;
    transaction_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    customer_name: string;
    customer_email: string;
    order_items?: ProductItem[];
    pending_payment_approval?: boolean;
    // Advance payment context
    payment_type?: string;
    product_request_id?: number;
    is_advance_payment?: boolean;
    // Warning message for edge cases
    warning_message?: string;
    show_contact_support?: boolean;
}

function PaymentSuccessContent({
    order_id,
    transaction_id,
    amount,
    currency = 'ETB',
    payment_method,
    customer_name,
    customer_email,
    order_items = [],
    pending_payment_approval = false,
    payment_type,
    product_request_id,
    is_advance_payment = false,
    warning_message,
    show_contact_support = false,
}: PaymentSuccessProps) {
    // Clear cart when payment is successful

    console.log("order_items", order_items);
    useEffect(() => {
        // Clear cart from localStorage directly since this is a standalone page
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
        }
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const formatDate = (date: Date | string = new Date()) => {
        // Handle both Date objects and date strings from backend
        let dateObj: Date;
        if (typeof date === 'string') {
            // Backend sends dates in UTC format (without timezone indicator)
            // We need to explicitly parse it as UTC, then convert to user's local timezone
            if (date.includes('T') && (date.endsWith('Z') || date.includes('+'))) {
                // Already has timezone info
                dateObj = new Date(date);
            } else {
                // No timezone info - assume UTC and append 'Z'
                const utcString = date.replace(' ', 'T') + 'Z';
                dateObj = new Date(utcString);
            }
        } else {
            dateObj = date;
        }
        
        // Get user's timezone to properly convert UTC dates from backend
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: tz, // Use user's local timezone (GMT+3)
        }).format(dateObj);
    };

    // Celebration animation state
    const [showCelebration, setShowCelebration] = useState(true);

    useEffect(() => {
        // Hide celebration after animation
        const timer = setTimeout(() => setShowCelebration(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleDownloadReceipt = () => {
        // Create receipt content
        const receiptContent = `
Payment Receipt

Order ID: ${order_id}
Transaction ID: ${transaction_id}
Date: ${formatDate()}
Customer: ${customer_name}
Email: ${customer_email}

Payment Details:
- Amount: ${formatPrice(amount)}
- Payment Method: ${payment_method}
- Status: ${pending_payment_approval ? 'Pending Admin Approval' : 'Completed'}

Items:
${order_items.map((item) => `- ${item.name} (Qty: ${item.quantity}) - ${formatPrice(item.price * item.quantity)}`).join('\n')}

Total: ${formatPrice(amount)}

Thank you for your purchase!
        `.trim();

        // Create blob and download
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${order_id}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <MainLayout title="Payment Successful - ShopHub" >
            <div className="min-h-screen ">

                {/* Success Header with Gradient */}
                <div className="mb-12 text-center relative">
                    <div className="relative inline-block">
                        {/* Animated Success Icon */}
                        <div className="relative mb-6">
                            <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200">
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        
                        <H1 className="">
                            Payment Successful!
                        </H1>
                        <p className="text-xl text-gray-700 mb-2">
                            Thank you for your purchase, <span className="font-semibold text-gray-900">{customer_name}</span>
                        </p>
                        {order_id && (
                            <p className="text-sm text-gray-500">
                                Order #{order_id}
                            </p>
                        )}
                        
                        {warning_message && (
                            <div className="mx-auto mt-6 max-w-2xl rounded-lg border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 p-4 shadow-md">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-orange-800 mb-2">
                                            {warning_message}
                                        </p>
                                        {show_contact_support && (
                                            <p className="text-xs text-orange-700">
                                                If you have any questions, please contact our support team with your transaction reference.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {pending_payment_approval && !warning_message && (
                            <div className="mx-auto mt-6 max-w-2xl rounded-lg border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 shadow-md">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <p className="text-sm font-medium text-yellow-800">
                                        Payment received and verified by the gateway. Your order will proceed after an admin reviews and approves the payment.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Order Details */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="border-2 border-green-100 shadow-xl bg-white/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 rounded-lg bg-green-100">
                                            <Package className="h-6 w-6 text-green-600" />
                                        </div>
                                        Order Details
                                    </CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        {pending_payment_approval
                                            ? 'Your payment was received and is awaiting admin approval.'
                                            : 'Your order has been confirmed and is being processed.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {order_id && (
                                            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                                <p className="text-sm font-medium text-gray-500 mb-1">Order ID</p>
                                                <p className="font-mono font-bold text-gray-900 text-lg">{order_id}</p>
                                            </div>
                                        )}
                                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Transaction ID</p>
                                            <p className="font-mono font-bold text-gray-900 text-lg break-all">{transaction_id}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Payment Method</p>
                                            <p className="font-semibold text-gray-900 capitalize text-lg">{payment_method}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Order Date</p>
                                            <p className="font-semibold text-gray-900 text-lg">{formatDate()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Images */}
                            {order_items && order_items.length > 0 && (
                                <ProductImages
                                    items={order_items}
                                    title="Ordered Products"
                                    showQuantity={true}
                                    showPrice={true}
                                />
                            )}

                            {/* Next Steps */}
                            <Card className="border-2 border-blue-100 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <Sparkles className="h-6 w-6 text-blue-600" />
                                        What's Next?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-blue-200">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold shadow-md flex-shrink-0">
                                                1
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    <h4 className="font-bold text-gray-900">Order Confirmation</h4>
                                                </div>
                                                <p className="text-sm text-gray-700">We've sent a confirmation email to <span className="font-semibold">{customer_email}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-blue-200">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold shadow-md flex-shrink-0">
                                                2
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <h4 className="font-bold text-gray-900">Processing</h4>
                                                </div>
                                                <p className="text-sm text-gray-700">Your order is being prepared for shipment</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-lg bg-white/40 backdrop-blur-sm border border-gray-200">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white font-bold shadow-md flex-shrink-0">
                                                3
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Truck className="h-4 w-4 text-gray-600" />
                                                    <h4 className="font-bold text-gray-600">Shipping</h4>
                                                </div>
                                                <p className="text-sm text-gray-600">You'll receive tracking information once shipped</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4 border-2 border-green-200 shadow-2xl bg-gradient-to-br from-white to-green-50">
                                <CardHeader >
                                    <CardTitle className="text-2xl flex items-center justify-between">
                                        <span>Payment Summary</span>
                                        <BrickWallIcon className="h-6 w-6" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                            <p className="text-sm font-medium text-gray-600 mb-2">Total Paid</p>
                                            <p className="text-3xl font-bold text-green-600">{formatPrice(amount)}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                                                <span className="text-sm font-medium text-gray-600">Payment Method</span>
                                                <span className="font-semibold capitalize text-gray-900">{payment_method}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                                                <span className="text-sm font-medium text-gray-600">Status</span>
                                                {pending_payment_approval ? (
                                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                                                        Pending Approval
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t-2 border-gray-200 pt-6">
                                        {is_advance_payment ? (
                                            // Advance payment navigation
                                            <>
                                                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all duration-200" size="lg" asChild>
                                                    <Link href={route('user.product-requests.show', product_request_id)}>
                                                        <Package className="mr-2 h-5 w-5" />
                                                        Back to Product Request
                                                    </Link>
                                                </Button>

                                                <Button variant="outline" className="w-full border-2 hover:bg-green-50 transition-all duration-200" size="lg" onClick={handleDownloadReceipt}>
                                                    <Download className="mr-2 h-5 w-5" />
                                                    Download Receipt
                                                </Button>

                                                <Button variant="ghost" className="w-full hover:bg-gray-100 transition-all duration-200" asChild>
                                                    <Link href={route('request.index')}>
                                                        View All Requests
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </>
                                        ) : (
                                            // Regular order navigation
                                            <>
                                                {order_id ? (
                                                    <Button className="w-full  text-white shadow-lg transition-all duration-200" size="lg" asChild>
                                                        <Link href={route('user.orders.show', order_id)}>
                                                            <Package className="mr-2 h-5 w-5" />
                                                            View Order Details
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button className="w-full  text-white shadow-lg transition-all duration-200" size="lg" asChild>
                                                        <Link href={route('user.orders')}>
                                                            <Package className="mr-2 h-5 w-5" />
                                                            View My Orders
                                                        </Link>
                                                    </Button>
                                                )}

                                                <Button variant="outline" className="w-full border-2 hover:bg-green-50 transition-all duration-200" size="lg" onClick={handleDownloadReceipt}>
                                                    <Download className="mr-2 h-5 w-5" />
                                                    Download Receipt
                                                </Button>

                                                <Button variant="ghost" className="w-full hover:bg-gray-100 transition-all duration-200" asChild>
                                                    <Link href={route('home')}>
                                                        Continue Shopping
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default function PaymentSuccess(props: PaymentSuccessProps) {
    return <PaymentSuccessContent {...props} />;
}
