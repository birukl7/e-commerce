'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Download, Package } from 'lucide-react';
import { useEffect } from 'react';
import MainLayout from '@/layouts/app/main-layout';

interface PaymentSuccessProps {
    order_id: string;
    transaction_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    customer_name: string;
    customer_email: string;
    order_items?: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
        image?: string;
    }>;
    awaiting_admin_approval?: boolean;
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
    awaiting_admin_approval = false,
}: PaymentSuccessProps) {
    // Clear cart when payment is successful
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

    const formatDate = (date: Date = new Date()) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

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
- Status: ${awaiting_admin_approval ? 'Pending Admin Approval' : 'Completed'}

Items:
${order_items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ${formatPrice(item.price * item.quantity)}`).join('\n')}

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
        <MainLayout title="Payment Successful - ShopHub">
            <div className="py-12">
                {/* Success Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-lg text-gray-600">Thank you for your purchase, {customer_name}</p>
                    {awaiting_admin_approval && (
                        <div className="mx-auto mt-4 max-w-2xl rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                            Payment received and verified by the gateway. Your order will proceed after an admin reviews and approves the payment.
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Order Details */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order Details
                                </CardTitle>
                                <CardDescription>
                                    {awaiting_admin_approval
                                        ? 'Your payment was received and is awaiting admin approval.'
                                        : 'Your order has been confirmed and is being processed.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Order ID</p>
                                        <p className="font-mono font-semibold">{order_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Transaction ID</p>
                                        <p className="font-mono font-semibold">{transaction_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Method</p>
                                        <p className="font-semibold capitalize">{payment_method}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Order Date</p>
                                        <p className="font-semibold">{formatDate()}</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                {order_items.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h4 className="mb-3 font-semibold">Items Ordered</h4>
                                        <div className="space-y-3">
                                            {order_items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <img
                                                        src={item.image || '/placeholder.svg?height=50&width=50&query=product'}
                                                        alt={item.name}
                                                        className="h-12 w-12 rounded-md object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What's Next?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Order Confirmation</h4>
                                            <p className="text-sm text-gray-600">We've sent a confirmation email to {customer_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Processing</h4>
                                            <p className="text-sm text-gray-600">Your order is being prepared for shipment</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-600">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-600">Shipping</h4>
                                            <p className="text-sm text-gray-600">You'll receive tracking information once shipped</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Paid</span>
                                        <span className="text-lg font-bold text-green-600">{formatPrice(amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Payment Method</span>
                                        <span className="capitalize">{payment_method}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Status</span>
                                        {awaiting_admin_approval ? (
                                            <span className="font-semibold text-yellow-600">Pending Admin Approval</span>
                                        ) : (
                                            <span className="font-semibold text-green-600">Completed</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <Button className="w-full" asChild>
                                        <Link href={route('user.orders')}>
                                            <Package className="mr-2 h-4 w-4" />
                                            View Order Details
                                        </Link>
                                    </Button>

                                    <Button 
                                        variant="outline" 
                                        className="w-full bg-transparent"
                                        onClick={handleDownloadReceipt}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Receipt
                                    </Button>

                                    <Button variant="ghost" className="w-full" asChild>
                                        <Link href={route('home')}>
                                            Continue Shopping
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default function PaymentSuccess(props: PaymentSuccessProps) {
    return <PaymentSuccessContent {...props} />;
}
