"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import type React from "react"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Clock, Star, Heart } from "lucide-react"
import H2 from "../ui/h2"

interface Product {
  id: number
  name: string
  slug: string
  price: string
  sale_price?: string
  image?: string
  category_id: number
  featured: boolean
  status: string
  stock_status: string
  rating?: number
}

interface DealsCarouselProps {
  excludeCategoryIds?: number[]
  productCount?: number
}

export default function DealsCarousel({ excludeCategoryIds = [], productCount = 8 }: DealsCarouselProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 55,
    seconds: 14,
  })

  // Use refs to track loading states and prevent multiple simultaneous requests
  const loadingRef = useRef(false)
  const lastExcludedIdsRef = useRef<string>("")

  // Create a base64 placeholder image to avoid server requests
  const createPlaceholderDataUrl = (text: string, width = 200, height = 200) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Fill background
      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(0, 0, width, height)

      // Add text
      ctx.fillStyle = "#9ca3af"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Wrap text if too long
      const maxWidth = width - 20
      const words = text.split(" ")
      let line = ""
      const lines = []

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " "
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          lines.push(line)
          line = words[n] + " "
        } else {
          line = testLine
        }
      }
      lines.push(line)

      // Draw lines
      const lineHeight = 16
      const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2

      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), width / 2, startY + index * lineHeight)
      })
    }

    return canvas.toDataURL()
  }

  const fetchProducts = useCallback(
    async (excludeIds: number[] = []) => {
      // Prevent multiple simultaneous requests
      if (loadingRef.current) return

      try {
        loadingRef.current = true
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          count: productCount.toString(),
          status: "published",
          stock_status: "in_stock",
          featured: "true", // Get featured/deal products
        })

        // Add excluded category IDs if provided
        if (excludeIds.length > 0) {
          params.append("exclude_categories", excludeIds.join(","))
        }

        const response = await fetch(`/api/products/featured?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setProducts(data.data || data || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch products")
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [productCount],
  )

  // Initial load effect
  useEffect(() => {
    fetchProducts(excludeCategoryIds)
  }, [])

  // Effect to handle changes in excludeCategoryIds
  useEffect(() => {
    const currentExcludedIds = JSON.stringify(excludeCategoryIds.sort())
    // Only refetch if excludeCategoryIds actually changed
    if (lastExcludedIdsRef.current !== currentExcludedIds && lastExcludedIdsRef.current !== "") {
      fetchProducts(excludeCategoryIds)
    }
    lastExcludedIdsRef.current = currentExcludedIds
  }, [excludeCategoryIds, fetchProducts])

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
  const totalSlides = loading ? productCount : products.length

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards())
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + visibleCards >= products.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, products.length - visibleCards) : prev - 1))
  }

  const formatTime = (time: number) => time.toString().padStart(2, "0")

  const formatPrice = (price: string, salePrice?: string) => {
    const formattedPrice = `ETB ${Number.parseFloat(price).toFixed(2)}`
    const formattedSalePrice = salePrice ? `ETB ${Number.parseFloat(salePrice).toFixed(2)}` : null
    return formattedSalePrice ? formattedSalePrice : formattedPrice
  }

  const getProductImage = (product: Product) => {
    if (!product.image) {
      return createPlaceholderDataUrl(product.name)
    }
    if (product.image.startsWith("http")) {
      return product.image
    }
    return `image/${product.image}`
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallbackText: string) => {
    const target = e.currentTarget
    const currentSrc = target.src

    // Prevent infinite loop by checking if we've already failed this image
    if (failedImages.has(currentSrc)) {
      return
    }

    // Add to failed images set
    setFailedImages((prev) => new Set(prev).add(currentSrc))

    // Set to data URL placeholder instead of server-dependent placeholder
    target.src = createPlaceholderDataUrl(fallbackText)
  }

  const calculateDiscount = (originalPrice: string, salePrice: string) => {
    const original = Number.parseFloat(originalPrice)
    const sale = Number.parseFloat(salePrice)
    const discount = Math.round(((original - sale) / original) * 100)
    return `${discount}% off`
  }

  const handleRetry = () => {
    // Clear failed images when retrying
    setFailedImages(new Set())
    fetchProducts(excludeCategoryIds)
  }

  if (error) {
    return (
      <div className="mx-auto p-2 md:p-2 lg:p-2">
        <div className="py-8 text-center">
          <p className="mb-4 text-red-500">Failed to load deals</p>
          <Button onClick={handleRetry} className="px-6 py-2">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto p-2 md:p-2 lg:p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <H2 className="text-gray-900">Today's big deals</H2>
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
            disabled={currentIndex === 0 || loading}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full w-10 h-10 border-gray-300 hover:bg-gray-50 bg-transparent"
            disabled={currentIndex + visibleCards >= products.length || loading}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out -mx-2"
          style={{
            transform: `translateX(-${(currentIndex * 100) / Math.max(totalSlides, 1)}%)`,
            willChange: "transform",
          }}
        >
          {loading
            ? Array.from({ length: productCount }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-2"
                  style={{ flex: `0 0 calc(100% / ${visibleCards})` }}
               >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="h-[200px] sm:h-[300px] md:h-[400px] bg-gray-200 animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2"
                  style={{ flex: `0 0 calc(100% / ${visibleCards})` }}
               >
                  <Link href={`/products/${product.slug}`}>
                    <Card
                      className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <CardContent className="p-0">
                        {/* Product Image */}
                        <div className="h-[200px] sm:h-[300px] md:h-[400px] w-full relative aspect-square overflow-hidden">
                          <img
                            loading="lazy"
                            decoding="async"
                            src={getProductImage(product) || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => handleImageError(e, product.name)}
                          />
                          {/* Discount Badge */}
                          {product.sale_price && (
                            <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              {calculateDiscount(product.price, product.sale_price)}
                            </div>
                          )}
                          {/* Wishlist Button */}
                          <div
                            className={`absolute top-3 right-3 transition-opacity duration-200 ${
                              hoveredProduct === product.id ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <button
                              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log("Added to wishlist:", product.id)
                              }}
                            >
                              <Heart className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-sm font-medium">{product.rating || 4.9}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2">
                            {product.sale_price ? (
                              <>
                                <span className="font-bold text-lg text-gray-900">{formatPrice(product.sale_price)}</span>
                                <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                                <span className="text-sm font-medium text-green-600">
                                  {calculateDiscount(product.price, product.sale_price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-lg text-gray-900">{ formatPrice(product.price)}</span>
                            )}
                          </div>
                          {/* Sale Info */}
                          <p className="text-xs text-gray-600">
                            {product.sale_price ? "Biggest sale in 60+ days" : "Limited time offer"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
        </div>
      </div>

      {/* Dots Indicator for Mobile */}
      {!loading && products.length > 0 && (
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {Array.from({ length: Math.ceil(products.length / visibleCards) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * visibleCards)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / visibleCards) === index ? "bg-gray-900" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No deals available at the moment.</p>
        </div>
      )}
    </div>
  )
}
