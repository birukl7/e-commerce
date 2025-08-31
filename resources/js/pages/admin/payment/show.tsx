import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, Mail, MapPin, Package, Phone, CheckCircle, XCircle, Eye, Clock, AlertTriangle, Ban, TrendingDown, FileImage, User } from 'lucide-react';
import { useState } from 'react';
import { adminNavItems } from '../dashboard';

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
}

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_slug: string;
    primary_image?: string;
    quantity: number;
    price: number;
    total: number;
}

interface Props {
    payment: PaymentTransaction;
    orderItems: OrderItem[];
    customerPaymentHistory: PaymentTransaction[];
    canApprove: boolean;
    canReject: boolean;
    orderStatus: string;
}

export default function ShowPayment({ payment, orderItems, customerPaymentHistory, canApprove, canReject, orderStatus }: Props) {
    const [activeAction, setActiveAction] = useState<'approve' | 'reject' | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/admin-dashboard',
        },
        {
            title: 'Payment Statistics',
            href: '/admin/paymentStats',
        },
        {
            title: `Payment #${payment.tx_ref}`,
            href: `/admin/payments/${payment.id}`,
        },
    ];

    const approveForm = useForm({
        notes: ''
    });

    const rejectForm = useForm({
        notes: ''
    });

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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGatewayStatusDisplay = (status: string) => {
        const variants = {
            'pending': { class: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Pending' },
            'proof_uploaded': { class: 'bg-blue-100 text-blue-800', icon: FileImage, text: 'Proof Uploaded' },
            'paid': { class: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Paid' },
            'failed': { class: 'bg-red-100 text-red-800', icon: Ban, text: 'Failed' },
            'refunded': { class: 'bg-purple-100 text-purple-800', icon: TrendingDown, text: 'Refunded' }
        };
        return variants[status as keyof typeof variants] || variants.pending;
    };

    const getAdminStatusDisplay = (status: string) => {
        const variants = {
            'unseen': { class: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle, text: 'Unseen' },
            'seen': { class: 'bg-blue-100 text-blue-800', icon: Eye, text: 'Seen' },
            'approved': { class: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
            'rejected': { class: 'bg-red-100 text-red-800', icon: Ban, text: 'Rejected' }
        };
        return variants[status as keyof typeof variants] || variants.unseen;
    };

    const getOrderStatusDisplay = (status: string) => {
        const statusMap = {
            'processing': { class: 'bg-green-100 text-green-800', text: 'Ready for Fulfillment' },
            'awaiting_admin_approval': { class: 'bg-orange-100 text-orange-800', text: 'Awaiting Admin Approval' },
            'payment_rejected': { class: 'bg-red-100 text-red-800', text: 'Payment Rejected' },
            'payment_failed': { class: 'bg-red-100 text-red-800', text: 'Payment Failed' },
            'pending_payment': { class: 'bg-gray-100 text-gray-800', text: 'Pending Payment' }
        };
        return statusMap[status as keyof typeof statusMap] || { class: 'bg-gray-100 text-gray-800', text: status };
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approveForm.post(`/admin/payments/${payment.id}/approve`, {
            onSuccess: () => {
                setActiveAction(null);
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(`/admin/payments/${payment.id}/reject`, {
            onSuccess: () => {
                setActiveAction(null);
            },
        });
    };

    const gatewayStatus = getGatewayStatusDisplay(payment.gateway_status);
    const adminStatus = getAdminStatusDisplay(payment.admin_status);
    const orderStatusDisplay = getOrderStatusDisplay(orderStatus);
    
    const GatewayIcon = gatewayStatus.icon;
    const AdminIcon = adminStatus.icon;

    const isFullyCompleted = payment.gateway_status === 'paid' && payment.admin_status === 'approved';
    const isAwaitingApproval = (payment.gateway_status === 'paid' || payment.gateway_status === 'proof_uploaded') && 
                               payment.admin_status !== 'approved' && payment.admin_status !== 'rejected';

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Payment #${payment.tx_ref}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans w-full max-w-7xl mx-auto">    
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/paymentStats"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Payments
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={orderStatusDisplay.class}>
                            Order: {orderStatusDisplay.text}
                        </Badge>
                        {isAwaitingApproval && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                NEEDS REVIEW
                            </Badge>
                        )}
                        {isFullyCompleted && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                COMPLETED
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Payment Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Two-Layer Status Display */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Status Overview
                                </CardTitle>
                                <CardDescription>Transaction #{payment.tx_ref}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3 p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium text-muted-foreground">Gateway Status</Label>
                                            <Badge className={`${gatewayStatus.class} flex items-center gap-1`}>
                                                <GatewayIcon className="h-3 w-3" />
                                                {gatewayStatus.text}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.gateway_status === 'paid' && 'Payment confirmed by gateway'}
                                            {payment.gateway_status === 'proof_uploaded' && 'Customer uploaded payment proof'}
                                            {payment.gateway_status === 'pending' && 'Awaiting gateway confirmation'}
                                            {payment.gateway_status === 'failed' && 'Gateway declined payment'}
                                            {payment.gateway_status === 'refunded' && 'Payment has been refunded'}
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-3 p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium text-muted-foreground">Admin Status</Label>
                                            <Badge className={`${adminStatus.class} flex items-center gap-1`}>
                                                <AdminIcon className="h-3 w-3" />
                                                {adminStatus.text}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.admin_status === 'approved' && 'Approved for order fulfillment'}
                                            {payment.admin_status === 'rejected' && 'Payment rejected by admin'}
                                            {payment.admin_status === 'seen' && 'Payment reviewed but pending decision'}
                                            {payment.admin_status === 'unseen' && 'Payment awaiting admin review'}
                                        </p>
                                        {payment.admin_name && payment.admin_action_at && (
                                            <p className="text-xs text-muted-foreground">
                                                by {payment.admin_name} • {formatDate(payment.admin_action_at)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Flow Indicator */}
                                <div className="flex items-center justify-center space-x-4 py-4">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                        payment.gateway_status === 'paid' || payment.gateway_status === 'proof_uploaded'
                                            ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                                    }`}>
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Gateway</span>
                                    </div>
                                    <div className={`h-px flex-1 ${
                                        payment.gateway_status === 'paid' || payment.gateway_status === 'proof_uploaded'
                                            ? 'bg-green-300' : 'bg-gray-300'
                                    }`} />
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                        payment.admin_status === 'approved'
                                            ? 'bg-green-50 text-green-700' : 
                                            isAwaitingApproval 
                                                ? 'bg-orange-50 text-orange-700'
                                                : 'bg-gray-50 text-gray-500'
                                    }`}>
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Admin</span>
                                    </div>
                                    <div className={`h-px flex-1 ${
                                        isFullyCompleted ? 'bg-green-300' : 'bg-gray-300'
                                    }`} />
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                        isFullyCompleted
                                            ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                                    }`}>
                                        <Package className="h-4 w-4" />
                                        <span className="text-sm font-medium">Fulfillment</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Transaction Reference</Label>
                                        <p className="font-mono text-sm">{payment.tx_ref}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                                        <p className="font-mono text-sm">{payment.order_id || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                                        <p className="text-lg font-semibold">{formatCurrency(payment.amount, payment.currency)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                                        <p className="text-sm capitalize">{payment.payment_method}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Transaction Date</Label>
                                        <p className="text-sm">{formatDate(payment.created_at)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Currency</Label>
                                        <p className="text-sm">{payment.currency}</p>
                                    </div>
                                </div>

                                {/* Admin Notes Display */}
                                {payment.admin_notes && (
                                    <div className="border-t pt-4">
                                        <Label className="text-sm font-medium text-muted-foreground">Admin Notes</Label>
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm">{payment.admin_notes}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                        <p className="text-sm">{payment.customer_name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm">{payment.customer_email}</p>
                                            {payment.email_verified_at && (
                                                <Badge variant="outline" className="text-xs">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {payment.customer_phone && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm">{payment.customer_phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {payment.customer_since && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Customer Since</Label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm">{formatDate(payment.customer_since)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Address Information */}
                                {(payment.address_line_1 || payment.city || payment.state || payment.country) && (
                                    <div className="space-y-2 border-t pt-4">
                                        <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            Address
                                        </Label>
                                        <div className="space-y-1 text-sm">
                                            {payment.address_line_1 && <p>{payment.address_line_1}</p>}
                                            <p>{[payment.city, payment.state, payment.country].filter(Boolean).join(', ')}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        {orderItems.length > 0 && (
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Order Items
                                    </CardTitle>
                                    <CardDescription>Order Total: {formatCurrency(payment.order_total || 0, payment.currency)}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
                                                {item.primary_image && (
                                                    <img
                                                        src={item.primary_image || '/placeholder.svg'}
                                                        alt={item.product_name}
                                                        className="h-16 w-16 rounded-md object-cover"
                                                    />
                                                )}
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-medium">{item.product_name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantity: {item.quantity} × {formatCurrency(item.price, payment.currency)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.total, payment.currency)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Admin Actions */}
                    <div className="space-y-6">
                        {/* Admin Actions */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Admin Actions</CardTitle>
                                <CardDescription>
                                    Review and approve/reject this payment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeAction === null ? (
                                    <div className="space-y-3">
                                        {canApprove && (
                                            <Button 
                                                onClick={() => setActiveAction('approve')} 
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve Payment
                                            </Button>
                                        )}
                                        
                                        {canReject && (
                                            <Button 
                                                variant="destructive"
                                                onClick={() => setActiveAction('reject')} 
                                                className="w-full"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Reject Payment
                                            </Button>
                                        )}

                                        {!canApprove && !canReject && (
                                            <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg">
                                                {payment.admin_status === 'approved' && 'Payment has been approved'}
                                                {payment.admin_status === 'rejected' && 'Payment has been rejected'}
                                                {(payment.gateway_status === 'pending' || payment.gateway_status === 'failed') && 'Payment not ready for review'}
                                            </div>
                                        )}
                                    </div>
                                ) : activeAction === 'approve' ? (
                                    <form onSubmit={handleApprove} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="approve-notes">Notes (Optional)</Label>
                                            <Textarea
                                                id="approve-notes"
                                                value={approveForm.data.notes}
                                                onChange={(e) => approveForm.setData('notes', e.target.value)}
                                                placeholder="Add any notes about this approval..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                type="submit" 
                                                disabled={approveForm.processing} 
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Confirm Approval
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setActiveAction(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleReject} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reject-notes">Rejection Reason (Required)</Label>
                                            <Textarea
                                                id="reject-notes"
                                                value={rejectForm.data.notes}
                                                onChange={(e) => rejectForm.setData('notes', e.target.value)}
                                                placeholder="Please provide a reason for rejecting this payment..."
                                                rows={3}
                                                required
                                            />
                                            {rejectForm.errors.notes && (
                                                <p className="text-sm text-red-600">{rejectForm.errors.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                type="submit" 
                                                disabled={rejectForm.processing} 
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Confirm Rejection
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setActiveAction(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Payment History */}
                        {customerPaymentHistory.length > 0 && (
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Payment History</CardTitle>
                                    <CardDescription>Recent payments from this customer</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {customerPaymentHistory.map((historyPayment) => {
                                            const historyGatewayStatus = getGatewayStatusDisplay(historyPayment.gateway_status);
                                            const historyAdminStatus = getAdminStatusDisplay(historyPayment.admin_status);
                                            
                                            return (
                                                <div key={historyPayment.id} className="flex items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">#{historyPayment.tx_ref}</p>
                                                        <p className="text-xs text-muted-foreground">{formatDate(historyPayment.created_at)}</p>
                                                        <div className="flex gap-1">
                                                            <Badge variant="outline" className={`${historyGatewayStatus.class} text-xs`}>
                                                                {historyGatewayStatus.text}
                                                            </Badge>
                                                            <Badge variant="outline" className={`${historyAdminStatus.class} text-xs`}>
                                                                {historyAdminStatus.text}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-right">
                                                        <p className="text-sm font-medium">
                                                            {formatCurrency(historyPayment.amount, historyPayment.currency)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}