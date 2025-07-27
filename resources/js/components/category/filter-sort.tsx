"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal, Info, X, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { router, usePage } from "@inertiajs/react"
import { createPortal } from "react-dom"

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

interface FilterSortProps {
  filters: Filters
  currentFilters: CurrentFilters
  sortOptions: SortOption[]
  totalProducts: number
}

// Helper function to format Ethiopian Birr
const formatETB = (amount: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function FilterSort({ filters, currentFilters, sortOptions, totalProducts }: FilterSortProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { url } = usePage()

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [url])

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false)
      }
    }

    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleEscape)
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isDrawerOpen])

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("sort_by", sortValue)

    router.get(
      `${window.location.pathname}?${params.toString()}`,
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

    // Reset to first page when filters change
    params.delete("page")

    router.get(
      `${window.location.pathname}?${params.toString()}`,
      {},
      {
        preserveState: true,
        preserveScroll: false,
      },
    )
  }

  const handlePriceRangeChange = (min: number, max: number | null) => {
    const params = new URLSearchParams(window.location.search)

    params.set("min_price", min.toString())
    if (max) {
      params.set("max_price", max.toString())
    } else {
      params.delete("max_price")
    }

    params.delete("page")

    router.get(
      `${window.location.pathname}?${params.toString()}`,
      {},
      {
        preserveState: true,
        preserveScroll: false,
      },
    )
  }

  const clearFilter = (filterType: string) => {
    handleFilterChange(filterType, "")
  }

  const clearAllFilters = () => {
    router.get(
      window.location.pathname,
      {},
      {
        preserveState: true,
        preserveScroll: false,
      },
    )
  }

  const hasActiveFilters =
    currentFilters.brand ||
    currentFilters.min_price ||
    currentFilters.max_price ||
    currentFilters.stock_status ||
    currentFilters.featured

  const getActiveFilterCount = () => {
    let count = 0
    if (currentFilters.brand) count++
    if (currentFilters.min_price || currentFilters.max_price) count++
    if (currentFilters.stock_status) count++
    if (currentFilters.featured) count++
    return count
  }

  // Filter drawer component
  const FilterDrawer = () => (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 50 }}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 51 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h2 id="filter-drawer-title" className="text-lg font-semibold">
                Filters
              </h2>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {/* Price Range Info */}
            {filters.price_stats && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range in this Category</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Min: {formatETB(filters.price_stats.min)}</div>
                  <div>Max: {formatETB(filters.price_stats.max)}</div>
                  <div>Avg: {formatETB(filters.price_stats.avg)}</div>
                </div>
              </div>
            )}

            {/* Brand Filter */}
            {filters.brands.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
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

            {/* Dynamic Price Range Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-2">
                {filters.price_ranges.map((range, index) => (
                  <label key={index} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="price_range"
                      value={`${range.min}-${range.max || ""}`}
                      checked={
                        currentFilters.min_price === range.min.toString() &&
                        (range.max ? currentFilters.max_price === range.max.toString() : !currentFilters.max_price)
                      }
                      onChange={() => handlePriceRangeChange(range.min, range.max)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock Status Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
              <select
                value={currentFilters.stock_status || ""}
                onChange={(e) => handleFilterChange("stock_status", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Items</option>
                {filters.stock_statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={currentFilters.featured === "1"}
                  onChange={(e) => handleFilterChange("featured", e.target.checked ? "1" : "")}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Featured Products Only</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 space-y-3 bg-white">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
                Clear All Filters
              </Button>
            )}
            <Button onClick={() => setIsDrawerOpen(false)} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="rounded-full bg-transparent relative"
            onClick={() => setIsDrawerOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            All Filters
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>{totalProducts}+ items</span>
              <Info className="w-4 h-4 ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Sort by:</span>
              <Select value={currentFilters.sort_by} onValueChange={handleSortChange}>
                <SelectTrigger className="w-40 border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>

            {currentFilters.brand && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>Brand: {filters.brands.find((b) => b.id.toString() === currentFilters.brand)?.name}</span>
                <button onClick={() => clearFilter("brand")} className="ml-1 hover:text-blue-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {(currentFilters.min_price || currentFilters.max_price) && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Price: {currentFilters.min_price && `${formatETB(Number.parseFloat(currentFilters.min_price))}`}
                  {currentFilters.min_price && currentFilters.max_price && " - "}
                  {currentFilters.max_price && `${formatETB(Number.parseFloat(currentFilters.max_price))}`}
                </span>
                <button
                  onClick={() => {
                    clearFilter("min_price")
                    clearFilter("max_price")
                  }}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {currentFilters.stock_status && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                <span>
                  Status: {filters.stock_statuses.find((s) => s.value === currentFilters.stock_status)?.label}
                </span>
                <button onClick={() => clearFilter("stock_status")} className="ml-1 hover:text-purple-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {currentFilters.featured && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <span>Featured Only</span>
                <button onClick={() => clearFilter("featured")} className="ml-1 hover:text-yellow-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Render drawer using portal to document.body */}
      {mounted && isDrawerOpen && createPortal(<FilterDrawer />, document.body)}
    </>
  )
}
