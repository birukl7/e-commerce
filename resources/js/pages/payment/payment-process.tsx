"use client"

import type React from "react"

import { Head, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Building2, Wallet, Shield, Loader2 } from "lucide-react"
import { CartProvider, useCart } from "@/contexts/cart-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { Link } from "@inertiajs/react"

interface PaymentProcessProps {
  order_id: string
  total_amount: number
  currency: string
  customer_email?: string
  customer_name?: string
  customer_phone?: string
}

function PaymentProcessContent({
  order_id,
  total_amount,
  currency = "ETB",
  customer_email = "",
  customer_name = "",
  customer_phone = "",
}: PaymentProcessProps) {
  const { items, getTotalPrice, getTotalItems } = useCart()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("telebirr")

  const { data, setData, post, processing, errors, reset } = useForm({
    payment_method: "telebirr",
    customer_name: customer_name,
    customer_email: customer_email,
    customer_phone: customer_phone,
    order_id: order_id,
    amount: total_amount,
    currency: currency,
  })

  useEffect(() => {
    setData("payment_method", selectedPaymentMethod)
  }, [selectedPaymentMethod])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!data.customer_name || !data.customer_email || !data.customer_phone) {
      return
    }

    post(route("payment.process"), {
      onSuccess: (response) => {
        // Redirect to Chapa payment page
      },
      onError: (errors) => {
        console.error("Payment processing error:", errors)
      },
    })
  }

  const paymentMethods = [
    {
      id: "telebirr",
      name: "Telebirr",
      description: "Pay with Telebirr mobile wallet",
      icon: <Wallet className="h-6 w-6" />,
      popular: true,
    },
    {
      id: "cbe",
      name: "Commercial Bank of Ethiopia",
      description: "Pay with CBE online banking",
      icon: <Building2 className="h-6 w-6" />,
      popular: false,
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with PayPal account",
      icon: <CreditCard className="h-6 w-6" />,
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={route("checkout")}>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Checkout
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Secure Payment
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method and complete your purchase securely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Payment Methods */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Payment Method</Label>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="relative">
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="text-gray-600">{method.icon}</div>
                              <div className="flex-1">
                                <Label
                                  htmlFor={method.id}
                                  className="font-medium cursor-pointer flex items-center gap-2"
                                >
                                  {method.name}
                                  {method.popular && (
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                      Popular
                                    </span>
                                  )}
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Customer Information</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer_name">Full Name *</Label>
                        <Input
                          id="customer_name"
                          type="text"
                          value={data.customer_name}
                          onChange={(e) => setData("customer_name", e.target.value)}
                          placeholder="Enter your full name"
                          className={errors.customer_name ? "border-red-500" : ""}
                          required
                        />
                        {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="customer_phone">Phone Number *</Label>
                        <Input
                          id="customer_phone"
                          type="tel"
                          value={data.customer_phone}
                          onChange={(e) => setData("customer_phone", e.target.value)}
                          placeholder="+251 9XX XXX XXX"
                          className={errors.customer_phone ? "border-red-500" : ""}
                          required
                        />
                        {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customer_email">Email Address *</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        value={data.customer_email}
                        onChange={(e) => setData("customer_email", e.target.value)}
                        placeholder="your.email@example.com"
                        className={errors.customer_email ? "border-red-500" : ""}
                        required
                      />
                      {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full py-3 text-lg" disabled={processing}>
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Pay {formatPrice(total_amount)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Secure Payment Processing</h4>
                    <p className="text-blue-800 text-sm">
                      Your payment information is encrypted and processed securely through Chapa. We never store your
                      payment details on our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image || "/placeholder.svg?height=50&width=50&query=product"}
                        alt={item.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}

                  {items.length > 3 && (
                    <p className="text-gray-600 text-sm text-center py-2">+{items.length - 3} more items</p>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total_amount)}</span>
                  </div>
                </div>

                {/* Order ID */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">Order ID</p>
                  <p className="font-mono text-sm">{order_id}</p>
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

export default function PaymentProcess(props: PaymentProcessProps) {
  return (
    <CartProvider>
      <Head title="Payment Processing - ShopHub" />
      <PaymentProcessContent {...props} />
    </CartProvider>
  )
}
