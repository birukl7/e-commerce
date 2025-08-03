import { CustomLink } from "@/components/link"
import { Button } from "@/components/ui/button"
import H1 from "@/components/ui/h1"
import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import { ArrowLeftIcon, PencilIcon, TrashIcon, ImageIcon, TagIcon, CalendarIcon, SortAscIcon } from "lucide-react"

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
  category: Category
}

const Show = ({ category }: Props) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AppLayout mainNavItems={[]} footerNavItems={[]}>
      <Head title={`Category: ${category.name}`} />

      <div className=" px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/categories"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Categories
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <H1 >{category.name}</H1>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
                {category.parent && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Sub-category
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <CustomLink
                href={`/admin/categories/${category.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </CustomLink>
              <Button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {category.image ? (
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                    <span className="ml-3 text-gray-500">No image uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{category.description}</p>
            </div>

            {/* Children Categories */}
            {category.children && category.children.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sub-categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/admin/categories/${child.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">/{child.slug}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            child.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {child.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Slug</p>
                    <p className="font-medium">/{category.slug}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <SortAscIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Sort Order</p>
                    <p className="font-medium">{category.sort_order}</p>
                  </div>
                </div>

                {category.parent && (
                  <div className="flex items-center">
                    <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Parent Category</p>
                      <Link
                        href={`/admin/categories/${category.parent.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {category.parent.name}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-sm">{formatDate(category.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-sm">{formatDate(category.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Show
