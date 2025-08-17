"use client"

import type React from "react"
import { useForm } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { XIcon, ImageIcon, UploadIcon, AlertTriangleIcon } from "lucide-react"
import { Button } from "./ui/button"

interface ProductImage {
  id?: number
  image_path: string
  alt_text?: string
  is_primary?: boolean
  sort_order?: number
  file?: File
}

interface Category {
  id: number
  name: string
}

interface Brand {
  id: number
  name: string
}

interface Product {
  id?: number
  name: string
  slug: string
  description: string
  sku: string
  price: number
  sale_price?: number | null
  cost_price?: number | null
  stock_quantity: number
  manage_stock: boolean
  stock_status: string
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  category_id: number
  brand_id: number
  featured: boolean
  status: string
  meta_title?: string | null
  meta_description?: string | null
  images: ProductImage[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
  action: "create" | "edit"
  product?: Product
  categories: Category[]
  brands: Brand[]
}

const ProductDialog = ({ isOpen, onClose, action, product, categories, brands }: Props) => {
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const { data, setData, post, processing, errors, reset } = useForm<{
    _method?: "PUT",
    name: string
    slug: string
    description: string
    sku: string
    price: number
    sale_price: number | null
    cost_price: number | null
    stock_quantity: number
    manage_stock: boolean
    stock_status: string
    weight: number | null
    length: number | null
    width: number | null
    height: number | null
    category_id: number | ""
    brand_id: number | ""
    featured: boolean
    status: string
    meta_title: string
    meta_description: string
    images: (File | string | null)[]
  }>({
    name: "",
    slug: "",
    description: "",
    sku: "",
    price: 0,
    sale_price: null,
    cost_price: null,
    stock_quantity: 0,
    manage_stock: true,
    stock_status: "in_stock",
    weight: null,
    length: null,
    width: null,
    height: null,
    category_id: "",
    brand_id: "",
    featured: false,
    status: "draft",
    meta_title: "",
    meta_description: "",
    images: [],
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (product && action === "edit") {
        setData({
          _method: "PUT",
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          sku: product.sku || "",
          price: product.price || 0,
          sale_price: product.sale_price ?? null,
          cost_price: product.cost_price ?? null,
          stock_quantity: product.stock_quantity || 0,
          manage_stock: product.manage_stock ?? true,
          stock_status: product.stock_status || "in_stock",
          weight: product.weight ?? null,
          length: product.length ?? null,
          width: product.width ?? null,
          height: product.height ?? null,
          category_id: product.category_id || "",
          brand_id: product.brand_id || "",
          featured: product.featured ?? false,
          status: product.status || "draft",
          meta_title: product.meta_title || "",
          meta_description: product.meta_description || "",
          // Do NOT send existing image path strings to the server on edit.
          // Only send files if the user selects new images. Otherwise leave empty.
          images: [],
        })
        setImagePreviews(product.images?.map(img => `/storage/${img.image_path}`) || [])
      } else if (action === "create") {
        setData({
          name: "",
          slug: "",
          description: "",
          sku: "",
          price: 0,
          sale_price: null,
          cost_price: null,
          stock_quantity: 0,
          manage_stock: true,
          stock_status: "in_stock",
          weight: null,
          length: null,
          width: null,
          height: null,
          category_id: "",
          brand_id: "",
          featured: false,
          status: "draft",
          meta_title: "",
          meta_description: "",
          images: [],
        })
        setImagePreviews([])
      }
    }
  }, [isOpen, product, action, setData])

