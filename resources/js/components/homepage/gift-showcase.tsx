import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {  Heart } from "lucide-react"
import H2 from "../ui/h2"


const featuredItems = [
  {
    id: 1,
    title: "Unique Vases",
    image: "/placeholder.svg?height=300&width=400",
    className: "col-span-1",
  },
  {
    id: 2,
    title: "Cake Pops",
    image: "/placeholder.svg?height=300&width=400",
    className: "col-span-1",
  },
  {
    id: 3,
    title: "Custom Face Straws and Balloons",
    image: "/placeholder.svg?height=300&width=400",
    className: "col-span-1",
  },
]

const products = [
  {
    id: 1,
    title: "Birthday Coloring Book Activity",
    price: "USD 10.00",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    title: "Birthday Card Set",
    price: "USD 41.00",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    title: "Gift Box Set",
    price: "USD 11.23",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    title: "Birthday Card",
    price: "USD 4.21",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    title: "Zodiac Birthday Card",
    price: "USD 18.00",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    title: "Happy Birthday Banner",
    price: "USD 29.95",
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function GiftShowcase() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  return (
    <div className=" mx-auto p-2 md:p-2 lg:p-2">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-6 lg:mb-0">
          <H2 className=" text-gray-900 mb-4 leading-tight">
            ShopHub-special gifts
            <br />
            for birthdays
          </H2>
          <Button
            variant="outline"
            className="px-6 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            Get inspired
          </Button>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1 lg:ml-8">
          {featuredItems.map((item, index) => (
            <Card key={item.id} className="overflow-hidden group cursor-pointer">
              <CardContent className="p-0 relative">
                <div   style={{ backgroundImage: `url(image/image-${index+1}.jpg)` }}
  className="bg-cover h-[200px] sm:h-[300px] md:h-[400px] w-full relative">
                  {/* <img
                    src={`image/image-${index+1}.jpg`}
                    alt={item.title}
                    className="object-cover transition-transform duration-300"
                  /> */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold text-lg md:text-xl">{item.title}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {products.map((product, index) => (
          <Card
            key={product.id}
            className="overflow-hidden group cursor-pointer relative"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <CardContent className="p-0">
              <div  style={{ backgroundImage: `url(image/image-${index+1}.jpg)` }} className="bg-cover h-[200px] sm:h-[200px] md:h-[200px] w-full relative aspect-square ">
                {/* <img
                  src={`https://picsum.photos/id/${Math.floor(Math.random() * 201)}/${Math.floor(Math.random() * 1)}/${Math.floor(Math.random() * 300)}`}
                  alt={product.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                /> */}
                {/* Bookmark Icon on Hover */}
                <div
                  className={`absolute top-3 right-3 transition-opacity duration-200 ${
                    hoveredProduct === product.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</p>
                <p className="text-sm font-semibold text-gray-900">{product.price}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Text */}
      <p className="text-center text-gray-600 text-sm">
        Find things you'll love. Support independent sellers. Only on ShopHub
      </p>
    </div>
  )
}
