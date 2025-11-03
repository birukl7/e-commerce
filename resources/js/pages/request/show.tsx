import type React from "react"

import { Head, Link, useForm } from "@inertiajs/react"
import { useState } from "react"
import MainLayout from "@/layouts/app/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Package, CreditCard, Truck } from "lucide-react"

interface TaxBreakdown {
  taxes: Array<{
    name: string
    amount: number
    rate: number
  }>
  total_tax_amount: number
  subtotal: number
  total: number
}

interface ProductRequest {
  id: number
  product_name: string
  description: string
  status: "pending" | "reviewed" | "approved" | "rejected"
  admin_response?: string
  image?: string | null
  amount?: number | null
  currency?: string | null
  payment_status?: string | null
  payment_method?: string | null
  payment_reference?: string | null
  paid_at?: string | null
  price_accepted_at?: string | null
  created_at: string
  updated_at?: string
  requires_payment?: boolean
  // Workflow fields
  advance_amount?: number | null
  final_amount?: number | null
  advance_payment_status?: string | null
  final_payment_status?: string | null
  advance_paid_at?: string | null
  final_paid_at?: string | null
  customer_willing_to_buy?: boolean
  willingness_confirmed_at?: string | null
  procurement_status?: string | null
  procurement_started_at?: string | null
  procurement_expected_completion_date?: string | null
  procurement_completed_at?: string | null
  procurement_notes?: string | null
  product_arrived_at?: string | null
  workflow_status?: string
  requires_advance_payment?: boolean
  requires_final_payment?: boolean
  advance_tax_breakdown?: TaxBreakdown | null
  final_tax_breakdown?: TaxBreakdown | null
}

interface Props {
  request: ProductRequest
}

