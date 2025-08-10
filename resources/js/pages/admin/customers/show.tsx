import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, ShoppingBag, User, Verified } from 'lucide-react';
import { adminNavItems } from '../dashboard';

interface Address {
    id: number;
    type: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    is_default: boolean;
}

interface Order {
    id: number;
    order_number?: string;
    status: string;
    total_amount: number;
    created_at: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'banned';
    email_verified_at?: string;
    created_at: string;
    profile_image?: string;
    addresses?: Address[];
    orders?: Order[];
    orders_count?: number;
    total_spent?: number;
}

interface Props {
    customer: Customer;
}

export default function ShowCustomer({ customer }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Customers',
            href: '/admin/customers',
        },
        {
            title: customer.name,
            href: `/admin/customers/${customer.id}`,
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'banned':
                return <Badge variant="destructive">Banned</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getOrderStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'processing':
                return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Customer: ${customer.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/customers">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{customer.name}</h1>
                            <p className="text-muted-foreground">Customer details and account information</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Customer Overview */}
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
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Email</p>
                                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                                            </div>
                                        </div>

                                        {customer.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Phone</p>
                                                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Member Since</p>
                                                <p className="text-sm text-muted-foreground">{new Date(customer.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="text-sm font-medium">Account Status</p>
                                                <div className="mt-1">{getStatusBadge(customer.status)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Verified className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Email Verification</p>
                                                <div className="mt-1">
                                                    {customer.email_verified_at ? (
                                                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Unverified</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Total Orders</p>
                                                <p className="text-sm text-muted-foreground">{customer.orders_count || 0} orders</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Orders */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Recent Orders
                                </CardTitle>
                                <CardDescription>Latest orders from this customer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {customer.orders && customer.orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                                                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Total</th>
                                                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customer.orders.slice(0, 5).map((order) => (
                                                    <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                                                        <td className="p-4 font-medium">#{order.id}</td>
                                                        <td className="p-4">{getOrderStatusBadge(order.status)}</td>
                                                        <td className="p-4">${order.total_amount.toFixed(2)}</td>
                                                        <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">No orders found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Addresses */}
                        {customer.addresses && customer.addresses.length > 0 && (
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Addresses
                                    </CardTitle>
                                    <CardDescription>Customer's saved addresses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {customer.addresses.map((address, index) => (
                                            <div key={address.id}>
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium capitalize">{address.type} Address</p>
                                                            {address.is_default && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {address.address_line_1}
                                                            {address.address_line_2 && `, ${address.address_line_2}`}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {address.city}, {address.state} {address.postal_code}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{address.country}</p>
                                                        {address.phone && <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>}
                                                    </div>
                                                </div>
                                                {index < customer.addresses!.length - 1 && <Separator className="mt-4" />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Orders</span>
                                    <span className="font-medium">{customer.orders_count || 0}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Spent</span>
                                    <span className="font-medium">${customer.total_spent?.toFixed(2) || '0.00'}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Addresses</span>
                                    <span className="font-medium">{customer.addresses?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Actions */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Account Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    View All Orders
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
