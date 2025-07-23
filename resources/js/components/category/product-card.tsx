import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import type React from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
}

interface ProductCardProps {
    product: Product;
    index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) {
            return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(title)}`;
        }
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `image/${imagePath}`;
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        target.src = `/placeholder.svg?height=300&width=300&query=product`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                        src={getImageUrl(product.image) || '/placeholder.svg'}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={handleImageError}
                        loading={index > 3 ? 'lazy' : 'eager'}
                    />
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Product Title */}
                    <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                        {product.name}
                    </h3>

                    {/* Product Description */}
                    <p className="mb-3 line-clamp-2 text-xs text-gray-600">{product.description}</p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                        </div>
                    </div>

                    {/* Placeholder for additional info that might come from backend later */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-gray-300 text-gray-300" />
                            ))}
                            <span className="ml-1">No reviews yet</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
