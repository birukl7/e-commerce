import { ProductCard } from "@/components/category/product-card"

const products = [
  {
    id: 1,
    title: "Wedding wrap cardigan, ballet wrap shrug, w...",
    price: "127.20",
    originalPrice: "169.60",
    discount: "20% off",
    rating: 5,
    reviewCount: 1207,
    seller: "EdelweissBride",
    isStarSeller: true,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    title: "Vintage Y2K Dior Overshine 1 N5WSZ Pink Shi...",
    price: "978.23",
    rating: 0,
    reviewCount: 0,
    seller: "ElenasClosetVintage",
    hasFreeShipping: true,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    title: "Set of 10 Hand printed bandana,Neckkerchief,...",
    price: "30.00",
    originalPrice: "99.99",
    discount: "70% off",
    rating: 4,
    reviewCount: 75,
    seller: "TheUniqueArts23",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    title: "100% Silk Scarf Blue & Green Hand painted silk",
    price: "22.47",
    rating: 5,
    reviewCount: 2444,
    seller: "MillieBooSilkScarfs",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 1,
    title: "Wedding wrap cardigan, ballet wrap shrug, w...",
    price: "127.20",
    originalPrice: "169.60",
    discount: "20% off",
    rating: 5,
    reviewCount: 1207,
    seller: "EdelweissBride",
    isStarSeller: true,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    title: "Vintage Y2K Dior Overshine 1 N5WSZ Pink Shi...",
    price: "978.23",
    rating: 0,
    reviewCount: 0,
    seller: "ElenasClosetVintage",
    hasFreeShipping: true,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    title: "Set of 10 Hand printed bandana,Neckkerchief,...",
    price: "30.00",
    originalPrice: "99.99",
    discount: "70% off",
    rating: 4,
    reviewCount: 75,
    seller: "TheUniqueArts23",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    title: "100% Silk Scarf Blue & Green Hand painted silk",
    price: "22.47",
    rating: 5,
    reviewCount: 2444,
    seller: "MillieBooSilkScarfs",
    image: "/placeholder.svg?height=300&width=300",
  },
]

export function ProductGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  )
}
