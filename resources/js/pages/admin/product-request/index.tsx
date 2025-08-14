import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '../dashboard';
import { Head, Link } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';

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
    created_at: string;
    user: User;
}

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface ProductRequestIndexProps {
    product_requests: ProductRequest[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin-dashboard' },
    { title: 'Product Requests', href: '/admin/product-requests' },
];

export default function ProductRequestIndex({ product_requests }: ProductRequestIndexProps) {
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


    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Product Requests" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 font-sans">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Requested By</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {product_requests.length > 0 ? (
                                    product_requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.product_name}</TableCell>
                                            <TableCell>{request.user.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(request.status)}>{request.status}</Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(new Date(request.created_at), 'PPP')}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/product-requests/${request.id}`}>View Details</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/product-requests/${request.id}/edit`}>Update Status</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No product requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
