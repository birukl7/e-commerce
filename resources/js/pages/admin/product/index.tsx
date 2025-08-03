"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ImageIcon, PackageIcon } from "lucide-react"
// import ProductDialog from "@/components/product-dialog"
import ConfirmationDialog from "@/components/confirmation-dialog"
import H1 from "@/components/ui/h1"
import H2 from "@/components/ui/h2"
import H3 from "@/components/ui/h3"
import { adminNavItems } from "../dashboard"
import { Button } from "@/components/ui/button"
import ProductDialog from "@/components/product-dialog"
import { Brand, Product } from "@/types"


interface Category {
  id: number
  name: string
  slug: string
  is_active: boolean
}


interface Props {
  products: Product[]
  categories: Category[]
  brands: Brand[]
}

const Index = ({ products = [], categories = [], brands = [] }: Props) => {
  const [dialogState, setDialogState] = useState<{
    action: "create" | "edit" | null
    data?: Product | null
  }>({
    action: null,
    data: null,
  })

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    id: number
    name: string
  } | null>(null)

  const openDialog = (action: "create" | "edit", data?: Product) => {
    setDialogState({ action, data: data || null })
  }

  const closeDialog = () => {
    setDialogState({ action: null, data: null })
  }

  const handleDelete = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      id,
      name,
    })
  }

  const confirmDelete = () => {
    if (confirmDialog) {
      router.delete(`/admin/products/${confirmDialog.id}`)
      setConfirmDialog(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'on_backorder':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const primaryImage = product.images.find(img => img.is_primary) || product.images[0]

    console.log('is primary', primaryImage)
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-100 relative">
          {primaryImage ? (
            <img 
              src={`/storage/${primaryImage.image_path}`} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
              {product.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.stock_status)}`}>
              {product.stock_status.replace('_', ' ')}
            </span>
            {product.featured && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <H3 className="line-clamp-2">{product.name}</H3>
          </div>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(product.sale_price || product.price)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">SKU: {product.sku}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>Stock: {product.stock_quantity}</span>
            <span>{product.category?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{product.brand.name}</span>
            <div className="flex space-x-1">
              <Link
                href={`/admin/products/${product.id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="View"
              >
                <EyeIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={() => openDialog("edit", product)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(product.id, product.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Products Management" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="text-3xl font-bold text-gray-900">Products Management</H1>
          <p className="text-gray-600 mt-2">Manage your e-commerce products</p>
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <H2>Products</H2>
            <Button
              onClick={() => openDialog("create")}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <H3>No products found</H3>
              <p className="text-gray-600 mb-4">Get started by creating your first product.</p>
              <Button
                onClick={() => openDialog("create")}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
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
  )
}

export default Index
