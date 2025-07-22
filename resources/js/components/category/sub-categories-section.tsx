'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

interface SubCategory {
    id: number;
    name: string;
    slug: string;
    image: string;
    product_count: number;
}

interface SubCategoriesSectionProps {
    subcategories: SubCategory[];
}

export function SubCategoriesSection({ subcategories }: SubCategoriesSectionProps) {
    const [showAll, setShowAll] = useState(false);
    const displayLimit = 6;
    const displayedCategories = showAll ? subcategories : subcategories.slice(0, displayLimit);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        const categoryName = target.alt;
        target.src = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(categoryName)}`;
    };

    const getImageUrl = (category: SubCategory) => {
        if (!category.image) {
            return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(category.name)}`;
        }

        // Try multiple potential paths
        const possiblePaths = [`/image/${category.image}`, `/storage/image/${category.image}`, `/storage/${category.image}`, category.image];

        // You could even add a check to see if the image exists
        return possiblePaths[0]; // Start with the most likely path
    };

    if (!subcategories || subcategories.length === 0) {
        return null;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 pb-8">
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {displayedCategories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`} className="group cursor-pointer">
                        <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                                //src={getImageUrl(category) || '/placeholder.svg'}
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                onError={handleImageError}
                            />
                        </div>
                        <h3 className="text-center text-sm leading-tight font-medium text-gray-900">{category.name}</h3>
                        <p className="mt-1 text-center text-xs text-gray-500">{category.product_count} products</p>
                    </Link>
                ))}
            </div>
            {subcategories.length > displayLimit && (
                <div className="text-center">
                    <Button variant="outline" className="rounded-full bg-transparent px-6" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show less' : `Show more (${subcategories.length - displayLimit})`}
                    </Button>
                </div>
            )}
        </div>
    );
}
