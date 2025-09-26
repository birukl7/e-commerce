'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { EyeIcon, FilterIcon, ImageIcon, Package, PackageCheck, PencilIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductsTabs } from '@/components/admin/ProductsTabs';
import { Paginated } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: string;
    stock_quantity: number;
    status: 'active' | 'draft' | 'archived';
    primary_image?: string;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

interface Props {
    products: Paginated<Product>;
    categories: Category[];
    brands: Brand[];
    filters: {
        search?: string;
        category?: string;
        brand?: string;
        status?: string;
        stock_status?: string;
        featured?: string;
        min_price?: string;
        max_price?: string;
        sort_by?: string;
        sort_direction?: string;
    };
}

const tabs = [
    { name: 'All Products', href: '/admin/products', icon: Package },
    { name: 'Stock Management', href: '/admin/stock?tab=alerts', icon: PackageCheck },
];

export default function ProductsPage({ products, categories = [], brands = [], filters = {} }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filtersState, setFiltersState] = useState({
        search: filters.search || '',
        category: filters.category || '',
        brand: filters.brand || '',
        status: filters.status || '',
        stock_status: filters.stock_status || '',
        featured: filters.featured || '',
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        sort_by: filters.sort_by || 'created_at',
        sort_direction: filters.sort_direction || 'desc',
    });

    const handleFilterChange = (key: string, value: string) => {
        setFiltersState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        
        Object.entries(filtersState).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        router.get(`/admin/products?${params.toString()}`);
    };

    const resetFilters = () => {
        setFiltersState({
            search: '',
            category: '',
            brand: '',
            status: '',
            stock_status: '',
            featured: '',
            min_price: '',
            max_price: '',
            sort_by: 'created_at',
            sort_direction: 'desc',
        });
        router.get('/admin/products');
    };

    const confirmDelete = (product: { id: number; name: string }) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (productToDelete) {
            router.delete(`/admin/products/${productToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setProductToDelete(null);
                },
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Products" />
            
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage your product catalog and inventory
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild>
                            <Link href="/admin/products/create">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </div>
                
                <div className="mt-8">
                    <ProductsTabs tabs={tabs} className="mb-6" />
                    
                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search products..."
                                    value={filtersState.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                />
                            </div>
                            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                                <FilterIcon className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                            <Button variant="outline" onClick={resetFilters}>
                                <XIcon className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                                        <Select
                                            value={filtersState.category}
                                            onValueChange={(value) => handleFilterChange('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                                        <Select
                                            value={filtersState.brand}
                                            onValueChange={(value) => handleFilterChange('brand', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Brands</SelectItem>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                        <Select
                                            value={filtersState.status}
                                            onValueChange={(value) => handleFilterChange('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Statuses</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Stock Status</label>
                                        <Select
                                            value={filtersState.stock_status}
                                            onValueChange={(value) => handleFilterChange('stock_status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stock status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All</SelectItem>
                                                <SelectItem value="in_stock">In Stock</SelectItem>
                                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowFilters(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={applyFilters}>Apply Filters</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products Table */}
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Brand
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Stock
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {products.data.length > 0 ? (
                                        products.data.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {product.primary_image ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-md object-cover"
                                                                    src={product.primary_image}
                                                                    alt={product.name}
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                                                                    <ImageIcon className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-900">{product.category?.name || 'N/A'}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-900">{product.brand?.name || 'N/A'}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    }).format(Number(product.price))}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span 
                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                            product.stock_quantity > 10 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : product.stock_quantity > 0 
                                                                    ? 'bg-yellow-100 text-yellow-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {product.stock_quantity} in stock
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span 
                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                            product.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : product.status === 'draft'
                                                                    ? 'bg-gray-100 text-gray-800'
                                                                    : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            href={`/admin/products/${product.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete({ id: product.id, name: product.name })}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No products found. Try adjusting your filters or add a new product.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="border-t border-gray-200 px-6 py-4">
                                <Pagination links={products.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Product"
                description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </AdminLayout>
    );
}
