'use client';

import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { getImageUrl } from '@/lib/image';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    sale_price?: string;
    image?: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    featured: boolean;
    status: string;
    stock_quantity: number;
    images?: Array<{
        id: number;
        image_path: string;
        is_primary: boolean;
    }>;
}

interface FeaturedProductsProps {
    products: Record<string, Product[]>;
}

export default function FeaturedProducts({ products: productsByCategory }: FeaturedProductsProps) {
    const { t } = useTranslation();
    const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
    const [wishlistLoading, setWishlistLoading] = useState<Set<number>>(new Set());

    if (!productsByCategory || Object.keys(productsByCategory).length === 0) {
        return null;
    }

    const toggleWishlist = async (productId: number) => {
        if (wishlistLoading.has(productId)) return;

        setWishlistLoading(prev => new Set([...prev, productId]));
        
        try {
            const response = await fetch(route('wishlist.toggle', { product: productId }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setWishlistItems(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(productId)) {
                        newSet.delete(productId);
                    } else {
                        newSet.add(productId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        } finally {
            setWishlistLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    return (
        <section className="py-8 bg-[#FAF6F0]">
            <div className="container mx-auto px-4">
                <div className="mb-10">
                    <h2
                        className="text-2xl font-bold text-[#222222]"
                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                        {t('Featured Products')}
                    </h2>
                    <p className="mt-1 text-sm text-[#595959]">
                        {t('Discover our handpicked selection of featured products across different categories')}
                    </p>
                </div>

                {Object.entries(productsByCategory).map(([categoryId, products]) => {
                    const category = products[0]?.category;
                    if (!category) return null;

                    return (
                        <div key={categoryId} className="mb-14">
                            <div className="flex justify-between items-center mb-5">
                                <h3
                                    className="text-lg font-semibold text-[#222222]"
                                    style={{ fontFamily: "'Lora', Georgia, serif" }}
                                >
                                    {category.name}
                                </h3>
                                <Link 
                                    href={route('web.categories.show', { category: category.slug })}
                                    className="text-sm font-medium text-[#222222] underline underline-offset-2 hover:text-[#595959] transition-colors"
                                >
                                    {t('View all')}
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {products.map((product) => {
                                    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
                                    const imageUrl = primaryImage ? getImageUrl(primaryImage.image_path) : '/images/placeholder-product.jpg';
                                    const isInWishlist = wishlistItems.has(product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            className="group cursor-pointer"
                                            onClick={() => {
                                                router.visit(route('web.products.show', { slug: product.slug }));
                                            }}
                                        >
                                            <div className="relative overflow-hidden rounded-lg">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleWishlist(product.id);
                                                    }}
                                                    disabled={wishlistLoading.has(product.id)}
                                                    className={cn(
                                                        'absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 transition-opacity duration-200 opacity-0 group-hover:opacity-100',
                                                        isInWishlist && 'opacity-100'
                                                    )}
                                                    aria-label={isInWishlist ? t('Remove from wishlist') : t('Add to wishlist')}
                                                >
                                                    <Heart 
                                                        className={cn(
                                                            'h-4 w-4',
                                                            isInWishlist ? 'fill-[#A61A2E] text-[#A61A2E]' : 'fill-transparent text-[#595959]'
                                                        )} 
                                                    />
                                                </button>
                                            </div>
                                            <div className="pt-2.5 pb-1">
                                                <h4 className="text-sm font-medium text-[#222222] line-clamp-2 leading-snug">
                                                    {product.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    {product.sale_price ? (
                                                        <>
                                                            <span className="text-sm font-bold text-[#2F7431]">
                                                                {new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'ETB',
                                                                }).format(parseFloat(product.sale_price))}
                                                            </span>
                                                            <span className="text-xs text-[#888888] line-through">
                                                                {new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'ETB',
                                                                }).format(parseFloat(product.price))}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm font-bold text-[#222222]">
                                                            {new Intl.NumberFormat('en-US', {
                                                                style: 'currency',
                                                                currency: 'ETB',
                                                            }).format(parseFloat(product.price))}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
