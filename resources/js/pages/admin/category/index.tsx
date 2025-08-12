'use client';

import BrandDialog from '@/components/brand-dialog';
import CategoryDialog from '@/components/category-dialog';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import H1 from '@/components/ui/h1';
import H2 from '@/components/ui/h2';
import H3 from '@/components/ui/h3';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { EyeIcon, ImageIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { adminNavItems } from '../dashboard';

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

    const openDialog = (type: 'category' | 'brand', action: 'create' | 'edit', data?: Category | Brand) => {
        setDialogState({ type, action, data: data || null });
    };

    const closeDialog = () => {
        setDialogState({ type: null, action: null, data: null });
    };

    const handleDelete = (type: 'category' | 'brand', id: number, name: string) => {
        setConfirmDialog({
            isOpen: true,
            type,
            id,
            name,
        });
    };

    const confirmDelete = () => {
        if (confirmDialog) {
            router.delete(`/admin/${confirmDialog.type === 'category' ? 'categories' : 'brands'}/${confirmDialog.id}`);
            setConfirmDialog(null);
        }
    };

    const CategoryCard = ({ category }: { category: Category }) => (
        <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
            <div className="relative aspect-video bg-gray-100">
                {category.image ? (
                    <img src={`/image/${category.image}`} alt={category.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                            category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                    <H3>{category.name}</H3>
                    {category.parent && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Sub-category</span>}
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{category.description}</p>
                {category.parent && (
                    <p className="mb-3 text-xs text-gray-500">
                        Parent: <span className="font-medium">{category.parent.name}</span>
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Sort: {category.sort_order}</span>
                    <div className="flex space-x-1">
                        <Link
                            href={`/admin/categories/${category.id}`}
                            className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title="View"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => openDialog('category', 'edit', category)}
                            className="rounded-full p-2 text-green-600 transition-colors hover:bg-green-50"
                            title="Edit"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete('category', category.id, category.name)}
                            className="rounded-full p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Delete"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const BrandCard = ({ brand }: { brand: Brand }) => (
        <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
            <div className="relative aspect-square bg-gray-100 p-4">
                {brand.logo ? (
                    <img src={`/image/${brand.logo}`} alt={brand.name} className="h-full w-full object-contain" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                            brand.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {brand.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <H3>{brand.name}</H3>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{brand.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">/{brand.slug}</span>
                    <div className="flex space-x-1">
                        <Link
                            href={`/admin/brands/${brand.id}`}
                            className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            title="View"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => openDialog('brand', 'edit', brand)}
                            className="rounded-full p-2 text-green-600 transition-colors hover:bg-green-50"
                            title="Edit"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete('brand', brand.id, brand.name)}
                            className="rounded-full p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Delete"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout mainNavItems={adminNavItems} breadcrumbs={breadcrumbs} footerNavItems={[]}>
            <Head title="Categories & Brands Management" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <H1 className="text-3xl font-bold text-gray-900">Categories & Brands</H1>
                    <p className="mt-2 text-gray-600">Manage your e-commerce categories and brands</p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                activeTab === 'categories'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Categories ({categories.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('brands')}
                            className={`border-b-2 px-1 py-2 text-sm font-medium ${
                                activeTab === 'brands'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Brands ({brands.length})
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'categories' && (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <H2>Categories</H2>
                            <Button
                                onClick={() => openDialog('category', 'create')}
                                className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </div>

                        {categories.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {categories.map((category) => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <H3>No categories found</H3>
                                <p className="mb-4 text-gray-600">Get started by creating your first category.</p>
                                <Button
                                    onClick={() => openDialog('category', 'create')}
                                    className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'brands' && (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <H2>Brands</H2>
                            <Button
                                onClick={() => openDialog('brand', 'create')}
                                className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Brand
                            </Button>
                        </div>

                        {brands.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {brands.map((brand) => (
                                    <BrandCard key={brand.id} brand={brand} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <H3>No brands found</H3>
                                <p className="mb-4 text-gray-600">Get started by creating your first brand.</p>
                                <button
                                    onClick={() => openDialog('brand', 'create')}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
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
                    onClose={() => setConfirmDialog(null)}
                    onConfirm={confirmDelete}
                    title={`Delete ${confirmDialog.type === 'category' ? 'Category' : 'Brand'}`}
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
