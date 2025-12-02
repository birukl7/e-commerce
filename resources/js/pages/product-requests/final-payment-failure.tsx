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
  error_code?: string;
  payment_method?: 'chapa' | 'offline';
  retry_url?: string;
  transaction_id?: string;
}

export default function FinalPaymentFailure({ 
  productRequest,
  error_message = 'Your final payment could not be processed.',
  error_code,
  payment_method = 'chapa',
  retry_url,
  transaction_id
}: FinalPaymentFailureProps) {
  
  const formatCurrency = (amount: number | null, currency: string = 'ETB') => {
    if (!amount) return 'N/A';
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get error-specific information
  const getErrorInfo = (code?: string) => {
    switch (code) {
      case 'insufficient_funds':
        return {
          title: 'Insufficient Funds',
          description: 'Your account doesn\'t have sufficient balance to complete this payment.',
          icon: '💰',
          suggestions: [
            'Check your account balance',
            'Add funds to your mobile money or bank account',
            'Try again once you have sufficient funds',
            'Important: Your product is ready, so please complete the final payment to receive it'
          ]
        };
      case 'user_cancelled':
      case 'cancelled':
        return {
          title: 'Payment Cancelled',
          description: 'You cancelled the payment process.',
          icon: '❌',
          suggestions: [
            'If this was accidental, you can try again',
            'Make sure you complete the payment process',
            'Important: Your product is ready, so please complete the final payment to receive it',
            'Contact support if you need assistance'
          ]
        };
      case 'invalid_phone':
      case 'invalid_account':
        return {
          title: 'Invalid Account',
          description: 'The phone number or account information provided is invalid.',
          icon: '📱',
          suggestions: [
            'Verify your phone number is correct',
            'Ensure your account is registered with the payment provider',
            'Try using a different payment method',
            'Important: Your product is ready, so please complete the final payment to receive it'
          ]
        };
      case 'timeout':
      case 'expired':
        return {
          title: 'Payment Timeout',
          description: 'The payment session expired. Please try again.',
          icon: '⏱️',
          suggestions: [
            'Complete the payment within the time limit',
            'Try again with a fresh payment session',
            'Ensure you have a stable internet connection',
            'Important: Your product is ready, so please complete the final payment to receive it'
          ]
        };
      case 'network_error':
        return {
          title: 'Network Error',
          description: 'A network error occurred during payment processing.',
          icon: '🌐',
          suggestions: [
            'Check your internet connection',
            'Try again in a moment',
            'Important: Your product is ready, so please complete the final payment to receive it',
            'Contact support if the problem persists'
          ]
        };
      case 'declined':
      case 'card_declined':
        return {
          title: 'Payment Declined',
          description: 'Your payment was declined by your bank or payment provider.',
          icon: '🚫',
          suggestions: [
            'Contact your bank to verify the transaction',
            'Try using a different payment method',
            'Ensure your payment method is active and valid',
            'Important: Your product is ready, so please complete the final payment to receive it'
          ]
        };
      case 'wrong_pin':
      case 'authentication_failed':
        return {
          title: 'Authentication Failed',
          description: 'Incorrect PIN or password entered multiple times.',
          icon: '🔒',
          suggestions: [
            'Wait a few minutes before trying again',
            'Ensure you enter the correct PIN',
            'Contact your bank if your account is locked',
            'Important: Your product is ready, so please complete the final payment to receive it'
          ]
        };
      case 'request_terminated':
        return {
          title: 'Request Terminated',
          description: 'This product request has been terminated and cannot accept payments.',
          icon: '🚫',
          suggestions: [
            'This request is no longer active',
            'Contact support immediately as your product may have been procured',
            'You may need to create a new product request'
          ]
        };
      default:
        return {
          title: 'Payment Failed',
          description: error_message || 'Your final payment could not be processed.',
          icon: '⚠️',
          suggestions: [
            'Check if you have sufficient funds in your account',
            'Verify your payment details and try again',
            'Contact your bank if you\'re having trouble with your payment method',
            payment_method === 'chapa' && 'Try using the "Pay & Upload Proof" payment method instead',
            'Contact our support team if the problem persists',
            'Important: Your product is ready, so please complete the final payment to receive it'
          ].filter(Boolean) as string[]
        };
    }
  };

  const errorInfo = getErrorInfo(error_code);

  return (
    <MainLayout title="Payment Failed">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-200">
          <CardHeader className="text-center pb-4 bg-red-50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">{errorInfo.title}</CardTitle>
            <CardDescription className="text-base mt-2 text-red-700">{errorInfo.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-2">Payment Unsuccessful</h4>
                  <p className="text-sm text-red-800 mb-2">
                    {errorInfo.description}
                  </p>
                  {error_code && (
                    <p className="text-xs text-red-600 mt-2">
                      Error Code: <span className="font-mono">{error_code}</span>
                    </p>
                  )}
                  {transaction_id && (
                    <p className="text-xs text-red-600 mt-1">
                      Transaction ID: <span className="font-mono">{transaction_id}</span>
                    </p>
                  )}
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
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
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

