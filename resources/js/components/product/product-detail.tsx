import { useState } from 'react'
import { Heart, Share2, Star, Truck, Shield, RotateCcw, Tag } from 'lucide-react'

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
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const isOnSale = product.sale_price && product.sale_price < product.price
  const isOutOfStock = product.stock_status === 'out_of_stock'
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    // Add to cart logic here
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

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
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {product.average_rating} ({product.reviews_count} reviews)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        {isOnSale ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">
              {formatPrice(product.current_price)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-sm font-medium text-red-800">
              <Tag className="mr-1 h-4 w-4" />
              Save {formatPrice(product.price - product.current_price)}
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.current_price)}
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${
          isOutOfStock ? 'bg-red-500' : 
          isLowStock ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
        <span className={`text-sm font-medium ${
          isOutOfStock ? 'text-red-600' : 
          isLowStock ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {isOutOfStock ? 'Out of Stock' : 
           isLowStock ? `Only ${product.stock_quantity} left in stock` : 'In Stock'}
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
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
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
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-3 rounded-md border transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-md border border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="border-t pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Truck className="h-5 w-5 text-blue-600" />
            <span>Free shipping over $50</span>
          </div>
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
            <dd className="text-gray-600">
              {product.stock_quantity} units in stock
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}