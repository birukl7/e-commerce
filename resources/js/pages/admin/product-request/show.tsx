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
    product_arrived_at?: string;
    workflow_status?: string;
    procurement_notes?: string;
}


interface ProductRequestShowProps {
    product_request: ProductRequest;
}

export default function ProductRequestShow({ product_request }: ProductRequestShowProps) {
    const [startProcurementDialogOpen, setStartProcurementDialogOpen] = useState(false);
    const [completeProcurementDialogOpen, setCompleteProcurementDialogOpen] = useState(false);

    const startProcurementForm = useForm({
        procurement_expected_completion_date: '',
        procurement_notes: '',
    });

    const completeProcurementForm = useForm({
        procurement_notes: '',
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
                                    
                                    {/* Show distinction between confirmed only vs confirmed + paid */}
                                    {product_request.customer_willing_to_buy && (
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
                        <div className="flex gap-2">
                            {product_request.status === 'approved' && 
                             product_request.advance_payment_status === 'paid' && 
                             product_request.procurement_status !== 'in_progress' && 
                             product_request.procurement_status !== 'completed' && (
                                <Dialog open={startProcurementDialogOpen} onOpenChange={setStartProcurementDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">Start Getting Product</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Start Getting the Product</DialogTitle>
                                            <DialogDescription>
                                                Set when the product is expected to arrive. The customer will be notified that you've started getting their product.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleStartProcurement}>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label htmlFor="procurement_expected_completion_date">
                                                        Expected Arrival Date *
                                                    </Label>
                                                    <Input
                                                        id="procurement_expected_completion_date"
                                                        type="date"
                                                        min={new Date().toISOString().split('T')[0]}
                                                        value={startProcurementForm.data.procurement_expected_completion_date}
                                                        onChange={(e) => startProcurementForm.setData('procurement_expected_completion_date', e.target.value)}
                                                        required
                                                    />
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
                            
                            {product_request.procurement_status === 'in_progress' && (
                                <Dialog open={completeProcurementDialogOpen} onOpenChange={setCompleteProcurementDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="default">Mark Product as Arrived</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Mark Product as Arrived</DialogTitle>
                                            <DialogDescription>
                                                Mark the product as arrived. This will notify the customer that their product has arrived and they can now pay the remaining amount.
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
                                                        placeholder="Add any notes about product arrival..."
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
                                                    {completeProcurementForm.processing ? 'Marking...' : 'Mark Product as Arrived'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <Button asChild>
                            <Link href={`/admin/product-requests/${product_request.id}/edit`}>Update Status</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
