import { FilterSort } from '@/components/category/filter-sort'
import { ProductGrid } from '@/components/category/product-grid'
import { SubCategoriesSection } from '@/components/category/sub-categories'
import H1 from '@/components/ui/h1'
import MainLayout from '@/layouts/app/main-layout'

const Show = () => {
  return (
    <MainLayout  title={''} className={''}>
      <>
        {/* Header Section */}
        <div className="text-center py-8 px-4">
          <H1 className="text-4xl font-bold text-gray-900 mb-2">Accessories</H1>
          <p className="text-gray-600 text-lg">Scarves, hats, and hair accessories that tie it all together</p>
        </div>

        {/* Sub-categories Section */}
        <SubCategoriesSection />

        {/* Filter and Sort Section */}
        <FilterSort />

        {/* Product Grid */}
        <ProductGrid />
      </>
    </MainLayout>
  )
}

export default Show
