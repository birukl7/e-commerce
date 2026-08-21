"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import type React from "react"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, Heart } from "lucide-react"
import { getImageUrl } from "@/lib/image"

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
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 55,
    seconds: 14,
  })

  const loadingRef = useRef(false)
  const lastExcludedIdsRef = useRef<string>("")

  const createPlaceholderDataUrl = (text: string, width = 200, height = 200) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#F0E6D3"
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = "#888888"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const maxWidth = width - 20
      const words = text.split(" ")
      let line = ""
      const lines: string[] = []
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line)
          line = words[n] + " "
        } else {
          line = testLine
        }
      }
      lines.push(line)
      const lineHeight = 16
      const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2
      lines.forEach((l, index) => {
        ctx.fillText(l.trim(), width / 2, startY + index * lineHeight)
      })
    }
    return canvas.toDataURL()
  }

  const fetchProducts = useCallback(
    async (excludeIds: number[] = []) => {
      if (loadingRef.current) return
      try {
        loadingRef.current = true
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          count: productCount.toString(),
          status: "published",
          stock_status: "in_stock",
          featured: "true",
        })
        if (excludeIds.length > 0) {
          params.append("exclude_categories", excludeIds.join(","))
        }
        const response = await fetch(`/api/products/featured?${params}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          cache: "no-store",
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
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

  useEffect(() => {
    fetchProducts(excludeCategoryIds)
  }, [])

  useEffect(() => {
    const currentExcludedIds = JSON.stringify(excludeCategoryIds.sort())
    if (lastExcludedIdsRef.current !== currentExcludedIds && lastExcludedIdsRef.current !== "") {
      fetchProducts(excludeCategoryIds)
    }
    lastExcludedIdsRef.current = currentExcludedIds
  }, [excludeCategoryIds, fetchProducts])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
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
    const handleResize = () => setVisibleCards(getVisibleCards())
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

  const formatPrice = (price: string) => `ETB ${Number.parseFloat(price).toFixed(2)}`

  const getProductImage = (product: Product) => {
    return getImageUrl(product.image, { bucket: "products", placeholderText: product.name, width: 400, height: 400 })
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallbackText: string) => {
    const target = e.currentTarget
    const currentSrc = target.src
    if (failedImages.has(currentSrc)) return
    setFailedImages((prev) => new Set(prev).add(currentSrc))
    target.src = createPlaceholderDataUrl(fallbackText)
  }

  const calculateDiscount = (originalPrice: string, salePrice: string) => {
    const original = Number.parseFloat(originalPrice)
    const sale = Number.parseFloat(salePrice)
    return `${Math.round(((original - sale) / original) * 100)}% off`
  }

  const handleRetry = () => {
    setFailedImages(new Set())
    fetchProducts(excludeCategoryIds)
  }

  if (error) {
    return (
      <div className="mx-auto py-2">
        <div className="py-8 text-center">
          <p className="mb-4 text-[#A61A2E]">Failed to load deals</p>
          <Button onClick={handleRetry} className="rounded-full bg-[#222222] px-6 py-2 text-white hover:bg-[#333333]">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2
            className="text-2xl font-bold text-[#222222]"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            Today's big deals
          </h2>
          <div className="flex items-center gap-1.5 text-[#595959]">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Fresh deals in {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>
        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222222] text-[#222222] bg-transparent hover:bg-[#222222] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={currentIndex === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#222222] text-[#222222] bg-transparent hover:bg-[#222222] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={currentIndex + visibleCards >= products.length || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
                  <div className="overflow-hidden rounded-lg">
                    <div className="h-[200px] sm:h-[260px] md:h-[320px] bg-[#F0E6D3] animate-pulse" />
                    <div className="pt-3 space-y-2">
                      <div className="h-3 bg-[#F0E6D3] rounded animate-pulse" />
                      <div className="h-3 bg-[#F0E6D3] rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            : products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 px-2"
                  style={{ flex: `0 0 calc(100% / ${visibleCards})` }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="group cursor-pointer">
                      {/* Product Image */}
                      <div className="h-[200px] sm:h-[260px] md:h-[320px] w-full relative overflow-hidden rounded-lg">
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
                          <div className="absolute top-2.5 left-2.5 bg-[#2F7431] text-white px-2 py-0.5 rounded text-xs font-semibold">
                            {calculateDiscount(product.price, product.sale_price)}
                          </div>
                        )}
                        {/* Wishlist Button */}
                        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            className="bg-white/90 rounded-full p-2 transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <Heart className="w-4 h-4 text-[#595959]" />
                          </button>
                        </div>
                      </div>
                      {/* Product Info */}
                      <div className="pt-2.5">
                        <h3 className="font-medium text-[#222222] mb-1.5 line-clamp-2 text-sm">
                          {product.name}
                        </h3>
                        {/* Price */}
                        <div className="flex items-center gap-2 mb-1">
                          {product.sale_price ? (
                            <>
                              <span className="font-bold text-base text-[#2F7431]">{formatPrice(product.sale_price)}</span>
                              <span className="text-xs text-[#888888] line-through">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="font-bold text-base text-[#222222]">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        {/* Sale Info */}
                        {product.sale_price && (
                          <p className="text-xs text-[#2F7431] font-medium">
                            {calculateDiscount(product.price, product.sale_price)}
                          </p>
                        )}
                      </div>
                    </div>
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
                Math.floor(currentIndex / visibleCards) === index ? "bg-[#222222]" : "bg-[#D4CFC7]"
              }`}
            />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-[#595959]">No deals available at the moment.</p>
        </div>
      )}
    </div>
  )
}
