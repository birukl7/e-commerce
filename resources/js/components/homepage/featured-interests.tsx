"use client"

import { useState, useEffect } from "react"
import H2 from "../ui/h2"
import { InterestCard } from "./interest-card"
import { InterestCardSkeleton } from "./interest-card-skeleton"
// import { InterestCardSkeleton } from "./interest-card-skeleton"

interface FeaturedCategory {
  id: number
  name: string
  slug: string
  description: string
  image: string
  product_count: number
}

interface FeaturedInterestsProps {
  count?: number
}

export function FeaturedInterests({
  count = 4,
}: FeaturedInterestsProps) {
  const [interests, setInterests] = useState<FeaturedCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedInterests()
  }, [])

  const fetchFeaturedInterests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`api/categories/featured?count=${count}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Add cache busting to ensure fresh random data on each request
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setInterests(data.data || [])
    } catch (err) {
      console.error("Error fetching featured interests:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch featured interests")
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    return `/storage/${imagePath}`
  }

  const handleRetry = () => {
    fetchFeaturedInterests()
  }

  if (error) {
    return (
      <section className="w-full mx-auto px-4 py-12">
        <H2 className="">Jump into featured interests</H2>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load featured interests</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full mx-auto px-4 py-12">
      <H2 className="">Jump into featured interests</H2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: count }).map((_, index) => <InterestCardSkeleton key={index} />)
          : interests.map((interest) => (
              <InterestCard
                key={interest.id}
                title={interest.name}
                subtitle={interest.description}
                imageSrc={getImageUrl(interest.image)}
                imageAlt={`${interest.name} category with ${interest.product_count} products`}
                productCount={interest.product_count}
                slug={interest.slug}
              />
            ))}
      </div>

      {!loading && interests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No featured interests available at the moment.</p>
        </div>
      )}
    </section>
  )
}