export default function RequestShow({ request }: Props) {
  const [accepted, setAccepted] = useState(false)
  const { post, processing } = useForm({})

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null | undefined, currency: string | null | undefined = 'ETB') => {
    if (!amount) return 'N/A'
    return `${currency || 'ETB'} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getWorkflowStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending_approval':
        return { text: 'Pending Admin Approval', variant: 'secondary' as const }
      case 'rejected':
        return { text: 'Rejected', variant: 'destructive' as const }
      case 'awaiting_customer_willingness':
        return { text: 'Awaiting Your Confirmation', variant: 'default' as const }
      case 'awaiting_advance_payment':
        return { text: 'Awaiting Advance Payment', variant: 'default' as const }
      case 'pending_payment_approval':
        return { text: 'Pending Payment Approval', variant: 'secondary' as const }
      case 'awaiting_procurement':
        return { text: 'We\'re Getting Your Product Ready', variant: 'default' as const }
      case 'procurement_in_progress':
        return { text: 'Getting Your Product', variant: 'default' as const }
      case 'awaiting_delivery':
        return { text: 'Awaiting Delivery', variant: 'default' as const }
      case 'awaiting_final_payment':
        return { text: 'Awaiting Final Payment', variant: 'default' as const }
      case 'completed':
        return { text: 'Completed', variant: 'default' as const }
      default:
        return { text: 'Unknown', variant: 'outline' as const }
    }
  }

  const workflowStatus = getWorkflowStatusBadge(request.workflow_status)

  return (
    <MainLayout title={`Request #${request.id}`}>
      <Head title={`Request #${request.id}`} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4">
          <Link href={route("request.index")}>
            <Button variant="secondary">Back to requests</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{request.product_name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
              {request.workflow_status && (
                <Badge variant={workflowStatus.variant}>
                  {workflowStatus.text}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              {request.image && (
                <img
                  src={request.image}
                  alt={request.product_name}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-800 whitespace-pre-line">{request.description}</p>
              </div>
            </div>

            {request.admin_response && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-blue-900">Admin Response</h3>
                <p className="text-sm text-blue-800">{request.admin_response}</p>
              </div>
            )}

            {/* Workflow Status Section */}
            {request.status === 'approved' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Progress</h3>
                
                {/* Customer Willingness Step */}
                {!request.customer_willing_to_buy && (
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Confirm Your Willingness to Buy</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Please confirm that you're willing to proceed with this purchase.
                    </p>
                    <Button
                      onClick={() => post(route('request.willingness', request.id))}
                      disabled={processing}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {processing ? 'Processing...' : 'Confirm Willingness'}
                    </Button>
                  </div>
                )}

                {/* Advance Payment Section */}
                {request.advance_amount && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Advance Payment
                        {request.advance_payment_status === 'paid' && (
                          <Badge variant="default" className="ml-2">Paid</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {request.requires_advance_payment && request.advance_payment_status !== 'paid' && request.advance_payment_status !== 'processing' && (
                        <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Payment Breakdown (with tax)</h4>
                          {request.advance_tax_breakdown ? (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span className="font-medium">{formatCurrency(request.advance_tax_breakdown.subtotal, request.currency)}</span>
                                </div>
                                {request.advance_tax_breakdown.taxes.map((tax, idx) => (
                                  <div key={idx} className="flex justify-between text-gray-600">
                                    <span>{tax.name} ({tax.rate}%):</span>
                                    <span>{formatCurrency(tax.amount, request.currency)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                  <span>Total to Pay:</span>
                                  <span className="text-green-700">{formatCurrency(request.advance_tax_breakdown.total, request.currency)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-lg font-bold text-green-700">
                                {formatCurrency(request.advance_amount, request.currency)}
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={() => window.location.href = route('user.product-requests.show', request.id)}
                          >
                            Pay Advance Amount
                          </Button>
                        </div>
                      )}
                      {request.advance_payment_status === 'processing' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <p className="font-medium text-blue-800">Payment Pending Approval</p>
                          </div>
                          <p className="text-sm text-blue-700">
                            Your payment proof has been uploaded and is awaiting admin approval. 
                            You'll be notified once it's approved.
                          </p>
                          {request.payment_reference && (
                            <p className="text-xs text-blue-600 mt-2">Reference: {request.payment_reference}</p>
                          )}
                        </div>
                      )}
                      {request.advance_payment_status === 'paid' && (
                        <div className="text-sm text-gray-600 space-y-2">
                          <p className="font-medium text-green-700">✓ Advance Payment Completed</p>
                          <p>Paid on: {request.advance_paid_at ? formatDate(request.advance_paid_at) : 'N/A'}</p>
                          {request.payment_reference && (
                            <p className="text-xs text-gray-500">Reference: {request.payment_reference}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Getting Product Status */}
                {request.procurement_status && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Status
                        <Badge variant={
                          request.procurement_status === 'completed' ? 'default' :
                          request.procurement_status === 'in_progress' ? 'default' : 'secondary'
                        }>
                          {request.procurement_status === 'completed' ? 'Product Arrived' :
                           request.procurement_status === 'in_progress' ? 'Getting Your Product' : 'Not Started'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {request.procurement_status === 'in_progress' && (
                        <div className="space-y-2">
                          {request.procurement_started_at && (
                            <p className="text-sm">
                              <span className="font-medium">We started getting your product on:</span> {formatDate(request.procurement_started_at)}
                            </p>
                          )}
                          {request.procurement_expected_completion_date && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-blue-900">
                                Product will arrive by: <span className="font-bold">{formatDate(request.procurement_expected_completion_date)}</span>
                              </p>
                              {(() => {
                                const arrivalDate = new Date(request.procurement_expected_completion_date);
                                const today = new Date();
                                const daysUntilArrival = Math.ceil((arrivalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                if (daysUntilArrival > 0) {
                                  return (
                                    <p className="text-xs text-blue-700 mt-1">
                                      (in {daysUntilArrival} {daysUntilArrival === 1 ? 'day' : 'days'})
                                    </p>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                          {request.procurement_notes && (
                            <p className="text-sm text-gray-600 italic">
                              Note: {request.procurement_notes}
                            </p>
                          )}
                        </div>
                      )}
                      {request.procurement_status === 'completed' && request.procurement_completed_at && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-900">
                            <span className="font-bold">Product Arrived!</span> Your product arrived on {formatDate(request.procurement_completed_at)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Final Payment Section - Only show after product arrived */}
                {request.final_amount && request.requires_final_payment && request.product_arrived_at && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Pay Remaining Amount
                        {request.final_payment_status === 'paid' && (
                          <Badge variant="default" className="ml-2">Paid</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Payment Breakdown (with tax)</h4>
                          {request.final_tax_breakdown ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">{formatCurrency(request.final_tax_breakdown.subtotal, request.currency)}</span>
                              </div>
                              {request.final_tax_breakdown.taxes.map((tax, idx) => (
                                <div key={idx} className="flex justify-between text-gray-600">
                                  <span>{tax.name} ({tax.rate}%):</span>
                                  <span>{formatCurrency(tax.amount, request.currency)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total to Pay:</span>
                                <span className="text-green-700">{formatCurrency(request.final_tax_breakdown.total, request.currency)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-green-700">
                              {formatCurrency(request.final_amount, request.currency)}
                            </div>
                          )}
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => window.location.href = route('user.product-requests.show', request.id)}
                        >
                          Pay Final Amount
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Overall Price Summary */}
                {request.amount && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Total Price Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">{formatCurrency(request.amount, request.currency)}</span>
                        </div>
                        {request.advance_amount && (
                          <div className="flex justify-between text-gray-600">
                            <span>Advance ({request.advance_payment_status === 'paid' ? 'Paid' : 'Pending'}):</span>
                            <span>{formatCurrency(request.advance_amount, request.currency)}</span>
                          </div>
                        )}
                        {request.final_amount && (
                          <div className="flex justify-between text-gray-600">
                            <span>Final ({request.final_payment_status === 'paid' ? 'Paid' : 'Pending'}):</span>
                            <span>{formatCurrency(request.final_amount, request.currency)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Status Timeline</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Created: {formatDate(request.created_at)}</li>
                {request.updated_at && <li>Last updated: {formatDate(request.updated_at)}</li>}
                {request.advance_paid_at && <li>Advance paid: {formatDate(request.advance_paid_at)}</li>}
                {request.procurement_started_at && <li>Started getting your product: {formatDate(request.procurement_started_at)}</li>}
                {(request.procurement_completed_at || request.product_arrived_at) && (
                  <li>Product arrived: {formatDate(request.product_arrived_at || request.procurement_completed_at || '')}</li>
                )}
                {request.final_paid_at && <li>Final payment: {formatDate(request.final_paid_at)}</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
