import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';

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
    status: 'pending' | 'approved' | 'rejected';
    admin_response?: string;
    rejection_reason?: string;
    amount?: number | string;
    estimated_arrival_date?: string;
    currency?: string;
    payment_status?: string;
    available?: boolean | null;
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
        rejection_reason: product_request.rejection_reason || '',
        amount: product_request.amount || '',
        estimated_arrival_date: product_request.estimated_arrival_date || '',
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

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={`/admin/product-requests/${product_request.id}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to request details
                </Link>
                <form onSubmit={submit}>
                    <Card className="mb-4 w-full">
                        <CardHeader>
                            <CardTitle>Update Product Request</CardTitle>
                            <CardDescription>Change the status and provide feedback for '{product_request.product_name}'.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Request Details */}
                            <div className="rounded-lg border bg-gray-50 p-4">
                                <h3 className="mb-2 font-semibold text-gray-800">Request Details</h3>
                                <div className="space-y-2">
                                    <p>
                                        <span className="font-medium">Requested by:</span> {product_request.user.name} ({product_request.user.email})
                                    </p>
                                    <p>
                                        <span className="font-medium">Product:</span> {product_request.product_name}
                                    </p>
                                    <p>
                                        <span className="font-medium">Current Status:</span>
                                        <span
                                            className={`ml-2 rounded px-2 py-1 text-sm ${
                                                product_request.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : product_request.status === 'approved'
                                                      ? 'bg-green-100 text-green-800'
                                                      : product_request.status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {product_request.status.charAt(0).toUpperCase() + product_request.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-base font-semibold">
                                        Update Status *
                                    </Label>
                                    {/* If status is already approved with price/arrival date set, disable status change */}
                                    {/* If status is rejected, prevent changing to approved */}
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(value) => setData('status', value as any)}
                                        disabled={
                                            (product_request.status === 'approved' && product_request.amount && product_request.estimated_arrival_date) ||
                                            product_request.status === 'rejected'
                                        }
                                    >
                                        <SelectTrigger id="status" className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                    Pending
                                                </div>
                                            </SelectItem>
                                            <SelectItem 
                                                value="approved"
                                                disabled={product_request.status === 'rejected'}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    Approved
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    Rejected
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="flex items-center gap-1 text-sm text-red-500">
                                            <span className="font-medium">Error:</span> {errors.status}
                                        </p>
                                    )}
                                    {product_request.status === 'rejected' && (
                                        <p className="text-xs text-amber-600">
                                            ⚠ Once a request is rejected, it cannot be changed back to approved.
                                        </p>
                                    )}
                                    {product_request.status === 'approved' && product_request.amount && product_request.estimated_arrival_date && (
                                        <p className="text-xs text-blue-600">
                                            ℹ Status cannot be changed after approval with price and arrival date set. Only the arrival date can be updated below.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data.status === 'rejected' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="rejection_reason" className="text-base font-semibold">
                                            Rejection Reason *
                                        </Label>
                                        <Select 
                                            value={data.rejection_reason} 
                                            onValueChange={(value) => setData('rejection_reason', value)}
                                        >
                                            <SelectTrigger id="rejection_reason" className={errors.rejection_reason ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select a reason for rejection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="product_not_available">Product Not Available</SelectItem>
                                                <SelectItem value="specifications_not_matching">Specifications Not Matching</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                                <SelectItem value="discontinued">Product Discontinued</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.rejection_reason && (
                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                <span className="font-medium">Error:</span> {errors.rejection_reason}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Select the primary reason for rejecting this product request. This will help us provide better feedback to the customer.
                                        </p>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <Label htmlFor="admin_response" className="text-base font-semibold">
                                        {data.status === 'rejected' ? 'Additional Notes (Optional)' : 'Admin Response'}
                                    </Label>
                                    <Textarea
                                        id="admin_response"
                                        value={data.admin_response}
                                        onChange={(e) => setData('admin_response', e.target.value)}
                                        placeholder={data.status === 'rejected' 
                                            ? "Add any additional notes or clarification for the customer..."
                                            : "Provide feedback or instructions for the user..."}
                                        className={errors.admin_response ? 'border-red-500' : ''}
                                        rows={4}
                                    />
                                    {errors.admin_response && <p className="text-sm text-red-500">{errors.admin_response}</p>}
                                    {data.status === 'rejected' && (
                                        <p className="text-xs text-gray-500">
                                            You can add personalized feedback here. The rejection reason above will be automatically included in the notification.
                                        </p>
                                    )}
                                </div>

                                {data.status === 'approved' && (
                                    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                        <h3 className="font-medium">Product Pricing & Delivery Information</h3>

                                        {/* If price and arrival date are already set, only allow editing arrival date */}
                                        {product_request.amount && product_request.estimated_arrival_date ? (
                                            <div className="space-y-4">
                                                <div className="rounded-md border bg-blue-50 p-3 border-blue-200">
                                                    <p className="text-sm text-blue-800 font-medium mb-2">
                                                        ℹ Price and arrival date have already been set. Only the arrival date can be updated.
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <Label className="text-sm font-medium text-gray-700">Total Amount (Read-only)</Label>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {product_request.currency} {typeof product_request.amount === 'number' 
                                                                    ? product_request.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                    : product_request.amount}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="estimated_arrival_date" className="font-medium">
                                                                Estimated Arrival Date *
                                                            </Label>
                                                            <input
                                                                type="date"
                                                                id="estimated_arrival_date"
                                                                min={new Date().toISOString().split('T')[0]}
                                                                value={data.estimated_arrival_date}
                                                                onChange={(e) => setData('estimated_arrival_date', e.target.value)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                                required
                                                            />
                                                            {errors.estimated_arrival_date && (
                                                                <p className="text-sm text-red-500">{errors.estimated_arrival_date}</p>
                                                            )}
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                You can update the estimated arrival date if needed.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="amount" className="font-medium">
                                                            Total Amount *
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                                                {data.currency}
                                                            </span>
                                                            <input
                                                                type="number"
                                                                id="amount"
                                                                min="0"
                                                                step="0.01"
                                                                value={data.amount}
                                                                onChange={(e) => setData('amount', e.target.value)}
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-16 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                                placeholder="0.00"
                                                                required={data.status === 'approved'}
                                                            />
                                                        </div>
                                                        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                                        <p className="text-xs text-gray-500">
                                                            This will be split into advance payment (30%) and final payment (70%)
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="currency" className="font-medium">
                                                            Currency *
                                                        </Label>
                                                        <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
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

                                                <div className="space-y-2">
                                                    <Label htmlFor="estimated_arrival_date" className="font-medium">
                                                        Estimated Arrival Date *
                                                    </Label>
                                                    <input
                                                        type="date"
                                                        id="estimated_arrival_date"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        value={data.estimated_arrival_date}
                                                        onChange={(e) => setData('estimated_arrival_date', e.target.value)}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                        required={data.status === 'approved'}
                                                    />
                                                    {errors.estimated_arrival_date && (
                                                        <p className="text-sm text-red-500">{errors.estimated_arrival_date}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        This date will be shown to the customer to help them make an informed decision.
                                                    </p>
                                                </div>

                                                <p className="text-sm text-muted-foreground">
                                                    The customer will see both the price and estimated arrival date before confirming their willingness to proceed.
                                                </p>
                                            </>
                                        )}
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
