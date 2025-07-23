'use client';

import type React from 'react';

import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState } from 'react';

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

    const handleAddToCart = async () => {
        if (!productId || !onAddToCart) return;

        setIsAddingToCart(true);
        try {
            await onAddToCart(productId);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="space-y-4">
            {/* Main Image - Made smaller */}
            <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-lg bg-gray-100">
                <img
                    src={currentImage.url || '/placeholder.svg'}
                    alt={currentImage.alt_text || productName}
                    className={`h-full w-full object-cover transition-transform duration-300 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    onError={handleImageError}
                />

                {/* Zoom Icon */}
                <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="bg-opacity-75 hover:bg-opacity-100 absolute top-4 right-4 rounded-full bg-white p-2 transition-all"
                >
                    <ZoomIn className="h-5 w-5 text-gray-700" />
                </button>

                {/* Navigation Arrows - only show if multiple images */}
                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="bg-opacity-75 hover:bg-opacity-100 absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white p-2 transition-all"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="bg-opacity-75 hover:bg-opacity-100 absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white p-2 transition-all"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {sortedImages.length > 1 && (
                    <div className="bg-opacity-50 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 text-sm text-white">
                        {currentImageIndex + 1} / {sortedImages.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Images - only show if multiple images */}
            {sortedImages.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                                index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <img
                                src={image.url || '/placeholder.svg'}
                                alt={image.alt_text || productName}
                                className="h-full w-full object-cover"
                                onError={handleImageError}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Add to Cart Section */}
            <div className="mx-auto max-w-md space-y-3">
                {price && (
                    <div className="text-center">
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(price)}</span>
                    </div>
                )}

            </div>
        </div>
    );
}
