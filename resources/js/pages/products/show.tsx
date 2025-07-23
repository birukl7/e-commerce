import { ProductImageGallery } from '@/components/product/product-image-gallery';
import MainLayout from '@/layouts/app/main-layout';

interface ProductImage {
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
}

interface ShowProps {
    product: {
        name: string;
        images: ProductImage[];
        [key: string]: any;
    };
    related_products: any[];
}

const Show = ({ product, related_products }: ShowProps) => {
    return (
        <MainLayout title={product?.name || 'Product'} className="">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">{product?.name || 'Loading...'}</h1>

                {/* Test ProductImageGallery */}
                <div className="mb-8">
                    <ProductImageGallery images={product.images || []} productName={product.name} />
                </div>

                {/* <ProductDetails product={product} />
        <ProductReviews 
          reviews={product.reviews}
          averageRating={product.average_rating}
          reviewsCount={product.reviews_count}
          productId={product.id}
        />
        <RelatedProducts products={related_products} /> */}
            </div>
        </MainLayout>
    );
};

export default Show;
