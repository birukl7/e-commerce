import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Package, 
    ShoppingCart, 
    DollarSign, 
    TrendingUp, 
    Eye, 
    Edit, 
    Plus,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import SupplierLayout from '@/layouts/SupplierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    moderation_status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
    visibility: 'private' | 'public';
    primary_image?: string;
    created_at: string;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer_name: string;
}

interface SupplierProfile {
    business_name: string;
    verification_status: 'pending' | 'approved' | 'rejected' | 'banned';
    default_commission_rate: number;
}

interface DashboardData {
    supplier: SupplierProfile;
    stats: {
        total_products: number;
        approved_products: number;
        pending_products: number;
        rejected_products: number;
        total_orders: number;
        total_earnings: number;
        monthly_earnings: number;
        pending_orders: number;
    };
    recent_products: Product[];
    recent_orders: Order[];
    products_by_status: {
        draft: number;
        pending_review: number;
        approved: number;
        rejected: number;
        suspended: number;
    };
}

interface Props {
    data: DashboardData;
}

export default function SupplierDashboard({ data }: Props) {
    const { supplier, stats, recent_products, recent_orders, products_by_status } = data;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending_review':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'suspended':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'suspended':
                return 'bg-orange-100 text-orange-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <SupplierLayout title="Dashboard">
            <Head title="Supplier Dashboard" />

            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {supplier.business_name}!
                </h1>
                <p className="mt-2 text-gray-600">
                    Here's what's happening with your store today.
                </p>
            </div>

            {/* Status Alert */}
            {supplier.verification_status === 'pending' && (
                <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Account Pending Approval
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                Your supplier account is currently under review. You can still add products, 
                                but they won't be visible to customers until your account is approved.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_products}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.approved_products} approved
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_orders}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pending_orders} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.total_earnings)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats.monthly_earnings)} this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{supplier.default_commission_rate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Platform commission
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Product Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Status Overview</CardTitle>
                        <CardDescription>
                            Distribution of your products by status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(products_by_status).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(status)}
                                        <span className="text-sm font-medium capitalize">
                                            {status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{count}</span>
                                        <div className="w-20">
                                            <Progress 
                                                value={(count / stats.total_products) * 100} 
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks you can perform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button asChild className="w-full justify-start">
                                <Link href="/supplier/products/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Product
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/supplier/products">
                                    <Package className="h-4 w-4 mr-2" />
                                    Manage Products
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/supplier/orders">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    View Orders
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/supplier/earnings">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    View Earnings
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Products and Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Products</CardTitle>
                                <CardDescription>
                                    Your latest product additions
                                </CardDescription>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/supplier/products">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent_products.length > 0 ? (
                                recent_products.map((product) => (
                                    <div key={product.id} className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            {product.primary_image ? (
                                                <img
                                                    src={product.primary_image}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatCurrency(product.price)} • {product.stock_quantity} in stock
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={getStatusColor(product.moderation_status)}>
                                                {product.moderation_status.replace('_', ' ')}
                                            </Badge>
                                            <div className="flex space-x-1">
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No products yet</p>
                                    <Button asChild className="mt-2">
                                        <Link href="/supplier/products/create">Add Your First Product</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>
                                    Latest orders for your products
                                </CardDescription>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/supplier/orders">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent_orders.length > 0 ? (
                                recent_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                Order #{order.order_number}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.customer_name} • {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                            <Badge variant="outline">
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No orders yet</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Orders will appear here when customers purchase your products
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SupplierLayout>
    );
}
