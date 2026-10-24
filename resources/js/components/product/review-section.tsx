"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Star, ThumbsUp, User, CheckCircle, MessageSquare, Filter } from "lucide-react"
import { Button } from "../ui/button"
import { usePage } from "@inertiajs/react"
import type { SharedData } from "@/types"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
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
        // alert("Review submitted successfully!")
      } else {
        // alert(data.message || "Failed to submit review")
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
    <div className="space-y-4">
      {/* Rating Overview */}
      <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {reviewsCount > 0 ? (
              <>
                <span className="text-3xl font-extrabold text-gray-900">{averageRating.toFixed(1)}</span>
                <div>
                  <div className="flex items-center">{renderStars(Math.round(averageRating))}</div>
                  <p className="text-xs text-gray-500 mt-0.5">{reviewsCount} {t('reviews.reviews')}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{t('reviews.noReviewsYet')}</h3>
                  <p className="text-xs text-gray-500">{t('reviews.beTheFirst', 'Be the first to share your thoughts!')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Write Review Button */}
          {auth.user && !userHasReviewed && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              size="sm"
              className="rounded-full text-xs font-semibold px-4 py-1.5 h-auto self-start sm:self-auto"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              {showReviewForm ? t('reviews.cancel') : t('reviews.writeReview')}
            </Button>
          )}
        </div>

        {/* Rating Breakdown only when reviews exist */}
        {reviewsCount > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200/60 grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex flex-col items-center text-center">
                <span className="text-[11px] font-medium text-gray-600 flex items-center gap-0.5">
                  {rating} <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="w-full bg-gray-200 rounded-full h-1.5 my-1 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-1.5 rounded-full"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{ratingBreakdown?.[rating] ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('reviews.writeYourReview')}</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('reviews.rating')}</label>
                {renderStars(reviewForm.rating, true, (rating) => setReviewForm((prev) => ({ ...prev, rating })))}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reviews.reviewTitle')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('reviews.summarizeReview')}
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reviews.yourReview')}
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={t('reviews.shareThoughts')}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting || reviewForm.rating === 0 || !reviewForm.comment.trim()}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {submitting ? t('reviews.submitting') : t('reviews.submitReview')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  {t('reviews.cancel')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Sorting (only when multiple reviews exist) */}
        {reviews?.data?.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-500">{t('reviews.sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">{t('reviews.newest')}</option>
                <option value="oldest">{t('reviews.oldest')}</option>
                <option value="highest_rating">{t('reviews.highestRating')}</option>
                <option value="lowest_rating">{t('reviews.lowestRating')}</option>
                <option value="most_helpful">{t('reviews.mostHelpful')}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-500">{t('reviews.filterByRating')}:</span>
              <select
                value={filterRating || ""}
                onChange={(e) => setFilterRating(e.target.value ? Number.parseInt(e.target.value) : null)}
                className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{t('reviews.allRatings')}</option>
                <option value="5">5 {t('reviews.stars')}</option>
                <option value="4">4 {t('reviews.stars')}</option>
                <option value="3">3 {t('reviews.stars')}</option>
                <option value="2">2 {t('reviews.stars')}</option>
                <option value="1">1 {t('reviews.star')}</option>
              </select>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">{t('reviews.loadingReviews')}</p>
            </div>
          ) : reviews?.data?.length > 0 ? (
            reviews.data.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0">
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar || "/placeholder.svg"}
                        alt={review.user_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-900 truncate">{review.user_name}</span>
                      <span className="text-[11px] text-gray-400 shrink-0">{formatDate(review.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1 my-1">
                      {renderStars(review.rating)}
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 font-medium ml-1.5">
                          <CheckCircle className="h-2.5 w-2.5" />
                          {t('reviews.verifiedPurchase')}
                        </span>
                      )}
                    </div>

                    {review.title && <h4 className="text-xs font-semibold text-gray-900 mt-1">{review.title}</h4>}
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{review.comment}</p>

                    <div className="mt-2 flex items-center">
                      <button
                        onClick={() => handleHelpfulVote(review.id)}
                        disabled={!auth.user}
                        className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
                          review.is_helpful_to_user ? "text-primary font-medium" : "text-gray-400 hover:text-gray-700"
                        } ${!auth.user ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{t('reviews.helpful')} ({review.helpful_count})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </div>
  )
}
