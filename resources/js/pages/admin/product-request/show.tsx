import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '../dashboard';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
}

interface BreadcrumbItem {
    title: string;
    href?: string;
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
                return 'success';
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
        { title: product_request.product_name },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title={`Request: ${product_request.product_name}`} />

            <div className="m-auto max-w-4xl space-y-6 p-6">
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
                                    Requested by {product_request.user.name} on {formatDate(new Date(product_request.created_at), 'PPP')}
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
                                        by {product_request.admin.name} on {formatDate(new Date(product_request.updated_at))}
                                    </p>
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
