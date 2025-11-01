'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/main-layout';
import { Link } from '@inertiajs/react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface ProductRequest {
  id: number;
  product_name: string;
  advance_amount: number;
  final_amount: number | null;
  currency: string;
  payment_reference: string | null;
}

interface AdvancePaymentSuccessProps {
  productRequest: ProductRequest;
  message?: string;
}

export default function AdvancePaymentSuccess({ 
  productRequest, 
  message = 'Your advance payment was successful! We will now start procuring your product.' 
}: AdvancePaymentSuccessProps) {
  
  const formatCurrency = (amount: number | null, currency: string = 'ETB') => {
    if (!amount) return 'N/A';
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <MainLayout title="Payment Successful">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Advance Payment Successful!</CardTitle>
            <CardDescription className="text-base mt-2">{message}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{productRequest.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Amount Paid:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(productRequest.advance_amount, productRequest.currency)}
                  </span>
                </div>
                {productRequest.final_amount && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Remaining Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(productRequest.final_amount, productRequest.currency)}
                    </span>
                  </div>
                )}
                {productRequest.payment_reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Reference:</span>
                    <span className="font-mono text-sm">{productRequest.payment_reference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What's Next?</strong> Our team will now start getting your product ready. 
                You'll be notified once your product has arrived and it's time to pay the remaining amount.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                <Link href={route('user.product-requests.show', productRequest.id)}>
                  <Package className="mr-2 h-4 w-4" />
                  View Product Request
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
              A confirmation email has been sent to your registered email address.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
