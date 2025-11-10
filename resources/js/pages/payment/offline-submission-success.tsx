import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, FileImage, Home, User } from 'lucide-react';
import { useEffect } from 'react';
import MainLayout from '@/layouts/app/main-layout';
import { useTranslation } from 'react-i18next';

interface OfflineSubmissionSuccessProps {
    submission_ref: string;
    order_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    payment_type?: string;
    product_request_id?: number;
}

export default function OfflineSubmissionSuccess({ submission_ref, order_id, amount, currency, payment_method, payment_type, product_request_id }: OfflineSubmissionSuccessProps) {
    const { t } = useTranslation();

    // Clear cart when offline payment is successfully submitted
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
        }
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
        })
            .format(price)
            .replace('$', currency + ' ');
    };

    // Early return when props are missing
    if (!submission_ref || !order_id) {
        return (
            <MainLayout title={t('payment.paymentSubmittedSuccess')} footerOff>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
                    <Head title={t('payment.paymentSubmittedSuccess')} />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('payment.paymentSubmittedSuccess')}</h1>
                        <p className="text-gray-600 mb-8">{t('payment.proofSubmittedPending')}</p>
                        <Button asChild style={{ backgroundColor: '#ef4e2a' }}>
                            <Link href="/">{t('checkout.continueShopping')}</Link>
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={payment_type === 'product_request_advance' ? t('payment.advancePaymentReceived') : t('payment.paymentSubmittedSuccess')} footerOff>
            <Head title={payment_type === 'product_request_advance' ? t('payment.advancePaymentReceived') : t('payment.paymentSubmittedSuccess')} />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <FileImage className="h-10 w-10 text-green-600" />
                    </div>

                    {/* Success Message */}
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        {payment_type === 'product_request_advance' ? t('payment.advancePaymentReceived') : t('payment.paymentSubmittedSuccess')}
                    </h1>
                    <p className="mb-8 text-lg text-gray-600">
                        {payment_type === 'product_request_advance' 
                            ? t('payment.advancePaymentReceivedDesc')
                            : t('payment.proofSubmittedDesc')
                        }
                    </p>

                    {/* Submission Details Card */}
                    <Card className="mx-auto mb-8 max-w-md border-primary-200 bg-primary-50">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-primary-900">
                                <Clock className="h-5 w-5" />
                                {t('payment.submissionDetails')}
                            </CardTitle>
                            <CardDescription className="text-primary-700">{t('payment.keepInformation')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-primary-800">{t('payment.submissionId')}</p>
                                    <p className="font-mono text-primary-600">{submission_ref}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-primary-800">{t('orders.orderNumber')}</p>
                                    <p className="font-mono text-primary-600">{order_id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-primary-800">{t('payment.amount')}</p>
                                    <p className="font-semibold text-primary-600">{formatPrice(amount)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-primary-800">{t('payment.method')}</p>
                                    <p className="text-primary-600">{payment_method}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* What Happens Next */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">{t('payment.whatsNext')}</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {payment_type === 'product_request_advance' ? (
                                <>
                                    <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                        <h3 className="mb-1 font-medium text-gray-900">{t('payment.paymentReceived')}</h3>
                                        <p className="text-sm text-gray-600">{t('payment.advancePaymentConfirmed')}</p>
                                    </div>

                                    <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Clock className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <h3 className="mb-1 font-medium text-gray-900">{t('payment.procurement')}</h3>
                                        <p className="text-sm text-gray-600">{t('payment.startProcuringProduct')}</p>
                                    </div>

                                    <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                                <FileImage className="h-5 w-5 text-yellow-600" />
                                            </div>
                                        </div>
                                        <h3 className="mb-1 font-medium text-gray-900">{t('payment.finalPaymentStep')}</h3>
                                        <p className="text-sm text-gray-600">{t('payment.payRemainingSeventy')}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <FileImage className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <h3 className="mb-1 font-medium text-gray-900">{t('payment.review')}</h3>
                                        <p className="text-sm text-gray-600">{t('payment.teamReviewScreenshot')}</p>
                                    </div>

                                    <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                                <Clock className="h-5 w-5 text-yellow-600" />
                                            </div>
                                        </div>
                                        <h3 className="mb-1 font-medium text-gray-900">{t('payment.verification')}</h3>
                                        <p className="text-sm text-gray-600">{t('payment.verificationTime')}</p>
                                    </div>

                                    <div className="rounded-lg bg-white p-4 shadow-sm">
                                        <div className="mb-2 flex justify-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                        <h3 className="mb-1 font-medium text-gray-900">{t('payment.confirmation')}</h3>
                                        <p className="text-sm text-gray-600">{t('payment.emailOnceVerified')}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        {payment_type === 'product_request_advance' && product_request_id ? (
                            <>
                                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" style={{ backgroundColor: '#ef4e2a' }}>
                                    <Link href={route('user.product-requests.show', product_request_id)} className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t('payment.viewProductRequest')}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={route('user.product-requests.index')} className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t('payment.viewAllRequests')}
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" style={{ backgroundColor: '#ef4e2a' }}>
                                    <Link href="/" className="flex items-center gap-2">
                                        <Home className="h-4 w-4" />
                                        {t('payment.continueShopping')}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/user-order" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t('payment.viewMyOrders')}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="mt-8 rounded-lg bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-medium text-blue-900">{t('payment.importantNotes')}</h4>
                                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                                    <li>• {t('payment.keepSubmissionReference')}</li>
                                    <li>• {t('payment.emailUpdates')}</li>
                                    <li>• {t('payment.questionsContactSupport')}</li>
                                    <li>• {t('payment.verificationTimeframe')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
