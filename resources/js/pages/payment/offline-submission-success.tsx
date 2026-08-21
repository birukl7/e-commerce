import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckCircle2, 
    Clock, 
    Copy, 
    Check, 
    Home, 
    User, 
    Receipt, 
    Building2, 
    ArrowRight, 
    ShieldCheck, 
    Package, 
    HelpCircle,
    Sparkles,
    FileCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function OfflineSubmissionSuccess({
    submission_ref,
    order_id,
    amount,
    currency = 'ETB',
    payment_method,
    payment_type,
    product_request_id,
}: OfflineSubmissionSuccessProps) {
    const { t } = useTranslation();
    const [copiedRef, setCopiedRef] = useState(false);
    const [copiedOrder, setCopiedOrder] = useState(false);

    // Clear cart when offline payment is successfully submitted
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cartItems');
        }
    }, []);

    const copyToClipboard = (text: string, type: 'ref' | 'order') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'ref') {
            setCopiedRef(true);
            setTimeout(() => setCopiedRef(false), 2000);
        } else {
            setCopiedOrder(true);
            setTimeout(() => setCopiedOrder(false), 2000);
        }
    };

    const formatPrice = (price: number) => {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price || 0);

        return `${currency === 'ETB' ? 'ETB' : currency} ${formatted}`;
    };

    // Early return fallback when essential props are missing
    if (!submission_ref && !order_id) {
        return (
            <MainLayout title={t('payment.paymentSubmittedSuccess')} footerOff>
                <div className="min-h-[70vh] bg-slate-50/50 flex items-center justify-center py-12 px-4">
                    <Head title={t('payment.paymentSubmittedSuccess')} />
                    <Card className="max-w-md w-full text-center p-8 shadow-lg border-slate-200/80 bg-white">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('payment.paymentSubmittedSuccess')}</h1>
                        <p className="text-slate-600 mb-6">{t('payment.proofSubmittedPending')}</p>
                        <Button asChild className="w-full text-white shadow-md transition-transform active:scale-95" style={{ backgroundColor: '#ef4e2a' }}>
                            <Link href="/">{t('payment.continueShopping')}</Link>
                        </Button>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    const isAdvance = payment_type === 'product_request_advance';

    return (
        <MainLayout title={isAdvance ? t('payment.advancePaymentReceived') : t('payment.paymentSubmittedSuccess')} footerOff>
            <Head title={isAdvance ? t('payment.advancePaymentReceived') : t('payment.paymentSubmittedSuccess')} />

            <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    
                    {/* Hero Success Banner Header */}
                    <div className="text-center space-y-4">
                        <div className="relative inline-flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-75 blur-sm" />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-50">
                                <ShieldCheck className="h-11 w-11" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
                                <Clock className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
                                <span>Pending Verification</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                {isAdvance ? t('payment.advancePaymentReceived') : t('payment.paymentSubmittedSuccess')}
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
                                {isAdvance 
                                    ? t('payment.advancePaymentReceivedDesc') 
                                    : t('payment.proofSubmittedDesc')
                                }
                            </p>
                        </div>
                    </div>

                    {/* Main 2-Column Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column: Transaction Details Card */}
                        <div className="lg:col-span-7 space-y-6">
                            <Card className="border border-slate-200/90 shadow-md bg-white overflow-hidden rounded-2xl">
                                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <Receipt className="h-5 w-5" />
                                            </div>
                                            {t('payment.submissionDetails')}
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 text-xs font-medium">
                                            Receipt Summary
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-slate-500 text-xs mt-1">
                                        {t('payment.keepInformation')}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-6 space-y-6">
                                    {/* Price Banner */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-md">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">{t('payment.amount')}</p>
                                            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">{formatPrice(amount)}</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
                                            <Sparkles className="h-5 w-5 text-amber-300" />
                                        </div>
                                    </div>

                                    {/* Detail Fields List */}
                                    <div className="space-y-3 divide-y divide-slate-100 text-sm">
                                        
                                        {/* Submission Ref */}
                                        {submission_ref && (
                                            <div className="flex items-center justify-between pt-3 first:pt-0">
                                                <span className="text-slate-500 font-medium">{t('payment.submissionId')}</span>
                                                <div className="flex items-center gap-2">
                                                    <code className="px-2.5 py-1 rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-800 border border-slate-200/60">
                                                        {submission_ref}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                                                        onClick={() => copyToClipboard(submission_ref, 'ref')}
                                                        title="Copy reference"
                                                    >
                                                        {copiedRef ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order ID */}
                                        {order_id && (
                                            <div className="flex items-center justify-between pt-3">
                                                <span className="text-slate-500 font-medium">{t('orders.orderNumber')}</span>
                                                <div className="flex items-center gap-2">
                                                    <code className="px-2.5 py-1 rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-800 border border-slate-200/60">
                                                        {order_id}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                                                        onClick={() => copyToClipboard(order_id, 'order')}
                                                        title="Copy order ID"
                                                    >
                                                        {copiedOrder ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Method */}
                                        <div className="flex items-center justify-between pt-3">
                                            <span className="text-slate-500 font-medium">{t('payment.method')}</span>
                                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                {payment_method || 'Bank Transfer / Offline'}
                                            </span>
                                        </div>

                                        {/* Verification Status */}
                                        <div className="flex items-center justify-between pt-3">
                                            <span className="text-slate-500 font-medium">Status</span>
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 font-medium text-xs">
                                                Pending Admin Review
                                            </Badge>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Navigation Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {isAdvance && product_request_id ? (
                                    <>
                                        <Button asChild className="flex-1 h-12 text-base font-semibold shadow-md text-white transition-all hover:opacity-95" style={{ backgroundColor: '#ef4e2a' }}>
                                            <Link href={route('user.product-requests.show', product_request_id)} className="flex items-center justify-center gap-2">
                                                <User className="h-4 w-4" />
                                                {t('payment.viewProductRequest')}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="flex-1 h-12 text-base font-medium border-slate-300 text-slate-700 hover:bg-slate-100">
                                            <Link href={route('user.product-requests.index')} className="flex items-center justify-center gap-2">
                                                <User className="h-4 w-4" />
                                                {t('payment.viewAllRequests')}
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button asChild className="flex-1 h-12 text-base font-semibold shadow-md text-white transition-all hover:opacity-95" style={{ backgroundColor: '#ef4e2a' }}>
                                            <Link href="/user-order" className="flex items-center justify-center gap-2">
                                                <User className="h-4 w-4" />
                                                {t('payment.viewMyOrders')}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="flex-1 h-12 text-base font-medium border-slate-300 text-slate-700 hover:bg-slate-100">
                                            <Link href="/" className="flex items-center justify-center gap-2">
                                                <Home className="h-4 w-4" />
                                                {t('payment.continueShopping')}
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Next Steps Timeline & Info */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* What Happens Next Card */}
                            <Card className="border border-slate-200/90 shadow-md bg-white rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-emerald-600" />
                                        {t('payment.whatHappensNext')}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-6">
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                                        
                                        {/* Timeline Step 1 */}
                                        <div className="relative">
                                            <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white shadow-xs">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    {isAdvance ? t('payment.paymentReceived') : t('payment.review')}
                                                </h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {isAdvance ? t('payment.advancePaymentConfirmed') : t('payment.teamReviewScreenshot')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Timeline Step 2 (Active/Pending) */}
                                        <div className="relative">
                                            <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-white shadow-xs">
                                                <Clock className="h-3 w-3 stroke-[2.5]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    {isAdvance ? t('payment.procurement') : t('payment.verification')}
                                                </h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {isAdvance ? t('payment.startProcuringProduct') : t('payment.verificationTime')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Timeline Step 3 */}
                                        <div className="relative">
                                            <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 ring-4 ring-white">
                                                <Package className="h-3 w-3" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-slate-700">
                                                    {isAdvance ? t('payment.finalPaymentStep') : t('payment.confirmation')}
                                                </h4>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    {isAdvance ? t('payment.payRemainingSeventy') : t('payment.emailOnceVerified')}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </CardContent>
                            </Card>

                            {/* Help & Support Banner */}
                            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-slate-50 p-5 shadow-xs">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-blue-950">{t('payment.importantNotes')}</h4>
                                        <ul className="space-y-1.5 text-xs text-blue-900/80">
                                            <li className="flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {t('payment.keepSubmissionReference')}
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {t('payment.emailUpdates')}
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {t('payment.verificationTimeframe')}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </MainLayout>
    );
}

