"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Star, ThumbsUp, User, CheckCircle, MessageSquare, Filter } from "lucide-react"
import { Button } from "../ui/button"
import { usePage } from "@inertiajs/react"
import type { SharedData } from "@/types"

interface Review {
  id: number
  rating: number
  title?: string
  comment: string
  user_name: string
  user_avatar?: string
  created_at: string
  helpful_count: number
  is_verified_purchase: boolean
  is_helpful_to_user: boolean
}

interface ReviewsPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface ReviewsData {
  data: Review[]
  pagination: ReviewsPagination
}

interface ReviewSectionProps {
  productId: number
  averageRating: number
  reviewsCount: number
  ratingBreakdown: { [key: number]: number }
  reviews: ReviewsData
  userHasReviewed: boolean
}

export function ReviewSection({
  productId,
  averageRating,
  reviewsCount,
  ratingBreakdown = {},
  reviews: initialReviews = { data: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } },
  userHasReviewed: initialUserHasReviewed,
}: ReviewSectionProps) {
  const { auth } = usePage<SharedData>().props
  const [reviews, setReviews] = useState<ReviewsData>(initialReviews)
  const [userHasReviewed, setUserHasReviewed] = useState(initialUserHasReviewed)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const getCsrfToken = () => {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
    if (metaToken) return metaToken
    return ""
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.user) return

    setSubmitting(true)
    try {
      const response = await fetch("/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          product_id: productId,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserHasReviewed(true)
        setShowReviewForm(false)
        setReviewForm({ rating: 0, title: "", comment: "" })
        // Refresh reviews
        loadReviews()
        alert("Review submitted successfully!")
      } else {
        alert(data.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("An error occurred while submitting your review")
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpfulVote = async (reviewId: number) => {
    if (!auth.user) return

    try {
      const response = await fetch(`/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "X-Requested-With": "XMLHttpRequest",
        },
      })

      const data = await response.json()

      if (data.success) {
        setReviews((prev) => ({
          ...prev,
          data: prev.data.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpful_count: data.helpful_count,
                  is_helpful_to_user: data.is_helpful,
                }
              : review,
          ),
        }))
      }
    } catch (error) {
      console.error("Error voting on review:", error)
    }
  }

  const loadReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        per_page: "10",
      })

      if (filterRating) {
        params.append("rating", filterRating.toString())
      }

      const response = await fetch(`/products/${productId}/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data)
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [sortBy, filterRating])

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingPercentage = (rating: number) => {
    return reviewsCount > 0 ? (ratingBreakdown[rating] / reviewsCount) * 100 : 0
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-gray-600">{reviewsCount} reviews</p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{rating}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{(ratingBreakdown?.[rating] ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {auth.user && !userHasReviewed && (
          <div className="mb-8">
            <Button onClick={() => setShowReviewForm(!showReviewForm)} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Write a Review
            </Button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                {renderStars(reviewForm.rating, true, (rating) => setReviewForm((prev) => ({ ...prev, rating })))}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Summarize your review"
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Share your thoughts about this product"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting || reviewForm.rating === 0 || !reviewForm.comment.trim()}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="lowest_rating">Lowest Rating</option>
              <option value="most_helpful">Most Helpful</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by rating:</span>
            <select
              value={filterRating || ""}
              onChange={(e) => setFilterRating(e.target.value ? Number.parseInt(e.target.value) : null)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading reviews...</p>
            </div>
          ) : reviews?.data?.length > 0 ? (
            reviews.data.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar || "/placeholder.svg"}
                        alt={review.user_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{review.user_name}</span>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">{formatDate(review.created_at)}</span>
                    </div>

                    {review.title && <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>}

                    <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleHelpfulVote(review.id)}
                        disabled={!auth.user}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          review.is_helpful_to_user ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                        } ${!auth.user ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpful_count})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
