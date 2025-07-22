import { SubCategoriesSection } from '@/components/category/sub-categories-section';
import { Head, Link } from '@inertiajs/react';
import type React from 'react';

interface SubCategory {
    id: number;
    name: string;
    slug: string;
    image: string;
    product_count: number;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    subcategories: SubCategory[];
    products: Product[];
    product_count: number;
}

interface ShowProps {
    category: Category;
}

export default function Show({ category }: ShowProps) {
    const getImageUrl = (imagePath: string) => {
        // If no image path, return placeholder
        if (!imagePath) {
            console.warn('No image path provided');
            return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(category.name)}`;
        }

        // If it's a full URL, return as-is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // Construct the full path
        const fullPath = `/image/${imagePath}`;

        // Log the full path for debugging
        console.log('Full image path:', fullPath);

        return fullPath;
    };

    // const getImageUrl = (imagePath: string) => {
    //     console.log(imagePath);
    //     if (!imagePath) {
    //         console.log('imagepath is null?');
    //         return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(category.name)}`;
    //     }
    //     if (imagePath.startsWith('http')) {
    //         return imagePath;
    //     }
    //     return `image/${imagePath}`;
    // };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.log('handleImageError called');
        const target = e.currentTarget;
        target.src = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(category.name)}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const getImageProductUrl = (imagePath: string) => {
        // If no image path, log and return null
        if (!imagePath) {
            console.warn('No image path provided');
            return null;
        }

        // If it's a full URL, return as-is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // Possible path variations
        const pathVariations = [
            `/image/${imagePath}`, // Current implementation
            `image/${imagePath}`, // Without leading slash
            `/storage/image/${imagePath}`, // Potential storage path
            imagePath, // Raw path
        ];

        // Log all possible paths for debugging
        console.log('Image path variations:', {
            originalPath: imagePath,
            variations: pathVariations,
        });

        // Return the first variation (you can modify this logic if needed)
        return pathVariations[0];
    };

    return (
        <>
            <Head title={category.name} />

            <div className="min-h-screen bg-gray-50">
                {/* Category Header */}
                <div className="bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-8">
                        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{category.name}</h1>
                                <p className="mt-4 text-lg text-gray-600">{category.description}</p>
                                <p className="mt-2 text-sm text-gray-500">{category.product_count} products available</p>
                            </div>
                            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                <img
                                    src={getImageUrl(category.image) || '/placeholder.svg'}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                    onError={handleImageError}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subcategories Section */}
                {category.subcategories && category.subcategories.length > 0 && (
                    <div className="bg-white">
                        <div className="mx-auto max-w-7xl px-4 py-8">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
                            <SubCategoriesSection subcategories={category.subcategories} />
                        </div>
                    </div>
                )}

                {/* Products Section */}
                {category.products && category.products.length > 0 && (
                    <div className="bg-gray-50">
                        <div className="mx-auto max-w-7xl px-4 py-8">
                            <h2 className="mb-6 text-2xl font-bold text-gray-900">Products in {category.name}</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {category.products.map((product) => (
                                    <Link key={product.id} href={`/products/${product.slug}`} className="group">
                                        <div className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 group-hover:shadow-md">
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{product.name}</h3>
                                                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                                                <p className="mt-2 text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {(!category.products || category.products.length === 0) && (
                    <div className="bg-gray-50">
                        <div className="mx-auto max-w-7xl px-4 py-12">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">No Products Found</h2>
                                <p className="mt-2 text-gray-600">There are currently no products in the {category.name} category.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
