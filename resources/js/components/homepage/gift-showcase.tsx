"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Link, usePage, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import H2 from "../ui/h2"
import type { SharedData } from "@/types"

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
}

interface ShowcaseCategory {
  id: number
  name: string
  slug: string
  image: string
  product_count: number
}

interface GiftShowcaseProps {
  excludeCategoryIds?: number[]
  productCount?: number
  categoryCount?: number
}

export default function GiftShowcase({
  excludeCategoryIds = [],
  productCount = 6,
  categoryCount = 3,
}: GiftShowcaseProps) {
  const { auth } = usePage<SharedData>().props
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ShowcaseCategory[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set())
  const [wishlistLoading, setWishlistLoading] = useState<Set<number>>(new Set())

  // Track failed images to prevent infinite loops
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Use refs to track loading states and prevent multiple simultaneous requests
  const productsLoadingRef = useRef(false)
  const categoriesLoadingRef = useRef(false)
  const lastExcludedIdsRef = useRef<string>("")

  // Get CSRF token
  const getCsrfToken = () => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
    if (metaToken) return metaToken

    // Fallback to cookie
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "XSRF-TOKEN") {
        return decodeURIComponent(value)
      }
    }
    return ""
  }

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

  // Fetch user's wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!auth.user) return

    try {
      const csrfToken = getCsrfToken()
      const response = await fetch("/api/wishlist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const wishlistProductIds = new Set(data.data.map((item: any) => item.id))
          setWishlistItems(wishlistProductIds)
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }, [auth.user])

  // Toggle wishlist item using Inertia router (more reliable for CSRF)
  const toggleWishlist = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!auth.user) {
      // Redirect to login
      router.visit("/login")
      return
    }

    // Add to loading set
    setWishlistLoading((prev) => new Set(prev).add(productId))

    // Use Inertia router for CSRF-protected requests
    router.post(
      "/api/wishlist/toggle",
      { product_id: productId },
      {
        preserveScroll: true,
        preserveState: true,
        only: [], // Don't reload any props
        onSuccess: (page) => {
          // Handle success - we need to make another request to get the response
          // Since Inertia doesn't return JSON responses directly, let's use fetch as fallback
          handleToggleSuccess(productId)
        },
        onError: (errors) => {
          console.error("Wishlist toggle failed:", errors)
          setWishlistLoading((prev) => {
            const newSet = new Set(prev)
            newSet.delete(productId)
            return newSet
          })
        },
      },
    )
  }

  // Handle successful toggle
  const handleToggleSuccess = (productId: number) => {
    setWishlistItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
        console.log("Product removed from wishlist")
      } else {
        newSet.add(productId)
        console.log("Product added to wishlist")
      }
      return newSet
    })

    setWishlistLoading((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  // Alternative: Use fetch with better error handling
  const toggleWishlistFetch = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!auth.user) {
      router.visit("/login")
      return
    }

    setWishlistLoading((prev) => new Set(prev).add(productId))

    try {
      const csrfToken = getCsrfToken()

      if (!csrfToken) {
        throw new Error("CSRF token not found. Please refresh the page.")
      }

      const url = "/api/wishlist/toggle"
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({ product_id: productId }),
      }

      console.log("Sending request to:", url, "with method:", options.method, "and CSRF token:", csrfToken)
      const response = await fetch("/api/wishlist/toggle", options)

      console.log("Received response status:", response.status)
      const responseClone = response.clone()
      const responseText = await responseClone.text()
      console.log("Received response body:", responseText)

      if (response.status === 419) {
        // CSRF token expired
        console.warn("CSRF token expired, refreshing page...")
        window.location.reload()
        return
      }

      const data = await response.json()

      if (data.success) {
        setWishlistItems((prev) => {
          const newSet = new Set(prev)
          if (data.in_wishlist) {
            newSet.add(productId)
          } else {
            newSet.delete(productId)
          }
          return newSet
        })
        console.log(data.message)
      } else {
        console.error("Wishlist toggle failed:", data.message)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      if (error instanceof Error && error.message.includes("CSRF")) {
        // Refresh page to get new CSRF token
        window.location.reload()
      }
    } finally {
      setWishlistLoading((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const fetchProducts = useCallback(
    async (excludeIds: number[] = []) => {
      // Prevent multiple simultaneous requests
      if (productsLoadingRef.current) return
      try {
        productsLoadingRef.current = true
        setProductsLoading(true)
        setProductsError(null)
        const params = new URLSearchParams({
          count: productCount.toString(),
          status: "published",
          stock_status: "in_stock",
        })
        // Add excluded category IDs if provided
        if (excludeIds.length > 0) {
          params.append("exclude_categories", excludeIds.join(","))
        }
        const response = await fetch(`/api/products/showcase?${params}`, {
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
        setProductsError(err instanceof Error ? err.message : "Failed to fetch products")
      } finally {
        setProductsLoading(false)
        productsLoadingRef.current = false
      }
    },
    [productCount],
  )

  const fetchCategories = useCallback(
    async (excludeIds: number[] = []) => {
      // Prevent multiple simultaneous requests
      if (categoriesLoadingRef.current) return
      try {
        categoriesLoadingRef.current = true
        setCategoriesLoading(true)
        setCategoriesError(null)
        const params = new URLSearchParams({
          count: categoryCount.toString(),
        })
        // Add excluded category IDs if provided
        if (excludeIds.length > 0) {
          params.append("exclude_categories", excludeIds.join(","))
        }
        const response = await fetch(`/api/categories/showcase?${params}`, {
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
        setCategories(data.data || data || [])
      } catch (err) {
        console.error("Error fetching categories:", err)
        setCategoriesError(err instanceof Error ? err.message : "Failed to fetch categories")
      } finally {
        setCategoriesLoading(false)
        categoriesLoadingRef.current = false
      }
    },
    [categoryCount],
  )

  // Initial load effect
  useEffect(() => {
    fetchProducts(excludeCategoryIds)
    fetchCategories(excludeCategoryIds)
    fetchWishlist()
  }, [])

  // Effect to handle changes in excludeCategoryIds
  useEffect(() => {
    const currentExcludedIds = JSON.stringify(excludeCategoryIds.sort())
    // Only refetch if excludeCategoryIds actually changed
    if (lastExcludedIdsRef.current !== currentExcludedIds && lastExcludedIdsRef.current !== "") {
      fetchProducts(excludeCategoryIds)
      fetchCategories(excludeCategoryIds)
    }
    lastExcludedIdsRef.current = currentExcludedIds
  }, [excludeCategoryIds, fetchProducts, fetchCategories])

  const formatPrice = (price: string, salePrice?: string) => {
    const formattedPrice = `USD ${Number.parseFloat(price).toFixed(2)}`
    const formattedSalePrice = salePrice ? `USD ${Number.parseFloat(salePrice).toFixed(2)}` : null
    return formattedSalePrice ? formattedSalePrice : formattedPrice
  }

  const getProductImage = (product: Product) => {
    if (!product.image) {
      return createPlaceholderDataUrl(product.name)
    }

    if (product.image.startsWith("http")) {
      // Remove any duplicate slashes in the URL path (except after "http(s):")
      const url = new URL(product.image)
      url.pathname = url.pathname.replace(/\/{2,}/g, "/")
      return url.toString()
    }

    return product.image
  }

  const getCategoryImage = (category: ShowcaseCategory) => {
    if (!category.image) {
      return createPlaceholderDataUrl(category.name, 400, 400)
    }
    if (category.image.startsWith("http")) {
      return category.image
    }
    return category.image
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

  const handleRetry = () => {
    // Clear failed images when retrying
    setFailedImages(new Set())
    fetchProducts(excludeCategoryIds)
    fetchCategories(excludeCategoryIds)
  }

  if (productsError && categoriesError) {
    return (
      <div className="mx-auto p-2 md:p-2 lg:p-2">
        <div className="py-8 text-center">
          <p className="mb-4 text-red-500">Failed to load content</p>
          <Button onClick={handleRetry} className="px-6 py-2">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto p-2 md:p-2 lg:p-2">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-6 lg:mb-0">
          <H2 className="text-gray-900 mb-4 leading-tight">
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
        {/* Featured Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1 lg:ml-8">
          {categoriesLoading
            ? Array.from({ length: categoryCount }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-[200px] sm:h-[300px] md:h-[400px] bg-gray-200 animate-pulse" />
                  </CardContent>
                </Card>
              ))
            : categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="overflow-hidden group cursor-pointer">
                    <CardContent className="p-0 relative">
                      <div className="h-[200px] sm:h-[300px] md:h-[400px] w-full relative overflow-hidden">
                        <img
                          src={getCategoryImage(category) || "/placeholder.svg"}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => handleImageError(e, category.name)}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white font-semibold text-lg md:text-xl transition-colors group-hover:text-blue-200">
                            {category.name}
                          </h3>
                          <p className="text-white/80 text-sm">{category.product_count} products</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {productsLoading
          ? Array.from({ length: productCount }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-[200px] bg-gray-200 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          : products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card
                  className="overflow-hidden group cursor-pointer relative transition-all duration-300 hover:shadow-lg"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <CardContent className="p-0">
                    <div className="h-[200px] w-full relative aspect-square overflow-hidden">
                      <img
                        src={getProductImage(product) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, product.name)}
                      />
                      {product.sale_price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                          SALE
                        </div>
                      )}
                      <div
                        className={`absolute top-3 right-3 transition-opacity duration-200 ${
                          hoveredProduct === product.id ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <button
                          className={`rounded-full p-2 shadow-md transition-colors ${
                            wishlistItems.has(product.id) ? "bg-red-500 hover:bg-red-600" : "bg-white hover:bg-gray-50"
                          } ${wishlistLoading.has(product.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={(e) => toggleWishlistFetch(product.id, e)} // Use the fetch version
                          disabled={wishlistLoading.has(product.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wishlistItems.has(product.id) ? "text-white fill-current" : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {product.sale_price ? (
                          <>
                            <p className="text-sm font-semibold text-gray-900">{formatPrice(product.sale_price)}</p>
                            <p className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</p>
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {!productsLoading && products.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      )}

      <p className="text-center text-gray-600 text-sm">
        Find things you'll love. Support independent sellers. Only on ShopHub
      </p>
    </div>
  )
}
