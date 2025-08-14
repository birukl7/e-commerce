"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { adminNavItems } from "@/pages/admin/dashboard"
import type { BreadcrumbItem } from "@/types"
import { Head, router, useForm } from "@inertiajs/react"
import { ArrowLeft, Calendar, CreditCard, Mail, Package, Phone, Save, Truck } from "lucide-react"
import { useState } from "react"

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
}

export default function AdminOrderShow({ order, orderSummary }: AdminOrderShowProps) {
  const [isEditing, setIsEditing] = useState(false)

  const { data, setData, put, processing, errors } = useForm({
    status: order.status,
    payment_status: order.payment_status,
    notes: order.notes || "",
  })

  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Admin Dashboard", href: "/admin-dashboard" },
    { title: "Orders", href: "/admin/orders" },
    { title: `Order #${order.order_number}`, href: `/admin/orders/${order.id}` },
  ]

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/admin/orders/${order.id}`, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  const getProductImage = (product: Product) => {
    const primaryImage = product.images?.find((img) => img.is_primary)
    if (primaryImage) {
      return `/storage/${primaryImage.image_path}`
    }
    return "/images/placeholder-product.png"
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title={`Order #${order.order_number}`} />
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 font-sans">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.visit("/admin/orders")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Order #{order.order_number}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({orderSummary.items_count} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={getProductImage(item.product) || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm">
                            Quantity: <span className="font-medium">{item.quantity}</span>
                          </span>
                          <span className="text-sm">
                            Price: <span className="font-medium">{formatCurrency(item.price)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{order.user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{order.user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {order.user.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{order.user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{order.payment_method}</p>
                    </div>
                    {order.payment_id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Payment ID</p>
                        <p className="font-medium font-mono text-xs">{order.payment_id}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{order.currency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {order.shipped_at && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Shipped</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.shipped_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Order Delivered</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.delivered_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(orderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatCurrency(orderSummary.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{formatCurrency(orderSummary.shipping_amount)}</span>
                </div>
                {orderSummary.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(orderSummary.discount_amount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(orderSummary.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Update Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Order</CardTitle>
              </CardHeader>
              <CardContent>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Current Status</Label>
                      <Badge className={`${getStatusColor(order.status)} mt-2`}>{order.status}</Badge>
                    </div>
                    <div>
                      <Label>Payment Status</Label>
                      <Badge className={`${getPaymentStatusColor(order.payment_status)} mt-2`}>
                        {order.payment_status}
                      </Badge>
                    </div>
                    {order.notes && (
                      <div>
                        <Label>Notes</Label>
                        <p className="mt-1 text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                    <Button onClick={() => setIsEditing(true)} className="w-full">
                      Edit Order
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="status">Order Status</Label>
                      <Select value={data.status} onValueChange={(value) => setData("status", value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
                    </div>

                    <div>
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select
                        value={data.payment_status}
                        onValueChange={(value) => setData("payment_status", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.payment_status && <p className="text-sm text-red-600 mt-1">{errors.payment_status}</p>}
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        placeholder="Add notes about this order..."
                        rows={3}
                      />
                      {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={processing} className="flex-1 gap-2">
                        <Save className="h-4 w-4" />
                        {processing ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Shipping Method</p>
                    <p className="font-medium capitalize">{order.shipping_method}</p>
                  </div>
                  {order.shipped_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Shipped Date</p>
                      <p className="font-medium">{new Date(order.shipped_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Delivered Date</p>
                      <p className="font-medium">{new Date(order.delivered_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
