"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Loader2 } from "lucide-react"
import { Category } from "@/types"


interface CategoryDropdownProps {
  onCategorySelect?: (category: Category) => void
}

export function CategoryDropdown({
  onCategorySelect,
}: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`api/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Transform flat categories into hierarchical structure
      const hierarchicalCategories = buildCategoryHierarchy(data.data || data)
      setCategories(hierarchicalCategories)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const buildCategoryHierarchy = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>()
    const rootCategories: Category[] = []

    // First pass: create map of all categories
    flatCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, subcategories: [] })
    })

    // Second pass: build hierarchy
    flatCategories.forEach((category) => {
      const categoryWithSubs = categoryMap.get(category.id)!

      if (category.parent_id === null) {
        rootCategories.push(categoryWithSubs)
      } else {
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.subcategories = parent.subcategories || []
          parent.subcategories.push(categoryWithSubs)
        }
      }
    })

    // Sort categories by sort_order
    const sortCategories = (cats: Category[]) => {
      cats.sort((a, b) => a.sort_order - b.sort_order)
      cats.forEach((cat) => {
        if (cat.subcategories && cat.subcategories.length > 0) {
          sortCategories(cat.subcategories)
        }
      })
    }

    sortCategories(rootCategories)
    return rootCategories.filter((cat) => cat.is_active)
  }

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category)
  }

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    //return `/api/storage/${imagePath}`
    return `image/${imagePath}`
  }

  if (loading) {
    return (
      <Button variant="outline" className="border-black bg-transparent" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (error) {
    return (
      <Button variant="outline" className="border-red-500 text-red-500 bg-transparent" onClick={fetchCategories}>
        <Menu className="mr-2" />
        Retry
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-black cursor-pointer bg-transparent">
          <Menu className="mr-2" />
          Categories
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Select Category</DropdownMenuLabel>
        <DropdownMenuGroup>
          {categories.map((category) => (
            <div key={category.id}>
              {category.subcategories && category.subcategories.length > 0 ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(category.image) || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=40&width=40&text=${category.name}`
                        }}
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-gray-500">{category.product_count || 0} products</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-60">
                      {category.subcategories.map((sub) => (
                        <DropdownMenuItem
                          key={sub.id}
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => handleCategoryClick(sub)}
                        >
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={getImageUrl(sub.image) || "/placeholder.svg"}
                              alt={sub.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `/placeholder.svg?height=32&width=32&text=${sub.name}`
                              }}
                            />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{sub.name}</span>
                            <span className="text-xs text-gray-500">{sub.product_count || 0} products</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(category.image) || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=40&width=40&text=${category.name}`
                      }}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-gray-500">{category.product_count || 0} products</span>
                  </div>
                </DropdownMenuItem>
              )}
            </div>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
