import { FilterSort } from '@/components/category/filter-sort'
import { ProductGrid } from '@/components/category/product-grid'
import { SubCategoriesSection } from '@/components/category/sub-categories-section'
import H1 from '@/components/ui/h1'
import MainLayout from '@/layouts/app/main-layout'
interface SubCategory {
  id: number
  name: string
  slug: string
  image: string
  product_count: number
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  description: string
  image: string
}

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  subcategories: SubCategory[]
  products: Product[]
  product_count: number
}

interface ShowProps {
  category: Category
}

const Show = ({ category }: ShowProps) => {
  return (
    <MainLayout title={category.name} className={""}>
      <>
        {/* Header Section */}
        <div className="text-center py-8 px-4">
          <H1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</H1>
          <p className="text-gray-600 text-lg">{category.description}</p>
          <p className="mt-2 text-sm text-gray-500">{category.product_count} products available</p>
        </div>

        {/* Sub-categories Section */}
        <SubCategoriesSection subcategories={category.subcategories} />

        {/* Filter and Sort Section */}
        <FilterSort />

        {/* Product Grid */}
        <ProductGrid products={category.products} />
      </>
    </MainLayout>
  )
}

export default Show
