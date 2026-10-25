import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTable, TableColumn, TableAction, createStatusColumn, createDateColumn } from '@/components/ui/data-table';
import AppLayout from '../../../layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';
import { Head } from '@inertiajs/react';
import { MoreHorizontal, Eye, MessageSquare, Clock, CheckCircle2, Truck, Filter, RotateCcw } from 'lucide-react';
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
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user: User;
    amount?: number;
    currency?: string;
    // Workflow fields
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
    lost_interest_at?: string;
    lost_interest_reason?: string;
}

interface ProductRequestIndexProps {
    product_requests: any;
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
    const [primaryColor, setPrimaryColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
        }
        return '#1E5338';
    });

    useEffect(() => {
        const handler = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handler);
        return () => window.removeEventListener('serdo:theme-color-changed', handler);
    }, []);

    // Normalize data and pagination (supports both array and paginator shapes)
    const items: ProductRequest[] = Array.isArray(product_requests)
        ? product_requests as ProductRequest[]
        : (product_requests?.data ?? []) as ProductRequest[];

    const meta = product_requests?.meta ?? product_requests;
    const pagination = meta && meta.current_page !== undefined ? {
        current_page: meta.current_page,
        last_page: meta.last_page,
        per_page: meta.per_page,
        total: meta.total,
        from: meta.from ?? ((meta.current_page - 1) * meta.per_page + 1),
        to: meta.to ?? Math.min(meta.current_page * meta.per_page, meta.total),
    } : undefined;

    const totalCount = pagination?.total ?? items.length;
    const pendingCount = items.filter(r => r.status === 'pending').length;
    const advancePaidCount = items.filter(r => r.workflow_status === 'advance_paid' || r.advance_payment_status === 'paid').length;
    const procurementCount = items.filter(r => r.workflow_status === 'procurement_in_progress' || r.procurement_status === 'in_progress').length;

    // Define table columns
    const columns: TableColumn<ProductRequest>[] = [
        {
            key: 'product_name',
            title: 'Product Name',
            render: (value, item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-950 text-sm">{value}</span>
                    <span className="text-xs text-gray-400">Request #{item.id}</span>
                </div>
            )
        },
        {
            key: 'user',
            title: 'Customer',
            render: (value: User) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-700">
                        {value?.name ? value.name.substring(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900">{value?.name || 'Guest Customer'}</span>
                        <span className="text-[11px] text-gray-400">{value?.email || '—'}</span>
                    </div>
                </div>
            )
        },
        createStatusColumn<ProductRequest>('status', 'Status'),
        {
            key: 'workflow_status',
            title: 'Procurement Workflow',
            render: (value, item) => {
                if (item.status !== 'approved') return <span className="text-gray-400 text-xs">—</span>;
                
                const getWorkflowBadge = (status: string, req: ProductRequest) => {
                    if (req.lost_interest_at) {
                        return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">Lost Interest</span>;
                    }
                    
                    switch (status) {
                        case 'awaiting_willingness':
                        case 'awaiting_customer_willingness':
                            return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">Awaiting Willingness</span>;
                        case 'awaiting_advance_payment':
                            return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">Awaiting Advance</span>;
                        case 'pending_payment_approval':
                            return <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/60">Pending Approval</span>;
                        case 'advance_paid':
                            return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Advance Paid</span>;
                        case 'procurement_in_progress':
                            return <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200/60">In Procurement</span>;
                        case 'procurement_completed':
                            return <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">Sourced / Arrived</span>;
                        case 'awaiting_final_payment':
                            return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">Awaiting Final Pay</span>;
                        case 'final_paid':
                        case 'completed':
                            return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Completed</span>;
                        default:
                            return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">Pending Review</span>;
                    }
                };
                
                return getWorkflowBadge(value || 'unknown', item);
            }
        },
        createDateColumn<ProductRequest>('created_at', 'Requested On', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    ];

    // Define table actions
    const getActions = (request: ProductRequest): TableAction<ProductRequest>[] => [
        {
            label: 'View Details',
            href: `/admin/product-requests/${request.id}`,
            icon: <Eye className="h-4 w-4" />,
            variant: 'default'
        },
        {
            label: 'Copy payment link',
            onClick: () => navigator.clipboard.writeText(`${window.location.origin}/user/product-requests/${request.id}/payment`),
            icon: <MoreHorizontal className="h-4 w-4" />
        },
    ];

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        window.location.search = params.toString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Product Requests" />
            <div className="min-h-screen bg-[#F6F8FA] p-6 lg:p-8 font-sans">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sourcing & Inquiries</span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-medium text-emerald-600">Active</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mt-1">Product Requests</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage custom import requests, quotes, advance payments, and customer procurement</p>
                    </div>
                </div>

                {/* 4 Donezo Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Primary Hero Metric */}
                    <div 
                        className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Total Requests</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-3xl font-black tracking-tight text-white">{totalCount}</h3>
                            <p className="text-xs font-medium text-white/80 mt-1">Custom sourcing tickets</p>
                        </div>
                    </div>

                    {/* Pending Review Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending Review</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-amber-600">{pendingCount}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Awaiting price quote</p>
                        </div>
                    </div>

                    {/* Advance Paid Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Advance Paid</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-emerald-600">{advancePaidCount}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Down-payment secured</p>
                        </div>
                    </div>

                    {/* Sourcing / Procurement Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">In Procurement</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50">
                                <Truck className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-indigo-600">{procurementCount}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Being acquired or in transit</p>
                        </div>
                    </div>
                </div>

                {/* Filter Strip */}
                <div className="rounded-[24px] border border-gray-200/80 bg-white p-4 shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </div>

                        {/* Status Filter */}
                        <div className="flex-1 min-w-[160px]">
                            <select
                                id="status"
                                value={filters?.status ?? ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <div className="flex-1 min-w-[160px]">
                            <select
                                id="payment_status"
                                value={filters?.payment_status ?? ''}
                                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <option value="">All Payment States</option>
                                <option value="pending">Payment Pending</option>
                                <option value="processing">Processing</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Availability Filter */}
                        <div className="flex-1 min-w-[160px]">
                            <select
                                id="available"
                                value={filters?.available ?? ''}
                                onChange={(e) => handleFilterChange('available', e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <option value="">All Availability</option>
                                <option value="true">Available</option>
                                <option value="false">Not Available</option>
                            </select>
                        </div>

                        {/* Reset Filter Button */}
                        {(filters?.status || filters?.payment_status || filters?.available) && (
                            <button
                                onClick={() => window.location.search = ''}
                                className="inline-flex items-center gap-1.5 rounded-2xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Container */}
                <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm">
                    <DataTable<ProductRequest>
                        data={items}
                        columns={columns}
                        title="Customer Sourcing Inquiries"
                        description="Review specifications, set prices, and approve custom sourcing requests"
                        actions={getActions}
                        emptyMessage="No product requests found matching your filters."
                        pagination={pagination}
                        baseUrl="/admin/product-requests"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
