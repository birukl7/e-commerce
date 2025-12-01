"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MainLayout from "@/layouts/app/main-layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { CreditCard, Smartphone, AlertCircle, ShoppingCart, User, Mail, Phone, Wallet, Building2, CheckCircle2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface ChapaPaymentMethod {
  id: number
  name: string
  code: string
  description?: string
  logo?: string
}

interface ChapaMethodSelectProps {
  order_id: string
  amount: number
  currency: string
  cart_items: CartItem[]
  chapaPaymentMethods?: ChapaPaymentMethod[]
  auth: {
    user: {
      name: string
      email: string
      phone?: string
    }
  }
  // Advance payment props
  payment_type?: string
  product_request_id?: number
  product_name?: string
  description?: string
}

type PaymentMethod = string

type FormData = {
  payment_method: PaymentMethod
  phone_number: string
  name: string
  email: string
  order_id: string
  amount: number
  currency: string
  cart_items: string // JSON string
  payment_type?: string
  product_request_id?: number
  description?: string
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

export default function ChapaMethodSelect({ 
  order_id, 
  amount, 
  currency, 
  cart_items, 
  chapaPaymentMethods = [],
  auth, 
  payment_type, 
  product_request_id, 
  product_name, 
  description 
}: ChapaMethodSelectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>("")
  const page = usePage<{ auth?: { user?: { phone?: string } } }>()

  // Get phone number from multiple sources with priority
  const getPhoneNumber = () => {
    return auth?.user?.phone || page?.props?.auth?.user?.phone || ""
  }

  // Use methods from database (should always be provided from backend)
  const availableMethods: ChapaPaymentMethod[] = chapaPaymentMethods.length > 0 
    ? chapaPaymentMethods 
    : [] // No fallback - methods should be seeded in database

  // Get default payment method (first available, or empty string if none)
  const defaultMethod = availableMethods.length > 0 ? availableMethods[0].code : ""

  const { data, setData, processing, errors, clearErrors } = useForm<FormData>({
    payment_method: defaultMethod,
    phone_number: getPhoneNumber(),
    name: auth?.user?.name || "",
    email: auth?.user?.email || "",
    order_id: order_id || "",
    amount: amount || 0,
    currency: currency || "ETB",
    cart_items: JSON.stringify(cart_items || []),
    payment_type: payment_type || "regular", // Default to 'regular' if not provided
    product_request_id: product_request_id || undefined,
    description: description || "",
  })

  useEffect(() => {
    clearErrors()
    setValidationErrors({})
    setSubmitError("")
  }, [data.payment_method, clearErrors])

  // Ensure phone is prefilled when available from auth, even if props arrive slightly later
  useEffect(() => {
    const phoneFromAuth = auth?.user?.phone || page?.props?.auth?.user?.phone
    if (phoneFromAuth && (!data.phone_number || data.phone_number === "")) {
      setData("phone_number", phoneFromAuth)
    }
  }, [auth?.user?.phone, page?.props?.auth?.user?.phone, data.phone_number, setData])

  // Real-time validation
  const validateField = useCallback(
    (field: string, value: string) => {
      const newErrors = { ...validationErrors }

      switch (field) {
        case "phone_number":
          if (!value.trim()) {
            newErrors.phone_number = "Phone number is required"
          } else if (!validateEthiopianPhone(value)) {
            newErrors.phone_number = "Please enter a valid Ethiopian phone number (e.g., +251911223344 or 0911223344)"
          } else {
            delete newErrors.phone_number
          }
          break
        case "email":
          if (!value.trim()) {
            newErrors.email = "Email address is required"
          } else if (!validateEmail(value)) {
            newErrors.email = "Please enter a valid email address"
          } else {
            delete newErrors.email
          }
          break
        case "name":
          if (!value.trim()) {
            newErrors.name = "Full name is required"
          } else if (value.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters long"
          } else {
            delete newErrors.name
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

      if (!data.phone_number.trim()) {
        finalErrors.phone_number = "Phone number is required"
      } else if (!validateEthiopianPhone(data.phone_number)) {
        finalErrors.phone_number = "Please enter a valid Ethiopian phone number"
      }

      if (!data.name.trim()) {
        finalErrors.name = "Full name is required"
      } else if (data.name.trim().length < 2) {
        finalErrors.name = "Name must be at least 2 characters long"
      }

      if (!data.email.trim()) {
        finalErrors.email = "Email address is required"
      } else if (!validateEmail(data.email)) {
        finalErrors.email = "Please enter a valid email address"
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
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          order_id: data.order_id,
          amount: data.amount,
          currency: data.currency,
          cart_items: data.cart_items,
          payment_type: data.payment_type,
          product_request_id: data.product_request_id,
          description: data.description,
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

  // Group payment methods by category
  // Filter out bank debit cards - only show mobile money methods
  const categorizeMethods = () => {
    const mobileMoney = ['telebirr', 'cbe', 'mpesa', 'awash', 'ebirr']
    // Removed bank debit cards: ['boa', 'awash_bank', 'addis_bank', 'hibret', 'cbo', 'berhan', 'nib']
    
    const categories = {
      mobile: availableMethods.filter((m: ChapaPaymentMethod) => mobileMoney.includes(m.code)),
      // banks: [] // Removed bank debit cards section
    }
    
    return categories
  }

  const methodCategories = categorizeMethods()
  
  const getMethodIcon = (code: string) => {
    const iconClass = "h-8 w-8"
    if (code === 'telebirr') return <Smartphone className={`${iconClass} text-orange-500`} />
    if (code === 'cbe') return <Wallet className={`${iconClass} text-primary`} />
    // Removed bank debit card icons
    return <Smartphone className={`${iconClass} text-gray-500`} />
  }

  return (
    <MainLayout title="Select Payment Method">
      <Head title="Select Payment Method" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header - Compact */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                Complete Your Payment
              </h1>
              <div className="text-right">
                <div className="text-sm text-gray-600">Order ID</div>
                <div className="font-mono text-sm font-medium">{order_id}</div>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-primary-50">Total Amount</span>
                <span className="text-2xl font-bold">{formatPrice(amount, currency)}</span>
              </div>
              {cart_items && cart_items.length > 0 && (
                <div className="mt-2 text-sm text-primary-50">
                  {cart_items.length} item{cart_items.length > 1 ? "s" : ""} in cart
                </div>
              )}
            </div>
          </div>

          {isMissingOrderInfo && (
            <Alert className="mb-4 border-yellow-400 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Missing order information. Please return to checkout and try again.
              </AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert className="mb-4 border-red-400 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Customer Information */}
              <div className="lg:col-span-1">
                <div className="rounded-xl bg-white p-5 shadow-md sticky top-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-600" />
                    Your Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className={`mt-1.5 ${validationErrors.name || errors.name ? "border-red-500" : ""}`}
                        placeholder="Enter your full name"
                      />
                      {(validationErrors.name || errors.name) && (
                        <p className="mt-1 text-xs text-red-500">
                          {validationErrors.name || errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className={`mt-1.5 ${validationErrors.email || errors.email ? "border-red-500" : ""}`}
                        placeholder="your@email.com"
                      />
                      {(validationErrors.email || errors.email) && (
                        <p className="mt-1 text-xs text-red-500">
                          {validationErrors.email || errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone_number" className="text-sm font-medium flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+251911223344"
                        value={data.phone_number}
                        onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        required
                        className={`mt-1.5 ${validationErrors.phone_number || errors.phone_number ? "border-red-500" : ""}`}
                      />
                      {(validationErrors.phone_number || errors.phone_number) && (
                        <p className="mt-1 text-xs text-red-500">
                          {validationErrors.phone_number || errors.phone_number}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Ethiopian mobile: 07 or 09</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Methods */}
              <div className="lg:col-span-2">
                <div className="rounded-xl bg-white p-5 shadow-md">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Choose Payment Method</h2>
                  
                  <RadioGroup
                    value={data.payment_method}
                    onValueChange={(value: PaymentMethod) => setData("payment_method", value)}
                    className="space-y-4"
                  >
                    {/* Mobile Money Section */}
                    {methodCategories.mobile.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Smartphone className="h-4 w-4" />
                          Mobile Money
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {methodCategories.mobile.map((method) => {
                            const isSelected = data.payment_method === method.code
                            return (
                              <label
                                key={method.id}
                                htmlFor={method.code}
                                className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                              >
                                <RadioGroupItem value={method.code} id={method.code} className="absolute top-2 right-2" />
                                {isSelected && (
                                  <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />
                                )}
                                <div className="mb-2">{getMethodIcon(method.code)}</div>
                                <div className="text-center">
                                  <div className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                                    {method.name}
                                  </div>
                                  {method.description && (
                                    <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      {method.description}
                                    </div>
                                  )}
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bank Debit Cards section removed - only mobile money methods are shown */}
                  </RadioGroup>
                  
                  {errors.payment_method && (
                    <p className="mt-3 text-sm text-red-500">{errors.payment_method}</p>
                  )}

                  {/* Submit Button */}
                  <div className="mt-6 flex items-center justify-between border-t pt-5">
                    {payment_type === 'product_request_advance' && product_request_id ? (
                      <Link
                        href={route("user.product-requests.show", product_request_id)}
                        className="text-sm font-medium text-primary hover:text-primary-800 hover:underline transition-colors"
                      >
                        ← Back
                      </Link>
                    ) : (
                      <Link
                        href={route("checkout")}
                        className="text-sm font-medium text-primary hover:text-primary-800 hover:underline transition-colors"
                      >
                        ← Back to Checkout
                      </Link>
                    )}
                    <Button 
                      type="submit" 
                      disabled={!canSubmit} 
                      className="min-w-[160px] bg-primary hover:bg-primary-700"
                      size="lg"
                    >
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
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
