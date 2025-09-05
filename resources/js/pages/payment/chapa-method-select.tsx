"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MainLayout from "@/layouts/app/main-layout"
import { Head, Link, useForm } from "@inertiajs/react"
import { CreditCard, Smartphone, AlertCircle, ShoppingCart, User, Mail, Phone } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface ChapaMethodSelectProps {
  order_id: string
  amount: number
  currency: string
  cart_items: CartItem[]
  auth: {
    user: {
      name: string
      email: string
      phone?: string
    }
  }
}

type PaymentMethod = "telebirr" | "cbe"

type FormData = {
  payment_method: PaymentMethod
  customer_phone: string
  customer_name: string
  customer_email: string
  order_id: string
  amount: number
  currency: string
  cart_items: string // JSON string
} & Record<string, any> // ensures Inertia compatibility

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "ETB" ? "USD" : currency,
  })
    .format(price)
    .replace("$", currency + " ")
}

// Phone number validation for Ethiopian numbers
const validateEthiopianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-$]/g, "")

  // Ethiopian phone patterns:
  // +251XXXXXXXXX (international format)
  // 09XXXXXXXX (national format)
  // 07XXXXXXXX (national format)
  const ethiopianPatterns = [
    /^\+251[79]\d{8}$/, // International format
    /^0[79]\d{8}$/, // National format
  ]

  return ethiopianPatterns.some((pattern) => pattern.test(cleanPhone))
}

// Email validation
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

