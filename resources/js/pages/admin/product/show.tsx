import { CustomLink } from "@/components/link"
import { Button } from "@/components/ui/button"
import H1 from "@/components/ui/h1"
import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { ArrowLeftIcon, PencilIcon, TrashIcon, ImageIcon, TagIcon, CalendarIcon, SortAscIcon, PackageIcon } from "lucide-react"
import { useState } from "react"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { adminNavItems } from "../dashboard"

interface ProductImage {
  id: number
  image_path: string
  alt_text?: string
  is_primary?: boolean
  sort_order?: number
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  sku: string
  price: number
  sale_price?: number | null
  cost_price?: number | null
  stock_quantity: number
  manage_stock: boolean
  stock_status: string
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  category_id: number
  brand_id: number
  featured: boolean
  status: string
  meta_title?: string | null
  meta_description?: string | null
  created_at: string
  updated_at: string
  category: Category
  brand: Brand
  images: ProductImage[]
}

interface Props {
  product: Product
}

const Show = ({ product }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "ETB" }).format(price)

  const handleDelete = () => {
    router.delete(`/admin/products/${product.id}`)
    setConfirmDelete(false)
  }

  const primaryImage = product.images.find((img) => img.is_primary) || product.images[0]

  return (
    <AppLayout mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title={`Product: ${product.name}`} />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <H1>{product.name}</H1>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === "published"
                      ? "bg-green-100 text-green-800"
                      : product.status === "archived"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock_status === "in_stock"
                      ? "bg-green-100 text-green-800"
                      : product.stock_status === "out_of_stock"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.stock_status.replace("_", " ")}
                </span>
                {product.featured && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <CustomLink
                href={`/admin/products/${product.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </CustomLink>
              <Button
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => setConfirmDelete(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                {primaryImage ? (
                  <img
                    src={`/storage/${primaryImage.image_path}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                    <span className="ml-3 text-gray-500">No image uploaded</span>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 p-4 border-t border-gray-100">
                  {product.images.map((img, idx) => (
                    <img
                      key={img.id || idx}
                      src={`/storage/${img.image_path}`}
                      alt={img.alt_text || product.name}
                      className={`w-16 h-16 object-cover rounded border ${
                        img.is_primary ? "ring-2 ring-blue-500" : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Pricing</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.sale_price && (
                    <span className="text-base text-green-700 font-semibold">
                      Sale: {formatPrice(product.sale_price)}
                    </span>
                  )}
                  {product.cost_price && (
                    <span className="text-xs text-gray-500 ml-2">Cost: {formatPrice(product.cost_price)}</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Stock</h3>
                <div className="flex items-center space-x-2">
                  <span>SKU: <span className="font-mono">{product.sku}</span></span>
                  <span>Qty: <span className="font-mono">{product.stock_quantity}</span></span>
                  <span>
                    {product.manage_stock ? (
                      <span className="text-xs text-blue-700">Managed</span>
                    ) : (
                      <span className="text-xs text-gray-400">Not managed</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Dimensions & Weight</h3>
              <div className="flex flex-wrap gap-4">
                <span>Weight: <span className="font-mono">{product.weight ?? "-"}</span></span>
                <span>Length: <span className="font-mono">{product.length ?? "-"}</span></span>
                <span>Width: <span className="font-mono">{product.width ?? "-"}</span></span>
                <span>Height: <span className="font-mono">{product.height ?? "-"}</span></span>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-2">SEO</h3>
              <div>
                <div>
                  <span className="font-semibold">Meta Title:</span>{" "}
                  <span className="text-gray-700">{product.meta_title || <em>None</em>}</span>
                </div>
                <div>
                  <span className="font-semibold">Meta Description:</span>{" "}
                  <span className="text-gray-700">{product.meta_description || <em>None</em>}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Slug</p>
                    <p className="font-medium">/{product.slug}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <PackageIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Link
                      href={`/admin/categories/${product.category?.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {product.category?.name}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <PackageIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Brand</p>
                    <span className="font-medium">{product.brand.name}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <SortAscIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Featured</p>
                    <span className="font-medium">{product.featured ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-sm">{formatDate(product.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-sm">{formatDate(product.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDelete && (
          <ConfirmationDialog
            isOpen={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
            title="Delete Product"
            description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
          />
        )}
      </div>
    </AppLayout>
  )
}

export default Show