"use client"
import AppLayout from "@/layouts/app-layout"
import type React from "react"

import MainLayout from "@/layouts/app/main-layout"
import type { NavItem, BreadcrumbItem } from "@/types"
import { BrickWall, ListOrdered, Save, Plus, Clock, CheckCircle, XCircle, Eye, Upload, X, LayoutDashboard, Edit, Trash2 } from "lucide-react"
import { useForm, Link, router } from "@inertiajs/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ProductRequest {
  id: number
  product_name: string
  description: string
  status: string
  image?: string | null
  created_at: string
  admin_response?: string
  rejection_reason?: string
  amount?: number | null
  currency?: string | null
  payment_status?: string | null
  payment_method?: string | null
  payment_reference?: string | null
  paid_at?: string | null
  price_accepted_at?: string | null
  requires_payment?: boolean
  available?: boolean | null
  // New procurement fields
  advance_amount?: number | null
  final_amount?: number | null
  advance_payment_status?: string | null
  final_payment_status?: string | null
  advance_paid_at?: string | null
  final_paid_at?: string | null
  procurement_status?: string | null
  procurement_notes?: string | null
  procurement_started_at?: string | null
  procurement_completed_at?: string | null
  product_arrived_at?: string | null
  customer_willing_to_buy?: boolean
  willingness_confirmed_at?: string | null
  workflow_status?: string
  lost_interest_at?: string | null
  lost_interest_reason?: string | null
  estimated_arrival_date?: string | null
}

interface RequestProps {
  requests: ProductRequest[]
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
  },
  {
    title: "Requests",
    href: "/user-request",
  },
]

const defaultMainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "BookMarked Products",
    href: "/user-wishlist",
    icon: Save,
  },
  {
    title: "Orders",
    href: "/user-order",
    icon: ListOrdered,
  },
  {
    title: "Requests",
    href: "/user-request",
    icon: BrickWall,
  },
  {
    title: "Bought Products",
    href: "/user-products",
    icon: ListOrdered,
  },
]

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    case "reviewed":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "approved":
      return <CheckCircle className="h-4 w-4" />
    case "rejected":
      return <XCircle className="h-4 w-4" />
    case "reviewed":
      return <Eye className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

