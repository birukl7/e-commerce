'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, HelpCircle, RefreshCw, XCircle } from 'lucide-react';

interface PaymentFailedProps {
    order_id?: string;
    error_message?: string;
    error_code?: string;
    amount?: number;
    currency?: string;
    retry_url?: string;
}

export default function PaymentFailed({
    order_id,
    error_message = 'Payment could not be processed',
    error_code,
    amount,
    currency = 'ETB',
    retry_url,
}: PaymentFailedProps) {
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

                {/* Error Details */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-red-600">What went wrong?</CardTitle>
                        <CardDescription>{getErrorDescription(error_code)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error_message && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">Error: {error_message}</p>
                                {error_code && <p className="mt-1 text-xs text-red-600">Error Code: {error_code}</p>}
                            </div>
                        )}

                        {order_id && (
                            <div className="rounded-md bg-gray-50 p-3">
                                <p className="text-xs text-gray-600">Order ID</p>
                                <p className="font-mono text-sm">{order_id}</p>
                            </div>
                        )}

                        {amount && (
                            <div className="rounded-md bg-gray-50 p-3">
                                <p className="text-xs text-gray-600">Amount</p>
                                <p className="text-lg font-semibold">{formatPrice(amount)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                    {retry_url && (
                        <Button className="w-full" size="lg" asChild>
                            <Link href={retry_url}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Payment Again
                            </Link>
                        </Button>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Button variant="outline" size="lg" asChild>
                            <Link href={route('checkout')}>
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

                    <Button variant="ghost" className="w-full" asChild>
                        <Link href={route('home')}>Continue Shopping</Link>
                    </Button>
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
                                    <Link href={route('home')} className="text-sm font-medium text-blue-600 hover:text-blue-800">
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
