import { ProductDetails } from '@/components/product/product-detail'
import { ProductImageGallery } from '@/components/product/product-image-gallery'
import MainLayout from '@/layouts/app/main-layout'
import { useTranslation } from 'react-i18next'

interface ProductImage {
  id: number
  url: string
  alt_text: string
  is_primary: boolean
  sort_order: number
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Product {
  id: number
  name: string
  slug: string
  description: string
  sku: string
  price: number
  sale_price?: number | null
  current_price: number
  cost_price?: number | null
  stock_quantity: number
  stock_status: string
  featured: boolean
  status: string
  meta_title?: string
  meta_description?: string
  images: ProductImage[]
  primary_image: string
  category: Category
  brand: Brand
  average_rating: number
  reviews_count: number
  rating_breakdown: { [key: number]: number }
}

interface Review {
  id: number
  rating: number
  title?: string
  comment: string
  user_name: string
  user_avatar?: string
  created_at: string
  helpful_count: number
  is_verified_purchase: boolean
  is_helpful_to_user: boolean
}

interface ReviewsData {
  data: Review[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ShowProps {
  product: Product
  related_products: any[]
  reviews?: ReviewsData
  userHasReviewed?: boolean
}



const Show = ({ product, related_products, reviews, userHasReviewed }: ShowProps) => {
  const { t } = useTranslation()

  return (
    <MainLayout 
      title={product?.name || t('productDetail.productDetails')} 
      showBackButton
    >
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <ProductImageGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="lg:col-span-7">
            <ProductDetails 
              product={product} 
              reviews={reviews || { data: [], pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 } }}
              userHasReviewed={userHasReviewed || false}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


export default Show