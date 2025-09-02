'use client';

import { useEffect } from 'react';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, HelpCircle, RefreshCw, XCircle } from 'lucide-react';

declare global {
    interface Window {
        paymentFailedProps?: any;
    }
}

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface PaymentFailedProps {
    order_id?: string | null;
    order_number?: string | null; // Add order_number to the interface
    error?: string;
    error_code?: string;
    amount?: number | string; // Allow string for amount to handle form inputs
    currency?: string;
    retry_url?: string;
    auth?: {
        user?: User;
    };
    transaction_id?: string; // Add transaction_id to the interface
}

export default function PaymentFailed(props: PaymentFailedProps) {
    // Enhanced logging for debugging
    useEffect(() => {
        console.group('Payment Failed Component Mounted');
        console.log('=== Component Props ===');
        console.log('Order ID:', props.order_id);
        console.log('Order Number:', props.order_number);
        console.log('Error:', props.error);
        console.log('Error Code:', props.error_code);
        console.log('Amount:', props.amount);
        console.log('Currency:', props.currency);
        console.log('Transaction ID:', props.transaction_id);
        console.log('Retry URL:', props.retry_url);
        console.log('User:', props.auth?.user);
        console.log('Full Props:', props);
        console.groupEnd();

        // Log to window for easier access in browser console
        window.paymentFailedProps = props;
    }, [props]);
    
    const {
        order_id,
        order_number = order_id, // Default to order_id if order_number is not provided
        error = 'Payment could not be processed',
        error_code,
        amount,
        currency = 'ETB',
        retry_url,
        auth,
        transaction_id,
    } = props;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const getErrorDescription = (code?: string) => {
        switch (code) {
            case 'insufficient_funds':
                return "Your account doesn't have sufficient funds to complete this transaction.";
            case 'card_declined':
                return 'Your payment method was declined. Please try a different payment method.';
            case 'network_error':
                return 'There was a network error. Please check your connection and try again.';
            case 'timeout':
                return 'The payment request timed out. Please try again.';
            case 'order_not_found':
                return 'We encountered an issue locating your order. Please contact support with the reference number below.';
            case 'processing_error':
                return 'An error occurred while processing your payment. Please try again or contact support.';
            default:
                return 'We encountered an issue processing your payment. Please try again or contact support.';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Payment Failed - ShopHub" />
            <Header />

            <div className="mx-auto max-w-2xl px-4 py-12">
                {/* Error Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment Failed</h1>
                    <p className="text-lg text-gray-600">We couldn't process your payment</p>
                </div>

                {/* Debug Info - Only show in development */}
                {process.env.NODE_ENV === 'development' && (
                    <Card className="mb-8 border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="text-yellow-800">Debug Info (Development Only)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs text-yellow-700">
                                {JSON.stringify(props, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Error Details */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-red-600">What went wrong?</CardTitle>
                        <CardDescription>{getErrorDescription(error_code)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">Error: {error}</p>
                                {error_code && <p className="mt-1 text-xs text-red-600">Error Code: {error_code}</p>}
                            </div>
                        )}

                        {order_id && (
                            <div className="rounded-md bg-gray-50 p-3">
                                <p className="text-xs text-gray-600">Order Number</p>
                                <p className="font-mono text-sm">{order_number || order_id || 'N/A'}</p>
                            </div>
                        )}

                        {amount && (typeof amount === 'string' ? parseFloat(amount) > 0 : amount > 0) && (
                            <div className="rounded-md bg-gray-50 p-3">
                                <p className="text-xs text-gray-600">Failed Amount</p>
                                <p className="text-lg font-semibold">
                                    {typeof amount === 'string' 
                                        ? new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: currency,
                                          }).format(parseFloat(amount))
                                        : formatPrice(amount || 0)}
                                </p>
                            </div>
                        )}

                        {auth?.user && (
                            <div className="rounded-md bg-gray-50 p-3">
                                <p className="text-xs text-gray-600">Account</p>
                                <p className="text-sm">{auth.user.name}</p>
                                <p className="text-xs text-gray-500">{auth.user.email}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                    {(retry_url || transaction_id) && (
                        <Button className="w-full" size="lg" asChild>
                            <Link href={retry_url || `/checkout?retry=${transaction_id}`}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Payment Again
                            </Link>
                        </Button>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/checkout">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Checkout
                            </Link>
                        </Button>

                        <Button variant="outline" size="lg" asChild>
                            <Link href="/contact">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Contact Support
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                        {transaction_id && (
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/user/orders${order_id ? `/${order_id}` : ''}`}>
                                    View Order Status
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Help Section */}
                <Card className="mt-8 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                            <div>
                                <h4 className="mb-2 font-semibold text-blue-900">Need Help?</h4>
                                <div className="space-y-1 text-sm text-blue-800">
                                    <p>• Check your internet connection and try again</p>
                                    <p>• Ensure your payment method has sufficient funds</p>
                                    <p>• Try using a different payment method</p>
                                    <p>• Contact your bank if the issue persists</p>
                                </div>
                                <div className="mt-3">
                                    <Link href="/contact" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        Contact our support team →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}