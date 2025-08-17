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
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
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
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedBrand, setSelectedBrand] = useState(filters.brand || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || 'all');
    const [selectedFeatured, setSelectedFeatured] = useState(filters.featured || 'all');
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

    const getProductWarningMessage = (productName: string) => {
        return `
            <div class="space-y-3">
                <p><strong>⚠️ WARNING: This action cannot be undone!</strong></p>
                <p>Deleting the product "<strong>${productName}</strong>" will permanently:</p>
                <ul class="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li><strong>Remove the product</strong> from your catalog</li>
                    <li><strong>Delete all product images</strong> and associated files</li>
                    <li><strong>Remove from customer wishlists</strong> and shopping carts</li>
                    <li><strong>Hide from search results</strong> and category listings</li>
                    <li><strong>Affect order history</strong> where this product was purchased</li>
                    <li><strong>Remove product reviews</strong> and ratings</li>
                </ul>
                <p class="text-orange-600 font-semibold">Consider archiving the product instead of deleting it to preserve historical data.</p>
            </div>
        `;
    };

    // Search and filter functions
    const handleSearch = () => {
        const params: any = {};
        
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedBrand && selectedBrand !== 'all') params.brand = selectedBrand;
        if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedStockStatus && selectedStockStatus !== 'all') params.stock_status = selectedStockStatus;
        if (selectedFeatured && selectedFeatured !== 'all') params.featured = selectedFeatured;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (sortBy) params.sort_by = sortBy;
        if (sortDirection) params.sort_direction = sortDirection;

        router.get('/admin/products', params, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedStatus('all');
        setSelectedStockStatus('all');
        setSelectedFeatured('all');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('created_at');
        setSortDirection('desc');
        router.get('/admin/products', {}, { preserveState: true });
    };

    const hasActiveFilters = !!(searchTerm || 
                               (selectedCategory && selectedCategory !== 'all') || 
                               (selectedBrand && selectedBrand !== 'all') || 
                               (selectedStatus && selectedStatus !== 'all') || 
                               (selectedStockStatus && selectedStockStatus !== 'all') || 
                               (selectedFeatured && selectedFeatured !== 'all') || 
                               minPrice || maxPrice);

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

            <div className="px-4 py-8 sm:px-6 lg:px-8 mx-auto max-w-7xl">
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
                                        <Select
                                            value={selectedCategory}
                                            onValueChange={setSelectedCategory}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Brand Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                        <Select
                                            value={selectedBrand}
                                            onValueChange={setSelectedBrand}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="All Brands" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Brands</SelectItem>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <Select
                                            value={selectedStatus}
                                            onValueChange={setSelectedStatus}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Stock Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                                        <Select
                                            value={selectedStockStatus}
                                            onValueChange={setSelectedStockStatus}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="All Stock Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Stock Statuses</SelectItem>
                                                <SelectItem value="in_stock">In Stock</SelectItem>
                                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                                <SelectItem value="on_backorder">On Backorder</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {/* Featured Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                                        <Select
                                            value={selectedFeatured}
                                            onValueChange={setSelectedFeatured}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="All Products" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Products</SelectItem>
                                                <SelectItem value="1">Featured Only</SelectItem>
                                                <SelectItem value="0">Non-Featured</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                        <Select
                                            value={sortBy}
                                            onValueChange={setSortBy}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="Sort By" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at">Date Created</SelectItem>
                                                <SelectItem value="updated_at">Date Modified</SelectItem>
                                                <SelectItem value="name">Name</SelectItem>
                                                <SelectItem value="price">Price</SelectItem>
                                                <SelectItem value="stock_quantity">Stock</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                        <Select
                                            value={sortDirection}
                                            onValueChange={setSortDirection}
                                        >
                                            <SelectTrigger className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                                <SelectValue placeholder="Order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Descending</SelectItem>
                                                <SelectItem value="asc">Ascending</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                    description={getProductWarningMessage(confirmDialog.name)}
                    confirmText="Yes, Delete Product"
                    cancelText="Cancel"
                    variant="danger"
                />
            )}
        </AppLayout>
    );
};

export default Index;
