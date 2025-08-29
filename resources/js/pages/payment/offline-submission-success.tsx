import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, FileImage, Home, User } from 'lucide-react';

interface OfflineSubmissionSuccessProps {
    submission_ref: string;
    order_id: string;
    amount: number;
    currency: string;
    payment_method: string;
}

export default function OfflineSubmissionSuccess({ submission_ref, order_id, amount, currency, payment_method }: OfflineSubmissionSuccessProps) {
    // Debug log to check if component is rendering
    console.log('OfflineSubmissionSuccess props:', { submission_ref, order_id, amount, currency, payment_method });
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
        })
            .format(price)
            .replace('$', currency + ' ');
    };

    // Early return with simple content if props are missing
    if (!submission_ref || !order_id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Head title="Payment Submitted Successfully - ShopHub" />
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h1>
                    <p className="text-gray-600 mb-8">Your payment proof has been submitted for verification.</p>
                    <Button asChild style={{ backgroundColor: '#ef4e2a' }}>
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Payment Submitted Successfully - ShopHub" />
            
            {/* Simplified header to avoid component errors */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/" className="text-2xl font-bold" style={{ color: '#ef4e2a' }}>
                        ShopHub
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <FileImage className="h-10 w-10 text-green-600" />
                    </div>

                    {/* Success Message */}
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Payment Submitted Successfully!</h1>
                    <p className="mb-8 text-lg text-gray-600">Your payment proof has been submitted and is pending verification by our team.</p>

                    {/* Submission Details Card */}
                    <Card className="mx-auto mb-8 max-w-md border-primary-200 bg-primary-50">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-primary-900">
                                <Clock className="h-5 w-5" />
                                Submission Details
                            </CardTitle>
                            <CardDescription className="text-primary-700">Please keep this information for your records</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-primary-800">Submission ID:</p>
                                    <p className="font-mono text-primary-600">{submission_ref}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-primary-800">Order ID:</p>
                                    <p className="font-mono text-primary-600">{order_id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-primary-800">Amount:</p>
                                    <p className="font-semibold text-primary-600">{formatPrice(amount)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-primary-800">Method:</p>
                                    <p className="text-primary-600">{payment_method}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* What Happens Next */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">What happens next?</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <div className="mb-2 flex justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                        <FileImage className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="mb-1 font-medium text-gray-900">1. Review</h3>
                                <p className="text-sm text-gray-600">Our team will review your payment screenshot</p>
                            </div>

                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <div className="mb-2 flex justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                                <h3 className="mb-1 font-medium text-gray-900">2. Verification</h3>
                                <p className="text-sm text-gray-600">Payment verification usually takes 2-24 hours</p>
                            </div>

                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <div className="mb-2 flex justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="mb-1 font-medium text-gray-900">3. Confirmation</h3>
                                <p className="text-sm text-gray-600">You'll receive an email once payment is verified</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" style={{ backgroundColor: '#ef4e2a' }}>
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </Button>

                        <Button asChild variant="outline">
                            <Link href="/user-order" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                View My Orders
                            </Link>
                        </Button>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-8 rounded-lg bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-medium text-blue-900">Important Notes</h4>
                                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                                    <li>• Keep your submission reference number for tracking</li>
                                    <li>• You will receive email updates on verification status</li>
                                    <li>• If you have questions, contact support with your submission ID</li>
                                    <li>• Verification typically happens within 24 hours during business days</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simplified footer to avoid component errors */}
            <div className="bg-gray-900 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400">© 2024 ShopHub Ethiopia. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
