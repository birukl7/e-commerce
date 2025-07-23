import { ProductCard } from '@/components/category/product-card';

interface BackendProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
}

interface ProductGridProps {
    products: BackendProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">No Products Found</h2>
                        <p className="mt-2 text-gray-600">There are currently no products in this category.</p>
                    </div>
                </div>
            </div>
        );
    }

    // No transformation needed - backend data already matches ProductCard interface
    return (
        <div className="mx-auto max-w-7xl px-4 pb-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                ))}
            </div>
        </div>
    );
}
