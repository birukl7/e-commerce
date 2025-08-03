import { ChartAreaGradient } from "@/components/chart-area-gradient"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartRadarDefault } from "@/components/chart-radar-default"
import { ChartRadialShape } from "@/components/chart-radial-shape"
import AppLayout from "@/layouts/app-layout"
import type { NavItem, BreadcrumbItem } from "@/types"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Tags,
  CreditCard,
  Settings,
  Mail,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Head } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
  },
]

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Product Requests",
    href: "/admin/requests",
    icon: MessageSquare,
  },
  {
    title: "Categories & Brands",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Site Configuration",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Communication",
    href: "/admin/communication",
    icon: Mail,
  },
]

export default function AdminDashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
      <Head title="Admin Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto font-sans">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$45,231.89</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary font-medium">+20.1%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2,350</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary font-medium">+180</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,234</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-primary font-medium">+19%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">12</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-muted-foreground">Products need restocking</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <ChartAreaGradient />
          </div>
          <div className="relative rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <ChartRadarDefault />
          </div>
          <div className="relative rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <ChartRadialShape />
          </div>
        </div>

        {/* Recent Activity and Top Products */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold text-foreground">Recent Orders</CardTitle>
              <CardDescription className="text-muted-foreground">Latest orders from customers</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">#ORD-001</p>
                    <p className="text-xs text-muted-foreground">John Doe</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">$299.99</p>
                    <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                      Paid
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">#ORD-002</p>
                    <p className="text-xs text-muted-foreground">Jane Smith</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">$149.50</p>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Pending
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">#ORD-003</p>
                    <p className="text-xs text-muted-foreground">Mike Johnson</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">$89.99</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Shipped
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">#ORD-004</p>
                    <p className="text-xs text-muted-foreground">Sarah Wilson</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">$199.99</p>
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Delivered
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-semibold text-foreground">Top Selling Products</CardTitle>
              <CardDescription className="text-muted-foreground">Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Wireless Headphones</p>
                      <p className="text-xs text-muted-foreground">Electronics</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">245 sold</p>
                    <p className="text-xs text-muted-foreground">$12,250</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Smart Watch</p>
                      <p className="text-xs text-muted-foreground">Wearables</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">189 sold</p>
                    <p className="text-xs text-muted-foreground">$18,900</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Laptop Stand</p>
                      <p className="text-xs text-muted-foreground">Accessories</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">156 sold</p>
                    <p className="text-xs text-muted-foreground">$4,680</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">USB-C Cable</p>
                      <p className="text-xs text-muted-foreground">Cables</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">134 sold</p>
                    <p className="text-xs text-muted-foreground">$1,340</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trends Chart */}
        <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <ChartAreaInteractive />
        </div>
      </div>
    </AppLayout>
  )
}
