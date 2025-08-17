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
}


interface ProductRequestIndexProps {
    product_requests: ProductRequest[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin-dashboard' },
    { title: 'Product Requests', href: '/admin/product-requests' },
];

export default function ProductRequestIndex({ product_requests }: ProductRequestIndexProps) {
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
        }
    ];



    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Product Requests" />
            <div className="font-sans mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
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
