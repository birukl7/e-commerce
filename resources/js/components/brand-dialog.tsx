"use client"

import type React from "react"
import { useForm } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { XIcon, ImageIcon, UploadIcon } from "lucide-react"
import H2 from "./ui/h2"
import { Button } from "./ui/button"

interface Brand {
  id: number
  name: string
  slug: string
  description: string
  logo: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  action: "create" | "edit"
  brand?: Brand
}

const BrandDialog = ({ isOpen, onClose, action, brand }: Props) => {
  const [logoPreview, setLogoPreview] = useState<string>("")

  const { data, setData, post, processing, errors, reset } = useForm<{
    _method?: "PUT"
    name: string
    slug: string
    description: string
    logo: string | File | null
    is_active: boolean
  }>(
    action === "edit"
      ? {
          _method: "PUT",
          name: brand?.name || "",
          slug: brand?.slug || "",
          description: brand?.description || "",
          logo: brand?.logo || "",
          is_active: brand?.is_active ?? true,
        }
      : {
          name: "",
          slug: "",
          description: "",
          logo: null,
          is_active: true,
        }
  )

  useEffect(() => {
    if (brand?.logo) {
      setLogoPreview(brand.logo)
    }
  }, [brand])

  useEffect(() => {
    if (data.name && action === "create") {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setData("slug", slug)
    }
  }, [data.name, action])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const url = action === "create" ? "/admin/brands" : `/admin/brands/${brand?.id}`

    post(url, {
      onSuccess: () => {
        reset()
        setLogoPreview("")
        onClose()
      },
      onError: (errors) => {
        console.log("Validation errors:", errors)
      },
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        
      }
      reader.readAsDataURL(file)
      setData("logo", file)
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
            <H2 >
              {action === "create" ? "Create Brand" : "Edit Brand"}
            </H2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-2">
                  {logoPreview ? (
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                </div>
              </div>
              {errors.logo && <p className="text-red-600 text-sm mt-1">{errors.logo}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter brand name"
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
                  placeholder="brand-slug"
                />
                {errors.slug && <p className="text-red-600 text-sm mt-1">{errors.slug}</p>}
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
                placeholder="Enter brand description"
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
                className="px-4 py-2  text-white rounded-lg  disabled:opacity-50 transition-colors"
              >
                {processing ? "Saving..." : action === "create" ? "Create Brand" : "Update Brand"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BrandDialog
