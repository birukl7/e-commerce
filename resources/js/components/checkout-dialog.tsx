"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, CreditCard, Smartphone, Wallet, ArrowLeft, ArrowRight, X } from "lucide-react"

interface CheckoutDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface AddressForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

const paymentMethods = [
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: "stripe",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, American Express",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    description: "Pay with Touch ID or Face ID",
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    id: "google-pay",
    name: "Google Pay",
    description: "Pay with your Google account",
    icon: <Smartphone className="h-5 w-5" />,
  },
]

export default function CheckoutDialog({ isOpen, onClose }: CheckoutDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, getTotalPrice, clearCart } = useCart()

  const [addressForm, setAddressForm] = useState<AddressForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  })

  const handleInputChange = (field: keyof AddressForm, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setCurrentStep(3)
    clearCart()
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedPayment("")
    setAddressForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    })
    onClose()
  }

  const isStep1Valid = () => {
    return (
      addressForm.firstName &&
      addressForm.lastName &&
      addressForm.email &&
      addressForm.phone &&
      addressForm.address &&
      addressForm.city &&
      addressForm.state &&
      addressForm.zipCode &&
      addressForm.country
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bottom-0  flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 " />

      {/* Dialog Content */}
      <div className="relative z-[101] w-full max-w-2xl mt-[600px] overflow-y-auto bg-white rounded-lg shadow-lg mx-4">
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-600"}`}
              >
                1
              </div>
              <div className={`h-1 w-16 ${currentStep >= 2 ? "bg-primary" : "bg-slate-200"}`} />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-600"}`}
              >
                2
              </div>
              <div className={`h-1 w-16 ${currentStep >= 3 ? "bg-primary" : "bg-slate-200"}`} />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-600"}`}
              >
                3
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {/* Step 1: Address Form */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={addressForm.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={addressForm.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={addressForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={addressForm.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={addressForm.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      placeholder="Enter your ZIP code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Payment Method</h3>

                {/* Order Summary */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>ETB {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>ETB {getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-lg">
                            {method.icon}
                          </div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-slate-600">{method.description}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <div className="text-center space-y-6 py-8">
                <div className="flex justify-center">
                  <CheckCircle className="h-24 w-24 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Order Successful!</h3>
                  <p className="text-slate-600">
                    Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Order confirmation has been sent to <strong>{addressForm.email}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            {currentStep === 1 && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleNextStep} disabled={!isStep1Valid()}>
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Address
                </Button>
                <Button onClick={handlePayment} disabled={!selectedPayment || isProcessing}>
                  {isProcessing ? "Processing..." : `Pay ETB ${getTotalPrice().toFixed(2)}`}
                </Button>
              </>
            )}

            {currentStep === 3 && (
              <Button onClick={handleClose} className="ml-auto">
                Continue Shopping
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
