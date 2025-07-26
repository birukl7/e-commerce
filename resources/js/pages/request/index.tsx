import type React from "react"

import { useState } from "react"
import { useForm } from "@inertiajs/react"
import H2 from "@/components/ui/h2"
import MainLayout from "@/layouts/app/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, CheckCircle, Home } from "lucide-react"

const Index = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm({
    product_name: "",
    description: "",
    image: null as File | null,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData("image", file)

      // Create preview
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
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    post("/request", {
      onSuccess: () => {
        setIsSubmitted(true)
        reset()
        setImagePreview(null)
      },
    })
  }

  const handleBackToHome = () => {
    window.location.href = "/" // or use Inertia.visit('/')
  }

  if (isSubmitted) {
    return (
      <MainLayout title={"Request a feature"} className={""}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
          <div className="max-w-2xl mx-auto w-full">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-green-100 p-6 rounded-full">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    <H2 className="text-3xl font-bold text-green-800">Request Submitted Successfully!</H2>
                    <p className="text-lg text-gray-600 max-w-md text-center">
                      Thank you for your product request. We'll review it carefully and get back to you soon.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg w-full max-w-md">
                    <p className="text-sm text-gray-500 mb-2 text-left">What happens next?</p>
                    <ul className="text-sm text-gray-700 space-y-1 text-left">
                      <li>• Our team will review your request</li>
                      <li>• We'll evaluate feasibility and impact</li>
                      <li>• You'll receive updates via email</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleBackToHome}
                    className="mt-6 h-12 px-8 text-base shadow-lg"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title={"Request a feature"} className={""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <H2 className="text-3xl font-bold text-gray-900 mb-4">Request a New Product Feature</H2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have an idea for a new product or feature? We'd love to hear from you! Share your vision and help us build
              something amazing together.
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
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
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Product Image</span>
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

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset()
                      setImagePreview(null)
                    }}
                    disabled={processing}
                    className="h-12 px-8 text-base"
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 px-8 text-base shadow-lg"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
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

export default Index
