"use client"

import type React from "react"

interface InterestCardProps {
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  productCount?: number
  slug?: string
  onClick?: () => void
}

export function InterestCard({ title, subtitle, imageSrc, imageAlt, productCount, slug, onClick }: InterestCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (slug) {
      // Navigate to category page
      window.location.href = `/categories/${slug}`
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    target.style.backgroundImage = `url(/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)})`
  }

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-black/10">
        <div
          style={{ backgroundImage: `url(${imageSrc || "/placeholder.svg"})` }}
          className="bg-cover bg-center h-[200px] sm:h-[300px] md:h-[400px] w-full transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
          role="img"
          aria-label={imageAlt}
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-1">{subtitle}</p>
          {productCount !== undefined && <p className="text-xs text-gray-500">{productCount} products</p>}
        </div>
      </div>
    </div>
  )
}
