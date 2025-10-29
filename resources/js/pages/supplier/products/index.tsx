import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Eye, 
    Edit, 
    Trash2, 
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';
import SupplierLayout from '@/layouts/SupplierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Pagination from '@/components/ui/pagination';
import ConfirmationDialog from '@/components/confirmation-dialog';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    moderation_status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'suspended';
    visibility: 'private' | 'public';
    primary_image?: string;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    products: PaginatedProducts;
    filters: {
        search?: string;
        status?: string;
    };
    statuses: Record<string, string>;
}

export default function SupplierProductsIndex({ products, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/supplier/products', { search, status: statusFilter }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        router.get('/supplier/products', { search, status }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (productId: number) => {
        setDeleteProductId(productId);
    };

    const confirmDelete = () => {
        if (deleteProductId) {
            router.delete(`/supplier/products/${deleteProductId}`, {
                onSuccess: () => {
                    setDeleteProductId(null);
                },
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending_review':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'suspended':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'suspended':
                return 'bg-orange-100 text-orange-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <SupplierLayout title="Products">
            <Head title="My Products" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                        <p className="mt-2 text-gray-600">
                            Manage your product catalog and track their status
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/supplier/products/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <Select value={statusFilter} onValueChange={handleStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    {Object.entries(statuses).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Products Grid */}
            {products.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.data.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                            <div className="aspect-square relative">
                                {product.primary_image ? (
                                    <img
                                        src={product.primary_image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <Package className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge className={getStatusColor(product.moderation_status)}>
                                        {getStatusIcon(product.moderation_status)}
                                        <span className="ml-1">
                                            {statuses[product.moderation_status]}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/supplier/products/${product.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/supplier/products/${product.id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><span className="font-medium">SKU:</span> {product.sku}</p>
                                    <p><span className="font-medium">Price:</span> {formatCurrency(product.price)}</p>
                                    <p><span className="font-medium">Stock:</span> {product.stock_quantity}</p>
                                    {product.category && (
                                        <p><span className="font-medium">Category:</span> {product.category.name}</p>
                                    )}
                                    {product.brand && (
                                        <p><span className="font-medium">Brand:</span> {product.brand.name}</p>
                                    )}
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Updated {formatDate(product.updated_at)}
                                    </span>
                                    <div className="flex space-x-2">
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/supplier/products/${product.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/supplier/products/${product.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-6">
                            {filters.search || filters.status 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Get started by adding your first product.'
                            }
                        </p>
                        <Button asChild>
                            <Link href="/supplier/products/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Product
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {products.data.length > 0 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={products.current_page}
                        totalPages={products.last_page}
                        onPageChange={(page) => {
                            router.get('/supplier/products', {
                                search,
                                status: statusFilter,
                                page,
                            }, {
                                preserveState: true,
                                replace: true,
                            });
                        }}
                    />
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteProductId !== null}
                onClose={() => setDeleteProductId(null)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </SupplierLayout>
    );
}