export default function ChapaMethodSelect({ order_id, amount, currency, cart_items, auth }: ChapaMethodSelectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>("")

  const { data, setData, processing, errors, clearErrors } = useForm<FormData>({
    payment_method: "telebirr",
    customer_phone: auth?.user?.phone || "",
    customer_name: auth?.user?.name || "",
    customer_email: auth?.user?.email || "",
    order_id: order_id || "",
    amount: amount || 0,
    currency: currency || "ETB",
    cart_items: JSON.stringify(cart_items || []),
  })

  useEffect(() => {
    clearErrors()
    setValidationErrors({})
    setSubmitError("")
  }, [data.payment_method, clearErrors])

  // Real-time validation
  const validateField = useCallback(
    (field: string, value: string) => {
      const newErrors = { ...validationErrors }

      switch (field) {
        case "customer_phone":
          if (!value.trim()) {
            newErrors.customer_phone = "Phone number is required"
          } else if (!validateEthiopianPhone(value)) {
            newErrors.customer_phone = "Please enter a valid Ethiopian phone number (e.g., +251911223344 or 0911223344)"
          } else {
            delete newErrors.customer_phone
          }
          break
        case "customer_email":
          if (!value.trim()) {
            newErrors.customer_email = "Email address is required"
          } else if (!validateEmail(value)) {
            newErrors.customer_email = "Please enter a valid email address"
          } else {
            delete newErrors.customer_email
          }
          break
        case "customer_name":
          if (!value.trim()) {
            newErrors.customer_name = "Full name is required"
          } else if (value.trim().length < 2) {
            newErrors.customer_name = "Name must be at least 2 characters long"
          } else {
            delete newErrors.customer_name
          }
          break
      }

      setValidationErrors(newErrors)
    },
    [validationErrors],
  )

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setData(field, value)
      validateField(field, value)
    },
    [setData, validateField],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (isLoading || processing) return

      // Final validation
      const finalErrors: Record<string, string> = {}

      if (!data.customer_phone.trim()) {
        finalErrors.customer_phone = "Phone number is required"
      } else if (!validateEthiopianPhone(data.customer_phone)) {
        finalErrors.customer_phone = "Please enter a valid Ethiopian phone number"
      }

      if (!data.customer_name.trim()) {
        finalErrors.customer_name = "Full name is required"
      } else if (data.customer_name.trim().length < 2) {
        finalErrors.customer_name = "Name must be at least 2 characters long"
      }

      if (!data.customer_email.trim()) {
        finalErrors.customer_email = "Email address is required"
      } else if (!validateEmail(data.customer_email)) {
        finalErrors.customer_email = "Please enter a valid email address"
      }

      if (Object.keys(finalErrors).length > 0) {
        setValidationErrors(finalErrors)
        return
      }

      setIsLoading(true)
      setSubmitError("")

      try {
        const formData = {
          payment_method: data.payment_method,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          order_id: data.order_id,
          amount: data.amount,
          currency: data.currency,
          cart_items: data.cart_items,
        }

        const response = await fetch(route("payment.process"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const result = await response.json()

        if (result.success && result.redirect_url) {
          // Redirect to Chapa external URL
          window.location.href = result.redirect_url
        } else {
          if (result.errors) {
            setValidationErrors(result.errors)
          }
          setSubmitError(result.message || "Payment initialization failed. Please try again.")
        }
      } catch (error) {
        console.error("Payment submission error:", error)
        setSubmitError(`Payment error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`)
      } finally {
        setIsLoading(false)
      }
    },
    [data, isLoading, processing],
  )

  const isMissingOrderInfo = !order_id || !amount || amount <= 0
  const hasValidationErrors = Object.keys(validationErrors).length > 0
  const canSubmit = !isLoading && !processing && !isMissingOrderInfo && !hasValidationErrors

  return (
    <MainLayout title="Select Payment Method">
      <Head title="Select Payment Method" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-lg bg-white p-6 shadow-md">
            {/* Header */}
            <div className="mb-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                Complete Your Payment
              </h1>
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium font-mono text-sm">{order_id}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">{formatPrice(amount, currency)}</span>
                </div>
                {cart_items && cart_items.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <span className="text-gray-600 text-sm">
                      {cart_items.length} item{cart_items.length > 1 ? "s" : ""} in cart
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isMissingOrderInfo && (
              <Alert className="mb-6 border-yellow-400 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Missing order information. Please return to checkout and try again.
                </AlertDescription>
              </Alert>
            )}

            {submitError && (
              <Alert className="mb-6 border-red-400 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="customer_name">Full Name *</Label>
                    <Input
                      id="customer_name"
                      type="text"
                      value={data.customer_name}
                      onChange={(e) => handleInputChange("customer_name", e.target.value)}
                      required
                      className={`mt-1 ${validationErrors.customer_name || errors.customer_name ? "border-red-500" : ""}`}
                      placeholder="Enter your full name"
                    />
                    {(validationErrors.customer_name || errors.customer_name) && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.customer_name || errors.customer_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customer_email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={data.customer_email}
                      onChange={(e) => handleInputChange("customer_email", e.target.value)}
                      required
                      className={`mt-1 ${validationErrors.customer_email || errors.customer_email ? "border-red-500" : ""}`}
                      placeholder="your@email.com"
                    />
                    {(validationErrors.customer_email || errors.customer_email) && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.customer_email || errors.customer_email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customer_phone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    placeholder="e.g., +251911223344 or 0911223344"
                    value={data.customer_phone}
                    onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                    required
                    className={`mt-1 ${validationErrors.customer_phone || errors.customer_phone ? "border-red-500" : ""}`}
                  />
                  {(validationErrors.customer_phone || errors.customer_phone) && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.customer_phone || errors.customer_phone}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Ethiopian mobile numbers starting with 07 or 09</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Choose Payment Method</h2>
                <RadioGroup
                  value={data.payment_method}
                  onValueChange={(value: PaymentMethod) => setData("payment_method", value)}
                  className="space-y-3"
                >
                  <div
                    className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                      data.payment_method === "telebirr" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem value="telebirr" id="telebirr" />
                    <div className="flex items-center gap-3 flex-1">
                      <Smartphone className="h-6 w-6 text-orange-500" />
                      <div>
                        <Label htmlFor="telebirr" className="cursor-pointer text-base font-medium">
                          Telebirr
                        </Label>
                        <p className="text-sm text-gray-500">Pay with your Telebirr wallet</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-colors hover:bg-blue-50 cursor-pointer ${
                      data.payment_method === "cbe" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem value="cbe" id="cbe" className="text-blue-600" />
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      <div>
                        <Label htmlFor="cbe" className="cursor-pointer text-base font-medium text-blue-800">
                          CBE Birr
                        </Label>
                        <p className="text-sm text-blue-600">Pay with Commercial Bank of Ethiopia</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-6">
                <Link
                  href={route("checkout")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  ← Back to Checkout
                </Link>
                <Button type="submit" disabled={!canSubmit} className="min-w-[140px]">
                  {isLoading || processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Continue to Payment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
