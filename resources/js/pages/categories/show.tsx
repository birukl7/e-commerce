import { FilterSort } from "@/components/category/filter-sort"
import { ProductGrid } from "@/components/category/product-grid"
import { SubCategoriesSection } from "@/components/category/sub-categories-section"
import H1 from "@/components/ui/h1"
import MainLayout from "@/layouts/app/main-layout"
import { router } from "@inertiajs/react"
// import { router } from "@inertiajs/react"

interface SubCategory {
  id: number
  name: string
  slug: string
  image: string
  product_count: number
}

interface ProductImage {
  id: number
  url: string
  alt_text: string
  is_primary: boolean
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number | null
  current_price: number
  description: string
  image: string
  images: ProductImage[]
  featured: boolean
  stock_status: string
  category?: string
  brand?: string
}

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  subcategories: SubCategory[]
  product_count: number
}

interface Brand {
  id: number
  name: string
}

interface PriceRange {
  min: number
  max: number | null
  label: string
}

interface StockStatus {
  value: string
  label: string
}

interface PriceStats {
  min: number
  max: number
  avg: number
}

interface Filters {
  brands: Brand[]
  price_ranges: PriceRange[]
  stock_statuses: StockStatus[]
  price_stats: PriceStats
}

interface SortOption {
  value: string
  label: string
}

interface CurrentFilters {
  brand?: string
  min_price?: string
  max_price?: string
  sort_by: string
  stock_status?: string
  featured?: string
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface ShowProps {
  category: Category
  products: Product[]
  pagination: Pagination
  filters: Filters
  currentFilters: CurrentFilters
  sortOptions: SortOption[]
}

const Show = ({ category, products, pagination, filters, currentFilters, sortOptions }: ShowProps) => {
  return (
    <MainLayout title={category.name} className="">
      <>
        {/* Header Section */}
        <div className="text-center py-8 px-4">
          <H1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</H1>
          <p className="text-gray-600 text-lg">{category.description}</p>
          <p className="mt-2 text-sm text-gray-500">
            {pagination.total > 0
              ? `Showing ${pagination.from}-${pagination.to} of ${pagination.total} products`
              : "No products found"}
          </p>
        </div>

        {/* Sub-categories Section */}
        <SubCategoriesSection subcategories={category.subcategories} />

        {/* Filter and Sort Section */}
        <FilterSort
          filters={filters}
          currentFilters={currentFilters}
          sortOptions={sortOptions}
          totalProducts={pagination.total}
        />
        

        {/* Product Grid */}
        <ProductGrid products={products} />

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center gap-2">
              {pagination.current_page > 1 && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)
                    params.set("page", (pagination.current_page - 1).toString())
                    router.get(`${window.location.pathname}?${params.toString()}`)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}

              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.current_page} of {pagination.last_page}
              </span>

              {pagination.current_page < pagination.last_page && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)
                    params.set("page", (pagination.current_page + 1).toString())
                    router.get(`${window.location.pathname}?${params.toString()}`)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        {/* No Results */}
        {products.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </>
    </MainLayout>
  )
}

export default Show
