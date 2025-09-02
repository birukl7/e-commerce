import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
// formatCurrency function defined locally

interface PaymentPendingProps {
    order_id: string;
    amount: string;
    currency: string;
    transaction_id: string;
    message: string;
    check_again_url: string;
}

export default function PaymentPending({ 
    order_id, 
    amount, 
    currency, 
    transaction_id, 
    message,
    check_again_url 
}: PaymentPendingProps) {
    // Format currency function
    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };
    const [isChecking, setIsChecking] = useState(false);
    const [checkCount, setCheckCount] = useState(0);
    const [autoCheckInterval, setAutoCheckInterval] = useState<NodeJS.Timeout | null>(null);

    // Auto-check payment status every 10 seconds for up to 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (checkCount < 12) { // 12 checks * 10 seconds = 2 minutes
                checkPaymentStatus();
                setCheckCount(prev => prev + 1);
            } else {
                clearInterval(interval);
                setAutoCheckInterval(null);
            }
        }, 10000);

        setAutoCheckInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [checkCount]);

    const checkPaymentStatus = async () => {
        setIsChecking(true);
        try {
            // First try the verification endpoint
            const verifyUrl = `/payment/verify/${transaction_id}`;
            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'success') {
                    // Payment verified, redirect to success page
                    router.visit(check_again_url, {
                        method: 'get',
                        preserveState: false,
                        preserveScroll: false,
                    });
                    return;
                }
            }
            
            // If verification didn't work, fall back to regular check
            router.visit(check_again_url, {
                method: 'get',
                preserveState: false,
                preserveScroll: false,
            });
        } catch (error) {
            console.error('Error checking payment status:', error);
            // Fall back to regular check
            router.visit(check_again_url, {
                method: 'get',
                preserveState: false,
                preserveScroll: false,
            });
        } finally {
            setIsChecking(false);
        }
    };

    const stopAutoCheck = () => {
        if (autoCheckInterval) {
            clearInterval(autoCheckInterval);
            setAutoCheckInterval(null);
        }
    };

    return (
        <>
            <Head title="Payment Processing" />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Payment Processing
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your payment is being verified
                        </p>
                    </div>

                    {/* Main Card */}
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                                Processing Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Payment Details */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Order ID:</span>
                                    <span className="text-sm font-mono text-gray-900">{order_id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Amount:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(parseFloat(amount), currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                                    <span className="text-sm font-mono text-gray-900">{transaction_id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Status:</span>
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Processing
                                    </Badge>
                                </div>
                            </div>

                            {/* Status Message */}
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {message}
                                </AlertDescription>
                            </Alert>

                            {/* Auto-check Status */}
                            {autoCheckInterval && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Automatically checking status... ({checkCount}/12)
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={stopAutoCheck}
                                        className="text-xs"
                                    >
                                        Stop Auto-check
                                    </Button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button 
                                    onClick={checkPaymentStatus}
                                    disabled={isChecking}
                                    className="w-full"
                                >
                                    {isChecking ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Checking Status...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Check Status Again
                                        </>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link 
                                        href="/user-dashboard" 
                                        className="text-sm text-blue-600 hover:text-blue-500"
                                    >
                                        Go to Dashboard
                                    </Link>
                                </div>
                            </div>

                            {/* Help Information */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">
                                    What happens next?
                                </h4>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• We're verifying your payment with the bank</li>
                                    <li>• This usually takes 1-2 minutes</li>
                                    <li>• You'll be redirected automatically when confirmed</li>
                                    <li>• Check your email for payment confirmation</li>
                                </ul>
                            </div>

                            {/* Support Information */}
                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    Need help? Contact support with reference: <br />
                                    <span className="font-mono text-gray-700">{transaction_id}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
