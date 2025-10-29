import type React from "react"
import { Head, Link } from "@inertiajs/react"
import MainLayout from "@/layouts/app/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Upload, ArrowLeft } from "lucide-react"

interface AdvancePaymentMethodProps {
  order_id: string
  amount: number
  currency: string
  product_name: string
  description: string
  product_request_id: number
}

export default function AdvancePaymentMethod({
  order_id,
  amount,
  currency,
  product_name,
  description,
  product_request_id
}: AdvancePaymentMethodProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'ETB' ? 'USD' : currency,
    })
      .format(price)
      .replace('$', currency + ' ')
  }

  const handleOnlinePayment = () => {
    // Redirect to Chapa payment form
    const params = new URLSearchParams({
      order_id,
      amount: amount.toString(),
      currency,
      payment_type: 'product_request_advance',
      product_request_id: product_request_id.toString(),
      description,
    })
    
    window.location.href = route('payment.chapa.method') + '?' + params.toString()
  }

  const handleOfflinePayment = () => {
    // Redirect to offline payment form
    const params = new URLSearchParams({
      order_id,
      amount: amount.toString(),
      currency,
      payment_method: 'offline',
      payment_type: 'product_request_advance',
      product_request_id: product_request_id.toString(),
      description,
    })
    
    window.location.href = route('payment.show') + '?' + params.toString()
  }

  return (
    <MainLayout title="Advance Payment Method">
      <Head title="Advance Payment Method" />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href={route("user.product-requests.show", product_request_id)}>
            <Button variant="secondary" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Product Request
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Advance Payment Method</CardTitle>
            <p className="text-gray-600">Choose how you'd like to pay your advance payment</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="font-medium">{product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono text-xs">{order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Advance Amount:</span>
                  <span className="font-bold text-lg">{formatPrice(amount)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {description}
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Online Payment */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleOnlinePayment}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Online Payment</h3>
                  <p className="text-gray-600 mb-4">
                    Pay securely online using Chapa payment gateway
                  </p>
                  <Button className="w-full">
                    Pay Online
                  </Button>
                </CardContent>
              </Card>

              {/* Offline Payment */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleOfflinePayment}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Pay & Upload Proof</h3>
                  <p className="text-gray-600 mb-4">
                    Pay via bank transfer and upload proof
                  </p>
                  <Button variant="outline" className="w-full">
                    Pay Offline
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">About Advance Payment</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• This is a 30% advance payment to secure your order</li>
                <li>• The remaining 70% will be paid when the product arrives</li>
                <li>• If we cannot find the product, your advance payment will be refunded</li>
                <li>• We will start procuring your product after receiving this payment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
