

import { useState } from "react"
import { Heart, Star, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function ProductDetails() {
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Stock Warning */}
      <div className="text-red-600 font-medium">Low in stock, only 1 left</div>

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-green-600">USD 127.20+</span>
          <span className="text-lg text-gray-500 line-through">USD 159.00+</span>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">20% off</Badge>
        </div>
        <div className="text-red-600 font-medium">Sale ends in 9:07:11</div>
        <div className="text-sm text-gray-600">Local taxes included (where applicable)</div>
      </div>

      {/* Product Title */}
      <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
        Wedding wrap cardigan, ballet wrap shrug, wedding sweater, cover up for wedding dress, white bolero for bride,
        warm wool bridesmaids jacket
      </h1>

      {/* Seller Info */}
      <div className="flex items-center gap-2">
        <span className="font-medium">EdelweissBride</span>
        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
          <Star className="w-3 h-3 fill-purple-500 text-purple-500" />
        </div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-green-600" />
          <span>
            Arrives soon! Get it by <span className="font-medium">Jul 28-Aug 2</span> if you order today
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-green-600" />
          <span>Exchanges accepted</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Primary color</label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="ivory">Ivory</SelectItem>
              <SelectItem value="cream">Cream</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">SIZE</label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">XS</SelectItem>
              <SelectItem value="s">S</SelectItem>
              <SelectItem value="m">M</SelectItem>
              <SelectItem value="l">L</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Personalization */}
        <div>
          <button
            onClick={() => setIsPersonalizationOpen(!isPersonalizationOpen)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900"
          >
            Add your personalization (optional)
            <ChevronDown className={`w-4 h-4 transition-transform ${isPersonalizationOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-medium rounded-full">
          Add to cart
        </Button>

        <Button variant="outline" size="icon" className="rounded-full bg-transparent">
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Star Seller Badge */}
      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-purple-900 mb-1">Star Seller.</div>
          <div className="text-gray-700">
            This seller consistently earned 5-star reviews, shipped on time, and replied quickly to any messages they
            received.
          </div>
        </div>
      </div>

      {/* Report Link */}
      <button className="text-sm text-gray-600 hover:text-gray-900 underline">Report this item to Etsy</button>
    </div>
  )
}
