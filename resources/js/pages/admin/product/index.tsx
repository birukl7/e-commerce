'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { EyeIcon, ImageIcon, PackageIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
// import ProductDialog from "@/components/product-dialog"
import ConfirmationDialog from '@/components/confirmation-dialog';
import ProductDialog from '@/components/product-dialog';
import { Button } from '@/components/ui/button';
import H1 from '@/components/ui/h1';
import H2 from '@/components/ui/h2';
import H3 from '@/components/ui/h3';
import { Brand, Product } from '@/types';
import { adminNavItems } from '../dashboard';

interface Category {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
}

interface Props {
    products: Product[];
    categories: Category[];
    brands: Brand[];
}

const Index = ({ products = [], categories = [], brands = [] }: Props) => {
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
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

        console.log('is primary', primaryImage);

        return (
            <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
                <div className="relative aspect-square bg-gray-100">
                    {primaryImage ? (
                        <img src={`/storage/image/${primaryImage.image_path}`} alt={product.name} className="h-full w-full object-cover" />
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
                            <button
                                onClick={() => openDialog('edit', product)}
                                className="rounded-full p-2 text-green-600 transition-colors hover:bg-green-50"
                                title="Edit"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(product.id, product.name)}
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
    };

    return (
        <AppLayout mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Products Management" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <H1 className="text-3xl font-bold text-gray-900">Products Management</H1>
                    <p className="mt-2 text-gray-600">Manage your e-commerce products</p>
                </div>

                {/* Content */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <H2>Products</H2>
                        <Button
                            onClick={() => openDialog('create')}
                            className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <H3>No products found</H3>
                            <p className="mb-4 text-gray-600">Get started by creating your first product.</p>
                            <Button
                                onClick={() => openDialog('create')}
                                className="inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                    )}
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
