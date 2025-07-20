import { ProductDetails } from '@/components/product/product-detail'
import { ProductImageGallery } from '@/components/product/product-image-gallery'
import { ProductReviews } from '@/components/product/product-reviews'
import { RelatedProducts } from '@/components/product/realted-products'
import MainLayout from '@/layouts/app/main-layout'

const show = () => {
  return (
    <MainLayout  title={''} className={''}>
      <>
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
          <ProductImageGallery />
          <ProductDetails />
        </div>

        {/* Reviews Section */}
        <ProductReviews />

        {/* Related Products */}
        <RelatedProducts />
      </>
    </MainLayout>
  )
}

export default show
