import type React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import MainLayout from "@/layouts/app/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Info } from "lucide-react"

interface ProductRequest {
  id: number
  product_name: string
  description: string
  amount: number
  advance_amount: number
  final_amount: number
  currency: string
  admin_response?: string
  image?: string | null
}

interface Props {
  request: ProductRequest
}

export default function WillingnessPage({ request }: Props) {
  const { post, processing } = useForm({})

  const handleConfirmWillingness = () => {
    post(route('request.confirm-willingness', request.id))
  }

  return (
    <MainLayout title={`Confirm Willingness - ${request.product_name}`}>
      <Head title={`Confirm Willingness - ${request.product_name}`} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href={route("request.index")}>
            <Button variant="secondary">← Back to requests</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Confirm Your Willingness to Buy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Details */}
            <div className="flex items-start gap-4">
              {request.image && (
                <img
                  src={request.image}
                  alt={request.product_name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{request.product_name}</h2>
                <p className="text-gray-600 mb-4">{request.description}</p>
                {request.admin_response && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Admin Response:</strong> {request.admin_response}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Structure */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {request.currency} {request.advance_amount?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Advance Payment (30%)</div>
                  <div className="text-xs text-gray-500 mt-1">Pay now to secure your order</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {request.currency} {request.final_amount?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Final Payment (70%)</div>
                  <div className="text-xs text-gray-500 mt-1">Pay when product arrives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {request.currency} {request.amount?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-xs text-gray-500 mt-1">Complete price</div>
                </div>
              </div>
            </div>

            {/* Process Explanation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                How This Works
              </h3>
              <div className="space-y-3 text-sm text-green-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">1</div>
                  <div>
                    <strong>Confirm Willingness:</strong> You confirm you want to buy this product at the set price
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">2</div>
                  <div>
                    <strong>Pay Advance (30%):</strong> Secure your order with advance payment
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">3</div>
                  <div>
                    <strong>We Procure:</strong> We source and purchase the product for you
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">4</div>
                  <div>
                    <strong>Product Arrives:</strong> We notify you when the product is ready
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-800">5</div>
                  <div>
                    <strong>Pay Final (70%):</strong> Complete payment and receive your product
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Why This Process?</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• <strong>Secure your order:</strong> Advance payment ensures we procure the product for you</li>
                <li>• <strong>No risk for you:</strong> If we can't find the product, we refund your advance payment</li>
                <li>• <strong>Better prices:</strong> We can negotiate better deals when we have confirmed orders</li>
                <li>• <strong>Quality assurance:</strong> We inspect the product before final payment</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-600">
                By confirming, you agree to the payment structure and process outlined above.
              </div>
              <div className="flex gap-3">
                <Link href={route("request.index")}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button 
                  onClick={handleConfirmWillingness}
                  disabled={processing}
                  className="flex items-center gap-2"
                >
                  {processing ? 'Processing...' : 'Confirm Willingness'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
