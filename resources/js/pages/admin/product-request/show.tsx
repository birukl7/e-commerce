import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

// Type definitions
interface User {
    id: number;
    name: string;
    email: string;
}

interface ProductRequest {
    id: number;
    product_name: string;
    description: string;
    image?: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    admin_response?: string;
    created_at: string;
    updated_at: string;
    user: User;
    admin?: User;
    // Workflow fields
    amount?: number;
    currency?: string;
    advance_amount?: number;
    final_amount?: number;
    advance_payment_status?: string;
    final_payment_status?: string;
    advance_paid_at?: string;
    final_paid_at?: string;
    customer_willing_to_buy?: boolean;
    willingness_confirmed_at?: string;
    procurement_status?: string;
    procurement_started_at?: string;
    procurement_completed_at?: string;
    product_arrived_at?: string;
    workflow_status?: string;
}


interface ProductRequestShowProps {
    product_request: ProductRequest;
}

export default function ProductRequestShow({ product_request }: ProductRequestShowProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'reviewed':
                return 'default';
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };


    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin-dashboard' },
        { title: 'Product Requests', href: '/admin/product-requests' },
        { title: product_request.product_name, href: `/admin/product-requests/${product_request.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Request: ${product_request.product_name}`} />

            <div className=" mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/admin/product-requests" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to all requests
                </Link>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{product_request.product_name}</CardTitle>
                                <CardDescription>
                                    Requested by {product_request.user.name} on {formatDate(product_request.created_at)}
                                </CardDescription>
                            </div>
                            <Badge variant={getStatusBadge(product_request.status)} className="capitalize">
                                {product_request.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {product_request.image && (
                            <div>
                                <h3 className="mb-2 font-semibold">Reference Image</h3>
                                <img
                                    src={`/storage/${product_request.image}`}
                                    alt={product_request.product_name}
                                    className="max-h-96 w-auto rounded-lg border"
                                />
                            </div>
                        )}
                        <div>
                            <h3 className="mb-2 font-semibold">Description</h3>
                            <p className="text-muted-foreground">{product_request.description}</p>
                        </div>
                        {product_request.admin_response && (
                            <div className="rounded-md border bg-muted/50 p-4">
                                <h3 className="mb-2 font-semibold">Admin Response</h3>
                                <p className="text-sm text-muted-foreground">{product_request.admin_response}</p>
                                {product_request.admin && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        by {product_request.admin.name} on {formatDate(product_request.updated_at)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Workflow Status Section */}
                        {product_request.status === 'approved' && (
                            <div className="rounded-md border bg-blue-50 p-4">
                                <h3 className="mb-4 font-semibold text-blue-900">Workflow Status</h3>
                                
                                {/* Customer Willingness */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${product_request.customer_willing_to_buy ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className="font-medium">Customer Willingness</span>
                                        <Badge variant={product_request.customer_willing_to_buy ? 'default' : 'secondary'}>
                                            {product_request.customer_willing_to_buy ? 'Confirmed' : 'Pending'}
                                        </Badge>
                                    </div>
                                    {product_request.willingness_confirmed_at && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Confirmed on {formatDate(product_request.willingness_confirmed_at)}
                                        </p>
                                    )}
                                </div>

                                {/* Advance Payment */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            product_request.advance_payment_status === 'paid' ? 'bg-green-500' : 
                                            product_request.advance_payment_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                                        }`}></div>
                                        <span className="font-medium">Advance Payment</span>
                                        <Badge variant={
                                            product_request.advance_payment_status === 'paid' ? 'default' : 
                                            product_request.advance_payment_status === 'pending' ? 'secondary' : 'outline'
                                        }>
                                            {product_request.advance_payment_status || 'Not Required'}
                                        </Badge>
                                    </div>
                                    {product_request.advance_amount && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Amount: {product_request.currency} {product_request.advance_amount}
                                            {product_request.advance_paid_at && (
                                                <span> - Paid on {formatDate(product_request.advance_paid_at)}</span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Procurement Status */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            product_request.procurement_status === 'completed' ? 'bg-green-500' : 
                                            product_request.procurement_status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                                        }`}></div>
                                        <span className="font-medium">Procurement</span>
                                        <Badge variant={
                                            product_request.procurement_status === 'completed' ? 'default' : 
                                            product_request.procurement_status === 'in_progress' ? 'secondary' : 'outline'
                                        }>
                                            {product_request.procurement_status || 'Not Started'}
                                        </Badge>
                                    </div>
                                    {product_request.procurement_started_at && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Started on {formatDate(product_request.procurement_started_at)}
                                            {product_request.procurement_completed_at && (
                                                <span> - Completed on {formatDate(product_request.procurement_completed_at)}</span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Final Payment */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            product_request.final_payment_status === 'paid' ? 'bg-green-500' : 
                                            product_request.final_payment_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                                        }`}></div>
                                        <span className="font-medium">Final Payment</span>
                                        <Badge variant={
                                            product_request.final_payment_status === 'paid' ? 'default' : 
                                            product_request.final_payment_status === 'pending' ? 'secondary' : 'outline'
                                        }>
                                            {product_request.final_payment_status || 'Not Required'}
                                        </Badge>
                                    </div>
                                    {product_request.final_amount && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Amount: {product_request.currency} {product_request.final_amount}
                                            {product_request.final_paid_at && (
                                                <span> - Paid on {formatDate(product_request.final_paid_at)}</span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Product Arrival */}
                                {product_request.product_arrived_at && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="font-medium">Product Arrived</span>
                                            <Badge variant="default">Delivered</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 ml-5">
                                            Arrived on {formatDate(product_request.product_arrived_at)}
                                        </p>
                                    </div>
                                )}

                                {/* Overall Workflow Status */}
                                {product_request.workflow_status && (
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-blue-900">Overall Status:</span>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {product_request.workflow_status}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button asChild>
                            <Link href={`/admin/product-requests/${product_request.id}/edit`}>Update Status</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