// Helper function to get workflow status display
const getWorkflowStatusDisplay = (request: ProductRequest) => {
  const workflowStatus = request.workflow_status || 'unknown'
  
  // If customer has lost interest, show that status
  if (request.lost_interest_at) {
    const reason = request.lost_interest_reason || '';
    let reasonText = '';
    if (reason.startsWith('price_too_high')) reasonText = ' - Price Too High';
    else if (reason.startsWith('delivery_date_too_long')) reasonText = ' - Delivery Too Long';
    else if (reason.startsWith('simply_lost_interest')) reasonText = ' - Simply Lost Interest';
    else if (reason.startsWith('changed_mind')) reasonText = ' - Changed Mind';
    else if (reason.startsWith('found_elsewhere')) reasonText = ' - Found Elsewhere';
    else if (reason.startsWith('other')) reasonText = ' - Other';
    return { text: `Lost Interest${reasonText}`, color: 'bg-red-100 text-red-800 border-red-200' }
  }
  
  switch (workflowStatus) {
    case 'pending_approval':
      return { text: 'Pending Admin Approval', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    case 'rejected':
      return { text: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' }
    case 'customer_lost_interest':
      const reason = request.lost_interest_reason || '';
      let reasonText = '';
      if (reason.startsWith('price_too_high')) reasonText = ' - Price Too High';
      else if (reason.startsWith('delivery_date_too_long')) reasonText = ' - Delivery Too Long';
      else if (reason.startsWith('simply_lost_interest')) reasonText = ' - Simply Lost Interest';
      else if (reason.startsWith('changed_mind')) reasonText = ' - Changed Mind';
      else if (reason.startsWith('found_elsewhere')) reasonText = ' - Found Elsewhere';
      else if (reason.startsWith('other')) reasonText = ' - Other';
      return { text: `Lost Interest${reasonText}`, color: 'bg-red-100 text-red-800 border-red-200' }
    case 'awaiting_customer_willingness':
      return { text: 'Awaiting Your Confirmation', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'awaiting_advance_payment':
      return { text: 'Awaiting Advance Payment', color: 'bg-orange-100 text-orange-800 border-orange-200' }
    case 'pending_payment_approval':
      return { text: 'Pending Payment Approval', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    case 'awaiting_procurement':
      return { text: 'We\'re Getting Your Product Ready', color: 'bg-purple-100 text-purple-800 border-purple-200' }
    case 'procurement_in_progress':
      return { text: 'Getting Your Product', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
    case 'awaiting_delivery':
      return { text: 'Awaiting Delivery', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' }
    case 'awaiting_final_payment':
      return { text: 'Awaiting Final Payment', color: 'bg-amber-100 text-amber-800 border-amber-200' }
    case 'completed':
      return { text: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' }
    default:
      return { text: 'Unknown Status', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  }
}

// Helper function to get action button for request
const getActionButton = (request: ProductRequest) => {
  const workflowStatus = request.workflow_status || 'unknown'
  
  // Don't show action button if customer has indicated lost interest
  if (request.lost_interest_at) {
    return null
  }
  
  switch (workflowStatus) {
    case 'awaiting_customer_willingness':
      return {
        text: 'Confirm Willingness',
        href: route('request.willingness', request.id),
        className: 'bg-blue-600 hover:bg-blue-700'
      }
    case 'awaiting_advance_payment':
      return {
        text: 'Pay Advance',
        href: route('user.product-requests.show', request.id),
        className: 'bg-orange-600 hover:bg-orange-700'
      }
    case 'pending_payment_approval':
      // When payment is processing, don't show action button or show "View Details"
      return {
        text: 'View Details',
        href: route('user.product-requests.show', request.id),
        className: 'bg-blue-600 hover:bg-blue-700'
      }
    case 'awaiting_final_payment':
      return {
        text: 'Pay Final Amount',
        href: route('user.product-requests.show', request.id),
        className: 'bg-amber-600 hover:bg-amber-700'
      }
    case 'completed':
      return {
        text: 'View Details',
        href: route('user.product-requests.show', request.id),
        className: 'bg-green-600 hover:bg-green-700'
      }
    default:
      return {
        text: 'View Details',
        href: route('user.product-requests.show', request.id),
        className: 'bg-gray-600 hover:bg-gray-700'
      }
  }
}

export default function RequestDashboard({ requests }: RequestProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [lostInterestDialogs, setLostInterestDialogs] = useState<Record<number, boolean>>({})

  const handleDelete = (requestId: number, productName: string) => {
    if (confirm(`Are you sure you want to delete the request for "${productName}"?`)) {
      router.delete(route('request.destroy', requestId))
    }
  }

  const { data, setData, post, processing, errors, reset } = useForm({
    product_name: "",
    description: "",
    image: null as File | null,
  })

  // Single form for lost interest that we'll reuse for all requests
  const lostInterestForm = useForm({
    reason: '',
    additional_notes: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData("image", file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setData("image", null)
    setImagePreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('request.store'), {
      onSuccess: () => {
        reset()
        setImagePreview(null)
        setDialogOpen(false)
      },
    })
  }

  return (
    <MainLayout title={"Product Requests"} className={""} footerOff={false} contentMarginTop={"mt-[60px]"}>
      <AppLayout
        logoDisplay=" invisible"
        sidebarStyle="mt-[20px]"
        breadcrumbs={breadcrumbs}
        mainNavItems={defaultMainNavItems}
        footerNavItems={[]}
      >
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Requests</h1>
              <p className="text-gray-600">Request products that you'd like to see in our store</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2  text-white px-4 py-2 rounded-lg  transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Product Request</DialogTitle>
                  <DialogDescription>
                    Describe the product you want us to source. Include details and an optional image.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="product_name"
                      value={data.product_name}
                      onChange={(e) => setData("product_name", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter the product name you're looking for"
                      required
                    />
                    {errors.product_name && <p className="text-red-600 text-sm mt-1">{errors.product_name}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe the product, specs, brand preferences, etc."
                      required
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Choose Image</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset()
                        setImagePreview(null)
                        setDialogOpen(false)
                      }}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing ? "Submitting..." : "Submit Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>


          {/* Requests List */}
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.product_name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {request.workflow_status && (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getWorkflowStatusDisplay(request).color}`}
                          >
                            {getWorkflowStatusDisplay(request).text}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      
                      {/* Price Information */}
                      {request.status === 'approved' && request.amount && request.currency && (
                        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800">Price Set by Admin</p>
                              <div className="flex items-center gap-4">
                                <p className="text-lg font-bold text-green-900">
                                  Total: {request.currency} {request.amount?.toLocaleString()}
                                </p>
                                {request.advance_amount && (
                                  <p className="text-sm text-green-700">
                                    Advance: {request.currency} {request.advance_amount?.toLocaleString()}
                                  </p>
                                )}
                                {request.final_amount && (
                                  <p className="text-sm text-green-700">
                                    Final: {request.currency} {request.final_amount?.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getActionButton(request) && request.workflow_status === 'awaiting_customer_willingness' && !request.lost_interest_at && request.status === 'approved' && request.advance_payment_status !== 'paid' && request.advance_payment_status !== 'processing' && (
                                <>
                                  <Link href={getActionButton(request).href}>
                                    <Button size="sm" className={getActionButton(request).className}>
                                      {getActionButton(request).text}
                                    </Button>
                                  </Link>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setLostInterestDialogs(prev => ({ ...prev, [request.id]: true }))}
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    Lost Interest
                                  </Button>
                                </>
                              )}
                              {getActionButton(request) && (request.workflow_status !== 'awaiting_customer_willingness' || request.status !== 'approved' || request.advance_payment_status === 'paid' || request.advance_payment_status === 'processing' || request.lost_interest_at) && (
                                <Link href={getActionButton(request).href}>
                                  <Button size="sm" className={getActionButton(request).className}>
                                    {getActionButton(request).text}
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                          <span>Request ID: #{request.id}</span>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Link href={route('request.edit', request.id)}>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(request.id, request.product_name)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {request.image && (
                      <img
                        src={request.image || "/placeholder.svg"}
                        alt={request.product_name}
                        className="w-20 h-20 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>

                  {/* Rejection Information */}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">Rejection Reason:</h4>
                      <p className="text-sm text-red-700 mb-2">
                        {request.rejection_reason === 'product_not_available' && 'Product Not Available - Unfortunately, the product you requested is not available at this time. We are unable to source this product from our suppliers.'}
                        {request.rejection_reason === 'specifications_not_matching' && 'Specifications Not Matching - We were unable to find a product that matches your exact specifications. The available options do not meet the requirements you specified.'}
                        {request.rejection_reason === 'out_of_stock' && 'Out of Stock - The product is currently out of stock with our suppliers and is not expected to be available in the foreseeable future.'}
                        {request.rejection_reason === 'discontinued' && 'Product Discontinued - The product has been discontinued by the manufacturer and is no longer available in the market.'}
                        {request.rejection_reason === 'other' && 'Other Reason - Your product request could not be fulfilled for the reasons specified below.'}
                      </p>
                      {request.admin_response && (
                        <div className="mt-2 pt-2 border-t border-red-300">
                          <p className="text-xs font-semibold text-red-900 mb-1">Additional Information:</p>
                          <p className="text-xs text-red-700">{request.admin_response}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Admin Response (for non-rejected statuses) */}
                  {request.admin_response && request.status !== 'rejected' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Admin Response:</h4>
                      <p className="text-gray-700">{request.admin_response}</p>
                    </div>
                  )}

                  {/* Lost Interest Dialogs */}
                  {request.status === 'approved' && request.workflow_status === 'awaiting_customer_willingness' && !request.lost_interest_at && request.advance_payment_status !== 'paid' && request.advance_payment_status !== 'processing' && (
                    <Dialog 
                      open={lostInterestDialogs[request.id] || false} 
                      onOpenChange={(open) => setLostInterestDialogs(prev => ({ ...prev, [request.id]: open }))}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Why are you losing interest?</DialogTitle>
                          <DialogDescription>
                            Please help us understand why you're no longer interested in this product request.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          lostInterestForm.post(route('request.lost-interest', request.id), {
                            onSuccess: () => {
                              setLostInterestDialogs(prev => ({ ...prev, [request.id]: false }))
                              lostInterestForm.reset()
                            }
                          })
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`lost_interest_reason_${request.id}`}>Reason *</Label>
                            <Select
                              value={lostInterestForm.data.reason}
                              onValueChange={(value) => lostInterestForm.setData('reason', value)}
                            >
                              <SelectTrigger id={`lost_interest_reason_${request.id}`}>
                                <SelectValue placeholder="Select a reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="price_too_high">Price Too High</SelectItem>
                                <SelectItem value="delivery_date_too_long">Delivery Date Too Long</SelectItem>
                                <SelectItem value="simply_lost_interest">Simply Lost Interest</SelectItem>
                                <SelectItem value="changed_mind">Changed My Mind</SelectItem>
                                <SelectItem value="found_elsewhere">Found It Elsewhere</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {lostInterestForm.errors.reason && (
                              <p className="text-sm text-red-500">{lostInterestForm.errors.reason}</p>
                            )}
                          </div>
                          
                          {lostInterestForm.data.reason === 'other' && (
                            <div className="space-y-2">
                              <Label htmlFor={`additional_notes_${request.id}`}>Additional Notes</Label>
                              <textarea
                                id={`additional_notes_${request.id}`}
                                value={lostInterestForm.data.additional_notes}
                                onChange={(e) => lostInterestForm.setData('additional_notes', e.target.value)}
                                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Please provide more details..."
                              />
                              {lostInterestForm.errors.additional_notes && (
                                <p className="text-sm text-red-500">{lostInterestForm.errors.additional_notes}</p>
                              )}
                            </div>
                          )}

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setLostInterestDialogs(prev => ({ ...prev, [request.id]: false }))
                                lostInterestForm.reset()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={lostInterestForm.processing || !lostInterestForm.data.reason}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {lostInterestForm.processing ? 'Submitting...' : 'Confirm Lost Interest'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <BrickWall className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Haven't found what you're looking for? Submit a product request and we'll do our best to add it to our
                store.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className=" text-white px-6 py-3 rounded-lg  transition-colors font-medium"
              >
                Submit Your First Request
              </Button>
            </div>
          )}
        </div>
      </AppLayout>
    </MainLayout>
  )
}
