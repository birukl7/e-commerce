import type React from "react"
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
import { CustomLink } from "../link"


interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  parent_id: number | null
  sort_order: number
  is_active: boolean
  product_count: number
  children?: Category[]
}

interface CategoryDropdownProps {
  onCategorySelect?: (category: Category) => void
}

export function CategoryDropdown({ onCategorySelect }: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Starting fetch request to /api/categories")

      let response = await fetch("/api/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      if (!response.ok) {
        console.log("Main endpoint failed, trying tree endpoint")
        response = await fetch("/api/categories/tree", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        })
      }

      console.log("Response status:", response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error text:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      console.log("Raw response text:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("Server returned invalid JSON")
      }

      console.log("Parsed API Response:", result)

      let categoriesData: Category[] = []
      if (result.success && result.data) {
        categoriesData = result.data
      } else if (Array.isArray(result)) {
        categoriesData = result
      } else if (result.data && Array.isArray(result.data)) {
        categoriesData = result.data
      } else {
        throw new Error("Unexpected response structure from server")
      }

      setCategories(categoriesData)
    } catch (err) {
      console.error("Detailed error in fetchCategories:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      return "/placeholder.svg?height=40&width=40"
    }
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    return imagePath
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, categoryName: string, size: string) => {
    const target = e.target as HTMLImageElement
    if (target.src.includes("placeholder.svg")) {
      return
    }
    target.src = `/placeholder.svg?height=${size}&width=${size}`
  }

  const handleMouseEnter = () => {
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsOpen(false)
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
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="border-red-500 text-red-500 bg-transparent" onClick={fetchCategories}>
          <Menu className="mr-2" />
          Retry
        </Button>
        <div className="text-xs text-red-500 max-w-xs break-words">Error: {error}</div>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Button variant="outline" className="border-gray-400 text-gray-400 bg-transparent" disabled>
        <Menu className="mr-2" />
        No Categories
      </Button>
    )
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer bg-transparent">
            <Menu className="mr-2" />
            Categories ({categories.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Select Category</DropdownMenuLabel>
          <DropdownMenuGroup>
            {categories.map((category) => (
              <div key={category.id}>
                {category.children && category.children.length > 0 ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center space-x-3">
                      <CustomLink
                        href={route("categories.show", { slug: category.slug })}
                        className="flex items-center space-x-3 w-full h-auto p-0"
                        variant="ghost"
                        onClick={() => onCategorySelect?.(category)}
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrl(category.image) || "/placeholder.svg"}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, category.name, "40")}
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs text-gray-500">{category.product_count || 0} products</span>
                        </div>
                      </CustomLink>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-60">
                        {category.children.map((child) => (
                          <DropdownMenuItem key={child.id} className="flex items-center space-x-3 cursor-pointer">
                            <CustomLink
                              href={route("categories.show", { slug: child.slug })}
                              className="flex items-center space-x-3 w-full h-auto p-0"
                              variant="ghost"
                              onClick={() => onCategorySelect?.(child)}
                            >
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100">
                                <img
                                  src={getImageUrl(child.image) || "/placeholder.svg"}
                                  alt={child.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => handleImageError(e, child.name, "32")}
                                />
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="font-medium">{child.name}</span>
                                <span className="text-xs text-gray-500">{child.product_count || 0} products</span>
                              </div>
                            </CustomLink>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer">
                    <CustomLink
                      href={route("categories.show", { slug: category.slug })}
                      className="flex items-center space-x-3 w-full h-auto p-0"
                      variant="ghost"
                      onClick={() => onCategorySelect?.(category)}
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(category.image) || "/placeholder.svg"}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, category.name, "40")}
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.product_count || 0} products</span>
                      </div>
                    </CustomLink>
                  </DropdownMenuItem>
                )}
              </div>
            ))}
            <CustomLink className="mx-auto my-2" href={route("request.index")}>
              Request
            </CustomLink>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
