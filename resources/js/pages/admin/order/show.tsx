import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, useForm } from "@inertiajs/react"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Package,
  Phone,
  Save,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Receipt,
  User,
  Edit3,
  X,
  Palette,
  Check
} from "lucide-react"
import { useEffect, useState } from "react"

interface Product {
  id: number
  name: string
  price: number
  sku: string
  images?: Array<{
    id: number
    image_path: string
    is_primary: boolean
  }>
}

interface OrderItem {
  id: number
  product: Product
  product_snapshot: any
  quantity: number
  price: number
  total: number
}

interface Order {
  id: number
  order_number: string
  user: {
    id: number
    name: string
    email: string
    phone?: string
  }
  status: "processing" | "shipped" | "delivered" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_method: string
  payment_id?: string
  currency: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  shipping_method: string
  notes?: string
  items: OrderItem[]
  created_at: string
  shipped_at?: string
  delivered_at?: string
}

interface OrderSummary {
  items_count: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
}

interface AdminOrderShowProps {
  order: Order
  orderSummary: OrderSummary
  taxBreakdown?: Array<{
    id: number
    name: string
    type: 'percentage' | 'fixed'
    rate: number
    amount: number
    formatted_rate: string
    description?: string
  }>
}

const COLOR_PRESETS = [
  { name: 'Donezo Forest', hex: '#1E5338' },
  { name: 'Pine Emerald', hex: '#0D9488' },
  { name: 'Royal Indigo', hex: '#4338CA' },
  { name: 'Ocean Cyan', hex: '#0284C7' },
  { name: 'Sunset Amber', hex: '#D97706' },
  { name: 'Crimson Rose', hex: '#BE123C' },
  { name: 'Obsidian Noir', hex: '#18181B' },
]

