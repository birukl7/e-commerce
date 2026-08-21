'use client';

import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getImageUrl } from '@/lib/image';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    sale_price?: string;
    image?: string;
    category_id: number;
    featured: boolean;
    status: string;
    stock_status: string;
}

interface ShowcaseCategory {
    id: number;
    name: string;
    slug: string;
    image: string;
    product_count: number;
}

interface GiftShowcaseProps {
    excludeCategoryIds?: number[];
    productCount?: number;
    categoryCount?: number;
}

export default function GiftShowcase({ excludeCategoryIds = [], productCount = 6, categoryCount = 3 }: GiftShowcaseProps) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ShowcaseCategory[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());
    const [wishlistLoading, setWishlistLoading] = useState<Set<number>>(new Set());
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    const productsLoadingRef = useRef(false);
    const categoriesLoadingRef = useRef(false);
    const lastExcludedIdsRef = useRef<string>('');

    const getCsrfToken = () => {
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) return metaToken;
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
        return '';
    };

    const createPlaceholderDataUrl = (text: string, width = 200, height = 200) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#F0E6D3';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#888888';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const maxWidth = width - 20;
            const words = text.split(' ');
            let line = '';
            const lines: string[] = [];
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            const lineHeight = 16;
            const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
            lines.forEach((l, index) => {
                ctx.fillText(l.trim(), width / 2, startY + index * lineHeight);
            });
        }
        return canvas.toDataURL();
    };

    const fetchWishlist = useCallback(async () => {
        if (!auth.user) return;
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/api/wishlist', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const wishlistProductIds = new Set<number>(data.data.map((item: { id: number }) => item.id));
                    setWishlistItems(wishlistProductIds);
                }
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    }, [auth.user]);

    const toggleWishlistFetch = async (productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        setWishlistLoading((prev) => new Set(prev).add(productId));
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('CSRF token not found.');
            }
            const response = await fetch('/api/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ product_id: productId }),
            });
            if (response.status === 419) {
                window.location.reload();
                return;
            }
            const data = await response.json();
            if (data.success) {
                setWishlistItems((prev) => {
                    const newSet = new Set(prev);
                    if (data.in_wishlist) {
                        newSet.add(productId);
                    } else {
                        newSet.delete(productId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setWishlistLoading((prev) => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    const fetchProducts = useCallback(
        async (excludeIds: number[] = []) => {
            if (productsLoadingRef.current) return;
            try {
                productsLoadingRef.current = true;
                setProductsLoading(true);
                setProductsError(null);
                const params = new URLSearchParams({
                    count: productCount.toString(),
                    status: 'published',
                    stock_status: 'in_stock',
                });
                if (excludeIds.length > 0) {
                    params.append('exclude_categories', excludeIds.join(','));
                }
                const response = await fetch(`/api/products/showcase?${params}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    cache: 'no-store',
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setProducts(data.data || data || []);
            } catch (err) {
                console.error('Error fetching products:', err);
                setProductsError(err instanceof Error ? err.message : 'Failed to fetch products');
            } finally {
                setProductsLoading(false);
                productsLoadingRef.current = false;
            }
        },
        [productCount],
    );

    const fetchCategories = useCallback(
        async (excludeIds: number[] = []) => {
            if (categoriesLoadingRef.current) return;
            try {
                categoriesLoadingRef.current = true;
                setCategoriesLoading(true);
                setCategoriesError(null);
                const params = new URLSearchParams({ count: categoryCount.toString() });
                if (excludeIds.length > 0) {
                    params.append('exclude_categories', excludeIds.join(','));
                }
                const response = await fetch(`/api/categories/showcase?${params}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    cache: 'no-store',
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setCategories(data.data || data || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategoriesError(err instanceof Error ? err.message : 'Failed to fetch categories');
            } finally {
                setCategoriesLoading(false);
                categoriesLoadingRef.current = false;
            }
        },
        [categoryCount],
    );

    useEffect(() => {
        fetchProducts(excludeCategoryIds);
        fetchCategories(excludeCategoryIds);
        fetchWishlist();
    }, []);

    useEffect(() => {
        const currentExcludedIds = JSON.stringify(excludeCategoryIds.sort());
        if (lastExcludedIdsRef.current !== currentExcludedIds && lastExcludedIdsRef.current !== '') {
            fetchProducts(excludeCategoryIds);
            fetchCategories(excludeCategoryIds);
        }
        lastExcludedIdsRef.current = currentExcludedIds;
    }, [excludeCategoryIds, fetchProducts, fetchCategories]);

    const formatPrice = (price: string, salePrice?: string) => {
        const formattedPrice = `ETB ${Number.parseFloat(price).toFixed(2)}`;
        const formattedSalePrice = salePrice ? `ETB ${Number.parseFloat(salePrice).toFixed(2)}` : null;
        return formattedSalePrice ? formattedSalePrice : formattedPrice;
    };

    const getProductImage = (product: Product) => {
        return getImageUrl(product.image, { bucket: 'products', placeholderText: product.name, width: 400, height: 400 });
    };

    const getCategoryImage = (category: ShowcaseCategory) => {
        return getImageUrl(category.image, { bucket: 'categories', placeholderText: category.name, width: 400, height: 400 });
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallbackText: string) => {
        const target = e.currentTarget;
        const currentSrc = target.src;
        if (failedImages.has(currentSrc)) return;
        setFailedImages((prev) => new Set(prev).add(currentSrc));
        target.src = createPlaceholderDataUrl(fallbackText);
    };

    const handleRetry = () => {
        setFailedImages(new Set());
        fetchProducts(excludeCategoryIds);
        fetchCategories(excludeCategoryIds);
    };

    if (productsError && categoriesError) {
        return (
            <div className="mx-auto py-2">
                <div className="py-8 text-center">
                    <p className="mb-4 text-[#A61A2E]">{t("giftShowcase.failedToLoad")}</p>
                    <Button onClick={handleRetry} className="rounded-full bg-[#222222] px-6 py-2 text-white hover:bg-[#333333]">
                        {t("giftShowcase.tryAgain")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto py-2">
            {/* Header Section */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0">
                    <h2
                        className="mb-4 text-2xl font-bold leading-tight text-[#222222]"
                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                        {t("giftShowcase.title")}
                        <br />
                        {t("giftShowcase.subtitle")}
                    </h2>
                    <Button
                        variant="outline"
                        className="rounded-full border-[#222222] bg-transparent px-6 py-2 text-sm font-medium text-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
                    >
                        {t("giftShowcase.getInspired")}
                    </Button>
                </div>
                {/* Featured Categories Grid */}
                <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 lg:ml-8 lg:gap-5">
                    {categoriesLoading
                        ? Array.from({ length: categoryCount }).map((_, index) => (
                              <div key={index} className="overflow-hidden rounded-lg">
                                  <div className="h-[200px] animate-pulse bg-[#F0E6D3] sm:h-[280px]" />
                              </div>
                          ))
                        : categories.map((category) => (
                              <Link prefetch key={category.id} href={`/categories/${category.slug}`}>
                                  <div className="group cursor-pointer overflow-hidden rounded-lg">
                                      <div className="relative h-[200px] w-full overflow-hidden sm:h-[280px]">
                                          <img
                                              src={getCategoryImage(category) || '/placeholder.svg'}
                                              alt={category.name}
                                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                              onError={(e) => handleImageError(e, category.name)}
                                          />
                                          <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
                                          <div className="absolute bottom-4 left-4">
                                              <h3 className="text-base font-semibold text-white">
                                                  {category.name}
                                              </h3>
                                              <p className="text-xs text-white/80">{category.product_count} {t("giftShowcase.products")}</p>
                                          </div>
                                      </div>
                                  </div>
                              </Link>
                          ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {productsLoading
                    ? Array.from({ length: productCount }).map((_, index) => (
                          <div key={index} className="overflow-hidden rounded-lg">
                              <div className="h-[200px] animate-pulse bg-[#F0E6D3]" />
                              <div className="space-y-2 pt-3">
                                  <div className="h-3 animate-pulse rounded bg-[#F0E6D3]" />
                                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#F0E6D3]" />
                              </div>
                          </div>
                      ))
                    : products.map((product) => (
                          <Link prefetch key={product.id} href={`/products/${product.slug}`}>
                              <div className="group cursor-pointer">
                                  <div className="relative aspect-square h-[200px] w-full overflow-hidden rounded-lg">
                                      <img
                                          src={getProductImage(product) || '/placeholder.svg'}
                                          alt={product.name}
                                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                      />
                                      {/* Wishlist Button */}
                                      <div className="absolute top-2.5 right-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                          <button
                                              className={`rounded-full p-2 transition-colors ${
                                                  wishlistItems.has(product.id) ? 'bg-white opacity-100' : 'bg-white/90'
                                              } ${wishlistLoading.has(product.id) ? 'cursor-not-allowed opacity-50' : ''}`}
                                              onClick={(e) => toggleWishlistFetch(product.id, e)}
                                              disabled={wishlistLoading.has(product.id)}
                                              style={wishlistItems.has(product.id) ? { opacity: 1 } : {}}
                                          >
                                              <Heart
                                                  className={`h-4 w-4 ${
                                                      wishlistItems.has(product.id) ? 'fill-[#A61A2E] text-[#A61A2E]' : 'text-[#595959]'
                                                  }`}
                                              />
                                          </button>
                                      </div>
                                      {/* Sale indicator */}
                                      {product.sale_price && (
                                          <div className="absolute top-2.5 left-2.5 rounded bg-[#2F7431] px-2 py-0.5 text-xs font-semibold text-white">
                                              SALE
                                          </div>
                                      )}
                                  </div>
                                  <div className="pt-2.5">
                                      <p className="mb-1 line-clamp-2 text-sm font-medium text-[#222222]">
                                          {product.name}
                                      </p>
                                      <div className="flex items-center gap-2">
                                          {product.sale_price ? (
                                              <>
                                                  <p className="text-sm font-bold text-[#2F7431]">{formatPrice(product.sale_price)}</p>
                                                  <p className="text-xs text-[#888888] line-through">{formatPrice(product.price)}</p>
                                              </>
                                          ) : (
                                              <p className="text-sm font-bold text-[#222222]">{formatPrice(product.price)}</p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </Link>
                      ))}
            </div>

            {!productsLoading && products.length === 0 && (
                <div className="py-8 text-center">
                    <p className="text-[#595959]">{t("giftShowcase.noProducts")}</p>
                </div>
            )}

            <p className="text-center text-sm text-[#595959]">{t("giftShowcase.footerText")}</p>
        </div>
    );
}
