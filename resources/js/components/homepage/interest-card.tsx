'use client';

import { Link } from '@inertiajs/react';

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
    const getImageUrl = (imagePath: string) => {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `${imagePath}`;
    };

    const cardContent = (
        <div className="group cursor-pointer">
            <div className="relative h-[200px] w-full overflow-hidden rounded-lg sm:h-[260px] md:h-[300px]">
                <img
                    src={getImageUrl(imageSrc) || '/placeholder.svg'}
                    alt={imageAlt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="pt-3 pb-2">
                <h3 className="text-sm font-bold text-[#222222]">{title}</h3>
                <p className="mt-0.5 text-xs text-[#595959] line-clamp-1">{subtitle}</p>
                {productCount !== undefined && (
                    <p className="mt-0.5 text-xs text-[#888888]">{productCount} products</p>
                )}
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
