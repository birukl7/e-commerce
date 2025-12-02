import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, HelpCircle, RefreshCw, XCircle } from 'lucide-react';

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
    // Safely extract and normalize props with comprehensive defaults
    // Handle all possible data types and edge cases
    const safeProps = props || {};
    
    // Normalize amount - handle both string and number types
    const normalizeAmount = (val: any): number | null => {
        if (val === null || val === undefined) return null;
        if (typeof val === 'number') return isNaN(val) ? null : val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    };
    
    // Extract and normalize all props
    const order_id = safeProps.order_id ?? null;
    const order_number = safeProps.order_number ?? order_id ?? null;
    const error = safeProps.error ?? 'Payment could not be processed';
    const error_code = safeProps.error_code ?? undefined;
    const amount = normalizeAmount(safeProps.amount);
    const currency = safeProps.currency ?? 'ETB';
    const retry_url = safeProps.retry_url ?? undefined;
    const auth = safeProps.auth ?? undefined;
    const transaction_id = safeProps.transaction_id ?? undefined;

    // Format price safely
    const formatPrice = (price: number | null) => {
        if (price === null || isNaN(price)) return 'N/A';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(price);
        } catch (e) {
            return `${price} ${currency}`;
        }
    };

    // Get user-friendly error descriptions
    const getErrorDescription = (code?: string, errorMessage?: string) => {
        // Handle product request specific errors
        if (code === 'product_request_not_found') {
            return 'We couldn\'t locate your product request. This might happen if the request was cancelled or if there was a system error. Please contact support with your transaction reference.';
        }
        
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
            case 'transaction_not_found':
                return 'We encountered an issue locating your order or transaction. Please contact support with the reference number below.';
            case 'processing_error':
                return 'An error occurred while processing your payment. Please try again or contact support.';
            case 'missing_reference':
                return 'Payment reference is missing. Please contact support if you made a payment.';
            default:
                // Use the error message if provided, otherwise use generic message
                if (errorMessage && errorMessage !== 'Payment could not be processed') {
                    return errorMessage;
                }
                return 'We encountered an issue processing your payment. Please try again or contact support.';
        }
    };

    // Get error title based on error code
    const getErrorTitle = (code?: string) => {
        switch (code) {
            case 'product_request_not_found':
                return 'Product Request Not Found';
            case 'transaction_not_found':
                return 'Transaction Not Found';
            case 'order_not_found':
                return 'Order Not Found';
            case 'insufficient_funds':
                return 'Insufficient Funds';
            case 'card_declined':
                return 'Payment Declined';
            case 'network_error':
                return 'Network Error';
            case 'timeout':
                return 'Payment Timeout';
            default:
                return 'Payment Failed';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Head title="Payment Failed - Serdo" />
            <Header />

            <div className="mx-auto max-w-2xl px-4 py-12">
                {/* Error Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-lg">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">{getErrorTitle(error_code)}</h1>
                    <p className="text-lg text-gray-600">{getErrorDescription(error_code, error)}</p>
                </div>

                {/* Error Details Card */}
                <Card className="mb-8 border-red-200 shadow-lg">
                    <CardHeader className="bg-red-50">
                        <CardTitle className="text-red-700">Payment Details</CardTitle>
                        <CardDescription className="text-red-600">
                            Please review the information below
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {/* Error Message */}
                        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-900">Error Message</p>
                                    <p className="mt-1 text-sm text-red-800">{error}</p>
                                    {error_code && (
                                        <p className="mt-2 text-xs text-red-600">
                                            Error Code: <span className="font-mono">{error_code}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transaction Reference */}
                        {transaction_id && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Transaction Reference</p>
                                <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{transaction_id}</p>
                                <p className="mt-1 text-xs text-gray-500">Please keep this reference for support inquiries</p>
                            </div>
                        )}

                        {/* Order/Request Reference */}
                        {(order_number || order_id) && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {error_code === 'product_request_not_found' ? 'Request Reference' : 'Order Number'}
                                </p>
                                <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{order_number || order_id}</p>
                            </div>
                        )}

                        {/* Amount */}
                        {amount !== null && amount > 0 && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Payment Amount</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(amount)}</p>
                            </div>
                        )}

                        {/* User Account Info */}
                        {auth?.user && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Account</p>
                                <p className="mt-1 text-sm font-semibold text-blue-900">{auth.user.name}</p>
                                <p className="mt-0.5 text-xs text-blue-700">{auth.user.email}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4">
                    {/* Primary Action - Retry Payment */}
                    {(retry_url || transaction_id) && !error_code?.includes('not_found') && (
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg" asChild>
                            <Link href={retry_url || `/payment/process?retry=${transaction_id}`}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Payment Again
                            </Link>
                        </Button>
                    )}

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {error_code !== 'product_request_not_found' && (
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/checkout">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Checkout
                                </Link>
                            </Button>
                        )}
                        
                        {error_code === 'product_request_not_found' && (
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/user/product-requests">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    View My Requests
                                </Link>
                            </Button>
                        )}

                        <Button variant="outline" size="lg" className="border-red-200 text-red-700 hover:bg-red-50" asChild>
                            <Link href="/contact">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Contact Support
                            </Link>
                        </Button>
                    </div>

                    {/* Tertiary Actions */}
                    <div className="flex flex-col space-y-2">
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                        
                        {transaction_id && order_id && error_code !== 'product_request_not_found' && (
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/user/orders${order_id ? `/${order_id}` : ''}`}>
                                    View Order Status
                                </Link>
                            </Button>
                        )}
                        
                        {error_code === 'product_request_not_found' && (
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/request">
                                    Create New Request
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Help Section */}
                <Card className="mt-8 border-blue-200 bg-blue-50 shadow-md">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                            <div className="flex-1">
                                <h4 className="mb-3 text-lg font-semibold text-blue-900">Need Help?</h4>
                                
                                {error_code === 'product_request_not_found' ? (
                                    <div className="space-y-2 text-sm text-blue-800">
                                        <p className="font-medium">If you believe this is an error:</p>
                                        <ul className="ml-4 list-disc space-y-1">
                                            <li>Contact support with your transaction reference: <span className="font-mono font-semibold">{transaction_id || 'N/A'}</span></li>
                                            <li>Check your product requests page to see if the request exists</li>
                                            <li>Verify you're logged into the correct account</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-sm text-blue-800">
                                        <p>• Check your internet connection and try again</p>
                                        <p>• Ensure your payment method has sufficient funds</p>
                                        <p>• Try using a different payment method</p>
                                        <p>• Contact your bank if the issue persists</p>
                                    </div>
                                )}
                                
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
                                        <Link href="/contact">
                                            Contact our support team
                                            <HelpCircle className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                
                                {transaction_id && (
                                    <div className="mt-3 rounded-md bg-blue-100 p-2">
                                        <p className="text-xs text-blue-700">
                                            <span className="font-semibold">Reference:</span>{' '}
                                            <span className="font-mono">{transaction_id}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Footer />
        </div>
    );
}