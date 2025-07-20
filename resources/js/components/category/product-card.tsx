import { Star, StarHalf } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  title: string
  price: string
  originalPrice?: string
  discount?: string
  rating: number
  reviewCount: number
  seller: string
  isStarSeller?: boolean
  hasFreeShipping?: boolean
  image: string
}

interface ProductCardProps {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-current text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-3 h-3 fill-current text-yellow-400" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="group cursor-pointer">
      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100 relative">
        <img
          src={`image/image-${index+1}.jpg`}
          alt={product.title}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {product.hasFreeShipping && (
          <Badge className="absolute bottom-2 left-2 bg-green-600 hover:bg-green-600 text-white text-xs">
            FREE shipping
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">{product.title}</h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">{renderStars(product.rating)}</div>
            <span className="text-xs text-gray-600">({product.reviewCount.toLocaleString()})</span>
            {product.isStarSeller && <Star className="w-3 h-3 fill-current text-purple-500 ml-1" />}
            {product.isStarSeller && <span className="text-xs text-purple-600 font-medium">Star Seller</span>}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">USD {product.price}</span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">USD {product.originalPrice}</span>
              <span className="text-sm text-gray-600">({product.discount})</span>
            </>
          )}
        </div>

        <p className="text-xs text-gray-600">Ad by {product.seller}</p>
      </div>
    </div>
  )
}
