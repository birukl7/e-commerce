'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CartProvider } from '@/contexts/cart-context';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Download, Package } from 'lucide-react';

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
}: PaymentSuccessProps) {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Payment Successful - ShopHub" />
            <Header />

            <div className="mx-auto max-w-4xl px-4 py-12">
                {/* Success Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-lg text-gray-600">Thank you for your purchase, {customer_name}</p>
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
                                <CardDescription>Your order has been confirmed and is being processed.</CardDescription>
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
                                        <span className="font-semibold text-green-600">Completed</span>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    <Button className="w-full" asChild>
                                        <Link href={route('user.orders')}>
                                            <Package className="mr-2 h-4 w-4" />
                                            View Order Details
                                        </Link>
                                    </Button>

                                    <Button variant="outline" className="w-full bg-transparent">
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

            <Footer />
        </div>
    );
}

export default function PaymentSuccess(props: PaymentSuccessProps) {
    return (
        <CartProvider>
            <PaymentSuccessContent {...props} />
        </CartProvider>
    );
}
