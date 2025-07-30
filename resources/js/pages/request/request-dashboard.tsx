"use client"
import AppLayout from "@/layouts/app-layout"
import type React from "react"

import MainLayout from "@/layouts/app/main-layout"
import type { NavItem, BreadcrumbItem } from "@/types"
import { BrickWall, ListOrdered, Save, Plus, Clock, CheckCircle, XCircle, Eye, Upload, X, LayoutDashboard } from "lucide-react"
import { useForm } from "@inertiajs/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ProductRequest {
  id: number
  product_name: string
  description: string
  status: string
  image?: string | null
  created_at: string
  admin_response?: string
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

export default function RequestDashboard({ requests }: RequestProps) {
  const [showForm, setShowForm] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    product_name: "",
    description: "",
    image: null as File | null,
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
    post("/user-request", {
      onSuccess: () => {
        reset()
        setImagePreview(null)
        setShowForm(false)
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
            <Button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2  text-white px-4 py-2 rounded-lg  transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>

          {/* Request Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Submit Product Request</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe the product you're looking for, including specifications, brand preferences, etc."
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

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={processing}
                    className=" text-white px-6 py-2 rounded-lg  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

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
                      </div>
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                        <span>Request ID: #{request.id}</span>
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

                  {request.admin_response && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Admin Response:</h4>
                      <p className="text-gray-700">{request.admin_response}</p>
                    </div>
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
