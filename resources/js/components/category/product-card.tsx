import { Link } from "@inertiajs/react"
import { Star, Tag } from "lucide-react"
import type React from "react"

interface ProductImage {
  id: number
  url: string
  alt_text: string
  is_primary: boolean
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number | null
  current_price: number
  description: string
  image: string
  images: ProductImage[]
  featured: boolean
  stock_status: string
}

interface ProductCardProps {
  product: Product
  index: number
}

// Helper function to format Ethiopian Birr
const formatETB = (amount: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function ProductCard({ product, index }: ProductCardProps) {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(product.name)}`
    }
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    // Image path from controller already includes full URL
    return imagePath
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget
    target.src = `/placeholder.svg?height=300&width=300&text=Product`
  }

  const isOnSale = product.sale_price && product.sale_price < product.price
  const isOutOfStock = product.stock_status === "out_of_stock"

  return (
    <Link prefetch href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(product.image) || "/placeholder.svg"}
            alt={product.images.find((img) => img.is_primary)?.alt_text || product.name}
            className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-105 ${
              isOutOfStock ? "opacity-50" : ""
            }`}
            onError={handleImageError}
            loading={index > 3 ? "lazy" : "eager"}
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.featured && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                Featured
              </span>
            )}
            {isOnSale && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                <Tag className="mr-1 h-3 w-3" />
                Sale
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="rounded bg-white px-3 py-1 text-sm font-medium text-gray-900">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Title */}
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
            {product.name}
          </h3>

          {/* Product Description */}
          <p className="mb-3 line-clamp-2 text-xs text-gray-600">{product.description}</p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnSale ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">{formatETB(product.current_price)}</span>
                  <span className="text-sm text-gray-500 line-through">{formatETB(product.price)}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">{formatETB(product.current_price)}</span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gray-300 text-gray-300" />
                ))}
                <span className="ml-1">No reviews yet</span>
              </div>
            </div>

            {product.stock_status === "in_stock" && (
              <span className="text-xs text-green-600 font-medium">In Stock</span>
            )}
            {product.stock_status === "on_backorder" && (
              <span className="text-xs text-yellow-600 font-medium">Backorder</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
