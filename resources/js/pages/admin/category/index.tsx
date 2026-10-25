import BrandDialog from '@/components/brand-dialog';
import CategoryDialog from '@/components/category-dialog';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import H1 from '@/components/ui/h1';
import H2 from '@/components/ui/h2';
import H3 from '@/components/ui/h3';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ImageIcon, PencilIcon, PlusIcon, TrashIcon, Layers, Sparkles, CheckCircle2, Tags, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminNavItems } from '@/constants/adminNavItems';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Categories and Brands',
        href: '/admin/categories',
    },
];
interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    parent_id: number | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    parent?: Category;
    children?: Category[];
}

interface Props {
    categories: Category[];
    brands: Brand[];
}

const Index = ({ categories = [], brands = [] }: Props) => {

    console.log("categories", categories);
    console.log("brands", brands);
    const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');

    const [dialogState, setDialogState] = useState<{
        type: 'category' | 'brand' | null;
        action: 'create' | 'edit' | null;
        data?: Category | Brand | null;
    }>({
        type: null,
        action: null,
        data: null,
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'category' | 'brand';
        id: number;
        name: string;
    } | null>(null);

    const [deleteErrors, setDeleteErrors] = useState<{
        password?: string[]
    }>({});

    // Form for handling deletion with password
    const deleteForm = useForm({
        password: ''
    });

    const openDialog = (type: 'category' | 'brand', action: 'create' | 'edit', data?: Category | Brand) => {
        setDialogState({ type, action, data: data || null });
    };

    const closeDialog = () => {
        setDialogState({ type: null, action: null, data: null });
    };

    const handleDelete = (type: 'category' | 'brand', id: number, name: string) => {
        setDeleteErrors({}); // Clear any previous errors
        deleteForm.reset(); // Reset the form
        setConfirmDialog({
            isOpen: true,
            type,
            id,
            name,
        });
    };

    const getCategoryWarningMessage = (categoryName: string) => {
        return `
            <div class="space-y-3">
                <p><strong>⚠️ WARNING: This action is irreversible!</strong></p>
                <p>Deleting the category "<strong>${categoryName}</strong>" will permanently:</p>
                <ul class="list-disc list-inside ml-4 space-y-1 text-sm">
                    <li><strong>Delete ALL products</strong> associated with this category</li>
                    <li><strong>Delete ALL child categories</strong> (subcategories) under this category</li>
                    <li><strong>Remove ALL product images, descriptions, and data</strong> for products in this category</li>
                    <li><strong>Delete order history</strong> containing products from this category</li>
                    <li><strong>Remove wishlist items</strong> that reference products in this category</li>
                    <li><strong>Clear shopping carts</strong> containing products from this category</li>
                </ul>
                <p class="text-red-600 font-semibold">This could affect hundreds of products and customer data!</p>
                <p>Please enter your password to confirm this dangerous operation.</p>
            </div>
        `;
    };

    const getBrandWarningMessage = (brandName: string) => {
        return `Are you sure you want to delete "${brandName}"? This action cannot be undone.`;
    };

    const confirmDelete = (password?: string) => {
        if (confirmDialog) {
            if (confirmDialog.type === 'category' && password) {
                // Set the password in the form
                deleteForm.setData('password', password);
                
                // Clear any previous errors
                setDeleteErrors({});
                
                deleteForm.delete(`/admin/categories/${confirmDialog.id}`, {
                    preserveState: true,
                    onError: (errors) => {
                        console.log('Delete errors received:', errors);
                        // Store errors to display in the dialog
                        if (errors.password) {
                            setDeleteErrors({ password: Array.isArray(errors.password) ? errors.password : [errors.password] });
                            // Dialog stays open to show the error
                        } else {
                            // For other errors, close dialog and let them be handled by the page
                            setConfirmDialog(null);
                            setDeleteErrors({});
                        }
                    },
                    onSuccess: () => {
                        setConfirmDialog(null);
                        setDeleteErrors({});
                        deleteForm.reset();
                    }
                });
            } else {
                // For brands, use regular router delete (no password required)
                router.delete(`/admin/brands/${confirmDialog.id}`, {
                    onSuccess: () => {
                        setConfirmDialog(null);
                    }
                });
            }
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

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredBrands = brands.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeCategoriesCount = categories.filter(c => c.is_active).length;
    const activeBrandsCount = brands.filter(b => b.is_active).length;

    const CategoryCard = ({ category }: { category: Category }) => (
        <div className="group overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
            <div>
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    {category.image ? (
                        <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                            <ImageIcon className="h-10 w-10 stroke-[1.5]" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {category.parent && (
                            <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white">
                                Subcategory
                            </span>
                        )}
                        <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md shadow-sm ${
                                category.is_active 
                                    ? 'bg-emerald-500/90 text-white' 
                                    : 'bg-red-500/90 text-white'
                            }`}
                        >
                            {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">{category.name}</h3>
                    </div>
                    {category.parent && (
                        <p className="text-xs text-gray-500 mb-2">
                            Parent: <span className="font-semibold text-gray-700">{category.parent.name}</span>
                        </p>
                    )}
                    <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed min-h-[32px]">
                        {category.description || 'No description provided.'}
                    </p>
                </div>
            </div>

            <div className="px-5 pb-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-mono text-gray-400">Order: {category.sort_order}</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => openDialog('category', 'edit', category)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                            title="Edit Category"
                        >
                            <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => handleDelete('category', category.id, category.name)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            title="Delete Category"
                        >
                            <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const BrandCard = ({ brand }: { brand: Brand }) => (
        <div className="group overflow-hidden rounded-[24px] border border-gray-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
            <div>
                <div className="relative aspect-video bg-gray-50 p-6 flex items-center justify-center overflow-hidden border-b border-gray-100">
                    {brand.logo ? (
                        <img src={`/storage/${brand.logo}`} alt={brand.name} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <ImageIcon className="h-10 w-10 stroke-[1.5]" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md shadow-sm ${
                                brand.is_active ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                            }`}
                        >
                            {brand.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 mb-1.5">{brand.name}</h3>
                    <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed min-h-[32px]">
                        {brand.description || 'No description provided.'}
                    </p>
                </div>
            </div>

            <div className="px-5 pb-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-mono text-gray-400">/{brand.slug}</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => openDialog('brand', 'edit', brand)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                            title="Edit Brand"
                        >
                            <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => handleDelete('brand', brand.id, brand.name)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                            title="Delete Brand"
                        >
                            <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout mainNavItems={adminNavItems} breadcrumbs={breadcrumbs} footerNavItems={[]}>
            <Head title="Categories & Brands Management" />

            <div className="min-h-screen bg-[#F6F8FA] p-6 lg:p-8 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catalog Taxonomy</span>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-medium text-emerald-600">Active</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mt-1">Categories & Brands</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Organize your store collections, hierarchy, and manufacturer partners</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeTab === 'categories' ? (
                            <button
                                onClick={() => openDialog('category', 'create')}
                                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Category
                            </button>
                        ) : (
                            <button
                                onClick={() => openDialog('brand', 'create')}
                                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Brand
                            </button>
                        )}
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
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Total Categories</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <Tags className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 relative z-10">
                            <h3 className="text-3xl font-black tracking-tight text-white">{categories.length}</h3>
                            <p className="text-xs font-medium text-white/80 mt-1">{activeCategoriesCount} live in navigation</p>
                        </div>
                    </div>

                    {/* Active Categories Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Categories</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                                <Layers className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-emerald-600">{activeCategoriesCount}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Available to shoppers</p>
                        </div>
                    </div>

                    {/* Total Brands Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Brands</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-purple-600">{brands.length}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">{activeBrandsCount} active partners</p>
                        </div>
                    </div>

                    {/* Active Brands Metric */}
                    <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Brands</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black tracking-tight text-blue-600">{activeBrandsCount}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Published storefront brands</p>
                        </div>
                    </div>
                </div>

                {/* Filter & Pill Tabs Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    {/* Modern Pill Switcher */}
                    <div className="inline-flex rounded-2xl bg-gray-200/60 p-1 border border-gray-200/50">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'categories'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Categories ({categories.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('brands')}
                            className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                                activeTab === 'brands'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Brands ({brands.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'categories' ? "Search categories..." : "Search brands..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200/80 bg-white pl-10 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                </div>

                {/* Content Cards Grid */}
                {activeTab === 'categories' && (
                    <div>
                        {filteredCategories.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredCategories.map((category) => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[26px] border border-gray-200/80 bg-white p-12 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                    <Tags className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">No categories found</h3>
                                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                    {searchQuery ? "No categories match your search term." : "Get started by creating your store's first category taxonomy."}
                                </p>
                                <button
                                    onClick={() => openDialog('category', 'create')}
                                    className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Category
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'brands' && (
                    <div>
                        {filteredBrands.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredBrands.map((brand) => (
                                    <BrandCard key={brand.id} brand={brand} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[26px] border border-gray-200/80 bg-white p-12 text-center shadow-sm">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">No brands found</h3>
                                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                    {searchQuery ? "No brands match your search query." : "Get started by adding manufacturers or brands for your catalog."}
                                </p>
                                <button
                                    onClick={() => openDialog('brand', 'create')}
                                    className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Brand
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            {dialogState.type === 'category' && (
                <CategoryDialog
                    isOpen={true}
                    onClose={closeDialog}
                    action={dialogState.action!}
                    category={dialogState.data as Category}
                    categories={categories}
                />
            )}

            {dialogState.type === 'brand' && (
                <BrandDialog isOpen={true} onClose={closeDialog} action={dialogState.action!} brand={dialogState.data as Brand} />
            )}

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <ConfirmationDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={() => {
                        setConfirmDialog(null);
                        setDeleteErrors({});
                        deleteForm.reset();
                    }}
                    onConfirm={confirmDelete}
                    title={`Delete ${confirmDialog.type === 'category' ? 'Category' : 'Brand'}`}
                    description={
                        confirmDialog.type === 'category' 
                            ? getCategoryWarningMessage(confirmDialog.name)
                            : getBrandWarningMessage(confirmDialog.name)
                    }
                    confirmText={confirmDialog.type === 'category' ? 'Yes, Delete Category & All Products' : 'Delete'}
                    cancelText="Cancel"
                    variant="danger"
                    requirePassword={confirmDialog.type === 'category'}
                    passwordPlaceholder="Enter your admin password to confirm deletion"
                    serverErrors={deleteForm.errors.password ? { password: [deleteForm.errors.password] } : deleteErrors}
                />
            )}
        </AppLayout>
    );
};

export default Index;
