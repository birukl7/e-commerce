import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { adminNavItems } from "@/constants/adminNavItems"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import {
  Calendar,
  Download,
  Eye,
  Filter,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  X,
  ArrowUpRight,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  Users
} from "lucide-react"
import { useEffect, useState } from "react"

interface User {
  id: number
  name: string
  email: string
}

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
  }
  quantity: number
  price: number
  total: number
}

interface Order {
  id: number
  order_number: string
  user: User
  status: "processing" | "shipped" | "delivered" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_method: string
  currency: string
  total_amount: number
  items: OrderItem[]
  created_at: string
  shipped_at?: string
  delivered_at?: string
}

interface OrderStats {
  total_orders: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  total_revenue: number
  today_orders: number
}

interface Filters {
  status?: string
  payment_status?: string
  search?: string
  date_from?: string
  date_to?: string
}

interface AdminOrdersIndexProps {
  orders: {
    data: Order[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: Array<{
      url?: string
      label: string
      active: boolean
    }>
  }
  stats: OrderStats
  filters: Filters
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Admin Dashboard", href: "/admin-dashboard" },
  { title: "Orders Management", href: "/admin/orders" },
]

export default function AdminOrdersIndex({ orders, stats, filters }: AdminOrdersIndexProps) {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [statusFilter, setStatusFilter] = useState(filters.status || "all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters.payment_status || "all")
  const [dateFrom, setDateFrom] = useState(filters.date_from || "")
  const [dateTo, setDateTo] = useState(filters.date_to || "")
  const [primaryColor, setPrimaryColor] = useState<string>('#1E5338')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('serdo_dashboard_primary_color')
      if (saved) setPrimaryColor(saved)
    } catch {
      // Ignore
    }

    const handleThemeChange = (e: any) => {
      const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
      if (color) setPrimaryColor(color);
    }
    window.addEventListener('serdo:theme-color-changed', handleThemeChange)
    return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange)
  }, [])

  const formatCurrency = (amount: number, currency = "ETB") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "ETB" ? "USD" : currency,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("$", currency + " ")
  }

  const handleSearch = () => {
    router.get(
      "/admin/orders",
      {
        search: searchTerm,
        status: statusFilter,
        payment_status: paymentStatusFilter,
        date_from: dateFrom,
        date_to: dateTo,
      },
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentStatusFilter("all")
    setDateFrom("")
    setDateTo("")
    router.get(
      "/admin/orders",
      {},
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const exportOrders = () => {
    const params = new URLSearchParams({
      status: statusFilter,
      payment_status: paymentStatusFilter,
      date_from: dateFrom,
      date_to: dateTo,
    })
    window.location.href = `/admin/orders/export?${params.toString()}`
  }

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const getCustomerAvatarColor = (name: string) => {
    const list = [
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-rose-100 text-rose-800 border-rose-200',
    ]
    return list[(name || 'U').charCodeAt(0) % list.length]
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Orders Management | Donezo Style" />

      <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto space-y-6">

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  Customer Orders
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <Receipt className="w-3 h-3 text-neutral-500" />
                  {orders.total} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
                Review, process, dispatch, and track all fulfilled store checkouts.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={exportOrders}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold shadow-xs hover:bg-neutral-50 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-neutral-500" />
                <span>Export CSV</span>
              </button>

              <Link
                href="/admin/sales"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Sales Overview</span>
              </Link>
            </div>
          </div>

          {/* Metric Strip (Donezo 4-Card Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Primary Accent Card (Total Orders Revenue) */}
            <div
              className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-white/80">Total Orders Revenue</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <ArrowUpRight className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {formatCurrency(stats.total_revenue || 0)}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-medium text-white backdrop-blur-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>Cumulative order volume</span>
                </div>
              </div>
            </div>

            {/* Card 2: White Card (Total & Today's Orders) */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Total Orders</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {stats.total_orders}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>{stats.today_orders} orders recorded today</span>
                </div>
              </div>
            </div>

            {/* Card 3: White Card (Pending Fulfillment) */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Processing & In Transit</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  stats.pending_orders > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'border border-neutral-200 text-neutral-400'
                }`}>
                  {stats.pending_orders}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {stats.pending_orders}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                  <Clock className="w-3 h-3" />
                  <span>Requires dispatch & courier updates</span>
                </div>
              </div>
            </div>

            {/* Card 4: White Card (Completed Orders) */}
            <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[160px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-neutral-400">Fulfilled & Delivered</span>
                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {stats.completed_orders}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{stats.cancelled_orders} cancelled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar Card */}
          <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search by order #, customer name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 rounded-full border-neutral-200/80 text-xs py-2 bg-neutral-50/60 focus:bg-white"
                />
              </div>

              {/* Status Select */}
              <div className="w-full sm:w-44">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-full border-neutral-200/80 text-xs py-2 bg-white">
                    <SelectValue placeholder="Fulfillment Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All Fulfillments</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Select */}
              <div className="w-full sm:w-44">
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="rounded-full border-neutral-200/80 text-xs py-2 bg-white">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="rounded-full border-neutral-200/80 text-xs py-2 w-36 bg-white"
                  />
                </div>
                <div className="relative">
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="rounded-full border-neutral-200/80 text-xs py-2 w-36 bg-white"
                  />
                </div>
              </div>

              {/* Apply / Clear Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-5 py-2 text-white text-xs font-semibold rounded-full shadow-xs transition-colors hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="p-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700 transition-colors"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modern Orders Table */}
          <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={orders.data.length > 0 && selectedOrders.length === orders.data.length}
                        onChange={() => {
                          if (selectedOrders.length === orders.data.length) {
                            setSelectedOrders([])
                          } else {
                            setSelectedOrders(orders.data.map(o => o.id))
                          }
                        }}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                      />
                    </th>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Fulfillment Status</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.data.map((order) => {
                    const avatarClass = getCustomerAvatarColor(order.user?.name || '')
                    const isDelivered = order.status === 'delivered'
                    const isShipped = order.status === 'shipped'
                    const isProcessing = order.status === 'processing'
                    const isCancelled = order.status === 'cancelled'
                    const isPaid = order.payment_status === 'paid'
                    const isPending = order.payment_status === 'pending'
                    const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-neutral-50/70 transition-colors group"
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                          />
                        </td>

                        {/* Order Number */}
                        <td className="py-4 px-4">
                          <Link
                            href={`/admin/orders/${order.order_number || order.id}`}
                            className="font-mono text-xs font-bold hover:underline"
                            style={{ color: primaryColor }}
                          >
                            #{order.order_number}
                          </Link>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full ${avatarClass} border flex items-center justify-center font-bold text-[10px] shrink-0`}>
                              {(order.user?.name || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-800 truncate">
                                {order.user?.name || 'Customer'}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                {order.user?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-neutral-900 text-xs">
                            {formatCurrency(order.total_amount, order.currency)}
                          </span>
                        </td>

                        {/* Fulfillment Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : isShipped
                                ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                : isProcessing
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}
                          >
                            {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                            {isShipped && <TrendingUp className="w-3 h-3" />}
                            {isProcessing && <Clock className="w-3 h-3" />}
                            {isCancelled && <XCircle className="w-3 h-3" />}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : isPending
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span className="capitalize">{order.payment_status}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-neutral-400 text-[11px]">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/admin/orders/${order.order_number || order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-[11px] font-semibold shadow-xs transition-all active:scale-95"
                          >
                            <Eye className="w-3 h-3 text-neutral-500" />
                            <span>Details</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}

                  {orders.data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-neutral-400">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold text-neutral-700">No orders found</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Try adjusting your filters or date range.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders.links && orders.links.length > 3 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
                <span className="text-xs text-neutral-400 font-medium">
                  Showing <strong className="text-neutral-700">{orders.data.length}</strong> of{' '}
                  <strong className="text-neutral-700">{orders.total}</strong> orders
                </span>

                <div className="flex items-center gap-1.5">
                  {orders.links.map((link, idx) => {
                    const label = link.label
                      .replace('&laquo; Previous', 'Prev')
                      .replace('Next &raquo;', 'Next')

                    return (
                      <button
                        key={idx}
                        onClick={() => link.url && router.visit(link.url)}
                        disabled={!link.url}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          link.active
                            ? 'text-white shadow-xs'
                            : link.url
                            ? 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                            : 'bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200/50'
                        }`}
                        style={link.active ? { backgroundColor: primaryColor } : {}}
                        dangerouslySetInnerHTML={{ __html: label }}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
