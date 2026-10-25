import type React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    Package,
    Phone,
    CheckCircle,
    XCircle,
    Clock,
    Ban,
    User,
    X,
    ShieldCheck,
    RefreshCw,
    ShoppingBag,
    Copy,
    Check,
    CheckCircle2,
    DollarSign,
    ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminNavItems } from '@/constants/adminNavItems';

interface PaymentTransaction {
    id: number;
    tx_ref: string;
    order_id: string;
    amount: number;
    currency: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    payment_method: string;
    gateway_status: 'pending' | 'proof_uploaded' | 'paid' | 'failed' | 'refunded';
    admin_status: 'unseen' | 'seen' | 'approved' | 'rejected';
    created_at: string;
    customer_id?: number;
    customer_since?: string;
    email_verified_at?: string;
    order_total?: number;
    order_status?: string;
    order_date?: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    country?: string;
    gateway_payload?: any;
    admin_notes?: string;
    admin_id?: number;
    admin_name?: string;
    admin_action_at?: string;
    checkout_url?: string;
}

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_slug?: string;
    primary_image?: string;
    quantity: number;
    price: number;
    total: number;
}

interface ProductRequest {
    id: number;
    product_name: string;
    product_url?: string;
    description?: string;
    image?: string;
    amount?: number;
    estimated_price?: number;
    advance_amount?: number;
    final_amount?: number;
    currency?: string;
    advance_payment_status?: string;
    final_payment_status?: string;
    procurement_status?: string;
    workflow_status?: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface RejectionReason {
    id: number;
    reason_code: string;
    reason_text: string;
    description?: string;
}

interface Props {
    payment: PaymentTransaction;
    orderItems: OrderItem[];
    customerPaymentHistory: PaymentTransaction[];
    canApprove: boolean;
    canReject: boolean;
    orderStatus: string;
    isProductRequestPayment?: boolean;
    paymentType?: 'advance' | 'final' | null;
    productRequest?: ProductRequest | null;
    rejectionReasons?: RejectionReason[];
    customerProfileImage?: string | null;
}

export default function ShowPayment({
    payment,
    orderItems = [],
    customerPaymentHistory = [],
    canApprove,
    canReject,
    orderStatus,
    isProductRequestPayment = false,
    paymentType = null,
    productRequest = null,
    rejectionReasons = [],
    customerProfileImage = null,
}: Props) {
    const [activeAction, setActiveAction] = useState<'approve' | 'reject' | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [primaryColor, setPrimaryColor] = useState<string>('#1E5338');

    // Load saved dashboard primary color preference
    useEffect(() => {
        try {
            const savedColor = localStorage.getItem('serdo_dashboard_primary_color');
            if (savedColor) setPrimaryColor(savedColor);
        } catch {
            // ignore
        }

        const handleThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handleThemeChange);
        return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/admin-dashboard',
        },
        {
            title: 'Payments',
            href: '/admin/payment',
        },
        {
            title: `Payment #${payment.tx_ref}`,
            href: `/admin/payments/${payment.id}`,
        },
    ];

    const approveForm = useForm({
        notes: '',
    });

    const rejectForm = useForm({
        rejection_reason_code: '',
        notes: '',
    });

    const verifyLinksEtForm = useForm({});

    const handleVerifyLinksEt = (e: React.FormEvent) => {
        e.preventDefault();
        verifyLinksEtForm.post(`/admin/payments/${payment.id}/verify-links-et`);
    };

