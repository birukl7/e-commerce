import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layouts/app-layout'
import MainLayout from '@/layouts/app/main-layout'
import type { BreadcrumbItem, NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import {
  LayoutDashboard,
  Bookmark,
  ShoppingBag,
  MessageSquare,
  Package2,
  Settings as SettingsIcon,
  Package,
  ArrowUpRight,
} from 'lucide-react'

type PurchasedProduct = {
  order_item_id: number
  order_id: number
  order_number: string
  order_status: string
  payment_status: string
  purchased_at: string
  product: {
    id: number
    name: string
    slug: string
    sku: string | null
    brand: string | null
    image: string | null
  }
  quantity: number
  unit_price: number
  total: number
}

type Summary = {
  items_count: number
  unique_products: number
  total_quantity: number
  total_spent: number
  status_breakdown: Record<string, number>
}

interface ProductsPageProps {
  purchasedItems: PurchasedProduct[]
  summary: Summary
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/user-dashboard',
  },
  {
    title: 'Bought Products',
    href: '/user-products',
  },
]

const userNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/user-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'BookMarked Products',
    href: '/user-wishlist',
    icon: Bookmark,
  },
  {
    title: 'Orders',
    href: '/user-order',
    icon: ShoppingBag,
  },
  {
    title: 'Requests',
    href: '/user-request',
    icon: MessageSquare,
  },
  {
    title: 'Bought Products',
    href: '/user-products',
    icon: Package2,
  },
  {
    title: 'Settings',
    href: '/settings/profile',
    icon: SettingsIcon,
  },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const statusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
    case 'awaiting_procurement':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
    case 'payment_rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const paymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending_approval':
    case 'pending_payment_approval':
      return 'bg-orange-100 text-orange-800'
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function BoughtProducts({ purchasedItems, summary }: ProductsPageProps) {
  return (
    <MainLayout title="Bought Products" className={''} footerOff={false} contentMarginTop="mt-[60px]">
      <AppLayout
        logoDisplay=" invisible"
        sidebarStyle="mt-[20px]"
        breadcrumbs={breadcrumbs}
        mainNavItems={userNavItems}
        footerNavItems={[]}
      >
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Bought Products</h1>
            <p className="text-gray-600">
              Track every product you have purchased including quantity, status, and quick navigation back to their
              orders.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Items Purchased</CardDescription>
                <CardTitle className="text-3xl">{summary.items_count}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Products</CardDescription>
                <CardTitle className="text-3xl">{summary.unique_products}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Quantity</CardDescription>
                <CardTitle className="text-3xl">{summary.total_quantity}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Spent</CardDescription>
                <CardTitle className="text-3xl">{formatCurrency(summary.total_spent)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {Object.keys(summary.status_breakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Status Overview</CardTitle>
                <CardDescription>Counts of purchased items grouped by the order status they belong to.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(summary.status_breakdown).map(([status, count]) => (
                    <span key={status} className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(status)}`}>
                      {status.replaceAll('_', ' ')} • {count}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>Detailed list of every product you have purchased.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {purchasedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Package className="h-12 w-12 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">No purchases yet</h3>
                    <p className="text-sm text-gray-600">Start shopping to see your purchased products here.</p>
                  </div>
                  <Link
                    href={route('home')}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Browse products
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Order
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Unit Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {purchasedItems.map((item) => (
                        <tr key={item.order_item_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.product.image || '/placeholder.svg?height=64&width=64&text=Product'}
                                alt={item.product.name}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                              <div>
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="font-medium text-gray-900 hover:text-blue-600"
                                >
                                  {item.product.name}
                                </Link>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  {item.product.brand && <span>Brand: {item.product.brand}</span>}
                                  {item.product.sku && <span>SKU: {item.product.sku}</span>}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  Purchased {new Date(item.purchased_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">#{item.order_number}</span>
                              <span className="text-xs text-gray-500">Order ID: {item.order_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(item.unit_price)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs">
                              <span className={`w-fit rounded-full px-3 py-1 font-medium ${statusColor(item.order_status)}`}>
                                {item.order_status.replaceAll('_', ' ')}
                              </span>
                              <span
                                className={`w-fit rounded-full px-3 py-1 font-medium ${paymentStatusColor(item.payment_status)}`}
                              >
                                {item.payment_status.replaceAll('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={route('user.orders.show', item.order_id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900"
                              >
                                View order
                              </Link>
                              <Link
                                href={route('user.orders.track', item.order_id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 hover:border-blue-300 hover:text-blue-700"
                              >
                                Track order
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </MainLayout>
  )
}



