'use client';

import type React from 'react';

import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '@/lib/image';

interface ProductImage {
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
}

interface ProductImageGalleryProps {
    images: ProductImage[];
    productName: string;
    productId?: number;
    price?: number;
    onAddToCart?: (productId: number) => void;
}

export function ProductImageGallery({ images, productName, productId, price, onAddToCart }: ProductImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Sort images by primary first, then by sort_order
    const sortedImages = [...images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.sort_order - b.sort_order;
    });

    const currentImage = sortedImages[currentImageIndex] || {
        url: '/placeholder.svg?height=500&width=500&text=No Image',
        alt_text: productName,
        id: 0,
        is_primary: true,
        sort_order: 0,
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        target.src = `/placeholder.svg?height=500&width=500&text=${encodeURIComponent(productName)}`;
    };

    console.log("currentImage", currentImage);



    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="space-y-3">
            {/* Main Image Container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-xs">
                <img
                    src={getImageUrl(currentImage.url, { placeholderText: productName, width: 600, height: 600, bucket: "products" })}
                    alt={currentImage.alt_text || productName}
                    className={`h-full w-full object-cover transition-transform duration-300 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                />

                {/* Zoom Icon */}
                <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute top-3 right-3 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-xs backdrop-blur-xs hover:bg-white transition-all"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>

                {/* Navigation Arrows */}
                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-xs backdrop-blur-xs hover:bg-white transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-xs backdrop-blur-xs hover:bg-white transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {sortedImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white backdrop-blur-xs">
                        {currentImageIndex + 1} / {sortedImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Images */}
            {sortedImages.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto py-1">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                                index === currentImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <img
                                src={getImageUrl(image.url, { placeholderText: productName, width: 100, height: 100, bucket: "products" })}
                                alt={image.alt_text || productName}
                                className="h-full w-full object-cover"
                                onError={handleImageError}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
