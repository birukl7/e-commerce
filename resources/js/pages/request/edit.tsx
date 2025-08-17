import type React from "react"

import { useState } from "react"
import { useForm, Head, Link } from "@inertiajs/react"
import H2 from "@/components/ui/h2"
import MainLayout from "@/layouts/app/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, ArrowLeft } from "lucide-react"

interface ProductRequest {
  id: number
  product_name: string
  description: string
  image?: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  admin_response?: string
  created_at: string
}

interface Props {
  request: ProductRequest
}

const EditRequest = ({ request }: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    request.image ? `/storage/${request.image}` : null
  )
  const [removeImage, setRemoveImage] = useState(false)

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    product_name: request.product_name,
    description: request.description,
    image: null as File | null,
    remove_image: false,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData("image", file)
      setRemoveImage(false)
      setData("remove_image", false)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setData("image", null)
    setImagePreview(null)
    setRemoveImage(true)
    setData("remove_image", true)
    
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Debug: Log form data before submission
    console.log('Form data before submission:', data)
    
    post(route('request.update', request.id), {
      forceFormData: true,
      onError: (errors) => {
        console.error('Validation errors:', errors)
      },
      onSuccess: () => {
        console.log('Request updated successfully')
      }
    })
  }

  return (
    <MainLayout title={"Edit Request"} className={""}>
      <Head title="Edit Product Request" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link 
              href={route('request.index')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Requests
            </Link>
          </div>

          <div className="text-center mb-8">
            <H2 className="text-3xl font-bold text-gray-900 mb-4">Edit Product Request</H2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Update your product request details. Note: You can only edit pending requests.
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </h3>
                    </div>
                  </div>
                  <div className="ml-8">
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>
                          <strong>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Product Name Field */}
                    <div className="space-y-3">
                      <Label htmlFor="product_name" className="text-base font-semibold text-gray-700">
                        Product Name *
                      </Label>
                      <Input
                        id="product_name"
                        type="text"
                        value={data.product_name}
                        onChange={(e) => setData("product_name", e.target.value)}
                        placeholder="Enter the product name"
                        className={`h-12 text-base ${errors.product_name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                      />
                      {errors.product_name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          {errors.product_name}
                        </p>
                      )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        rows={24}
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Describe your product idea in detail. What problem does it solve? Who would use it? What features should it have?"
                        className={`text-base resize-none ${errors.description ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700">Product Image (Optional)</Label>
                    <div className="h-full min-h-[300px]">
                      {!imagePreview ? (
                        <div className="h-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-all duration-200 cursor-pointer group">
                          <Label
                            htmlFor="image"
                            className="cursor-pointer h-full flex flex-col items-center justify-center p-8"
                          >
                            <div className="bg-blue-50 p-4 rounded-full group-hover:bg-blue-100 transition-colors">
                              <Upload className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="mt-4 text-center">
                              <span className="text-lg font-medium text-gray-900 block">Upload an image</span>
                              <span className="text-sm text-gray-500 mt-1 block">Drag and drop or click to browse</span>
                              <span className="text-xs text-gray-400 mt-2 block">PNG, JPG, GIF up to 10MB</span>
                            </div>
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="relative h-full min-h-[300px] group">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Product preview"
                            className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-3 right-3 opacity-80 hover:opacity-100 shadow-lg"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Product Image</span>
                          </div>
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image')?.click()}
                            >
                              Change Image
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.image && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="h-4 w-4" />
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Response (if any) */}
                {request.admin_response && (
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-2">Admin Response:</h3>
                    <p className="text-gray-600">{request.admin_response}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                  <Link href={route('request.index')}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={processing}
                      className="h-12 px-8 text-base w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 px-8 text-base shadow-lg w-full sm:w-auto"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Request"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default EditRequest
