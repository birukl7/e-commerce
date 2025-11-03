'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/app/main-layout';
import { Link } from '@inertiajs/react';
import { CheckCircle, Package, ArrowRight, Download, Clock } from 'lucide-react';

interface ProductRequest {
  id: number;
  product_name: string;
  final_amount: number | null;
  currency: string;
  payment_reference: string | null;
  final_payment_status: string;
  order_id?: number;
}

interface FinalPaymentSuccessOfflineProps {
  productRequest: ProductRequest;
  submission_ref: string;
  amount: number;
  payment_method: string;
}

export default function FinalPaymentSuccessOffline({ 
  productRequest,
  submission_ref,
  amount,
  payment_method
}: FinalPaymentSuccessOfflineProps) {
  
  const formatCurrency = (amount: number | null, currency: string = 'ETB') => {
    if (!amount) return 'N/A';
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
Final Payment Receipt (Offline)

Product Request ID: #${productRequest.id}
Order ID: ${productRequest.order_id || 'N/A'}
Submission Reference: ${submission_ref}
Date: ${new Date().toLocaleString()}
Product: ${productRequest.product_name}

Payment Details:
- Final Amount Paid: ${formatCurrency(amount, productRequest.currency)}
- Payment Method: ${payment_method} (Pay & Upload Proof)
- Status: Pending Admin Approval

Thank you for your payment! Your order will be complete once verified.
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `final-payment-receipt-${productRequest.id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <MainLayout title="Final Payment Submitted">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-orange-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-700">Payment Proof Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your final payment proof has been submitted and is pending admin verification.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Pending Verification:</strong> Our team will review your payment proof. 
                You'll receive a notification once your payment is verified and your order is complete.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{productRequest.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(amount, productRequest.currency)}
                  </span>
                </div>
                {productRequest.order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm">#{productRequest.order_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Submission Reference:</span>
                  <span className="font-mono text-sm">{submission_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{payment_method}</span>
                </div>
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
              <h4 className="font-medium mb-2 text-blue-900">What happens next?</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span>1.</span>
                  <span>Our team reviews your payment proof (usually within 24 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2.</span>
                  <span>You'll receive an email notification once verified</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3.</span>
                  <span>Your order will be prepared for shipment</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                <Link href={route('user.product-requests.show', productRequest.id)}>
                  <Package className="mr-2 h-4 w-4" />
                  Back to Product Request
                </Link>
              </Button>

              {productRequest.order_id && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={route('user.orders.show', productRequest.order_id)}>
                    View Order Details
                  </Link>
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={handleDownloadReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
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

