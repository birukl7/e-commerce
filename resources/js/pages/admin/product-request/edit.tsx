import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '../dashboard';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    admin_response?: string;
    amount?: number | string;
    currency?: string;
    payment_status?: string;
    user: User;
    created_at: string;
    updated_at: string;
}


interface ProductRequestEditProps {
    product_request: ProductRequest;
}

export default function ProductRequestEdit({ product_request }: ProductRequestEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        status: product_request.status,
        admin_response: product_request.admin_response || '',
        amount: product_request.amount || '',
        currency: product_request.currency || 'ETB',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/product-requests/${product_request.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin-dashboard' },
        { title: 'Product Requests', href: '/admin/product-requests' },
        { title: 'Edit Request', href: '/admin/product-requests/edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Update Request: ${product_request.product_name}`} />

            <div className=" mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href={`/admin/product-requests/${product_request.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to request details
                </Link>
                <form onSubmit={submit}>
                    <Card className="mb-4 w-full">
                        <CardHeader>
                            <CardTitle>Update Product Request</CardTitle>
                            <CardDescription>
                                Change the status and provide feedback for '{product_request.product_name}'.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Request Details */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h3 className="font-semibold text-gray-800 mb-2">Request Details</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Requested by:</span> {product_request.user.name} ({product_request.user.email})</p>
                                    <p><span className="font-medium">Product:</span> {product_request.product_name}</p>
                                    <p><span className="font-medium">Current Status:</span> 
                                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                                            product_request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            product_request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            product_request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {product_request.status.charAt(0).toUpperCase() + product_request.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-base font-semibold">Update Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                                        <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                    Pending
                                                </div>
                                            </SelectItem>
                                        <SelectItem value="reviewed">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Reviewed
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Approved
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                Rejected
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-red-500 flex items-center gap-1">
                                    <span className="font-medium">Error:</span> {errors.status}
                                </p>}
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin_response" className="text-base font-semibold">Admin Response</Label>
                                    <Textarea
                                        id="admin_response"
                                        value={data.admin_response}
                                        onChange={(e) => setData('admin_response', e.target.value)}
                                        placeholder="Provide feedback or instructions for the user..."
                                        className={errors.admin_response ? "border-red-500" : ""}
                                        rows={4}
                                    />
                                    {errors.admin_response && <p className="text-sm text-red-500">{errors.admin_response}</p>}
                                </div>

                                {data.status === 'approved' && (
                                    <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
                                        <h3 className="font-medium">Payment Information</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="amount" className="font-medium">Amount *</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        {data.currency}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        id="amount"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.amount}
                                                        onChange={(e) => setData('amount', e.target.value)}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-16 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="0.00"
                                                        required={data.status === 'approved'}
                                                    />
                                                </div>
                                                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor="currency" className="font-medium">Currency *</Label>
                                                <Select 
                                                    value={data.currency} 
                                                    onValueChange={(value) => setData('currency', value)}
                                                >
                                                    <SelectTrigger id="currency" className="w-full">
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
                                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.currency && <p className="text-sm text-red-500">{errors.currency}</p>}
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground">
                                            The user will be required to pay this amount to proceed with their request.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Request'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
