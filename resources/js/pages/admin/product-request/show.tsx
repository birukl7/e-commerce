import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
    status: 'pending' | 'approved' | 'rejected';
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
    procurement_expected_completion_date?: string;
    procurement_completed_at?: string;
    product_arrived_at?: string | null;
    arrival_notes?: string | null;
    estimated_arrival_date?: string;
    workflow_status?: string;
    procurement_notes?: string;
    lost_interest_at?: string | null;
    lost_interest_reason?: string | null;
}


interface ProductRequestShowProps {
    product_request: ProductRequest;
}

export default function ProductRequestShow({ product_request }: ProductRequestShowProps) {
    const [startProcurementDialogOpen, setStartProcurementDialogOpen] = useState(false);
    const [completeProcurementDialogOpen, setCompleteProcurementDialogOpen] = useState(false);
    const [markArrivedDialogOpen, setMarkArrivedDialogOpen] = useState(false);

    // Pre-fill with estimated_arrival_date if available, otherwise use procurement_expected_completion_date
    const initialProcurementDate = product_request.estimated_arrival_date 
        ? new Date(product_request.estimated_arrival_date).toISOString().split('T')[0]
        : (product_request.procurement_expected_completion_date 
            ? new Date(product_request.procurement_expected_completion_date).toISOString().split('T')[0]
            : '');

    const startProcurementForm = useForm({
        procurement_expected_completion_date: initialProcurementDate,
        procurement_notes: '',
    });

    const completeProcurementForm = useForm({
        procurement_notes: '',
    });

    // If product already arrived, use that date; otherwise default to today
    const initialArrivalDate = product_request.product_arrived_at
        ? new Date(product_request.product_arrived_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    const markArrivedForm = useForm({
        arrival_date: initialArrivalDate,
        arrival_notes: product_request.arrival_notes || '',
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
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

    const formatDateOnly = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleStartProcurement = (e: React.FormEvent) => {
        e.preventDefault();
        startProcurementForm.post(route('admin.product-requests.start-procurement', product_request.id), {
            onSuccess: () => {
                setStartProcurementDialogOpen(false);
                startProcurementForm.reset();
            },
        });
    };

    const handleCompleteProcurement = (e: React.FormEvent) => {
        e.preventDefault();
        completeProcurementForm.post(route('admin.product-requests.complete-procurement', product_request.id), {
            onSuccess: () => {
                setCompleteProcurementDialogOpen(false);
                completeProcurementForm.reset();
            },
        });
    };

    const handleMarkArrived = (e: React.FormEvent) => {
        e.preventDefault();
        markArrivedForm.post(route('admin.product-requests.mark-arrived', product_request.id), {
            onSuccess: () => {
                setMarkArrivedDialogOpen(false);
                // Reset form with current values
                const currentArrivalDate = product_request.product_arrived_at
                    ? new Date(product_request.product_arrived_at).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];
                markArrivedForm.reset();
                markArrivedForm.setData('arrival_date', currentArrivalDate);
                markArrivedForm.setData('arrival_notes', product_request.arrival_notes || '');
            },
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
                        {/* Rejection Information */}
                        {product_request.status === 'rejected' && product_request.rejection_reason && (
                            <div className="rounded-md border bg-red-50 p-4 border-red-200">
                                <h3 className="mb-2 font-semibold text-red-900">Rejection Reason</h3>
                                <p className="text-sm font-medium text-red-800 mb-2">
                                    {product_request.rejection_reason === 'product_not_available' && 'Product Not Available'}
                                    {product_request.rejection_reason === 'specifications_not_matching' && 'Specifications Not Matching'}
                                    {product_request.rejection_reason === 'out_of_stock' && 'Out of Stock'}
                                    {product_request.rejection_reason === 'discontinued' && 'Product Discontinued'}
                                    {product_request.rejection_reason === 'other' && 'Other Reason'}
                                </p>
                                {product_request.admin_response && (
                                    <p className="text-sm text-red-700 mt-2">{product_request.admin_response}</p>
                                )}
                                {product_request.admin && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Rejected by {product_request.admin.name} on {formatDate(product_request.updated_at)}
                                    </p>
                                )}
                            </div>
                        )}

                        {product_request.admin_response && product_request.status !== 'rejected' && (
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

                        {/* Pricing and Estimated Arrival Information (for approved requests) */}
                        {product_request.status === 'approved' && (product_request.amount || product_request.estimated_arrival_date) && (
                            <div className="rounded-md border bg-green-50 p-4 border-green-200">
                                <h3 className="mb-3 font-semibold text-green-900">Pricing & Delivery Information</h3>
                                {product_request.amount && (
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Total Amount:</span>{' '}
                                            <span className="font-semibold text-green-900">
                                                {product_request.currency} {product_request.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </p>
                                        {product_request.advance_amount && (
                                            <p className="text-xs text-gray-600 ml-4">
                                                Advance: {product_request.currency} {product_request.advance_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • 
                                                Final: {product_request.currency} {product_request.final_amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {product_request.estimated_arrival_date && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Estimated Arrival Date:</span>{' '}
                                            <span className="font-semibold text-green-900">
                                                {formatDateOnly(product_request.estimated_arrival_date)}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-600 ml-4">
                                            This date is shown to the customer when they review the approval
                                        </p>
                                    </div>
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
                                        <div className={`w-3 h-3 rounded-full ${
                                            product_request.lost_interest_at ? 'bg-red-500' :
                                            product_request.customer_willing_to_buy ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                        <span className="font-medium">Customer Willingness to Pay</span>
                                        {product_request.lost_interest_at ? (
                                            <Badge variant="destructive">Lost Interest</Badge>
                                        ) : (
                                            <Badge variant={product_request.customer_willing_to_buy ? 'default' : 'secondary'}>
                                                {product_request.customer_willing_to_buy ? 'Confirmed' : 'Pending'}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Show lost interest status and reason */}
                                    {product_request.lost_interest_at && (
                                        <div className="ml-5 space-y-2">
                                            <p className="text-sm text-red-700 font-medium">
                                                Customer indicated they've lost interest on {formatDate(product_request.lost_interest_at)}
                                            </p>
                                            {product_request.lost_interest_reason && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <p className="text-sm font-semibold text-red-900 mb-1">Reason for Lost Interest:</p>
                                                    <p className="text-sm text-red-800">
                                                        {product_request.lost_interest_reason.startsWith('price_too_high') && 'Price Too High - Customer found the price too expensive.'}
                                                        {product_request.lost_interest_reason.startsWith('delivery_date_too_long') && 'Delivery Date Too Long - Customer found the estimated delivery time too long.'}
                                                        {product_request.lost_interest_reason.startsWith('simply_lost_interest') && 'Simply Lost Interest - Customer is no longer interested in this product.'}
                                                        {product_request.lost_interest_reason.startsWith('changed_mind') && 'Changed My Mind - Customer has changed their mind about the purchase.'}
                                                        {product_request.lost_interest_reason.startsWith('found_elsewhere') && 'Found It Elsewhere - Customer found the product from another source.'}
                                                        {product_request.lost_interest_reason.startsWith('other') && (
                                                            <span>
                                                                Other Reason{product_request.lost_interest_reason.includes(':') && ` - ${product_request.lost_interest_reason.split(': ').slice(1).join(': ')}`}
                                                            </span>
                                                        )}
                                                        {!product_request.lost_interest_reason.startsWith('price_too_high') &&
                                                         !product_request.lost_interest_reason.startsWith('delivery_date_too_long') &&
                                                         !product_request.lost_interest_reason.startsWith('simply_lost_interest') &&
                                                         !product_request.lost_interest_reason.startsWith('changed_mind') &&
                                                         !product_request.lost_interest_reason.startsWith('found_elsewhere') &&
                                                         !product_request.lost_interest_reason.startsWith('other') &&
                                                         product_request.lost_interest_reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Show confirmed willingness */}
                                    {!product_request.lost_interest_at && product_request.willingness_confirmed_at && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Confirmed on {formatDate(product_request.willingness_confirmed_at)}
                                        </p>
                                    )}
                                    
                                    {/* Show distinction between confirmed only vs confirmed + paid */}
                                    {!product_request.lost_interest_at && product_request.customer_willing_to_buy && (
                                        <div className="mt-2 ml-5">
                                            {product_request.advance_payment_status === 'paid' || product_request.advance_payment_status === 'processing' ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                    ✓ Willingness confirmed + Advance Payment {product_request.advance_payment_status === 'processing' ? 'Pending' : 'Paid'}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                                    ⚠ Willingness confirmed but advance payment NOT yet paid
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Show pending status when neither confirmed nor lost interest */}
                                    {!product_request.lost_interest_at && !product_request.customer_willing_to_buy && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Waiting for customer to confirm willingness or indicate lost interest.
                                        </p>
                                    )}
                                </div>

                                {/* Advance Payment */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            product_request.advance_payment_status === 'paid' ? 'bg-green-500' : 
                                            product_request.advance_payment_status === 'processing' ? 'bg-orange-500' :
                                            product_request.advance_payment_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                                        }`}></div>
                                        <span className="font-medium">Advance Payment</span>
                                        <Badge variant={
                                            product_request.advance_payment_status === 'paid' ? 'default' : 
                                            product_request.advance_payment_status === 'processing' ? 'secondary' :
                                            product_request.advance_payment_status === 'pending' ? 'secondary' : 'outline'
                                        }>
                                            {product_request.advance_payment_status === 'processing' ? 'Pending Admin Approval' :
                                             product_request.advance_payment_status || 'Not Required'}
                                        </Badge>
                                    </div>
                                    {product_request.advance_amount && (
                                        <p className="text-sm text-gray-600 ml-5">
                                            Amount: {product_request.currency} {product_request.advance_amount}
                                            {product_request.advance_paid_at && (
                                                <span> - Paid on {formatDate(product_request.advance_paid_at)}</span>
                                            )}
                                            {product_request.advance_payment_status === 'processing' && (
                                                <span className="text-orange-600 font-medium"> - Awaiting your approval</span>
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
                                        <span className="font-medium">Getting Product</span>
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
                                            {product_request.procurement_expected_completion_date && (
                                                <span> - Expected arrival: {formatDateOnly(product_request.procurement_expected_completion_date)}</span>
                                            )}
                                            {product_request.procurement_completed_at && (
                                                <span> - Completed on {formatDate(product_request.procurement_completed_at)}</span>
                                            )}
                                        </p>
                                    )}
                                    {product_request.procurement_notes && (
                                        <p className="text-sm text-gray-500 italic ml-5 mt-1">
                                            Notes: {product_request.procurement_notes}
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
                                        {product_request.arrival_notes && (
                                            <div className="mt-2 ml-5 bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-green-900 mb-1">Arrival Notes:</p>
                                                <p className="text-sm text-green-800">{product_request.arrival_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Overall Workflow Status */}
                                {product_request.workflow_status && (
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-blue-900">Overall Status:</span>
                                            <Badge variant="outline" className={
                                                product_request.workflow_status === 'pending_payment_approval' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                product_request.workflow_status === 'awaiting_advance_payment' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                                product_request.workflow_status === 'awaiting_procurement' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                product_request.workflow_status === 'procurement_in_progress' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                                                product_request.workflow_status === 'awaiting_final_payment' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                                product_request.workflow_status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                                'bg-blue-100 text-blue-800'
                                            }>
                                                {product_request.workflow_status === 'pending_payment_approval' ? 'Pending Payment Approval' :
                                                 product_request.workflow_status === 'awaiting_advance_payment' ? 'Awaiting Advance Payment' :
                                                 product_request.workflow_status === 'awaiting_procurement' ? 'Awaiting Procurement' :
                                                 product_request.workflow_status === 'procurement_in_progress' ? 'Procurement In Progress' :
                                                 product_request.workflow_status === 'awaiting_final_payment' ? 'Awaiting Final Payment' :
                                                 product_request.workflow_status === 'completed' ? 'Completed' :
                                                 product_request.workflow_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {/* Start Procurement Button - Use when you need to procure the product
                                Show when: approved, paid, procurement not started, product NOT arrived
                                This is mutually exclusive with "Mark as Arrived" */}
                            {product_request.status === 'approved' && 
                             product_request.advance_payment_status === 'paid' &&
                             product_request.procurement_status !== 'in_progress' && 
                             product_request.procurement_status !== 'completed' && 
                             !product_request.product_arrived_at && // Don't show if product already arrived
                             !product_request.lost_interest_at && (
                                <Dialog open={startProcurementDialogOpen} onOpenChange={setStartProcurementDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">Start Getting Product</Button>
                                    </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Start Getting the Product</DialogTitle>
                                                    <DialogDescription>
                                                        Confirm when procurement will be completed. This date is pre-filled from the estimated arrival date set during approval. The customer will be notified that you've started getting their product.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleStartProcurement}>
                                                    <div className="space-y-4 py-4">
                                                        <div>
                                                            <Label htmlFor="procurement_expected_completion_date">
                                                                Expected Completion Date *
                                                            </Label>
                                                            <Input
                                                                id="procurement_expected_completion_date"
                                                                type="date"
                                                                min={new Date().toISOString().split('T')[0]}
                                                                value={startProcurementForm.data.procurement_expected_completion_date}
                                                                onChange={(e) => startProcurementForm.setData('procurement_expected_completion_date', e.target.value)}
                                                                required
                                                            />
                                                            {product_request.estimated_arrival_date && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Note: Original estimated arrival date was {formatDateOnly(product_request.estimated_arrival_date)}. You can adjust this if needed.
                                                                </p>
                                                            )}
                                                            {startProcurementForm.errors.procurement_expected_completion_date && (
                                                                <p className="text-sm text-red-500 mt-1">
                                                                    {startProcurementForm.errors.procurement_expected_completion_date}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="procurement_notes">Notes (Optional)</Label>
                                                            <Textarea
                                                                id="procurement_notes"
                                                                value={startProcurementForm.data.procurement_notes}
                                                                onChange={(e) => startProcurementForm.setData('procurement_notes', e.target.value)}
                                                                rows={3}
                                                                placeholder="Add any notes about getting the product..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setStartProcurementDialogOpen(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={startProcurementForm.processing}>
                                                            {startProcurementForm.processing ? 'Starting...' : 'Start Getting Product'}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                            )}
                            
                            {/* Complete Procurement Button - Show when procurement is in progress */}
                            {product_request.procurement_status === 'in_progress' && (
                                <Dialog open={completeProcurementDialogOpen} onOpenChange={setCompleteProcurementDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">Complete Procurement</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Complete Procurement</DialogTitle>
                                            <DialogDescription>
                                                Mark procurement as completed. This will also automatically mark the product as arrived.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCompleteProcurement}>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label htmlFor="complete_procurement_notes">Notes (Optional)</Label>
                                                    <Textarea
                                                        id="complete_procurement_notes"
                                                        value={completeProcurementForm.data.procurement_notes}
                                                        onChange={(e) => completeProcurementForm.setData('procurement_notes', e.target.value)}
                                                        rows={3}
                                                        placeholder="Add any notes about procurement completion..."
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setCompleteProcurementDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={completeProcurementForm.processing}>
                                                    {completeProcurementForm.processing ? 'Completing...' : 'Complete Procurement'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                            
                            {/* Mark Product as Arrived - Show only when procurement has been started but product hasn't arrived
                                Hide when "Start Getting Product" button is visible (procurement not started)
                                This is mutually exclusive with "Start Getting Product" */}
                            {product_request.status === 'approved' && 
                             product_request.advance_payment_status === 'paid' && 
                             !product_request.lost_interest_at &&
                             (product_request.procurement_status === 'in_progress' || 
                              product_request.procurement_status === 'completed' || 
                              product_request.procurement_started_at) && // Only show if procurement has been started
                             !product_request.product_arrived_at && ( // Don't show if already arrived
                                <Dialog open={markArrivedDialogOpen} onOpenChange={setMarkArrivedDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">Mark Product as Arrived</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Mark Product as Arrived</DialogTitle>
                                            <DialogDescription>
                                                Use this if the product is already available and you want to skip the procurement workflow. This will notify the customer that their product has arrived and they can now pay the final amount.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleMarkArrived}>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label htmlFor="arrival_date">Arrival Date</Label>
                                                    <Input
                                                        id="arrival_date"
                                                        type="date"
                                                        value={markArrivedForm.data.arrival_date}
                                                        onChange={(e) => markArrivedForm.setData('arrival_date', e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Defaults to today. Only change if the product arrived on a different date.
                                                    </p>
                                                    {markArrivedForm.errors.arrival_date && (
                                                        <p className="text-sm text-red-500 mt-1">
                                                            {markArrivedForm.errors.arrival_date}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label htmlFor="arrival_notes">Arrival Notes (Optional)</Label>
                                                    <Textarea
                                                        id="arrival_notes"
                                                        value={markArrivedForm.data.arrival_notes}
                                                        onChange={(e) => markArrivedForm.setData('arrival_notes', e.target.value)}
                                                        rows={3}
                                                        placeholder="Add any notes about product arrival..."
                                                    />
                                                    {markArrivedForm.errors.arrival_notes && (
                                                        <p className="text-sm text-red-500 mt-1">
                                                            {markArrivedForm.errors.arrival_notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setMarkArrivedDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={markArrivedForm.processing}>
                                                    {markArrivedForm.processing ? 'Marking...' : 'Mark as Arrived'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        {/* Hide Update Status button once advance payment is paid or processing - status should not be changed after payment */}
                        {!(product_request.advance_payment_status === 'paid' || product_request.advance_payment_status === 'processing') && (
                            <Button asChild>
                                <Link href={`/admin/product-requests/${product_request.id}/edit`}>Update Status</Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
