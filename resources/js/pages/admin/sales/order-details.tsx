import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    Ban,
    Eye,
    ShoppingCart,
    User,
    MapPin,
    CreditCard,
    Package,
    Calendar,
    DollarSign,
    FileText,
    ExternalLink
} from 'lucide-react';
import { adminNavItems } from '../dashboard';

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        price: number;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
    };
    quantity: number;
    price: number;
    total: number;
}

interface PaymentTransaction {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    payment_method: string;
    gateway_status: 'pending' | 'proof_uploaded' | 'paid' | 'failed' | 'refunded';
    admin_status: 'unseen' | 'seen' | 'approved' | 'rejected';
    created_at: string;
    admin_action_at: string | null;
    admin_notes: string | null;
}

interface UserAddress {
    id: number;
    type: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
}

interface Order {
    id: number;
    order_number: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    shipping_address: UserAddress;
    billing_address: UserAddress;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
    payment_transactions: PaymentTransaction[];
}

interface OrderDetailsProps {
    order: Order;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Sales Dashboard',
        href: '/admin/sales',
    },
    {
        title: 'Order Details',
        href: '#',
    },
];

export default function OrderDetails({ order }: OrderDetailsProps) {
    const handlePaymentAction = (paymentId: number, action: 'approve' | 'reject' | 'mark-seen') => {
        const endpoint = action === 'mark-seen' ? 'mark-seen' : action;
        router.post(`/admin/payments/${paymentId}/${endpoint}`, {}, {
            onSuccess: () => {
                router.reload({ only: ['order'] });
            },
        });
    };

    const getStatusBadge = (status: string, type: 'order' | 'payment' | 'gateway') => {
        const baseClasses = "inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full";
        
        if (type === 'order') {
            switch (status) {
                case 'pending':
                    return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}><AlertTriangle className="h-4 w-4"/>Pending</Badge>;
                case 'processing':
                    return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}><Package className="h-4 w-4"/>Processing</Badge>;
                case 'shipped':
                    return <Badge className={`${baseClasses} bg-purple-100 text-purple-800`}><Package className="h-4 w-4"/>Shipped</Badge>;
                case 'delivered':
                    return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-4 w-4"/>Delivered</Badge>;
                case 'cancelled':
                    return <Badge className={`${baseClasses} bg-red-100 text-red-800`}><Ban className="h-4 w-4"/>Cancelled</Badge>;
                default:
                    return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>;
            }
        } else if (type === 'payment') {
            switch (status) {
                case 'unseen':
                    return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}><AlertTriangle className="h-4 w-4"/>Unseen</Badge>;
                case 'seen':
                    return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}><Eye className="h-4 w-4"/>Seen</Badge>;
                case 'approved':
                    return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-4 w-4"/>Approved</Badge>;
                case 'rejected':
                    return <Badge className={`${baseClasses} bg-red-100 text-red-800`}><Ban className="h-4 w-4"/>Rejected</Badge>;
                default:
                    return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>;
            }
        } else {
            switch (status) {
                case 'paid':
                    return <Badge className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="h-4 w-4"/>Paid</Badge>;
                case 'pending':
                    return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}><AlertTriangle className="h-4 w-4"/>Pending</Badge>;
                case 'proof_uploaded':
                    return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}><FileText className="h-4 w-4"/>Proof Uploaded</Badge>;
                case 'failed':
                    return <Badge className={`${baseClasses} bg-red-100 text-red-800`}><Ban className="h-4 w-4"/>Failed</Badge>;
                default:
                    return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>;
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Order Details - ${order.order_number}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex w-full flex-col p-6 font-sans max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/sales">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Sales
                                </Link>
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Order Details
                                </h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Order #{order.order_number} • {new Date(order.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadge(order.status, 'order')}
                                {getStatusBadge(order.payment_status, 'payment')}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-gray-800">
                                        <div className="p-1.5 bg-blue-100 rounded-md">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Order Items
                                    </CardTitle>
                                    <CardDescription>Products included in this order</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50/50">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.product.images.length > 0 ? (
                                                        <img
                                                            src={item.product.images[0].image_path}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                    <p className="text-sm text-gray-500">Price: ETB {item.price.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">ETB {item.total.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Separator className="my-6" />
                                    
                                    <div className="flex justify-between items-center text-lg font-semibold">
                                        <span>Total Amount:</span>
                                        <span className="text-primary">ETB {order.total_amount.toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Transactions */}
                            {order.payment_transactions.length > 0 && (
                                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                                        <CardTitle className="flex items-center gap-2 text-gray-800">
                                            <div className="p-1.5 bg-green-100 rounded-md">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            Payment Transactions
                                        </CardTitle>
                                        <CardDescription>Payment details and admin actions</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {order.payment_transactions.map((payment) => (
                                                <div key={payment.id} className="border rounded-lg p-4 bg-gray-50/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Transaction #{payment.tx_ref}</h4>
                                                            <p className="text-sm text-gray-500">{payment.payment_method}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {getStatusBadge(payment.gateway_status, 'gateway')}
                                                            {getStatusBadge(payment.admin_status, 'payment')}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Amount</p>
                                                            <p className="font-medium">{payment.currency} {payment.amount.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Date</p>
                                                            <p className="font-medium">{new Date(payment.created_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {payment.admin_notes && (
                                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <p className="text-sm text-yellow-800">
                                                                <strong>Admin Notes:</strong> {payment.admin_notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex gap-2">
                                                        {payment.admin_status === 'unseen' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handlePaymentAction(payment.id, 'mark-seen')}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Mark as Seen
                                                            </Button>
                                                        )}
                                                        {payment.admin_status !== 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve Payment
                                                            </Button>
                                                        )}
                                                        {payment.admin_status !== 'rejected' && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handlePaymentAction(payment.id, 'reject')}
                                                            >
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Reject Payment
                                                            </Button>
                                                        )}
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
                            {/* Customer Information */}
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-gray-800">
                                        <div className="p-1.5 bg-purple-100 rounded-md">
                                            <User className="h-5 w-5 text-purple-600" />
                                        </div>
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{order.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{order.user.email}</p>
                                        </div>
                                        {order.user.phone && (
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium">{order.user.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-gray-800">
                                        <div className="p-1.5 bg-blue-100 rounded-md">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-2 text-sm">
                                        <p className="font-medium">{order.shipping_address.address_line_1}</p>
                                        {order.shipping_address.address_line_2 && (
                                            <p>{order.shipping_address.address_line_2}</p>
                                        )}
                                        <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                        <p>{order.shipping_address.postal_code}</p>
                                        <p>{order.shipping_address.country}</p>
                                        <p className="text-gray-500">Phone: {order.shipping_address.phone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-gray-800">
                                        <div className="p-1.5 bg-gray-100 rounded-md">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                        </div>
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Order Number</span>
                                            <span className="font-medium">#{order.order_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Order Date</span>
                                            <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Last Updated</span>
                                            <span className="font-medium">{new Date(order.updated_at).toLocaleDateString()}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total Amount</span>
                                            <span className="text-primary">ETB {order.total_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
