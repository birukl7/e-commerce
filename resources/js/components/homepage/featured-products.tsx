'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Heart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import H2 from '../ui/h2';
import { getImageUrl } from '@/lib/image';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';

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
    const { addToCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
    const [wishlistLoading, setWishlistLoading] = useState<Set<number>>(new Set());

    if (!productsByCategory || Object.keys(productsByCategory).length === 0) {
        return null; // Don't render anything if no featured products
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

    const handleAddToCart = (product: Product) => {
        // Transform product data to match what addToCart expects
        const currentPrice = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        const imageUrl = primaryImage ? getImageUrl(primaryImage.image_path) : '/images/placeholder-product.jpg';
        
        // Determine stock status based on stock_quantity
        const stockStatus = product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock';
        
        addToCart({
            id: product.id,
            name: product.name,
            current_price: currentPrice,
            primary_image: imageUrl,
            stock_quantity: product.stock_quantity,
            stock_status: stockStatus,
            manage_stock: true, // Default to true, adjust if you have this field
            quantity: 1
        });
    };

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <H2 className="text-3xl font-bold text-gray-900 mb-4">{t('Featured Products')}</H2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t('Discover our handpicked selection of featured products across different categories')}
                    </p>
                </div>

                {Object.entries(productsByCategory).map(([categoryId, products]) => {
                    const category = products[0]?.category;
                    if (!category) return null;

                    return (
                        <div key={categoryId} className="mb-16">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-900">{category.name}</h3>
                                <Link 
                                    href={route('web.categories.show', { category: category.slug })}
                                    className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
                                >
                                    {t('View all')} <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((product) => {
                                    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
                                    const imageUrl = primaryImage ? getImageUrl(primaryImage.image_path) : '/images/placeholder-product.jpg';
                                    const isInWishlist = wishlistItems.has(product.id);

                                    return (
                                        <Card 
                                            key={product.id} 
                                            className="group relative overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
                                            onClick={() => {
                                                router.visit(route('web.products.show', { slug: product.slug }));
                                            }}
                                        >
                                            <div className="relative aspect-square overflow-hidden">
                                                <Link 
                                                    href={route('web.products.show', { slug: product.slug })} 
                                                    className="block"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                      
                                                    />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleWishlist(product.id);
                                                    }}
                                                    disabled={wishlistLoading.has(product.id)}
                                                    className={cn(
                                                        'absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors z-10',
                                                        isInWishlist ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                                                    )}
                                                    aria-label={isInWishlist ? t('Remove from wishlist') : t('Add to wishlist')}
                                                >
                                                    <Heart 
                                                        className={cn(
                                                            'h-5 w-5',
                                                            isInWishlist ? 'fill-current' : 'fill-transparent'
                                                        )} 
                                                    />
                                                </button>
                                            </div>
                                            <CardContent className="p-4">
                                                <Link 
                                                    href={route('web.products.show', { slug: product.slug })} 
                                                    className="block"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center mt-2">
                                                        {product.sale_price ? (
                                                            <>
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    {new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: 'ETB',
                                                                    }).format(parseFloat(product.sale_price))}
                                                                </span>
                                                                <span className="ml-2 text-sm text-gray-500 line-through">
                                                                    {new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: 'ETB',
                                                                    }).format(parseFloat(product.price))}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-gray-900">
                                                                {new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: 'ETB',
                                                                }).format(parseFloat(product.price))}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                                <Button 
                                                    className="w-full mt-4"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleAddToCart(product);
                                                    }}
                                                >
                                                    {t('Add to Cart')}
                                                </Button>
                                            </CardContent>
                                        </Card>
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
