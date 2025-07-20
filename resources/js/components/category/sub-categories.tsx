
import { Button } from "@/components/ui/button"

const categories = [
  {
    id: 1,
    name: "Hair Accessories",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Keychains & Lanyards",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Scarves & Wraps",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Hats & Caps",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Sunglasses & Eyewear",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "Hand Fans",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export function SubCategoriesSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {categories.map((category, i) => (
          <div key={category.id} className="group cursor-pointer">
            <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100">
              <img
                src={`image/image-${i+1}.jpg`}
                alt={category.name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 text-center leading-tight">{category.name}</h3>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="rounded-full px-6 bg-transparent">
          Show more (9)
        </Button>
      </div>
    </div>
  )
}
