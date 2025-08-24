import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Package, Eye, Calendar, DollarSign } from 'lucide-react';
import MainLayout from '@/layouts/app/main-layout';

interface OrderItem {
    id: number;
    product_name: string;
    product_slug: string;
    quantity: number;
    price: number;
    primary_image?: string;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

interface UserOrdersProps {
    orders: Order[];
}

export default function UserOrders({ orders = [] }: UserOrdersProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <MainLayout title="My Orders - ShopHub">
            <div className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-600">Track your order history and status</p>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Orders Yet</h3>
                            <p className="mb-6 text-gray-600">You haven't placed any orders yet.</p>
                            <Button asChild>
                                <Link href={route('home')}>
                                    Start Shopping
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-gray-50">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Order #{order.order_number}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(order.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {formatPrice(order.total_amount)}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                                                {order.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Order Items Preview */}
                                    <div className="mb-6">
                                        <h4 className="mb-3 font-semibold">Items</h4>
                                        <div className="space-y-3">
                                            {order.items.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    <img
                                                        src={item.primary_image || '/placeholder.svg?height=50&width=50&query=product'}
                                                        alt={item.product_name}
                                                        className="h-12 w-12 rounded-md object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.product_name}</p>
                                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-sm text-gray-600">
                                                    +{order.items.length - 3} more items
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                                        <div className="text-sm text-gray-600">
                                            <p>Total: <span className="font-semibold">{formatPrice(order.total_amount)}</span></p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/user/orders/${order.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </Button>
                                            <Button size="sm" asChild>
                                                <Link href={`/user/orders/${order.id}/track`}>
                                                    <Package className="mr-2 h-4 w-4" />
                                                    Track Order
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
