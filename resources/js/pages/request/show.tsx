import type React from "react"

import { Head, Link, useForm } from "@inertiajs/react"
import { useState } from "react"
import MainLayout from "@/layouts/app/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
}

interface Props {
  request: ProductRequest
}

export default function RequestShow({ request }: Props) {
  const [accepted, setAccepted] = useState(false)
  const { post, processing } = useForm({})
  return (
    <MainLayout title={`Request #${request.id}`}>
      <Head title={`Request #${request.id}`} />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href={route("request.index")}>
            <Button variant="secondary">Back to requests</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              {request.image && (
                <img
                  src={request.image}
                  alt={request.product_name}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold">{request.product_name}</h1>
                <p className="text-sm text-gray-600">Status: {request.status}</p>
                {request.admin_response && (
                  <p className="mt-2 text-sm">Admin response: {request.admin_response}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-medium">Description</h2>
              <p className="text-sm text-gray-800 whitespace-pre-line">{request.description}</p>
            </div>

            <div className="pt-4 border-t">
              <h2 className="font-medium mb-2">Status timeline</h2>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li>Created at: {new Date(request.created_at).toLocaleString()}</li>
                {request.updated_at && (
                  <li>Last updated: {new Date(request.updated_at).toLocaleString()}</li>
                )}
                <li>Current status: {request.status}</li>
                {request.payment_status && <li>Payment status: {request.payment_status}</li>}
                {request.paid_at && <li>Paid at: {new Date(request.paid_at).toLocaleString()}</li>}
                {request.price_accepted_at && (
                  <li>Price accepted: {new Date(request.price_accepted_at).toLocaleString()}</li>
                )}
              </ul>
            </div>

            {request.requires_payment && (
              <div className="pt-4 border-t">
                <p className="text-sm">
                  Amount due: {request.currency} {request.amount}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    id="accept_price"
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  <label htmlFor="accept_price" className="text-sm text-gray-700">
                    I accept the set price
                  </label>
                </div>
                <Button
                  className="mt-2"
                  disabled={!accepted || processing}
                  onClick={() => post(route('request.accept-price', request.id))}
                >
                  {processing ? 'Processing...' : 'Proceed to payment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


