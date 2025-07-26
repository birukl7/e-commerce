"use client"

import { useEffect, useState } from "react"
import { InterestCard } from "./interest-card"
import { InterestCardSkeleton } from "./interest-card-skeleton"
import { Button } from "../ui/button"

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

export function FeaturedInterests({ count = 4 }: FeaturedInterestsProps) {
  const [interests, setInterests] = useState<FeaturedCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedInterests()
  }, [count])

  const fetchFeaturedInterests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/categories/featured?count=${count}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setInterests(data.data || data || [])
    } catch (err) {
      console.error("Error fetching featured interests:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch featured interests")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchFeaturedInterests()
  }

  if (error) {
    return (
      <section className="mx-auto w-full px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Jump into featured interests</h2>
        <div className="py-8 text-center">
          <p className="mb-4 text-red-500">Failed to load featured interests</p>
          <Button
            onClick={handleRetry}
            className=""
          >
            Try Again
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full px-4 py-12">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">Jump into featured interests</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: count }).map((_, index) => <InterestCardSkeleton key={index} />)
          : interests.map((interest) => (
              <InterestCard
                key={interest.id}
                title={interest.name}
                subtitle={interest.description}
                imageSrc={interest.image}
                imageAlt={`${interest.name} category with ${interest.product_count} products`}
                productCount={interest.product_count}
                slug={interest.slug}
              />
            ))}
      </div>
      {!loading && interests.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No featured interests available at the moment.</p>
        </div>
      )}
    </section>
  )
}
