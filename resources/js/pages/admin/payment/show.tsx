import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, DollarSign, Edit, History, Mail, MapPin, Package, Phone, User } from 'lucide-react';
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
            title: 'Payments',
            href: '/admin/payments',
        },
        {
            title: `Transaction ${payment.tx_ref}`,
            href: `/admin/payments/${payment.id}`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        status: payment.status,
        notes: payment.admin_notes || '',
    });

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/payments/${payment.id}/status`, {
            onSuccess: () => {
                setIsEditingStatus(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'refunded':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refunded</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPaymentMethodBadge = (method: string) => {
        switch (method) {
            case 'telebirr':
                return <Badge className="bg-purple-100 text-purple-800">Telebirr</Badge>;
            case 'cbe':
                return <Badge className="bg-blue-100 text-blue-800">CBE</Badge>;
            case 'paypal':
                return <Badge className="bg-indigo-100 text-indigo-800">PayPal</Badge>;
            default:
                return <Badge variant="outline">{method}</Badge>;
        }
    };

    const formatPrice = (amount: number, currency: string = 'ETB') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const handleStatusChange = (value: string) => {
        if (['pending', 'completed', 'failed', 'refunded'].includes(value)) {
            setData('status', value as 'pending' | 'completed' | 'failed' | 'refunded');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Payment: ${payment.tx_ref}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/payments">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment Details</h1>
                            <p className="text-muted-foreground">Transaction {payment.tx_ref}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {payment.customer_id && (
                            <Link href={`/admin/customers/${payment.customer_id}`}>
                                <Button variant="outline">View Customer</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Transaction Overview */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Transaction Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Amount</p>
                                                <p className="text-lg font-bold text-primary">{formatPrice(payment.amount, payment.currency)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Order ID</p>
                                                <p className="font-mono text-sm text-muted-foreground">{payment.order_id}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Transaction Date</p>
                                                <p className="text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-sm font-medium">Payment Method</p>
                                                <div className="mt-1">{getPaymentMethodBadge(payment.payment_method)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-sm font-medium">Status</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {getStatusBadge(payment.status)}
                                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingStatus(!isEditingStatus)}>
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-sm font-medium">Transaction Reference</p>
                                                <p className="font-mono text-sm text-muted-foreground">{payment.tx_ref}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Update Form */}
                                {isEditingStatus && (
                                    <div className="mt-6 rounded-lg border bg-muted/30 p-4">
                                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Update Status</label>
                                                <Select value={data.status} onValueChange={handleStatusChange}>
                                                    <SelectTrigger className="mt-1">
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
                                            <div>
                                                <label className="text-sm font-medium">Admin Notes</label>
                                                <Textarea
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Add notes about this status change..."
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="submit" size="sm" disabled={processing}>
                                                    {processing ? 'Updating...' : 'Update Status'}
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingStatus(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
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
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Name</p>
                                                <p className="text-sm text-muted-foreground">{payment.customer_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Email</p>
                                                <p className="text-sm text-muted-foreground">{payment.customer_email}</p>
                                                {payment.email_verified_at && (
                                                    <Badge className="mt-1 bg-green-100 text-xs text-green-800">Verified</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {payment.customer_phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-muted-foreground">{payment.customer_phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {payment.customer_since && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Customer Since</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(payment.customer_since).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(payment.address_line_1 || payment.city) && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Address</p>
                                                    <div className="text-sm text-muted-foreground">
                                                        {payment.address_line_1 && <p>{payment.address_line_1}</p>}
                                                        {payment.city && (
                                                            <p>
                                                                {payment.city}
                                                                {payment.state && `, ${payment.state}`}
                                                            </p>
                                                        )}
                                                        {payment.country && <p>{payment.country}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                    <CardDescription>Items purchased in this transaction</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {orderItems.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                                                <img
                                                    src={item.primary_image || '/placeholder.svg?height=60&width=60&query=product'}
                                                    alt={item.product_name}
                                                    className="h-15 w-15 rounded-md object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.product_name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantity: {item.quantity} × {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatPrice(item.total)}</p>
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
                        {/* Quick Actions */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {payment.customer_id && (
                                    <Link href={`/admin/customers/${payment.customer_id}`} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <User className="mr-2 h-4 w-4" />
                                            View Customer Profile
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="outline" className="w-full justify-start">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email to Customer
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Package className="mr-2 h-4 w-4" />
                                    View Order Details
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        {customerPaymentHistory.length > 0 && (
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <History className="h-4 w-4" />
                                        Customer Payment History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {customerPaymentHistory.map((historyPayment) => (
                                        <div key={historyPayment.id} className="flex items-center justify-between rounded border p-2">
                                            <div>
                                                <p className="text-sm font-medium">{formatPrice(historyPayment.amount, historyPayment.currency)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(historyPayment.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">{getStatusBadge(historyPayment.status)}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Notes */}
                        {payment.admin_notes && (
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Admin Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{payment.admin_notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
