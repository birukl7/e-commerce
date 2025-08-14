"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { adminNavItems } from "@/pages/admin/dashboard"
import type { BreadcrumbItem } from "@/types"
import { Head, Link, router } from "@inertiajs/react"
import {
  Calendar,
  Download,
  DollarSign,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
  X,
} from "lucide-react"
import { useState } from "react"

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
  { title: "Orders", href: "/admin/orders" },
]

export default function AdminOrdersIndex({ orders, stats, filters }: AdminOrdersIndexProps) {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [statusFilter, setStatusFilter] = useState(filters.status || "all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters.payment_status || "all")
  const [dateFrom, setDateFrom] = useState(filters.date_from || "")
  const [dateTo, setDateTo] = useState(filters.date_to || "")

  const formatCurrency = (amount: number, currency = "ETB") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "ETB" ? "USD" : currency,
      currencyDisplay: currency === "ETB" ? "code" : "symbol",
    })
      .format(amount)
      .replace("USD", "ETB")
  }

  const getStatusColor = (status: string) => {
    const colors = {
      processing: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      shipped: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      delivered: "bg-green-100 text-green-800 hover:bg-green-200",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-800 hover:bg-green-200",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      failed: "bg-red-100 text-red-800 hover:bg-red-200",
      refunded: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
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

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.data.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.data.map((order) => order.id))
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Orders Management" />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans">
        {/* Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders Management</h1>
            <p className="text-muted-foreground">Manage and track all customer orders</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportOrders} variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pending_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.today_orders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Orders List</CardTitle>
              <div className="text-sm text-muted-foreground">
                Showing {orders.data.length} of {orders.total} orders
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {orders.data.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded"
                        />
                        <div>
                          <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">
                            #{order.order_number}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {order.user.name} • {order.user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.total_amount, order.currency)}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {orders.current_page} of {orders.last_page}
              </div>
              <div className="flex items-center gap-2">
                {orders.links.map((link, index) => (
                  <Button
                    key={index}
                    variant={link.active ? "default" : "outline"}
                    size="sm"
                    disabled={!link.url}
                    onClick={() => link.url && router.visit(link.url)}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
