import AppLayout from "@/layouts/app-layout"
import MainLayout from "@/layouts/app/main-layout"
import type { NavItem, BreadcrumbItem } from "@/types"
import {
  Bookmark,
  ShoppingBag,
  MessageSquare,
  Package2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  LayoutDashboard,
} from "lucide-react"
import { Link } from "@inertiajs/react"
import H3 from "@/components/ui/h3"
// import { route } from "@/router" // Import the route function

interface Product {
  id: number
  name: string
  slug: string
  price: number
  sale_price?: number | null
  current_price: number
  image: string
  category?: string
  brand?: string
  stock_status: string
  added_at: string
}

interface ProductRequest {
  id: number
  product_name: string
  description: string
  status: string
  image?: string | null
  created_at: string
  admin_response?: string
}

interface DashboardStats {
  wishlist_count: number
  requests_count: number
  pending_requests: number
  approved_requests: number
}

interface DashboardProps {
  stats: DashboardStats
  recentWishlist: Product[]
  recentRequests: ProductRequest[]
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
]

const defaultMainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "BookMarked Products",
    href: "/user-wishlist",
    icon: Bookmark,
  },
  {
    title: "Orders",
    href: "/user-order",
    icon: ShoppingBag,
  },
  {
    title: "Requests",
    href: "/user-request",
    icon: MessageSquare,
  },
  {
    title: "Bought Products",
    href: "/user-products",
    icon: Package2,
  },
]

// Helper function to format Ethiopian Birr
const formatETB = (amount: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "reviewed":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />
    case "approved":
      return <CheckCircle2 className="h-4 w-4" />
    case "rejected":
      return <XCircle className="h-4 w-4" />
    case "reviewed":
      return <Eye className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default function Dashboard({ stats, recentWishlist, recentRequests }: DashboardProps) {
  return (
    <MainLayout title={"User Dashboard"} className={""} footerOff={false} contentMarginTop={"mt-[60px]"}>
      <AppLayout
        logoDisplay=" invisible"
        sidebarStyle="mt-[20px]"
        breadcrumbs={breadcrumbs}
        mainNavItems={defaultMainNavItems}
        footerNavItems={[]}
      >
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
          {/* Stats Cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            {/* Wishlist Count */}
            <div className="relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Bookmark className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.wishlist_count}</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Wishlist Items</h3>
                <p className="text-sm text-blue-700">Products you love</p>
              </div>
            </div>
            {/* Total Requests */}
            <div className="relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-green-50 to-green-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.requests_count}</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Total Requests</h3>
                <p className="text-sm text-green-700">Product requests made</p>
              </div>
            </div>
            {/* Pending Requests */}
            <div className="relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.pending_requests}</span>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900">Pending</h3>
                <p className="text-sm text-yellow-700">Awaiting review</p>
              </div>
            </div>
            {/* Approved Requests */}
            <div className="relative aspect-video rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-purple-50 to-purple-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.approved_requests}</span>
              </div>
              <div>
                <H3 className="font-semibold text-purple-900">Approved</H3>
                <p className="text-sm text-purple-700">Requests approved</p>
              </div>
            </div>
          </div>
          {/* Main Content Area */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Wishlist Items */}
            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Wishlist Items</h2>
                <Link href="/user-wishlist" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              {recentWishlist.length > 0 ? (
                <div className="space-y-4">
                  {recentWishlist.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={product.image || "/placeholder.svg?height=60&width=60"}
                        alt={product.name}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {product.sale_price ? (
                            <>
                              <span className="text-sm font-semibold text-red-600">
                                {formatETB(product.current_price)}
                              </span>
                              <span className="text-xs text-gray-500 line-through">{formatETB(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">
                              {formatETB(product.current_price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {product.category && <span className="text-xs text-gray-500">{product.category}</span>}
                          {product.brand && <span className="text-xs text-gray-500">• {product.brand}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock_status === "in_stock"
                              ? "bg-green-100 text-green-800"
                              : product.stock_status === "out_of_stock"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.stock_status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No items in your wishlist yet</p>
                  <Link
                    href={route("home")}
                    className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
            {/* Recent Requests */}
            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
                <Link href="/user-request" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All
                </Link>
              </div>
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{request.product_name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {request.image && (
                          <img
                            src={request.image || "/placeholder.svg"}
                            alt={request.product_name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No product requests yet</p>
                  <Link
                    href="/user-request"
                    className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Make a Request
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </MainLayout>
  )
}
