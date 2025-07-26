// "use client"

// import { Head, Link } from "@inertiajs/react"
// import { useState } from "react"

// interface InterestCardProps {
//   title: string
//   subtitle: string
//   imageSrc: string
//   imageAlt: string
//   productCount?: number
//   slug?: string
//   onClick?: () => void
// }

// export function InterestCard({ title, subtitle, imageSrc, imageAlt, productCount, slug, onClick }: InterestCardProps) {
//   const [imageError, setImageError] = useState(false)

//   const handleImageError = () => {
//     setImageError(true)
//   }

//   const getImageUrl = (imagePath: string) => {
//     if (!imagePath || imageError) {
//       return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`
//     }
//     if (imagePath.startsWith("http")) {
//       return imagePath
//     }
//     return `/storage/${imagePath}`
//   }

//   const cardContent = (
//     <div className="group cursor-pointer">
//       <div className="duration-300 group-hover:shadow-2xl group-hover:shadow-black/10 relative overflow-hidden rounded-2xl bg-white transition-all ease-out">
//         <div className="relative h-[200px] w-full sm:h-[300px] md:h-[400px] overflow-hidden">
//           <img
//             src={getImageUrl(imageSrc) || "/placeholder.svg"}
//             alt={imageAlt}
//             className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//             onError={handleImageError}
//           />
//         </div>
//         <div className="p-6">
//           <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
//             {title}
//           </h3>
//           <p className="mb-1 text-sm text-gray-600">{subtitle}</p>
//           {productCount !== undefined && <p className="text-xs text-gray-500">{productCount} products</p>}
//         </div>
//       </div>
//     </div>
//   )

//   if (onClick) {
//     return <div onClick={onClick}>{cardContent}</div>
//   }

//   if (slug) {
//     return <Link href={`/categories/${slug}`}>{cardContent}</Link>
//   }

//   return cardContent
// }
'use client';

import { Link } from '@inertiajs/react';
import type React from 'react';
import H3 from '../ui/h3';

interface InterestCardProps {
    title: string;
    subtitle: string;
    imageSrc: string;
    imageAlt: string;
    productCount?: number;
    slug?: string;
    onClick?: () => void;
}

export function InterestCard({ title, subtitle, imageSrc, imageAlt, productCount, slug, onClick }: InterestCardProps) {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        target.src = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`;
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) {
            return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`;
        }
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `image/${imagePath}`;
    };

    const cardContent = (
        <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-black/10">
                <div className="h-[200px] w-full overflow-hidden sm:h-[300px] md:h-[400px]">
                    <img
                        src={getImageUrl(imageSrc) || '/placeholder.svg'}
                        alt={imageAlt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                    />
                </div>
                <div className="p-6">
                    <H3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors">{title}</H3>
                    <p className="mb-1 text-sm text-gray-600">{subtitle}</p>
                    {productCount !== undefined && <p className="text-xs text-gray-500">{productCount} products</p>}
                </div>
            </div>
        </div>
    );

    if (onClick) {
        return <div onClick={onClick}>{cardContent}</div>;
    }

    if (slug) {
        return <Link href={`/categories/${slug}`}>{cardContent}</Link>;
    }

    return cardContent;
}
