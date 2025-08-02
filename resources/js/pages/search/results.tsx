"use client"
import { ProductGrid } from "@/components/category/product-grid"
import H1 from "@/components/ui/h1"
import MainLayout from "@/layouts/app/main-layout"
import { Search, Filter, X } from "lucide-react"
import { router } from "@inertiajs/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

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

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface Suggestion {
  text: string
  type: "product" | "category" | "brand"
}

interface Category {
  id: number
  name: string
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

interface Filters {
  categories: Category[]
  brands: Brand[]
  price_ranges: PriceRange[]
}

interface ActiveFilters {
  total_results: number
  in_stock: number
  on_sale: number
  featured: number
}

interface SortOption {
  value: string
  label: string
}

interface CurrentFilters {
  category?: string
  brand?: string
  min_price?: string
  max_price?: string
  sort_by: string
}

interface SearchResultsProps {
  products: Product[]
  pagination: Pagination
  suggestions: Suggestion[]
  filters: Filters
  active_filters: ActiveFilters
  sort_options: SortOption[]
  query: string
  currentFilters: CurrentFilters
}

const SearchResults = ({
  products,
  pagination,
  suggestions,
  filters,
  active_filters,
  sort_options,
  query,
  currentFilters,
}: SearchResultsProps) => {
  const [showFilters, setShowFilters] = useState(false)

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("sort_by", sortValue)

    router.get(
      `/search?${params.toString()}`,
      {},
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(window.location.search)

    if (value) {
      params.set(filterType, value)
    } else {
      params.delete(filterType)
    }

    router.get(
      `/search?${params.toString()}`,
      {},
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const clearFilter = (filterType: string) => {
    handleFilterChange(filterType, "")
  }

  const clearAllFilters = () => {
    router.get(
      `/search?q=${encodeURIComponent(query)}`,
      {},
      {
        preserveState: true,
        preserveScroll: true,
      },
    )
  }

  const hasActiveFilters =
    currentFilters.category || currentFilters.brand || currentFilters.min_price || currentFilters.max_price

  return (
    <MainLayout title={`Search Results for "${query}"`} className="" showBackButton>
      <>
        {/* Search Header */}
        <div className="bg-gray-50 border-b">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-6 w-6 text-gray-400" />
              <H1 className="text-2xl font-bold text-gray-900">
                {query ? `Search Results for "${query}"` : "Search Results"}
              </H1>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {pagination.total > 0 ? (
                  <>
                    Showing {pagination.from}-{pagination.to} of {pagination.total} results
                    {query && ` for "${query}"`}
                  </>
                ) : (
                  <>No results found{query && ` for "${query}"`}</>
                )}
              </p>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="bg-white border-b">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>

                {currentFilters.category && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>
                      Category: {filters.categories.find((c) => c.id.toString() === currentFilters.category)?.name}
                    </span>
                    <Button onClick={() => clearFilter("category")} className="ml-1">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {currentFilters.brand && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <span>Brand: {filters.brands.find((b) => b.id.toString() === currentFilters.brand)?.name}</span>
                    <button onClick={() => clearFilter("brand")} className="ml-1 hover:text-green-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {(currentFilters.min_price || currentFilters.max_price) && (
                  <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <span>
                      Price: {currentFilters.min_price && `$${currentFilters.min_price}`}
                      {currentFilters.min_price && currentFilters.max_price && " - "}
                      {currentFilters.max_price && `$${currentFilters.max_price}`}
                    </span>
                    <button
                      onClick={() => {
                        clearFilter("min_price")
                        clearFilter("max_price")
                      }}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  Clear all
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}>
              <div className="bg-white rounded-lg border p-6 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={currentFilters.sort_by}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sort_options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                {filters.categories.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={currentFilters.category || ""}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {filters.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Brands */}
                {filters.brands.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <select
                      value={currentFilters.brand || ""}
                      onChange={(e) => handleFilterChange("brand", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Brands</option>
                      {filters.brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Ranges */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="space-y-2">
                    {filters.price_ranges.map((range, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          name="price_range"
                          value={`${range.min}-${range.max || ""}`}
                          checked={
                            currentFilters.min_price === range.min.toString() &&
                            (range.max ? currentFilters.max_price === range.max.toString() : !currentFilters.max_price)
                          }
                          onChange={() => {
                            handleFilterChange("min_price", range.min.toString())
                            handleFilterChange("max_price", range.max ? range.max.toString() : "")
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Stats</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>In Stock: {active_filters.in_stock}</div>
                    <div>On Sale: {active_filters.on_sale}</div>
                    <div>Featured: {active_filters.featured}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Related Suggestions:</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => router.get(`/search?q=${encodeURIComponent(suggestion.text)}`)}
                        className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        {suggestion.text}
                        <span className="ml-1 text-xs text-blue-500">({suggestion.type})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <ProductGrid products={products} />

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    {pagination.current_page > 1 && (
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(window.location.search)
                          params.set("page", (pagination.current_page - 1).toString())
                          router.get(`/search?${params.toString()}`)
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
                          router.get(`/search?${params.toString()}`)
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
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {query
                      ? `We couldn't find any products matching "${query}". Try adjusting your search or filters.`
                      : "Try adjusting your filters to see more results."}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearAllFilters}
                      className="inline-flex items-center px-4 py-2  text-white rounded-md  transition-colors"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </MainLayout>
  )
}

export default SearchResults
