import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, Mail, MapPin, Package, Phone, Save, User } from 'lucide-react';
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
    status: 'pending' | 'completed' | 'failed' | 'refunded';
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
    chapa_data?: any;
    admin_notes?: string;
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
}

export default function ShowPayment({ payment, orderItems, customerPaymentHistory }: Props) {
    const [isEditingStatus, setIsEditingStatus] = useState(false);

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

    const { data, setData, put, processing } = useForm({
        status: payment.status,
        notes: payment.admin_notes || '',
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

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'refunded':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/payments/${payment.id}/status`, {
            onSuccess: () => {
                setIsEditingStatus(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Payment #${payment.tx_ref}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans">
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
                        <Badge className={getStatusBadgeClass(payment.status)}>{payment.status}</Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Payment Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Payment Information */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                                <CardDescription>Transaction #{payment.tx_ref}</CardDescription>
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

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Management */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Status Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditingStatus ? (
                                    <form onSubmit={handleStatusUpdate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="failed">Failed</SelectItem>
                                                    <SelectItem value="refunded">Refunded</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Admin Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Add notes about this payment..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={processing} className="flex-1">
                                                <Save className="mr-2 h-4 w-4" />
                                                Save
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setIsEditingStatus(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Current Status</Label>
                                            <Badge className={getStatusBadgeClass(payment.status)}>{payment.status}</Badge>
                                        </div>
                                        {payment.admin_notes && (
                                            <div className="space-y-2">
                                                <Label>Admin Notes</Label>
                                                <p className="text-sm text-muted-foreground">{payment.admin_notes}</p>
                                            </div>
                                        )}
                                        <Button onClick={() => setIsEditingStatus(true)} variant="outline" className="w-full">
                                            Edit Status
                                        </Button>
                                    </div>
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
                                        {customerPaymentHistory.map((historyPayment) => (
                                            <div key={historyPayment.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">#{historyPayment.tx_ref}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(historyPayment.created_at)}</p>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(historyPayment.amount, historyPayment.currency)}
                                                    </p>
                                                    <Badge className={getStatusBadgeClass(historyPayment.status)} variant="outline">
                                                        {historyPayment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
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
