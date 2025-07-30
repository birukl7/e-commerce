"use client"
import AppLayout from "@/layouts/app-layout"
import MainLayout from "@/layouts/app/main-layout"
import type { NavItem, BreadcrumbItem } from "@/types"
import { BrickWall, ListOrdered, Save, Heart, Trash2, ShoppingCart, Star, LayoutDashboard } from "lucide-react"
import { Link, router } from "@inertiajs/react"
import { useState } from "react"
import { CustomLink } from "@/components/link"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number | null
  current_price: number
  description: string
  image: string
  images: Array<{
    id: number
    url: string
    alt_text: string
    is_primary: boolean
  }>
  category?: string
  brand?: string
  stock_status: string
  featured: boolean
  added_at: string
}

interface WishlistProps {
  wishlistItems: Product[]
  count: number
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
  },
  {
    title: "Wishlist",
    href: "/user-wishlist",
  },
]

const defaultMainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "BookMarked Products",
    href: "/user-wishlist",
    icon: Save,
  },
  {
    title: "Orders",
    href: "/user-order",
    icon: ListOrdered,
  },
  {
    title: "Requests",
    href: "/user-request",
    icon: BrickWall,
  },
  {
    title: "Bought Products",
    href: "/user-products",
    icon: ListOrdered,
  },
]

// Helper function to format Ethiopian Birr
const formatETB = (amount: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function WishlistDashboard({ wishlistItems, count }: WishlistProps) {
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())

  const handleRemoveFromWishlist = async (productId: number) => {
    setRemovingItems((prev) => new Set(prev).add(productId))

    try {
      const response = await fetch("/wishlist/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({ product_id: productId }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the page to update the wishlist
        router.reload()
      } else {
        alert(data.message || "Failed to remove item from wishlist")
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      alert("An error occurred while removing the item")
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  return (
    <MainLayout title={"My Wishlist"} className={""} footerOff={false} contentMarginTop={"mt-[60px]"}>
      <AppLayout
        logoDisplay=" invisible"
        sidebarStyle="mt-[20px]"
        breadcrumbs={breadcrumbs}
        mainNavItems={defaultMainNavItems}
        footerNavItems={[]}
      >
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">{count} items saved for later</p>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">Items you love</span>
            </div>
          </div>

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Link href={`/products/${product.slug}`}>
                      <img
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.featured && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </span>
                      )}
                      {product.sale_price && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Sale</span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      disabled={removingItems.has(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {removingItems.has(product.id) ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Stock Status Overlay */}
                    {product.stock_status === "out_of_stock" && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                    {/* Category and Brand */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      {product.category && <span>{product.category}</span>}
                      {product.brand && (
                        <>
                          <span>•</span>
                          <span>{product.brand}</span>
                        </>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.sale_price ? (
                        <>
                          <span className="text-lg font-bold text-red-600">{formatETB(product.current_price)}</span>
                          <span className="text-sm text-gray-500 line-through">{formatETB(product.price)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{formatETB(product.current_price)}</span>
                      )}
                    </div>

                    {/* Rating Placeholder */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gray-300 text-gray-300" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">No reviews yet</span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.stock_status === "in_stock"
                            ? "bg-green-100 text-green-800"
                            : product.stock_status === "out_of_stock"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.stock_status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        Added {new Date(product.added_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Product
                      </Link>
                      {product.stock_status === "in_stock" && (
                        <button className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Heart className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Start adding products you love to your wishlist. You can save items for later and keep track of your
                favorites.
              </p>
              <CustomLink
                href={route('home')}
                className=" text-white px-6 py-3 rounded-lg  transition-colors font-medium"
              >
                Browse Products
              </CustomLink>
            </div>
          )}
        </div>
      </AppLayout>
    </MainLayout>
  )
}