    const handleCopyTxRef = () => {
        navigator.clipboard.writeText(payment.tx_ref);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCurrency = (amount: number, currency = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency,
            minimumFractionDigits: 2,
        })
            .format(amount)
            .replace('$', currency + ' ');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/admin/payments/${payment.id}/approve`, {
            onSuccess: () => setActiveAction(null),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/admin/payments/${payment.id}/reject`, {
            onSuccess: () => setActiveAction(null),
        });
    };

    const isFullyCompleted = payment.gateway_status === 'paid' && payment.admin_status === 'approved';
    const isAwaitingApproval =
        (payment.gateway_status === 'paid' || payment.gateway_status === 'proof_uploaded') &&
        payment.admin_status !== 'approved' &&
        payment.admin_status !== 'rejected';

    const customerInitial = (payment.customer_name || 'U').slice(0, 2).toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Payment #${payment.tx_ref}`} />

            <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900">
                <div className="max-w-[1440px] mx-auto space-y-6">

                    {/* Top Navigation Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Link
                            href="/admin/payment"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors w-fit"
                        >
                            <ArrowLeft className="w-4 h-4 text-neutral-500" />
                            Back to Payments
                        </Link>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {isProductRequestPayment && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                                    Product Request {paymentType || 'Payment'}
                                </span>
                            )}
                            {isAwaitingApproval && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Clock className="w-3.5 h-3.5" />
                                    Review Required
                                </span>
                            )}
                            {isFullyCompleted && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Fully Approved & Settled
                                </span>
                            )}
                            {payment.admin_status === 'rejected' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Payment Rejected
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* TOP STATS CARDS (Donezo Styled Metric Strip)              */}
                    {/* ========================================================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Payment Amount (Primary Colored) */}
                        <div
                            className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs flex flex-col justify-between min-h-[150px]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                                    Total Amount
                                </span>
                                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
                                    <DollarSign className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    {formatCurrency(payment.amount, payment.currency)}
                                </div>
                                <div className="text-xs text-white/70 mt-1 capitalize font-medium">
                                    Method: {payment.payment_method.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Gateway Status */}
                        <div className="relative overflow-hidden rounded-[26px] bg-white border border-neutral-200/80 p-6 shadow-xs flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    Gateway Verification
                                </span>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    payment.gateway_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 capitalize tracking-tight">
                                    {payment.gateway_status.replace('_', ' ')}
                                </div>
                                <p className="text-xs text-neutral-400 mt-1">
                                    {payment.gateway_status === 'paid' ? 'Verified & paid at source' : 'Awaiting confirmation'}
                                </p>
                            </div>
                        </div>

                        {/* Card 3: Admin Review Status */}
                        <div className="relative overflow-hidden rounded-[26px] bg-white border border-neutral-200/80 p-6 shadow-xs flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    Admin Decision
                                </span>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    payment.admin_status === 'approved'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : payment.admin_status === 'rejected'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {payment.admin_status === 'approved' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : payment.admin_status === 'rejected' ? (
                                        <Ban className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 capitalize tracking-tight">
                                    {payment.admin_status}
                                </div>
                                <p className="text-xs text-neutral-400 mt-1 truncate">
                                    {payment.admin_name ? `By ${payment.admin_name}` : 'Awaiting admin decision'}
                                </p>
                            </div>
                        </div>

                        {/* Card 4: Order Status */}
                        <div className="relative overflow-hidden rounded-[26px] bg-white border border-neutral-200/80 p-6 shadow-xs flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                    Fulfillment Status
                                </span>
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                    <Package className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 capitalize tracking-tight">
                                    {orderStatus.replace(/_/g, ' ')}
                                </div>
                                <p className="text-xs text-neutral-400 mt-1">
                                    {orderItems.length} purchased item{orderItems.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* MAIN TWO-COLUMN CONTENT GRID                              */}
                    {/* ========================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN (2 Cols): Products, Verification, & Details */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ================================================= */}
                            {/* 🛍️ PURCHASED PRODUCTS CARD                         */}
                            {/* ================================================= */}
                            <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-xs p-6 space-y-5">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">
                                                Purchased Products
                                            </h2>
                                            <p className="text-xs text-neutral-400">
                                                Items included in this payment transaction
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
                                        {orderItems.length} {orderItems.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                </div>

                                {orderItems.length > 0 ? (
                                    <div className="divide-y divide-neutral-100">
                                        {orderItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="py-3.5 flex items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-14 h-14 rounded-2xl border border-neutral-200/80 bg-neutral-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {item.primary_image ? (
                                                            <img
                                                                src={item.primary_image}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                                onClick={() => setSelectedImage(item.primary_image || null)}
                                                            />
                                                        ) : (
                                                            <span className="text-2xl select-none">🛍️</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        {item.product_slug ? (
                                                            <Link
                                                                href={`/products/${item.product_slug}`}
                                                                className="text-sm font-bold text-neutral-900 hover:text-emerald-700 transition-colors line-clamp-1"
                                                            >
                                                                {item.product_name}
                                                            </Link>
                                                        ) : (
                                                            <p className="text-sm font-bold text-neutral-900 line-clamp-1">
                                                                {item.product_name}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            Qty: <span className="font-semibold text-neutral-700">{item.quantity}</span> × {formatCurrency(item.price, payment.currency)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm sm:text-base font-extrabold text-neutral-900">
                                                        {formatCurrency(item.total, payment.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Products Subtotal Bar */}
                                        <div className="pt-4 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                                Total Items Cost
                                            </span>
                                            <span className="text-base font-extrabold text-neutral-900">
                                                {formatCurrency(
                                                    orderItems.reduce((acc, i) => acc + (i.total || 0), 0),
                                                    payment.currency
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-neutral-400">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-xs font-medium">No order items attached to this payment record</p>
                                    </div>
                                )}
                            </div>

                            {/* ================================================= */}
                            {/* 💳 TRANSACTION & PAYMENT DETAILS CARD              */}
                            {/* ================================================= */}
                            <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-xs p-6 space-y-5">
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">
                                                Transaction Details
                                            </h2>
                                            <p className="text-xs text-neutral-400">
                                                Reference identifiers and timestamps
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-full">
                                        <span className="truncate max-w-[160px] sm:max-w-none">{payment.tx_ref}</span>
                                        <button
                                            onClick={handleCopyTxRef}
                                            className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
                                            title="Copy Tx Ref"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                                        <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                                            Order Identifier
                                        </span>
                                        <p className="font-mono font-bold text-neutral-900 text-sm">
                                            {payment.order_id || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                                        <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                                            Payment Method
                                        </span>
                                        <p className="font-bold text-neutral-900 text-sm capitalize">
                                            {payment.payment_method.replace('_', ' ')}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                                        <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                                            Created Date & Time
                                        </span>
                                        <p className="font-bold text-neutral-900 text-sm">
                                            {formatDate(payment.created_at)}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                                        <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                                            Amount Settled
                                        </span>
                                        <p className="font-extrabold text-emerald-700 text-sm">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </p>
                                    </div>
                                </div>

                                {/* Offline Proof & links.et Verification */}
                                {payment.payment_method === 'offline' && payment.gateway_payload && (
                                    <div className="space-y-4 pt-2">
                                        {/* links.et Bank Verification Card */}
                                        <div className="rounded-2xl border border-sky-500/20 bg-sky-950/5 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="h-5 w-5 text-sky-600" />
                                                    <span className="text-xs font-bold text-neutral-900">
                                                        links.et Bank Verification
                                                    </span>
                                                    {payment.gateway_payload.links_et_verification?.ok ? (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                                                            VERIFIED AT SOURCE
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                                                            NOT VERIFIED
                                                        </span>
                                                    )}
                                                </div>

                                                <form onSubmit={handleVerifyLinksEt}>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={verifyLinksEtForm.processing}
                                                        variant="outline"
                                                        className="h-7 text-xs rounded-full border-sky-200 text-sky-700 hover:bg-sky-50"
                                                    >
                                                        <RefreshCw className={`h-3 w-3 mr-1 ${verifyLinksEtForm.processing ? 'animate-spin' : ''}`} />
                                                        Re-verify
                                                    </Button>
                                                </form>
                                            </div>

                                            {payment.gateway_payload.payment_reference && (
                                                <div className="text-xs text-neutral-600 bg-white p-3 rounded-xl border border-neutral-200/80 space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">Customer Reference:</span>
                                                        <span className="font-mono font-bold text-neutral-900 break-all">
                                                            {payment.gateway_payload.payment_reference}
                                                        </span>
                                                    </div>
                                                    {payment.gateway_payload.links_et_verification?.extracted_payer && (
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Bank Payer Name:</span>
                                                            <span className="font-bold text-neutral-900">
                                                                {payment.gateway_payload.links_et_verification.extracted_payer}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {payment.gateway_payload.links_et_verification?.extracted_amount && (
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Bank Settled Amount:</span>
                                                            <span className="font-bold text-emerald-700">
                                                                {payment.gateway_payload.links_et_verification.extracted_amount} ETB
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Uploaded Screenshot if available */}
                                        {payment.gateway_payload.screenshot_path && (
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                                                    Receipt Screenshot
                                                </span>
                                                <img
                                                    src={`/storage/${payment.gateway_payload.screenshot_path}`}
                                                    alt="Payment proof"
                                                    className="max-h-60 rounded-2xl border border-neutral-200 object-contain bg-neutral-50 cursor-pointer hover:opacity-95 transition-opacity"
                                                    onClick={() => setSelectedImage(`/storage/${payment.gateway_payload.screenshot_path}`)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {payment.admin_notes && (
                                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                                        <span className="font-bold uppercase tracking-wider text-amber-800 block mb-1">
                                            Admin Notes
                                        </span>
                                        <p>{payment.admin_notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Product Request Specific Details (if applicable) */}
                            {isProductRequestPayment && productRequest && (
                                <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-xs p-6 space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                        <h3 className="text-sm font-extrabold text-neutral-900">
                                            Product Request #{productRequest.id}
                                        </h3>
                                        <Link
                                            href={`/admin/product-requests/${productRequest.id}`}
                                            className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                                        >
                                            View Request
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <p className="font-bold text-neutral-900">{productRequest.product_name}</p>
                                        {productRequest.description && (
                                            <p className="text-neutral-500">{productRequest.description}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (1 Col): Admin Actions & Customer Profile */}
                        <div className="space-y-6">

                            {/* ================================================= */}
                            {/* ⚡ ADMIN APPROVE / REJECT ACTIONS CARD             */}
                            {/* ================================================= */}
                            <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-xs p-6 space-y-4">
                                <div className="pb-3 border-b border-neutral-100">
                                    <h3 className="text-sm font-extrabold text-neutral-900">
                                        Payment Verification Actions
                                    </h3>
                                    <p className="text-xs text-neutral-400">
                                        Review and take action on this payment
                                    </p>
                                </div>

                                {activeAction === null ? (
                                    <div className="space-y-3">
                                        {canApprove && (
                                            <Button
                                                onClick={() => setActiveAction('approve')}
                                                className="w-full rounded-full py-5 font-bold shadow-xs transition-all active:scale-95 text-white"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve Payment
                                            </Button>
                                        )}

                                        {canReject && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setActiveAction('reject')}
                                                className="w-full rounded-full py-5 font-bold text-rose-700 border-rose-200 hover:bg-rose-50 shadow-xs transition-all active:scale-95"
                                                disabled={payment.admin_status === 'approved'}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Reject Payment
                                            </Button>
                                        )}

                                        {!canApprove && !canReject && (
                                            <div className="p-4 rounded-2xl bg-neutral-50 text-center text-xs text-neutral-500 border border-neutral-200/70">
                                                {payment.admin_status === 'approved' && 'Payment has been successfully approved.'}
                                                {payment.admin_status === 'rejected' && 'Payment was rejected.'}
                                                {payment.admin_status === 'unseen' && 'Payment is ready for admin review.'}
                                            </div>
                                        )}
                                    </div>
                                ) : activeAction === 'approve' ? (
                                    <form onSubmit={handleApprove} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="approve-notes" className="text-xs font-bold text-neutral-700">
                                                Approval Notes (Optional)
                                            </Label>
                                            <Textarea
                                                id="approve-notes"
                                                value={approveForm.data.notes}
                                                onChange={(e) => approveForm.setData('notes', e.target.value)}
                                                placeholder="Add verification notes..."
                                                rows={3}
                                                className="rounded-2xl text-xs"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={approveForm.processing}
                                                className="flex-1 rounded-full text-xs font-bold text-white shadow-xs"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Confirm Approval
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setActiveAction(null)}
                                                className="rounded-full text-xs"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleReject} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="reject-reason" className="text-xs font-bold text-neutral-700">
                                                Rejection Reason *
                                            </Label>
                                            <Select
                                                value={rejectForm.data.rejection_reason_code}
                                                onValueChange={(val) => rejectForm.setData('rejection_reason_code', val)}
                                                required
                                            >
                                                <SelectTrigger id="reject-reason" className="rounded-xl text-xs">
                                                    <SelectValue placeholder="Select reason..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {rejectionReasons.map((r) => (
                                                        <SelectItem key={r.id} value={r.reason_code}>
                                                            {r.reason_text}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="reject-notes" className="text-xs font-bold text-neutral-700">
                                                Additional Notes
                                            </Label>
                                            <Textarea
                                                id="reject-notes"
                                                value={rejectForm.data.notes}
                                                onChange={(e) => rejectForm.setData('notes', e.target.value)}
                                                placeholder="Explain why this payment is rejected..."
                                                rows={3}
                                                className="rounded-2xl text-xs"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={rejectForm.processing}
                                                className="flex-1 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                                            >
                                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                Confirm Rejection
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setActiveAction(null)}
                                                className="rounded-full text-xs"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* ================================================= */}
                            {/* 👤 CUSTOMER PROFILE CARD                          */}
                            {/* ================================================= */}
                            <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-xs p-6 space-y-4">
                                <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
                                    <h3 className="text-sm font-extrabold text-neutral-900">
                                        Customer Information
                                    </h3>
                                    <User className="w-4 h-4 text-neutral-400" />
                                </div>

                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xs flex-shrink-0"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {customerProfileImage ? (
                                            <img
                                                src={customerProfileImage}
                                                alt={payment.customer_name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            customerInitial
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-extrabold text-neutral-900 truncate">
                                            {payment.customer_name}
                                        </p>
                                        <p className="text-xs text-neutral-400 truncate">
                                            {payment.customer_email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 text-xs">
                                    {payment.customer_phone && (
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                                            <span className="font-bold text-neutral-600">Mobile Phone:</span>
                                            <a
                                                href={`tel:${payment.customer_phone}`}
                                                className="font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1"
                                            >
                                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                {payment.customer_phone}
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-neutral-500 py-1">
                                        <span>Customer Since:</span>
                                        <span className="font-bold text-neutral-800">
                                            {payment.customer_since ? formatDate(payment.customer_since) : formatDate(payment.created_at)}
                                        </span>
                                    </div>

                                    {(payment.address_line_1 || payment.city) && (
                                        <div className="pt-2 border-t border-neutral-100">
                                            <span className="font-bold text-neutral-500 uppercase tracking-wider block mb-1 text-[10px]">
                                                Address
                                            </span>
                                            <p className="text-neutral-700">
                                                {[payment.address_line_1, payment.city, payment.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Previous Payments */}
                            {customerPaymentHistory.length > 0 && (
                                <div className="bg-white rounded-[28px] border border-neutral-200/80 shadow-xs p-6 space-y-4">
                                    <div className="pb-3 border-b border-neutral-100">
                                        <h3 className="text-sm font-extrabold text-neutral-900">
                                            Payment History
                                        </h3>
                                        <p className="text-xs text-neutral-400">
                                            Previous transactions from this customer
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        {customerPaymentHistory.map((hist) => (
                                            <Link
                                                key={hist.id}
                                                href={`/admin/payments/${hist.id}`}
                                                className="block p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 transition-colors"
                                            >
                                                <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                                                    <span className="font-mono truncate max-w-[150px]">
                                                        #{hist.tx_ref}
                                                    </span>
                                                    <span className="text-emerald-700">
                                                        {formatCurrency(hist.amount, hist.currency)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                                                    <span>{formatDate(hist.created_at)}</span>
                                                    <span className="capitalize font-semibold text-neutral-600">
                                                        {hist.admin_status}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen Image Modal */}
            <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-black/95 border-none [&>button]:hidden">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Full screen preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}