"use client"
import { useState, useEffect, useCallback } from "react"
import { Heart, Share2, Star, Shield, RotateCcw, Tag } from "lucide-react"
import { Button } from "../ui/button"
import { useCart } from "@/contexts/cart-context"
import { usePage, router } from "@inertiajs/react"
import type { SharedData } from "@/types"
import { ReviewSection } from "./review-section"
// import { ReviewSection } from "./review-section"

interface ProductImage {
  id: number
  url: string
  alt_text: string
  is_primary: boolean
  sort_order: number
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Brand {
  id: number
  name: string
  slug?: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  sku: string
  price: number
  sale_price?: number | null
  current_price: number
  cost_price?: number | null
  stock_quantity: number
  stock_status: string
  featured: boolean
  status: string
  meta_title?: string
  meta_description?: string
  images: ProductImage[]
  primary_image: string
  category: Category
  brand: Brand
  average_rating: number
  reviews_count: number
  rating_breakdown: { [key: number]: number }
}

interface Review {
  id: number
  rating: number
  title?: string
  comment: string
  user_name: string
  user_avatar?: string
  created_at: string
  helpful_count: number
  is_verified_purchase: boolean
  is_helpful_to_user: boolean
}

interface ReviewsData {
  data: Review[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ProductDetailsProps {
  product: Product
  reviews: ReviewsData
  userHasReviewed: boolean
}

export function ProductDetails({ product, reviews, userHasReviewed }: ProductDetailsProps) {
  const { auth } = usePage<SharedData>().props
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const { addToCart } = useCart()

  const getCsrfToken = () => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
    if (metaToken) return metaToken
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "XSRF-TOKEN") {
        return decodeURIComponent(value)
      }
    }
    return ""
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const isOnSale = product.sale_price && product.sale_price < product.price
  const isOutOfStock = product.stock_status === "out_of_stock"
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: quantity })
    console.log(`Adding ${quantity} of product ${product.id} to cart`)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const fetchWishlistStatus = useCallback(async () => {
    if (!auth.user) {
      setIsWishlisted(false)
      return
    }
    try {
      const csrfToken = getCsrfToken()
      const response = await fetch(`/wishlist/check?product_id=${product.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
      })
      if (response.status === 419) {
        console.warn("CSRF token expired during wishlist check, refreshing page...")
        window.location.reload()
        return
      }
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsWishlisted(data.in_wishlist)
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist status:", error)
    }
  }, [auth.user, product.id])

  const handleToggleWishlist = async () => {
    if (!auth.user) {
      router.visit("/login")
      return
    }
    setWishlistLoading(true)
    try {
      const csrfToken = getCsrfToken()
      if (!csrfToken) {
        throw new Error("CSRF token not found. Please refresh the page.")
      }
      const response = await fetch("/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({ product_id: product.id }),
      })
      if (response.status === 419) {
        console.warn("CSRF token expired during wishlist toggle, refreshing page...")
        window.location.reload()
        return
      }
      const data = await response.json()
      if (data.success) {
        setIsWishlisted(data.in_wishlist)
        console.log(data.message)
      } else {
        console.error("Wishlist toggle failed:", data.message)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      if (error instanceof Error && error.message.includes("CSRF")) {
        window.location.reload()
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlistStatus()
  }, [fetchWishlistStatus])

  return (
    <div className="space-y-6">
      {/* Product Title and Brand */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">{product.brand.name}</span>
          {product.featured && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              Featured
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(product.average_rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {product.average_rating.toFixed(1)} ({product.reviews_count} reviews)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        {isOnSale ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">{formatPrice(product.current_price)}</span>
            <span className="text-xl text-gray-500 line-through">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-800">
              <Tag className="mr-1 h-4 w-4" />
              Save {formatPrice(product.price - product.current_price)}
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-gray-900">{formatPrice(product.current_price)}</span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isOutOfStock ? "bg-red-500" : isLowStock ? "bg-yellow-500" : "bg-green-500"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-green-600"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${product.stock_quantity} left in stock` : "In Stock"}
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* Quantity and Add to Cart */}
      {!isOutOfStock && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="w-16 px-3 py-2 text-center border-0 focus:ring-0"
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock_quantity}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Add to Cart
            </Button>
            <Button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`p-3 rounded-md border transition-colors ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:text-red-600"
              } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
            <Button
              onClick={handleShare}
              className="p-3 rounded-md border border-gray-200 bg-gray-50 text-gray-600 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="border-t pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Shield className="h-5 w-5 text-green-600" />
            <span>1 year warranty</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            <span>30-day returns</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-900">Category</dt>
            <dd className="text-gray-600">{product.category.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Brand</dt>
            <dd className="text-gray-600">{product.brand.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">SKU</dt>
            <dd className="text-gray-600">{product.sku}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Availability</dt>
            <dd className="text-gray-600">{product.stock_quantity} units in stock</dd>
          </div>
        </dl>
      </div>

      {/* Reviews Section */}
      <ReviewSection
        productId={product.id}
        averageRating={product.average_rating}
        reviewsCount={product.reviews_count}
        ratingBreakdown={product.rating_breakdown}
        reviews={reviews}
        userHasReviewed={userHasReviewed}
      />
    </div>
  )
}
