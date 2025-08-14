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
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    admin_response?: string;
    user: User;
}


interface ProductRequestEditProps {
    product_request: ProductRequest;
}

export default function ProductRequestEdit({ product_request }: ProductRequestEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        status: product_request.status,
        admin_response: product_request.admin_response || '',
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

            <div className="m-auto max-w-2xl space-y-6 p-6">
                <Link href={`/admin/product-requests/${product_request.id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to request details
                </Link>
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Product Request</CardTitle>
                            <CardDescription>
                                Change the status and provide feedback for '{product_request.product_name}'.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reviewed">Reviewed</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin_response">Admin Response (Optional)</Label>
                                <Textarea
                                    id="admin_response"
                                    value={data.admin_response}
                                    onChange={(e) => setData('admin_response', e.target.value)}
                                    placeholder="Provide feedback or reasons for the status change..."
                                    rows={4}
                                />
                                {errors.admin_response && <p className="text-sm text-destructive">{errors.admin_response}</p>}
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
