"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, Link, router } from "@inertiajs/react"
import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ImageIcon } from "lucide-react"
import CategoryDialog from "@/components/category-dialog"
import BrandDialog from "@/components/brand-dialog"
import ConfirmationDialog from "@/components/confirmation-dialog"
import H1 from "@/components/ui/h1"
import H2 from "@/components/ui/h2"
import H3 from "@/components/ui/h3"
import { adminNavItems } from "../dashboard"
import { Button } from "@/components/ui/button"

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
  categories: Category[]
  brands: Brand[]
}

const Index = ({ categories = [], brands = [] }: Props) => {
  const [activeTab, setActiveTab] = useState<"categories" | "brands">("categories")

  const [dialogState, setDialogState] = useState<{
    type: "category" | "brand" | null
    action: "create" | "edit" | null
    data?: Category | Brand | null
  }>({
    type: null,
    action: null,
    data: null,
  })

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: "category" | "brand"
    id: number
    name: string
  } | null>(null)

  const openDialog = (type: "category" | "brand", action: "create" | "edit", data?: Category | Brand) => {
    setDialogState({ type, action, data: data || null })
  }

  const closeDialog = () => {
    setDialogState({ type: null, action: null, data: null })
  }

  const handleDelete = (type: "category" | "brand", id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      id,
      name,
    })
  }

  const confirmDelete = () => {
    if (confirmDialog) {
      router.delete(`/admin/${confirmDialog.type === "category" ? "categories" : "brands"}/${confirmDialog.id}`)
      setConfirmDialog(null)
    }
  }

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        {category.image ? (
          <img src={`/storage/${category.image}`} alt={category.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {category.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <H3>{category.name}</H3>
          {category.parent && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Sub-category</span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
        {category.parent && (
          <p className="text-xs text-gray-500 mb-3">
            Parent: <span className="font-medium">{category.parent.name}</span>
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Sort: {category.sort_order}</span>
          <div className="flex space-x-1">
            <Link
              href={`/admin/categories/${category.id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="View"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={() => openDialog("category", "edit", category)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete("category", category.id, category.name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const BrandCard = ({ brand }: { brand: Brand }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative p-4">
        {brand.logo ? (
          <img src={`/storage/${brand.logo}`} alt={brand.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              brand.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {brand.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <H3>{brand.name}</H3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{brand.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">/{brand.slug}</span>
          <div className="flex space-x-1">
            <Link
              href={`/admin/brands/${brand.id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="View"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={() => openDialog("brand", "edit", brand)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete("brand", brand.id, brand.name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AppLayout mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Categories & Brands Management" />

      <div className=" px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <H1 className="text-3xl font-bold text-gray-900">Categories & Brands</H1>
          <p className="text-gray-600 mt-2">Manage your e-commerce categories and brands</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "brands"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Brands ({brands.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <H2>Categories</H2>
              <Button
                onClick={() => openDialog("category", "create")}
                className="inline-flex items-center px-4 py-2  text-white rounded-lg  transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <H3>No categories found</H3>
                <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
                <Button
                  onClick={() => openDialog("category", "create")}
                  className="inline-flex items-center px-4 py-2  text-white rounded-lg  transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "brands" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <H2>Brands</H2>
              <Button
                onClick={() => openDialog("brand", "create")}
                className="inline-flex items-center px-4 py-2  text-white rounded-lg  transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            </div>

            {brands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <H3>No brands found</H3>
                <p className="text-gray-600 mb-4">Get started by creating your first brand.</p>
                <button
                  onClick={() => openDialog("brand", "create")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Brand
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {dialogState.type === "category" && (
        <CategoryDialog
          isOpen={true}
          onClose={closeDialog}
          action={dialogState.action!}
          category={dialogState.data as Category}
          categories={categories}
        />
      )}

      {dialogState.type === "brand" && (
        <BrandDialog
          isOpen={true}
          onClose={closeDialog}
          action={dialogState.action!}
          brand={dialogState.data as Brand}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDelete}
          title={`Delete ${confirmDialog.type === "category" ? "Category" : "Brand"}`}
          description={`Are you sure you want to delete "${confirmDialog.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </AppLayout>
  )
}

export default Index
