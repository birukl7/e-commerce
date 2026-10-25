/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { EyeIcon, FilterIcon, ImageIcon, PackageIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
// import ProductDialog from "@/components/product-dialog"
import ConfirmationDialog from '@/components/confirmation-dialog';
import ProductDialog from '@/components/product-dialog';
import { Button } from '@/components/ui/button';
import H1 from '@/components/ui/h1';
import H2 from '@/components/ui/h2';
import H3 from '@/components/ui/h3';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brand, BreadcrumbItem, Paginated, Product } from '@/types';
import { adminNavItems } from '@/constants/adminNavItems';

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
                <p class="text-primary-600 font-semibold">Consider archiving the product instead of deleting it to preserve historical data.</p>
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

    const hasActiveFilters = !!(
        searchTerm ||
        (selectedCategory && selectedCategory !== 'all') ||
        (selectedBrand && selectedBrand !== 'all') ||
        (selectedStatus && selectedStatus !== 'all') ||
        (selectedStockStatus && selectedStockStatus !== 'all') ||
        (selectedFeatured && selectedFeatured !== 'all') ||
        minPrice ||
        maxPrice
    );

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

    const inStockCount = products.data.filter(p => p.stock_status === 'in_stock').length;
    const lowOrOutCount = products.data.filter(p => p.stock_status === 'out_of_stock' || p.stock_quantity <= 5).length;
    const featuredCount = products.data.filter(p => p.featured).length;

    const ProductCard = ({ product }: { product: Product }) => {
        const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];

        return (
            <div className="group overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                <div>
                    <div className="relative aspect-square bg-gray-50 overflow-hidden border-b border-gray-100">
                        {primaryImage ? (
                            <img 
                                src={primaryImage.image_path} 
                                alt={product.name} 
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <ImageIcon className="h-12 w-12 stroke-[1.5]" />
                            </div>
                        )}
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md shadow-xs ${
                                product.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-gray-700/80 text-white'
                            }`}>
                                {product.status}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md shadow-xs ${
                                product.stock_status === 'in_stock' 
                                    ? 'bg-emerald-100/90 text-emerald-800' 
                                    : product.stock_status === 'out_of_stock'
                                    ? 'bg-red-500/90 text-white'
                                    : 'bg-amber-100/90 text-amber-800'
                            }`}>
                                {product.stock_status.replace('_', ' ')}
                            </span>
                            {product.featured && (
                                <span className="rounded-full bg-purple-600/90 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                                    Featured
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">{product.name}</h3>
                        </div>
                        <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed min-h-[32px] mb-3">
                            {product.description || 'No product description provided.'}
                        </p>

                        <div className="flex items-baseline justify-between mb-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-gray-950">
                                    {formatPrice(product.sale_price || product.price)}
                                </span>
                                {product.sale_price && (
                                    <span className="text-xs text-gray-400 line-through">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-mono text-gray-400">SKU: {product.sku}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <span className="font-medium">Stock: <strong className="text-gray-800">{product.stock_quantity}</strong></span>
                            <span className="truncate max-w-[120px] text-gray-600">{product.category?.name || 'Uncategorized'}</span>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 truncate max-w-[110px]">
                            {product.brand?.name || 'No Brand'}
                        </span>
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/admin/products/${product.id}`}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                title="View Details"
                            >
                                <EyeIcon className="h-3.5 w-3.5" />
                            </Link>
                            <button
                                onClick={() => openDialog('edit', product)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                                title="Edit Product"
                            >
                                <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                title="Delete Product"
                            >
                                <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout mainNavItems={adminNavItems} breadcrumbs={breadcrumbs} footerNavItems={[]}>
            <Head title="Products Management" />

            <div className="min-h-screen bg-[#F6F8FA] p-6 lg:p-8 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catalog Inventory</span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-medium text-emerald-600">Active</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mt-1">Products Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage stock, variants, brand associations, pricing, and showcase listings</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openDialog('create')}
                            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Product
                        </button>
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
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Total Products</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <PackageIcon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-3xl font-black tracking-tight text-white">{products.total}</h3>
                            <p className="text-xs font-medium text-white/80 mt-1">Total active SKUs in database</p>
                        </div>
                    </div>

                    {/* In Stock Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Available Stock</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                                <PackageIcon className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-emerald-600">{inStockCount} on page</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Ready for fulfillment</p>
                        </div>
                    </div>

                    {/* Low / Out of Stock Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Low or Depleted</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                                <FilterIcon className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-amber-600">{lowOrOutCount} items</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Restock recommended</p>
                        </div>
                    </div>

                    {/* Featured Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Featured Showcase</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50">
                                <EyeIcon className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-purple-600">{featuredCount} spotlighted</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Displayed on storefront hero</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div>
                    {/* Search and Filter Bar */}
                    <div className="mb-6 space-y-4">

                        {/* Search Bar & Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products by title, SKU, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full rounded-2xl border border-gray-200/80 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-xs"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 cursor-pointer"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Search
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                                        showFilters || hasActiveFilters 
                                            ? 'border-gray-900 bg-gray-900 text-white' 
                                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <FilterIcon className="h-3.5 w-3.5" />
                                    <span>Filters</span>
                                    {hasActiveFilters && (
                                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                            ✓
                                        </span>
                                    )}
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                                    >
                                        <XIcon className="h-3.5 w-3.5" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="space-y-4 rounded-[24px] border border-gray-200/80 bg-white p-6 shadow-sm">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Category</label>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
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
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Brand</label>
                                        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
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
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Publish Status</label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
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
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Stock Availability</label>
                                        <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
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

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                    {/* Featured Filter */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Featured</label>
                                        <Select value={selectedFeatured} onValueChange={setSelectedFeatured}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
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
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Min Price (ETB)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Max Price (ETB)</label>
                                        <input
                                            type="number"
                                            placeholder="100000"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-xs text-gray-800"
                                        />
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Sort By</label>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
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
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Order</label>
                                        <Select value={sortDirection} onValueChange={setSortDirection}>
                                            <SelectTrigger className="w-full rounded-2xl border-gray-200 bg-gray-50/60 text-xs">
                                                <SelectValue placeholder="Order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Descending</SelectItem>
                                                <SelectItem value="asc">Ascending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSearch}
                                        className="inline-flex items-center rounded-2xl px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 cursor-pointer"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Apply Filters
                                    </button>
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
                            <H3>{hasActiveFilters ? 'No products match your search criteria' : 'No products found'}</H3>
                            <p className="mb-4 text-gray-600">
                                {hasActiveFilters
                                    ? 'Try adjusting your search or filters to find products.'
                                    : 'Get started by creating your first product.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button onClick={clearFilters} variant="outline" className="inline-flex items-center rounded-lg px-4 py-2">
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
                    {products.links && products.links.length > 0 ? <Pagination links={products.links} /> : null}
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
