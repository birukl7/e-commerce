import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal, Info } from "lucide-react"

export function FilterSort() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <Button variant="outline" className="rounded-full bg-transparent">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          All Filters
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <span>1,000+ items with ads</span>
            <Info className="w-4 h-4 ml-1" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <Select defaultValue="relevancy">
              <SelectTrigger className="w-32 border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancy">Relevancy</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
