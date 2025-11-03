'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/main-layout';
import { Link } from '@inertiajs/react';
import { XCircle, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

interface ProductRequest {
  id: number;
  product_name: string;
  final_amount: number | null;
  currency: string;
}

interface FinalPaymentFailureProps {
  productRequest: ProductRequest;
  error_message?: string;
  payment_method?: 'chapa' | 'offline';
  retry_url?: string;
}

export default function FinalPaymentFailure({ 
  productRequest,
  error_message = 'Your final payment could not be processed.',
  payment_method = 'chapa',
  retry_url
}: FinalPaymentFailureProps) {
  
  const formatCurrency = (amount: number | null, currency: string = 'ETB') => {
    if (!amount) return 'N/A';
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <MainLayout title="Payment Failed">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-200">
          <CardHeader className="text-center pb-4 bg-red-50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Final Payment Failed</CardTitle>
            <CardDescription className="text-base mt-2 text-red-700">{error_message}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Payment Unsuccessful</h4>
                  <p className="text-sm text-red-800">
                    We were unable to process your final payment. Please try again or contact support if the problem persists.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{productRequest.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(productRequest.final_amount, productRequest.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {payment_method === 'chapa' ? 'Chapa (Online Payment)' : 'Pay & Upload Proof'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Request ID:</span>
                  <span>#{productRequest.id}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-yellow-900">What to do next?</h4>
              <ul className="space-y-2 text-sm text-yellow-800 list-disc list-inside">
                <li>Check if you have sufficient funds in your account</li>
                <li>Verify your payment details and try again</li>
                <li>Contact your bank if you're having trouble with your payment method</li>
                {payment_method === 'chapa' && (
                  <li>Try using the "Pay & Upload Proof" payment method instead</li>
                )}
                <li>Contact our support team if the problem persists</li>
                <li><strong>Important:</strong> Your product is ready, so please complete the final payment to receive it</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {retry_url && (
                <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                  <Link href={retry_url}>
                    Try Payment Again
                  </Link>
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href={route('user.product-requests.show', productRequest.id)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Product Request
                </Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href={route('request.index')}>
                  View All Requests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Need help? <Link href="#" className="text-orange-600 hover:underline">Contact our support team</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

