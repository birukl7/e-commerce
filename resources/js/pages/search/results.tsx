"use client"

import { Head, Link, usePage } from "@inertiajs/react"
import { useForm } from "@inertiajs/react"
import { ProductCard } from "@/components/category/product-card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import MainLayout from "@/layouts/app/main-layout"
import { useState, useEffect } from "react"

interface SearchResultsProps {
  query: string
  products: any[]
  pagination: any
  filters: any
  activeFilters: any
  sortOptions: any[]
  currentFilters: any
}

// Update the form data interface
interface FormData {
  [key: string]: string | number
  q: string
  category: string
  brand: string
  min_price: string
  max_price: string
  sort_by: string
  page: number
}

export default function SearchResults({
  query,
  products,
  pagination,
  filters,
  activeFilters,
  sortOptions,
  currentFilters,
}: SearchResultsProps) {
  const { url } = usePage()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([currentFilters?.min_price || 0, currentFilters?.max_price || 1000])

  // Update the useForm call with proper typing
  const { data, setData, get, processing } = useForm<FormData>({
    q: query,
    category: currentFilters?.category || "",
    brand: currentFilters?.brand || "",
    min_price: currentFilters?.min_price || "",
    max_price: currentFilters?.max_price || "",
    sort_by: currentFilters?.sort_by || "relevance",
    page: 1,
  })

  // Update form data when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setData({
      q: query,
      category: urlParams.get("category") || "",
      brand: urlParams.get("brand") || "",
      min_price: urlParams.get("min_price") || "",
      max_price: urlParams.get("max_price") || "",
      sort_by: urlParams.get("sort_by") || "relevance",
      page: 1,
    })
  }, [url, query])

  // Fix the handleFilterChange function
  const handleFilterChange = (key: keyof FormData, value: any) => {
    const newData = { ...data, [key]: value, page: 1 }

    // Remove empty values to clean up URL
    Object.keys(newData).forEach((k) => {
      if (newData[k] === "" || newData[k] === null || newData[k] === undefined) {
        delete newData[k]
      }
    })

    setData(newData)

    get("/search", {
      preserveState: true,
      preserveScroll: true,
      only: ["products", "pagination", "activeFilters", "currentFilters"],
    })
  }

  const handleSortChange = (sortValue: string) => {
    handleFilterChange("sort_by", sortValue)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
  }

  // Fix the applyPriceFilter function
  const applyPriceFilter = () => {
    const newData: FormData = {
      ...data,
      min_price: priceRange[0] > 0 ? priceRange[0].toString() : "",
      max_price: priceRange[1] < 1000 ? priceRange[1].toString() : "",
      page: 1,
    }

    setData(newData)
    get("/search", {
      preserveState: true,
      preserveScroll: true,
      only: ["products", "pagination", "activeFilters", "currentFilters"],
    })
  }

  // Fix the clearFilters function
  const clearFilters = () => {
    setPriceRange([0, 1000])

    const resetData = {q: query} as FormData
    setData(resetData)
    get("/search",{
      preserveState: true,
      preserveScroll: true,
    })
  }

  // Fix the handlePageChange function
  const handlePageChange = (page: number) => {
    setData({...data, page})
    get(
      "/search",
      {
        preserveState: true,
        preserveScroll: false,
        only: ["products", "pagination"],
      },
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (data.category) count++
    if (data.brand) count++
    if (data.min_price || data.max_price) count++
    return count
  }

  return (
    <MainLayout title={`Search Results for "${query}"`}  className="bg-gray-50">
      <Head title={`Search Results for "${query}"`} />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Search Results for "{query}"</h1>
              <div className="text-sm text-gray-600">{pagination.total} results found</div>
            </div>

            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>Search Results</span>
            </nav>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </span>
                  {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {/* Filter Content */}
              <div className={`bg-white rounded-lg p-6 space-y-6 ${isFilterOpen ? "block" : "hidden lg:block"}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {getActiveFilterCount() > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} disabled={processing}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <select
                    value={data.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={processing}
                  >
                    <option value="">All Categories</option>
                    {filters.categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <h3 className="font-medium mb-3">Brand</h3>
                  <select
                    value={data.brand}
                    onChange={(e) => handleFilterChange("brand", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={processing}
                  >
                    <option value="">All Brands</option>
                    {filters.brands.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceRangeChange}
                        max={1000}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Button onClick={applyPriceFilter} size="sm" className="w-full" disabled={processing}>
                      Apply Price Filter
                    </Button>
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="font-medium mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    {filters.price_ranges.map((range: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPriceRange([range.min, range.max || 1000])
                          handleFilterChange("min_price", range.min > 0 ? range.min : "")
                          handleFilterChange("max_price", range.max ? range.max : "")
                        }}
                        className="block w-full text-left text-sm py-2 px-3 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={processing}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {pagination.from}-{pagination.to} of {pagination.total} results
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      value={data.sort_by}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md"
                      disabled={processing}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {processing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading...</p>
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {products.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1 || processing}
                        >
                          Previous
                        </Button>

                        {[...Array(pagination.last_page)].map((_, index) => {
                          const page = index + 1
                          const isCurrentPage = page === pagination.current_page
                          const showPage =
                            page === 1 || page === pagination.last_page || Math.abs(page - pagination.current_page) <= 2

                          if (!showPage) {
                            if (page === pagination.current_page - 3 || page === pagination.current_page + 3) {
                              return (
                                <span key={page} className="px-2">
                                  ...
                                </span>
                              )
                            }
                            return null
                          }

                          return (
                            <Button
                              key={page}
                              variant={isCurrentPage ? "default" : "outline"}
                              onClick={() => handlePageChange(page)}
                              size="sm"
                              disabled={processing}
                            >
                              {page}
                            </Button>
                          )
                        })}

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page || processing}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearFilters} disabled={processing}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
