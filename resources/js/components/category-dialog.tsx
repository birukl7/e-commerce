"use client"

import type React from "react"

import { useForm } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { XIcon, ImageIcon, UploadIcon } from "lucide-react"
import H2 from "./ui/h2"
import { Button } from "./ui/button"

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  parent_id: number | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  parent?: Category
  children?: Category[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
  action: "create" | "edit"
  category?: Category
  categories: Category[]
}

const CategoryDialog = ({ isOpen, onClose, action, category, categories }: Props) => {
  const [imagePreview, setImagePreview] = useState<string>("")

  const { data, setData, post, processing, errors, reset } = useForm<{
    _method?: 'PUT',
    name: string
    slug: string
    description: string
    image: string | File | null
    parent_id: string | number | null
    sort_order: number
    is_active: boolean
  }>(action === 'edit'
    ? {
        _method: 'PUT',
        name: category?.name || '',
        slug: category?.slug || '',
        description: category?.description || '',
        image: category?.image || null,
        parent_id: category?.parent_id?.toString() || '',
        sort_order: category?.sort_order || 0,
        is_active: category?.is_active ?? true,
      }
    : {
        name: '',
        slug: '',
        description: '',
        image: null,
        parent_id: '',
        sort_order: 0,
        is_active: true,
      }
  )
  

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (category && action === "edit") {
        // Set all form data when editing
        setData({
          _method: 'PUT',
          name: category.name || "",
          slug: category.slug || "",
          description: category.description || "",
          image: category.image || null,
          parent_id: category.parent_id?.toString() || "",
          sort_order: category.sort_order || 0,
          is_active: category.is_active ?? true,
        })
        setImagePreview(category.image || "")
      } else if (action === "create") {
        // Reset form for create mode
        setData({
          name: "",
          slug: "",
          description: "",
          image: null,
          parent_id: "",
          sort_order: 0,
          is_active: true,
        })
        setImagePreview("")
      }
    }
  }, [isOpen, category, action, setData])

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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  
    if (action === "edit") {
      setData((prev) => ({
        ...prev,
        _method: "PUT",
      }))
  
      // Delay the post until after _method is set
      setTimeout(() => {
        post(`/admin/categories/${category?.id}`, {
          onSuccess: () => {
            onClose()
          },
          onError: (errors) => {
            console.log("Validation errors:", errors)
          },
        })
      }, 0)
    } else {
      post("/admin/categories", {
        onSuccess: () => {
          reset()
          setImagePreview("")
          onClose()
        },
        onError: (errors) => {
          console.log("Validation errors:", errors)
        },
      })
    }
  }
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
      setData("image", file) // Now TypeScript won't complain
    }
  }

  if (!isOpen) return null

  // Filter out current category and its children from parent options
  const parentOptions = categories.filter((cat) => {
    if (action === "edit" && category) {
      return cat.id !== category.id && cat.parent_id !== category.id
    }
    return true
  })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <H2>
              {action === "create" ? "Create Category" : "Edit Category"}
            </H2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={
                        imagePreview.startsWith("data:") || imagePreview.startsWith("blob:")
                          ? imagePreview
                          : `/storage/${imagePreview}`
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
              {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
            </div>

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
                  placeholder="Enter category name"
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
                  placeholder="category-slug"
                />
                {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
              </div>

              {/* Parent Category */}
              <div>
                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  id="parent_id"
                  value={data.parent_id ?? ""}
                  onChange={(e) => setData("parent_id", e.target.value === "" ? null : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No Parent (Root Category)</option>
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.parent_id && <p className="text-red-600 text-sm mt-1">{errors.parent_id}</p>}
              </div>

              {/* Sort Order */}
              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sort_order"
                  value={data.sort_order}
                  onChange={(e) => setData("sort_order", Number.parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                {errors.sort_order && <p className="text-red-600 text-sm mt-1">{errors.sort_order}</p>}
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
                placeholder="Enter category description"
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={data.is_active}
                onChange={(e) => setData("is_active", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={processing}
                className="px-4 py-2  text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {processing ? "Saving..." : action === "create" ? "Create Category" : "Update Category"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CategoryDialog
