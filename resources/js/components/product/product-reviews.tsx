"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const reviews = [
  {
    id: 1,
    rating: 5,
    author: "Emily Bell",
    date: "May 26, 2025",
    text: "Love the sweater! I'm super excited to wear it. Shipping was fast as well",
    sellerResponse:
      "Thank you for your positive feedback! 😊 We're glad to hear that you're excited about your new cardigan. Enjoy wearing it! 🖤",
  },
  {
    id: 2,
    rating: 5,
    author: "Stefanie",
    date: "May 19, 2025",
    text: "Beautiful and arrived on time for my daughter's nursing school pinning ceremony celebration.",
    sellerResponse:
      "That's wonderful to hear! 🌟 We're glad the delivery was timely for such a special occasion. Thank you for sharing your experience!",
  },
  {
    id: 3,
    rating: 5,
    author: "Stefanie",
    date: "May 19, 2025",
    text: "Beautiful and arrived on time for my daughter's nursing school pinning ceremony celebration.",
    sellerResponse:
      "That's wonderful to hear! We're thrilled that the package arrived on time for such a special occasion. If you ever need anything else, feel free to reach out. 😊",
  },
  {
    id: 4,
    rating: 5,
    author: "Sena Weidkamp",
    date: "Apr 4, 2025",
    text: "Perfect quality and fast shipping. Highly recommend!",
    sellerResponse: null,
  },
]

export function ProductReviews() {
  const [sortBy, setSortBy] = useState("suggested")

  return (
    <div className="border-t pt-8 mb-12 max-w-7xl mx-auto">
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-xl font-semibold">4.9 out of 5</span>
            <span className="text-gray-600">(1.2k reviews)</span>
          </div>
          <p className="text-sm text-gray-600">All reviews are from verified buyers</p>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="suggested">Sort by: Suggested</SelectItem>
            <SelectItem value="newest">Sort by: Newest</SelectItem>
            <SelectItem value="oldest">Sort by: Oldest</SelectItem>
            <SelectItem value="highest">Sort by: Highest Rating</SelectItem>
            <SelectItem value="lowest">Sort by: Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rating Breakdown */}
      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex items-center justify-center mb-2">
            <span className="font-bold text-lg">5/5</span>
          </div>
          <div className="text-sm text-gray-600">Item quality</div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex items-center justify-center mb-2">
            <span className="font-bold text-lg">5/5</span>
          </div>
          <div className="text-sm text-gray-600">Shipping</div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex items-center justify-center mb-2">
            <span className="font-bold text-lg">5/5</span>
          </div>
          <div className="text-sm text-gray-600">Customer service</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-200 text-gray-600">{review.author.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{review.rating}</span>
                  <span className="text-sm text-gray-600">Recommends</span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="font-medium">{review.author}</span>
                  <span className="text-sm text-gray-600">{review.date}</span>
                </div>

                <p className="text-gray-900 mb-4">{review.text}</p>

                {review.sellerResponse && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">A</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Response from Anastasia</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.sellerResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