export default function AdminOrderShow({ order, orderSummary, taxBreakdown = [] }: AdminOrderShowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [primaryColor, setPrimaryColor] = useState<string>('#1E5338')
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)

  // Load saved theme color from localStorage
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem('serdo_dashboard_primary_color')
      if (savedColor) {
        setPrimaryColor(savedColor)
      }
    } catch (e) {
      // Ignore
    }

    const handleThemeChange = (e: any) => {
      const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
      if (color) setPrimaryColor(color);
    };
    window.addEventListener('serdo:theme-color-changed', handleThemeChange);
    return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
  }, [])

  const handleColorChange = (hex: string) => {
    setPrimaryColor(hex)
    try {
      localStorage.setItem('serdo_dashboard_primary_color', hex)
    } catch (e) {
      // Ignore
    }
  }

  const { data, setData, put, processing, errors } = useForm({
    status: order.status,
    payment_status: order.payment_status,
    notes: order.notes || "",
  })

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin Dashboard", href: "/admin-dashboard" },
    { title: "Orders", href: "/admin/orders" },
    { title: `Order #${order.order_number}`, href: `/admin/orders/${order.order_number || order.id}` },
  ]

  const formatCurrency = (amount: number, currency = "ETB") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "ETB" ? "USD" : currency,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("$", currency + " ")
  }

  const formatDateTimeLocal = (value: string | Date) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(new Date(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/admin/orders/${order.id}`, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  const getProductImage = (product: Product) => {
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
    if (primaryImage && primaryImage.image_path) {
      return primaryImage.image_path
    }
    return "/placeholder.svg"
  }

  // Customer avatar colors
  const avatarBg = 'bg-emerald-100 text-emerald-800 border-emerald-200'

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={[]} footerNavItems={[]}>
      <Head title={`Order #${order.order_number} | Admin Details`} />

      <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto space-y-6">

          {/* Top Navigation & Header Row */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/orders"
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 shadow-xs transition-colors active:scale-95"
                title="Back to Orders"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
                    Order #{order.order_number}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    <Receipt className="w-3 h-3 text-neutral-500" />
                    Details
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Placed on {formatDateTimeLocal(order.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {/* Status Badges */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                  order.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : order.status === 'shipped'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                    : order.status === 'processing'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}
              >
                {order.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {order.status === 'shipped' && <TrendingUp className="w-3.5 h-3.5" />}
                {order.status === 'processing' && <Clock className="w-3.5 h-3.5" />}
                {order.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
                <span>{order.status}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${
                  order.payment_status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : order.payment_status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{order.payment_status}</span>
              </span>
            </div>
          </header>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Primary Accent Total Amount */}
            <div
              className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-white/80">Total Order Amount</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {formatCurrency(order.total_amount)}
                </div>
                <p className="text-[11px] text-white/70">
                  {orderSummary.items_count} {orderSummary.items_count === 1 ? 'item' : 'items'} purchased
                </p>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Payment Gateway</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-extrabold tracking-tight text-neutral-900 capitalize">
                  {order.payment_method.replace('_', ' ')}
                </div>
                <p className="text-[11px] font-mono text-neutral-400 truncate">
                  Ref: {order.payment_id || 'Direct / Offline'}
                </p>
              </div>
            </div>

            {/* Card 3: Customer */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Customer</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-base font-extrabold tracking-tight text-neutral-900 truncate">
                  {order.user?.name || 'Customer'}
                </div>
                <p className="text-[11px] text-neutral-400 truncate">
                  {order.user?.email}
                </p>
              </div>
            </div>

            {/* Card 4: Shipping Method */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Fulfillment Method</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-base font-extrabold tracking-tight text-neutral-900 capitalize truncate">
                  {order.shipping_method || 'Standard Courier'}
                </div>
                <p className="text-[11px] text-neutral-400">
                  {order.delivered_at ? 'Delivered' : order.shipped_at ? 'In Transit' : 'Pending dispatch'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid: Content + Sidebar */}
          <div className="grid gap-6 lg:grid-cols-12">

            {/* Left 8 Columns: Products & Timeline */}
            <div className="lg:col-span-8 space-y-6">

              {/* Order Items Card */}
              <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-neutral-900">Purchased Items</h2>
                      <p className="text-[11px] text-neutral-400">{orderSummary.items_count} items in this order</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 group">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={getProductImage(item.product) || "/placeholder.svg"}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-neutral-900 truncate">
                          {item.product?.name || item.product_snapshot?.name || "Product"}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                          {item.product?.sku && <span>SKU: {item.product.sku}</span>}
                          <span>Qty: <strong className="text-neutral-700">{item.quantity}</strong></span>
                          <span>Unit: <strong className="text-neutral-700">{formatCurrency(item.price)}</strong></span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-neutral-900">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Customer Details</h3>
                      <p className="text-[11px] text-neutral-400">Buyer account profile</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className={`w-8 h-8 rounded-full ${avatarBg} border flex items-center justify-center font-bold text-xs shrink-0`}>
                        {(order.user?.name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{order.user?.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{order.user?.email}</p>
                      </div>
                    </div>

                    {order.user?.phone && (
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-neutral-50/70 text-xs text-neutral-700">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-semibold">{order.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fulfillment / Shipping info */}
                <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Fulfillment Status</h3>
                      <p className="text-[11px] text-neutral-400">Carrier dispatch tracking</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-400">Shipping Method</span>
                      <span className="font-semibold text-neutral-800 capitalize">{order.shipping_method || 'Standard Courier'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-400">Dispatch Status</span>
                      <span className="font-semibold text-neutral-800 capitalize">{order.status}</span>
                    </div>
                    {order.shipped_at && (
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-400">Shipped At</span>
                        <span className="font-semibold text-neutral-800">{formatDateTimeLocal(order.shipped_at)}</span>
                      </div>
                    )}
                    {order.delivered_at && (
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-400">Delivered At</span>
                        <span className="font-semibold text-neutral-800">{formatDateTimeLocal(order.delivered_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Timeline Card */}
              <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Order Progress Timeline</h3>
                    <p className="text-[11px] text-neutral-400">Audit track of fulfillment events</p>
                  </div>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {/* Step 1: Placed */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Order Placed & Recorded</p>
                      <p className="text-[11px] text-neutral-400">{formatDateTimeLocal(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Step 2: Payment */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs ${
                      order.payment_status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {order.payment_status === 'paid' ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">
                        Payment Status: <span className="capitalize">{order.payment_status}</span>
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Method: {order.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs ${
                      order.shipped_at || order.status === 'shipped' || order.status === 'delivered'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {order.shipped_at || order.status === 'shipped' || order.status === 'delivered' ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <Truck className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Dispatch / In Transit</p>
                      <p className="text-[11px] text-neutral-400">
                        {order.shipped_at ? formatDateTimeLocal(order.shipped_at) : 'Awaiting courier dispatch'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs ${
                      order.delivered_at || order.status === 'delivered'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {order.delivered_at || order.status === 'delivered' ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <Package className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Delivered to Customer</p>
                      <p className="text-[11px] text-neutral-400">
                        {order.delivered_at ? formatDateTimeLocal(order.delivered_at) : 'Package pending final delivery'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Columns: Financial Breakdown & Status Controls */}
            <div className="lg:col-span-4 space-y-6">

              {/* Order Financial Breakdown */}
              <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Order Summary</h3>
                    <p className="text-[11px] text-neutral-400">Financial computation breakdown</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(orderSummary.subtotal)}</span>
                  </div>

                  {taxBreakdown && taxBreakdown.length > 0 && (
                    <div className="py-2 space-y-1.5 border-y border-dashed border-neutral-100">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Taxes & Fees</span>
                      {taxBreakdown.map((tax) => (
                        <div key={tax.id} className="flex justify-between text-neutral-500 text-[11px]">
                          <span>{tax.name} ({tax.formatted_rate})</span>
                          <span className="font-semibold text-neutral-800">{formatCurrency(tax.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-500">
                    <span>Tax</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(orderSummary.tax_amount)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-500">
                    <span>Shipping</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(orderSummary.shipping_amount)}</span>
                  </div>

                  {orderSummary.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatCurrency(orderSummary.discount_amount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-900">Total Charged</span>
                      <p className="text-[10px] text-neutral-400">Inclusive of all applied charges</p>
                    </div>
                    <span className="text-xl font-extrabold text-neutral-900">
                      {formatCurrency(orderSummary.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Card */}
              <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm font-bold text-neutral-900">Manage Status</span>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold px-3 py-1 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-neutral-400 block mb-1">Current Order Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold capitalize ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : order.status === 'shipped'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : order.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block mb-1">Payment Status</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold capitalize ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : order.payment_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>

                    {order.notes && (
                      <div>
                        <span className="text-neutral-400 block mb-1">Order Notes</span>
                        <div className="p-3 bg-neutral-50 rounded-xl text-neutral-700 text-xs leading-relaxed">
                          {order.notes}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full rounded-full text-white font-semibold text-xs py-2.5 mt-2"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Update Order Status
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="status" className="text-xs font-bold text-neutral-700">Order Status</Label>
                      <Select value={data.status} onValueChange={(value) => setData("status", value as any)}>
                        <SelectTrigger className="mt-1 rounded-xl border-neutral-200 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
                    </div>

                    <div>
                      <Label htmlFor="payment_status" className="text-xs font-bold text-neutral-700">Payment Status</Label>
                      <Select
                        value={data.payment_status}
                        onValueChange={(value) => setData("payment_status", value as any)}
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-neutral-200 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.payment_status && <p className="text-xs text-red-600 mt-1">{errors.payment_status}</p>}
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-xs font-bold text-neutral-700">Internal Order Notes</Label>
                      <Textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="Add notes about this order..."
                        rows={3}
                        className="mt-1 rounded-xl border-neutral-200 text-xs"
                      />
                      {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={processing}
                        className="flex-1 rounded-full text-white text-xs font-semibold gap-1.5"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Save className="h-3.5 w-3.5" />
                        {processing ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="rounded-full text-xs font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  )
}
