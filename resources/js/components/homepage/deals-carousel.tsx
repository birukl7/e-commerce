import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Clock, Star } from "lucide-react"
import H2 from "../ui/h2"


const deals = [
  {
    id: 1,
    title: "Bracelet, Beaded Jewelry",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    currentPrice: "USD 16",
    originalPrice: null,
    discount: "50% off",
    saleInfo: "in 60+ days",
    discountBadge: "50% off",
  },
  {
    id: 2,
    title: "Custom Pet Portrait Stained Glass",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    currentPrice: "USD 30.27",
    originalPrice: "USD 67.26",
    discount: "55% off",
    saleInfo: "Biggest sale in 60+ days",
    discountBadge: "55% off",
  },
  {
    id: 3,
    title: "CROCHET PATTERN & Tutorial",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    currentPrice: "USD 7.36",
    originalPrice: "USD 16.36",
    discount: "55% off",
    saleInfo: "Biggest sale in 60+ days",
    discountBadge: "55% off",
  },
  {
    id: 4,
    title: "Gold Italian Bracelet, Vintage Style",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    currentPrice: "USD 9.71",
    originalPrice: "USD 30.85",
    discount: "75% off",
    saleInfo: "Biggest sale in 60+ days",
    discountBadge: "75% off",
  },
  {
    id: 5,
    title: "Custom Birthstone Necklace",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    currentPrice: "USD 25.96",
    originalPrice: "USD 51.92",
    discount: "50% off",
    saleInfo: "Biggest sale in 60+ days",
    discountBadge: "50% off",
  },
  {
    id: 6,
    title: "Handmade Ceramic Mug",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    currentPrice: "USD 18.50",
    originalPrice: "USD 25.00",
    discount: "26% off",
    saleInfo: "Limited time offer",
    discountBadge: "26% off",
  },
]

export default function DealsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 55,
    seconds: 14,
  })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getVisibleCards = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1
      if (window.innerWidth < 1024) return 2
      if (window.innerWidth < 1280) return 3
      return 4
    }
    return 4
  }

  const [visibleCards, setVisibleCards] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards())
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + visibleCards >= deals.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, deals.length - visibleCards) : prev - 1))
  }

  const formatTime = (time: number) => time.toString().padStart(2, "0")

  return (
    <div className="mx-auto p-2 md:p-2 lg:p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <H2 className=" text-gray-900">Today's big deals</H2>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Fresh deals in {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full w-10 h-10 border-gray-300 hover:bg-gray-50 bg-transparent"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full w-10 h-10 border-gray-300 hover:bg-gray-50 bg-transparent"
            disabled={currentIndex + visibleCards >= deals.length}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
          }}
        >
          {deals.map((deal, index) => (
            <Card
              key={deal.id}
              className="flex-shrink-0 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-200"
              style={{ width: `calc(${100 / visibleCards}% - 12px)` }}
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div   style={{ backgroundImage: `url(image/image-${index+1}.jpg)` }}
  className="bg-cover h-[200px] sm:h-[300px] md:h-[400px] w-full aspect-square relative" >
                  {/* <img
                    src={deal.image || "/placeholder.svg"}
                    alt={deal.title}
                    
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  /> */}
                  {/* Discount Badge */}
                  {deal.discountBadge && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      {deal.discountBadge}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">{deal.title}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm font-medium">{deal.rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{deal.currentPrice}</span>
                    {deal.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{deal.originalPrice}</span>
                    )}
                    {deal.discount && <span className="text-sm font-medium text-green-600">{deal.discount}</span>}
                  </div>

                  {/* Sale Info */}
                  <p className="text-xs text-gray-600">{deal.saleInfo}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dots Indicator for Mobile */}
      <div className="flex justify-center gap-2 mt-6 md:hidden">
        {Array.from({ length: Math.ceil(deals.length / visibleCards) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * visibleCards)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / visibleCards) === index ? "bg-gray-900" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
