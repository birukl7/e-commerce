import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, TableColumn, TableAction, createStatusColumn, createDateColumn } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '../dashboard';
import { Head, Link } from '@inertiajs/react';
import { MoreHorizontal, Eye, Edit } from 'lucide-react';
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
    created_at: string;
    user: User;
    amount?: number;
    currency?: string;
}


interface ProductRequestIndexProps {
    product_requests: ProductRequest[];
    filters?: {
        status?: string | null;
        payment_status?: string | null;
        available?: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin-dashboard' },
    { title: 'Product Requests', href: '/admin/product-requests' },
];

export default function ProductRequestIndex({ product_requests, filters }: ProductRequestIndexProps) {
    // Define table columns
    const columns: TableColumn<ProductRequest>[] = [
        {
            key: 'product_name',
            title: 'Product Name',
            render: (value) => <span className="font-medium">{value}</span>
        },
        {
            key: 'user',
            title: 'Requested By',
            render: (value: User) => value.name
        },
        createStatusColumn<ProductRequest>('status', 'Status'),
        createDateColumn<ProductRequest>('created_at', 'Date', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    ];

    // Define table actions
    const getActions = (request: ProductRequest): TableAction<ProductRequest>[] => [
        {
            label: 'View Details',
            href: `/admin/product-requests/${request.id}`,
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Update Status',
            href: `/admin/product-requests/${request.id}/edit`,
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Copy payment link',
            onClick: () => navigator.clipboard.writeText(`${window.location.origin}/user/product-requests/${request.id}/payment`),
            icon: <MoreHorizontal className="h-4 w-4" />
        },
    ];



    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Product Requests" />
            <div className="font-sans mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="status">Status</label>
                        <select
                            id="status"
                            defaultValue={filters?.status ?? ''}
                            onChange={(e) => window.location.search = new URLSearchParams({
                                status: e.target.value,
                                payment_status: (document.getElementById('payment_status') as HTMLSelectElement)?.value || '',
                                available: (document.getElementById('available') as HTMLSelectElement)?.value || '',
                            }).toString()}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="payment_status">Payment Status</label>
                        <select
                            id="payment_status"
                            defaultValue={filters?.payment_status ?? ''}
                            onChange={(e) => window.location.search = new URLSearchParams({
                                status: (document.getElementById('status') as HTMLSelectElement)?.value || '',
                                payment_status: e.target.value,
                                available: (document.getElementById('available') as HTMLSelectElement)?.value || '',
                            }).toString()}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="available">Availability</label>
                        <select
                            id="available"
                            defaultValue={filters?.available ?? ''}
                            onChange={(e) => window.location.search = new URLSearchParams({
                                status: (document.getElementById('status') as HTMLSelectElement)?.value || '',
                                payment_status: (document.getElementById('payment_status') as HTMLSelectElement)?.value || '',
                                available: e.target.value,
                            }).toString()}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">All</option>
                            <option value="true">Available</option>
                            <option value="false">Not available</option>
                        </select>
                    </div>
                </div>
                <DataTable<ProductRequest>
                    data={product_requests}
                    columns={columns}
                    title="Product Requests"
                    description="Manage and review product requests from users"
                    actions={getActions}
                    emptyMessage="No product requests found."
                />
            </div>
        </AppLayout>
    );
}