  useEffect(() => {
    // Generate slug from name only for create mode
    if (data.name && action === "create") {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setData("slug", slug)
    }
  }, [data.name, action, setData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length) {
      // Explicitly set the images in the form data
      setData("images", files)
      
      // Create preview URLs for all selected files
      const previews = files.map(file => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (action === "create") {
      post("/admin/products", {
        onSuccess: () => {
          reset()
          setImagePreviews([])
          onClose()
        },
        onError: (errors) => {
          console.error("Validation errors:", errors)
          // Don't close dialog on validation errors
          // The error summary will show the errors to the user
        },
        forceFormData: true,
      })
    } else {
      post(`/admin/products/${product?.id}`, {
        onSuccess: () => {
          onClose()
        },
        onError: (errors) => {
          console.error("Update validation errors:", errors)
          // Don't close dialog on validation errors
          // The error summary will show the errors to the user
        },
        forceFormData: true,
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {action === "create" ? "Create Product" : "Edit Product"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0">
                    <AlertTriangleIcon className="h-5 w-5 text-red-400" />
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <div className="space-y-4">
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Area */}
                <div className="flex items-center space-x-4">
                  {imagePreviews.length === 0 && (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <UploadIcon className="w-4 h-4 mr-2" />
                      {imagePreviews.length > 0 ? 'Replace Images' : 'Upload Images'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageChange} 
                        className="hidden"
                        name="images"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG, JPG, GIF, WebP up to 2MB each. Maximum 10 images.</p>
                    {imagePreviews.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">{imagePreviews.length} image(s) selected</p>
                    )}
                  </div>
                </div>
              </div>
              {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
            </div>

            {/* Main Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={data.slug}
                  onChange={(e) => setData("slug", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="product-slug"
                />
                {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  id="sku"
                  value={data.sku}
                  onChange={(e) => setData("sku", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Stock Keeping Unit"
                />
                {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku}</p>}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  value={data.price}
                  onChange={(e) => setData("price", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Sale Price */}
              <div>
                <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price
                </label>
                <input
                  type="number"
                  id="sale_price"
                  value={data.sale_price ?? ""}
                  onChange={(e) => setData("sale_price", e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.sale_price && <p className="text-red-600 text-sm mt-1">{errors.sale_price}</p>}
              </div>

              {/* Cost Price */}
              <div>
                <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  id="cost_price"
                  value={data.cost_price ?? ""}
                  onChange={(e) => setData("cost_price", e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.cost_price && <p className="text-red-600 text-sm mt-1">{errors.cost_price}</p>}
              </div>

              {/* Stock Quantity */}
              <div>
                <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock_quantity"
                  value={data.stock_quantity}
                  onChange={(e) => setData("stock_quantity", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="0"
                />
                {errors.stock_quantity && <p className="text-red-600 text-sm mt-1">{errors.stock_quantity}</p>}
              </div>

              {/* Manage Stock */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="manage_stock"
                  checked={data.manage_stock}
                  onChange={(e) => setData("manage_stock", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="manage_stock" className="ml-2 block text-sm text-gray-700">
                  Manage Stock
                </label>
              </div>

              {/* Stock Status */}
              <div>
                <label htmlFor="stock_status" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Status *
                </label>
                <select
                  id="stock_status"
                  value={data.stock_status}
                  onChange={(e) => setData("stock_status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="on_backorder">On Backorder</option>
                </select>
                {errors.stock_status && <p className="text-red-600 text-sm mt-1">{errors.stock_status}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category_id"
                  value={data.category_id}
                  onChange={(e) => setData("category_id", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
              </div>

              {/* Brand */}
              <div>
                <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  id="brand_id"
                  value={data.brand_id}
                  onChange={(e) => setData("brand_id", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brand_id && <p className="text-red-600 text-sm mt-1">{errors.brand_id}</p>}
              </div>

              {/* Featured */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="featured"
                  checked={data.featured}
                  onChange={(e) => setData("featured", e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Product
                </label>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={data.status}
                  onChange={(e) => setData("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* SEO */}
            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                value={data.meta_title}
                onChange={(e) => setData("meta_title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Meta title for SEO"
              />
              {errors.meta_title && <p className="text-red-600 text-sm mt-1">{errors.meta_title}</p>}
            </div>
            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                value={data.meta_description}
                onChange={(e) => setData("meta_description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Meta description for SEO"
              />
              {errors.meta_description && <p className="text-red-600 text-sm mt-1">{errors.meta_description}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className="px-4 py-2  text-white rounded-lg  disabled:opacity-50 transition-colors"
              >
                {processing ? "Saving..." : action === "create" ? "Create Product" : "Update Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductDialog 