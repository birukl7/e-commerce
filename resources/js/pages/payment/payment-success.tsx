"use client"

import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, ArrowRight, Package } from "lucide-react"
import { Link } from "@inertiajs/react"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface PaymentSuccessProps {
  order_id: string
  transaction_id: string
  amount: number
  currency: string
  payment_method: string
  customer_name: string
  customer_email: string
  order_items?: Array<{
    id: number
    name: string
    quantity: number
    price: number
    image?: string
  }>
}

export default function PaymentSuccess({
  order_id,
  transaction_id,
  amount,
  currency = "ETB",
  payment_method,
  customer_name,
  customer_email,
  order_items = [],
}: PaymentSuccessProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  const formatDate = (date: Date = new Date()) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Payment Successful - ShopHub" />
      <Header />

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 text-lg">Thank you for your purchase, {customer_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <CardDescription>Your order has been confirmed and is being processed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-mono font-semibold">{order_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transaction ID</p>
                    <p className="font-mono font-semibold">{transaction_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-semibold capitalize">{payment_method}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-semibold">{formatDate()}</p>
                  </div>
                </div>

                {/* Order Items */}
                {order_items.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Items Ordered</h4>
                    <div className="space-y-3">
                      {order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image || "/placeholder.svg?height=50&width=50&query=product"}
                            alt={item.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Order Confirmation</h4>
                      <p className="text-gray-600 text-sm">We've sent a confirmation email to {customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Processing</h4>
                      <p className="text-gray-600 text-sm">Your order is being prepared for shipment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-600">Shipping</h4>
                      <p className="text-gray-600 text-sm">You'll receive tracking information once shipped</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Paid</span>
                    <span className="font-bold text-lg text-green-600">{formatPrice(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Payment Method</span>
                    <span className="capitalize">{payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Status</span>
                    <span className="text-green-600 font-semibold">Completed</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <Button className="w-full" asChild>
                    <Link href={route("user.orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      View Order Details
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>

                  <Button variant="ghost" className="w-full" asChild>
                    <Link href={route("home")}>
                      Continue Shopping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
