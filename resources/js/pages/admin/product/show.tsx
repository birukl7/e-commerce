/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from "@/layouts/app-layout"
import { adminNavItems } from "@/constants/adminNavItems"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ImageIcon,
  Tag,
  Calendar,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Award,
  Search,
} from "lucide-react"
import { useEffect, useState } from "react"
import ConfirmationDialog from "@/components/confirmation-dialog"
import ProductDialog from "@/components/product-dialog"

interface ProductImage {
  id: number
  image_path: string
  alt_text?: string
  is_primary?: boolean
  sort_order?: number
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  sku: string
  price: number
  sale_price?: number | null
  stock_quantity: number
  manage_stock: boolean
  stock_status: string
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  category_id: number
  brand_id: number
  featured: boolean
  status: string
  meta_title?: string | null
  meta_description?: string | null
  created_at: string
  updated_at: string
  category: Category
  brand: Brand
  images: ProductImage[]
}

interface Props {
  product: Product
  categories: { id: number; name: string }[]
  brands: { id: number; name: string }[]
}

const Show = ({ product, categories, brands }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Real-time theme sync with localStorage
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("serdo_dashboard_primary_color") || "#1E5338"
      } catch {
        return "#1E5338"
      }
    }
    return "#1E5338"
  })

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const color = typeof e.detail === "string" ? e.detail : (e.detail?.color || e.detail?.hex)
      if (color) setPrimaryColor(color)
    }
    window.addEventListener("serdo:theme-color-changed", handleThemeChange)
    window.addEventListener("theme-color-changed", handleThemeChange)
    return () => {
      window.removeEventListener("serdo:theme-color-changed", handleThemeChange)
      window.removeEventListener("theme-color-changed", handleThemeChange)
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "ETB", maximumFractionDigits: 0 })
      .format(price)
      .replace("$", "ETB ")

  const handleDelete = () => {
    router.delete(`/admin/products/${product.id}`)
    setConfirmDelete(false)
  }

  const displayedImage =
    product.images[selectedImageIndex] ||
    product.images.find((img) => img.is_primary) ||
    product.images[0]

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin Dashboard", href: "/admin-dashboard" },
    { title: "Products", href: "/admin/products" },
    { title: product.name, href: `/admin/products/${product.id}` },
  ]

  // Status visual helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return {
          label: "Published",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        }
      case "archived":
        return {
          label: "Archived",
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
        }
      default:
        return {
          label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft",
          bg: "bg-neutral-100 text-neutral-700 border-neutral-200",
          icon: <Clock className="w-3.5 h-3.5 text-neutral-500" />,
        }
    }
  }

  const getStockBadge = (stockStatus: string, qty: number) => {
    if (stockStatus === "in_stock" && qty > 5) {
      return {
        label: `In Stock (${qty})`,
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      }
    } else if (stockStatus === "out_of_stock" || qty === 0) {
      return {
        label: "Out of Stock (0)",
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
      }
    } else {
      return {
        label: `Low Stock (${qty})`,
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      }
    }
  }

  const statusBadge = getStatusBadge(product.status)
  const stockBadge = getStockBadge(product.stock_status, product.stock_quantity)

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title={`Product: ${product.name} | Serdo Admin`} />

      <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto space-y-6">

          {/* ========================================================== */}
          {/* TOP BACK LINK & ACTION BAR                                  */}
          {/* ========================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white px-3.5 py-2 rounded-full border border-neutral-200/80 shadow-xs transition-all active:scale-95 w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Product</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* HEADER HERO CARD                                           */}
          {/* ========================================================== */}
          <div className="relative overflow-hidden rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
            <div
              className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl transition-all duration-700"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-neutral-400" />
                    SKU: <span className="font-mono text-neutral-800">{product.sku || 'N/A'}</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusBadge.bg}`}>
                    {statusBadge.icon}
                    {statusBadge.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${stockBadge.bg}`}>
                    {stockBadge.icon}
                    {stockBadge.label}
                  </span>
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Featured Item
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {product.name}
                </h1>

                <p className="text-xs sm:text-sm text-neutral-500 font-mono">
                  Slug: <span className="text-neutral-700">/{product.slug}</span>
                </p>
              </div>

              {/* Price Pill Hero */}
              <div className="flex flex-col sm:items-end justify-center bg-[#F6F8FA] p-5 rounded-2xl border border-neutral-200/80 shrink-0">
                <span className="text-xs font-medium text-neutral-500 mb-1">Standard Price</span>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    {formatPrice(product.price)}
                  </span>
                </div>
                {product.sale_price && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    <span>Sale Price:</span>
                    <span>{formatPrice(product.sale_price)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* 4-KPI SUMMARY ROW                                          */}
          {/* ========================================================== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Category</span>
                <Layers className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                {product.category?.name || "Uncategorized"}
              </p>
              <Link
                href="/admin/categories"
                className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 mt-1 inline-flex items-center gap-1"
              >
                View categories <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Brand</span>
                <Award className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                {product.brand?.name || "No Brand"}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">Verified supplier brand</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Available Units</span>
                <Package className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-neutral-900">
                {product.stock_quantity} units
              </p>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                {product.manage_stock ? "Inventory tracked" : "Unmanaged stock"}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Created On</span>
                <Calendar className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-sm sm:text-base font-bold text-neutral-900">
                {new Date(product.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Updated {new Date(product.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* MAIN 2-COLUMN GRID: Left Gallery & Content / Right Sidebar */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Product Gallery Card */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs overflow-hidden p-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-neutral-500" />
                    <h3 className="text-sm font-bold text-neutral-900">Product Media Gallery</h3>
                  </div>
                  <span className="text-xs text-neutral-400 font-medium">
                    {product.images?.length || 0} Images
                  </span>
                </div>

                {/* Main Active Image Stage */}
                <div className="aspect-video w-full rounded-2xl bg-[#F6F8FA] border border-neutral-200/60 relative overflow-hidden flex items-center justify-center group">
                  {displayedImage ? (
                    <img
                      src={displayedImage.image_path}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
                      <p className="text-xs font-medium">No product photo uploaded</p>
                    </div>
                  )}

                  {displayedImage?.is_primary && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-semibold shadow">
                      Primary Display Image
                    </span>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {product.images && product.images.length > 1 && (
                  <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-neutral-50 shrink-0 transition-all ${
                          idx === selectedImageIndex
                            ? "shadow-sm scale-105"
                            : "border-neutral-200 opacity-60 hover:opacity-100"
                        }`}
                        style={idx === selectedImageIndex ? { borderColor: primaryColor } : undefined}
                      >
                        <img
                          src={img.image_path}
                          alt={img.alt_text || product.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description Card */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-4">
                  <Tag className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-sm font-bold text-neutral-900">Product Description & Specs</h3>
                </div>
                <div className="prose prose-sm max-w-none text-neutral-600 leading-relaxed font-normal">
                  {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="text-neutral-400 italic">No detailed description has been provided for this product.</p>
                  )}
                </div>
              </div>

              {/* Shipping Dimensions & Weight Card */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-5">
                  <Package className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-sm font-bold text-neutral-900">Physical Dimensions & Packaging</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-neutral-200/60">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Weight</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-neutral-800">
                      {product.weight ? `${product.weight} kg` : "—"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-neutral-200/60">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Length</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-neutral-800">
                      {product.length ? `${product.length} cm` : "—"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-neutral-200/60">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Width</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-neutral-800">
                      {product.width ? `${product.width} cm` : "—"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F8FA] border border-neutral-200/60">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Height</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-neutral-800">
                      {product.height ? `${product.height} cm` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Engine Optimization (SEO) */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-2 pb-4 border-b border-neutral-100 mb-4">
                  <Search className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-sm font-bold text-neutral-900">Search Engine Optimization (SEO)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-neutral-700 block mb-1">Meta Title</span>
                    <p className="text-xs text-neutral-600 bg-[#F6F8FA] px-3.5 py-2.5 rounded-xl border border-neutral-200/60 font-medium">
                      {product.meta_title || <span className="italic text-neutral-400">Default store title template in use</span>}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-neutral-700 block mb-1">Meta Description</span>
                    <p className="text-xs text-neutral-600 bg-[#F6F8FA] px-3.5 py-2.5 rounded-xl border border-neutral-200/60 leading-relaxed font-medium">
                      {product.meta_description || <span className="italic text-neutral-400">No custom meta description provided</span>}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Taxonomy, Inventory & Audit Logs */}
            <div className="space-y-6">

              {/* Taxonomy & Organization Card */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6">
                <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
                  Classification & Taxonomies
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-neutral-500 font-medium">Product Category</span>
                    <Link
                      href={`/admin/categories`}
                      className="font-bold hover:underline"
                      style={{ color: primaryColor }}
                    >
                      {product.category?.name || "None"}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">Brand</span>
                    <span className="font-bold text-neutral-800">{product.brand?.name || "None"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">Store Front Slug</span>
                    <span className="font-mono text-neutral-700 font-semibold truncate max-w-[140px]">
                      /{product.slug}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">Promoted / Featured</span>
                    <span className={`font-bold ${product.featured ? "text-purple-600" : "text-neutral-500"}`}>
                      {product.featured ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">Catalog Visibility</span>
                    <span className="font-bold text-emerald-600">Active Listing</span>
                  </div>
                </div>
              </div>

              {/* Inventory Management Card */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6">
                <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
                  Inventory & Warehouse
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-neutral-500 font-medium">Tracking Mode</span>
                    <span className="font-semibold text-neutral-800">
                      {product.manage_stock ? "Auto stock decrements" : "Manual quantity"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">SKU Identifier</span>
                    <span className="font-mono text-neutral-800 font-bold">{product.sku}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">Units in Stock</span>
                    <span className="font-bold text-neutral-900 text-sm">{product.stock_quantity}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-neutral-50">
                    <span className="text-neutral-500 font-medium">Stock Status</span>
                    <span className={`font-semibold capitalize ${
                      product.stock_status === "in_stock" ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {product.stock_status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100">
                  <Link
                    href="/admin/stock"
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors"
                  >
                    <span>Open Stock Manager</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                </div>
              </div>

              {/* Timeline & Audit Logs Card */}
              <div className="rounded-[26px] bg-white border border-neutral-200/80 shadow-xs p-6">
                <h3 className="text-sm font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>Audit Timeline</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-neutral-500 font-medium">Created</p>
                      <p className="font-semibold text-neutral-800">{formatDate(product.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-neutral-500 font-medium">Last Modified</p>
                      <p className="font-semibold text-neutral-800">{formatDate(product.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ========================================================== */}
          {/* DIALOGS                                                    */}
          {/* ========================================================== */}
          {editDialogOpen && (
            <ProductDialog
              isOpen={true}
              onClose={() => setEditDialogOpen(false)}
              action="edit"
              product={product as any}
              categories={categories as any}
              brands={brands as any}
            />
          )}

          {confirmDelete && (
            <ConfirmationDialog
              isOpen={confirmDelete}
              onClose={() => setConfirmDelete(false)}
              onConfirm={handleDelete}
              title="Delete Product"
              description={`Are you sure you want to permanently delete "${product.name}"? This action cannot be reversed.`}
              confirmText="Delete Product"
              cancelText="Cancel"
              variant="danger"
            />
          )}

        </div>
      </div>
    </AppLayout>
  )
}

export default Show