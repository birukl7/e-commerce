'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { EyeIcon, ImageIcon, PackageIcon, PencilIcon, PlusIcon, TrashIcon, SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
// import ProductDialog from "@/components/product-dialog"
import ConfirmationDialog from '@/components/confirmation-dialog';
import ProductDialog from '@/components/product-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import H1 from '@/components/ui/h1';
import H2 from '@/components/ui/h2';
import H3 from '@/components/ui/h3';
import { Brand, BreadcrumbItem, Product, Paginated } from '@/types';
import { adminNavItems } from '../dashboard';
import Pagination from '@/components/ui/pagination';

interface Category {
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
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Products',
        href: '/admin/products',
    },
];
const Index = ({ products, categories = [], brands = [], filters = {} }: Props) => {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || '');
    const [selectedFeatured, setSelectedFeatured] = useState(filters.featured || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

    const [dialogState, setDialogState] = useState<{
        action: 'create' | 'edit' | null;
        data?: Product | null;
    }>({
        action: null,
        data: null,
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        id: number;
        name: string;
    } | null>(null);

    const openDialog = (action: 'create' | 'edit', data?: Product) => {
        setDialogState({ action, data: data || null });
    };

    const closeDialog = () => {
        setDialogState({ action: null, data: null });
    };

    const handleDelete = (id: number, name: string) => {
        setConfirmDialog({
            isOpen: true,
            id,
            name,
        });
    };

    const confirmDelete = () => {
        if (confirmDialog) {
            router.delete(`/admin/products/${confirmDialog.id}`);
            setConfirmDialog(null);
        }
    };

    // Search and filter functions
    const handleSearch = () => {
        const params: any = {};
        
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedStatus) params.status = selectedStatus;
        if (selectedStockStatus) params.stock_status = selectedStockStatus;
        if (selectedFeatured) params.featured = selectedFeatured;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (sortBy) params.sort_by = sortBy;
        if (sortDirection) params.sort_direction = sortDirection;

        router.get('/admin/products', params, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedStatus('');
        setSelectedStockStatus('');
        setSelectedFeatured('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('created_at');
        setSortDirection('desc');
        router.get('/admin/products', {}, { preserveState: true });
    };

    const hasActiveFilters = !!(searchTerm || selectedCategory || selectedBrand || selectedStatus || 
                               selectedStockStatus || selectedFeatured || minPrice || maxPrice);

    // Auto-search on enter key
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(price);
    };

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-100 text-green-800';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800';
            case 'on_backorder':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'archived':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const ProductCard = ({ product }: { product: Product }) => {
        const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

        return (
            <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
                <div className="relative aspect-square bg-gray-100">
                    {primaryImage ? (
                        <img src={`/storage/${primaryImage.image_path}`} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(product.status)}`}>{product.status}</span>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStockStatusColor(product.stock_status)}`}>
                            {product.stock_status.replace('_', ' ')}
                        </span>
                        {product.featured && (
                            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">Featured</span>
                        )}
                    </div>
                </div>
                <div className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                        <H3 className="line-clamp-2">{product.name}</H3>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-gray-900">{formatPrice(product.sale_price || product.price)}</span>
                            {product.sale_price && <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>}
                        </div>
                        <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                    </div>
                    <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Stock: {product.stock_quantity}</span>
                        <span>{product.category?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{product.brand.name}</span>
                        <div className="flex space-x-1">
                            <Link
                                href={`/admin/products/${product.id}`}
                                className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50"
                                title="View"
                            >
                                <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Button
                                onClick={() => openDialog('edit', product)}
                                className="rounded-full p-2 text-green-600 transition-colors hover:bg-green-50"
                                title="Edit"
                                variant="ghost"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="rounded-full p-2 text-red-600 transition-colors hover:bg-red-50"
                                title="Delete"
                                variant="ghost"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout mainNavItems={adminNavItems} breadcrumbs={breadcrumbs} footerNavItems={[]}>
            <Head title="Products Management" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <H1 className="text-3xl font-bold text-gray-900">Products Management</H1>
                    <p className="mt-2 text-gray-600">Manage your e-commerce products</p>
                </div>

                {/* Content */}
                <div>
                    {/* Search and Filter Bar */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <H2>Products</H2>
                            <Button
                                onClick={() => openDialog('create')}
                                className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search products by name, SKU, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pl-10 h-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSearch}
                                    className="px-4 py-2 h-10"
                                >
                                    Search
                                </Button>
                                <Button
                                    onClick={() => setShowFilters(!showFilters)}
                                    variant="outline"
                                    className="px-4 py-2 h-10"
                                >
                                    <FilterIcon className="mr-2 h-4 w-4" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            !
                                        </span>
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button
                                        onClick={clearFilters}
                                        variant="outline"
                                        className="px-4 py-2 h-10 text-red-600 hover:text-red-700"
                                    >
                                        <XIcon className="mr-2 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Brand Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                        <select
                                            value={selectedBrand}
                                            onChange={(e) => setSelectedBrand(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Brands</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>

                                    {/* Stock Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                                        <select
                                            value={selectedStockStatus}
                                            onChange={(e) => setSelectedStockStatus(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Stock Statuses</option>
                                            <option value="in_stock">In Stock</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                            <option value="on_backorder">On Backorder</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {/* Featured Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                                        <select
                                            value={selectedFeatured}
                                            onChange={(e) => setSelectedFeatured(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">All Products</option>
                                            <option value="1">Featured Only</option>
                                            <option value="0">Non-Featured</option>
                                        </select>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="created_at">Date Created</option>
                                            <option value="updated_at">Date Modified</option>
                                            <option value="name">Name</option>
                                            <option value="price">Price</option>
                                            <option value="stock_quantity">Stock</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                        <select
                                            value={sortDirection}
                                            onChange={(e) => setSortDirection(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="desc">Descending</option>
                                            <option value="asc">Ascending</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSearch}
                                        className="px-6 py-2"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Summary */}
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                        <div>
                            Showing {products.from || 0} to {products.to || 0} of {products.total} products
                            {hasActiveFilters && ' (filtered)'}
                        </div>
                        <div>
                            Page {products.current_page} of {products.last_page}
                        </div>
                    </div>

                    {products.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <H3>
                                {hasActiveFilters ? 'No products match your search criteria' : 'No products found'}
                            </H3>
                            <p className="mb-4 text-gray-600">
                                {hasActiveFilters 
                                    ? 'Try adjusting your search or filters to find products.'
                                    : 'Get started by creating your first product.'
                                }
                            </p>
                            {hasActiveFilters ? (
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="inline-flex items-center rounded-lg px-4 py-2"
                                >
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => openDialog('create')}
                                    className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            )}
                        </div>
                    )}
                    {/* pagination */}
                    {products.links && products.links.length > 0 ? (
                        <Pagination links={products.links} />
                    ) : null}
                </div>
            </div>

            {/* Product Dialog */}
            {dialogState.action && (
                <ProductDialog
                    isOpen={true}
                    onClose={closeDialog}
                    action={dialogState.action}
                    product={dialogState.data ?? undefined}
                    categories={categories}
                    brands={brands}
                />
            )}

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <ConfirmationDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={() => setConfirmDialog(null)}
                    onConfirm={confirmDelete}
                    title="Delete Product"
                    description={`Are you sure you want to delete "${confirmDialog.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                />
            )}
        </AppLayout>
    );
};

export default Index;
