import { ProductCard } from "@/components/category/product-card"

const relatedProducts = [
  {
    id: 1,
    title: "Bridal shrug, wedding bolero, white knit cardigan",
    price: "89.50",
    originalPrice: "119.00",
    discount: "25% off",
    rating: 5,
    reviewCount: 892,
    seller: "EdelweissBride",
    isStarSeller: true,
    image: "/placeholder.svg?height=300&width=300&text=Bridal+Shrug",
  },
  {
    id: 2,
    title: "Wedding wrap, bridal cover up, mohair cardigan",
    price: "145.00",
    rating: 5,
    reviewCount: 567,
    seller: "ElegantBridalWear",
    hasFreeShipping: true,
    image: "/placeholder.svg?height=300&width=300&text=Wedding+Wrap",
  },
  {
    id: 3,
    title: "Ivory wedding shawl, bridal wrap, wool blend",
    price: "78.90",
    originalPrice: "98.90",
    discount: "20% off",
    rating: 4,
    reviewCount: 234,
    seller: "BridalAccessories",
    image: "/placeholder.svg?height=300&width=300&text=Bridal+Shawl",
  },
  {
    id: 4,
    title: "White bolero jacket, wedding cover up, lace trim",
    price: "112.30",
    rating: 5,
    reviewCount: 445,
    seller: "WeddingEssentials",
    image: "/placeholder.svg?height=300&width=300&text=Bolero+Jacket",
  },
]

export function RelatedProducts() {
  return (
    <div className="border-t pt-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  )
}
