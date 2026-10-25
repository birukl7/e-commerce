import MainLayout from "@/layouts/app/main-layout";
import { UserHeaderNav } from "@/components/user-header-nav";
import type { BreadcrumbItem, SharedData } from "@/types";
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
  Settings,
  ArrowUpRight,
  Search,
  Plus,
  ChevronRight,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import React from "react";
import { useTranslation } from "react-i18next";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number | null;
  current_price: number;
  image: string;
  category?: string;
  brand?: string;
  stock_status: string;
  added_at: string;
}

interface ProductRequest {
  id: number;
  product_name: string;
  description: string;
  status: string;
  image?: string | null;
  created_at: string;
  admin_response?: string;
}

interface DashboardStats {
  wishlist_count: number;
  requests_count: number;
  pending_requests: number;
  approved_requests: number;
}

interface DashboardProps {
  stats: DashboardStats;
  recentWishlist: Product[];
  recentRequests: ProductRequest[];
}

// Helper to format currency
const formatETB = (amount: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Dashboard({ stats, recentWishlist = [], recentRequests = [] }: DashboardProps) {
  const { t } = useTranslation();
  const page = usePage<SharedData>();
  const user = page.props.auth?.user;

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t("header.dashboard") || "Dashboard",
      href: "/dashboard",
    },
  ];

  const userNavTabs = [
    {
      title: t("header.dashboard") || "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    {
      title: t("header.bookmarkedProducts") || "Wishlist",
      href: "/user-wishlist",
      icon: Bookmark,
      count: stats?.wishlist_count,
    },
    {
      title: t("header.orders") || "Orders",
      href: "/user-order",
      icon: ShoppingBag,
    },
    {
      title: t("header.requests") || "Product Requests",
      href: "/user-request",
      icon: MessageSquare,
      count: stats?.requests_count,
    },
    {
      title: t("header.boughtProducts") || "Bought Products",
      href: "/user-products",
      icon: Package2,
    },
    {
      title: t("header.settings") || "Settings",
      href: "/settings/profile",
      icon: Settings,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          icon: <Clock className="w-3 h-3 text-amber-600" />,
          label: "Pending Review",
        };
      case "approved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
          label: "Approved",
        };
      case "rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          icon: <XCircle className="w-3 h-3 text-rose-600" />,
          label: "Declined",
        };
      case "reviewed":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200/80",
          icon: <Eye className="w-3 h-3 text-sky-600" />,
          label: "Reviewed",
        };
      default:
        return {
          bg: "bg-neutral-100 text-neutral-700 border-neutral-200",
          icon: <Clock className="w-3 h-3 text-neutral-500" />,
          label: status,
        };
    }
  };

  return (
    <MainLayout
      title={t("dashboard.title") || "Customer Dashboard"}
      className="bg-[#FAFAFA]"
      footerOff={false}
      contentMarginTop="mt-[70px]"
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={false}
    >
      <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 pb-16">
        {/* TOP HEADER SUB-NAVBAR (Clean Horizontal Header Navigation, No Icons, Active Underline) */}
        <UserHeaderNav activeTab="dashboard" />

        {/* ========================================================== */}
        {/* MAIN BODY: Minimal & Clean Content                         */}
        {/* ========================================================== */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Header Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Account Overview
                </span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-emerald-600">Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                Hi, {user?.name ? user.name.split(" ")[0] : "there"}!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Here is a clean summary of your saved products, active sourcing requests, and activity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/products"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95"
              >
                <Search className="w-3.5 h-3.5 text-neutral-500" />
                <span>Explore Store</span>
              </Link>
              <Link
                href="/settings/profile"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 text-xs font-semibold text-neutral-700 shadow-xs transition-all active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-500" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* ========================================================== */}
          {/* STATS CARDS: 4 Minimal Metric Cards                        */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Wishlist */}
            <Link
              href="/user-wishlist"
              className="rounded-2xl bg-white p-5 border border-neutral-200/80 shadow-xs hover:border-neutral-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between group min-h-[130px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Wishlist Items</span>
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {stats?.wishlist_count ?? 0}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                  <span>Saved for later</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                </p>
              </div>
            </Link>

            {/* Card 2: Total Requests */}
            <Link
              href="/user-request"
              className="rounded-2xl bg-white p-5 border border-neutral-200/80 shadow-xs hover:border-neutral-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between group min-h-[130px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Total Requests</span>
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {stats?.requests_count ?? 0}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                  <span>Sourcing submissions</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                </p>
              </div>
            </Link>

            {/* Card 3: Pending Review */}
            <div className="rounded-2xl bg-white p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Pending Review</span>
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {stats?.pending_requests ?? 0}
                </div>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">Awaiting response</p>
              </div>
            </div>

            {/* Card 4: Approved */}
            <div className="rounded-2xl bg-white p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Approved</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {stats?.approved_requests ?? 0}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">Ready or fulfilled</p>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* TWO-COLUMN SECTION: Recent Wishlist & Custom Requests      */}
          {/* ========================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Recent Wishlist Items (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Saved Wishlist</h2>
                    <p className="text-xs text-neutral-400">Products saved for quick access</p>
                  </div>
                  <Link
                    href="/user-wishlist"
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1 rounded-full hover:bg-neutral-50 transition-colors flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </Link>
                </div>

                {recentWishlist && recentWishlist.length > 0 ? (
                  <div className="space-y-3">
                    {recentWishlist.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/60 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0">
                            <img
                              src={product.image || "/placeholder.svg?height=60&width=60"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${product.slug}`}
                              className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700 truncate block transition-colors"
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.sale_price ? (
                                <>
                                  <span className="text-xs font-bold text-emerald-700">
                                    {formatETB(product.current_price)}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 line-through">
                                    {formatETB(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-neutral-900">
                                  {formatETB(product.current_price)}
                                </span>
                              )}
                            </div>
                            {(product.category || product.brand) && (
                              <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                {[product.category, product.brand].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              product.stock_status === "in_stock"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : product.stock_status === "out_of_stock"
                                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {product.stock_status.replace("_", " ")}
                          </span>
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-0.5"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-neutral-200">
                    <Bookmark className="mx-auto h-7 w-7 text-neutral-300 mb-2" />
                    <p className="text-xs font-bold text-neutral-700">No items saved yet</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Bookmark items while browsing to track them here.</p>
                    <Link
                      href={route("home")}
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-4 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Browse Products</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Total: <strong className="text-neutral-900">{stats?.wishlist_count ?? 0} items</strong></span>
                <Link
                  href="/user-wishlist"
                  className="font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
                >
                  <span>Go to Wishlist</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Right Column: Recent Sourcing Requests (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Product Requests</h2>
                    <p className="text-xs text-neutral-400">Custom sourcing and procurement status</p>
                  </div>
                  <Link
                    href="/user-request"
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1 rounded-full hover:bg-neutral-50 transition-colors flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                  </Link>
                </div>

                {recentRequests && recentRequests.length > 0 ? (
                  <div className="space-y-3">
                    {recentRequests.map((request) => {
                      const badge = getStatusBadge(request.status);
                      return (
                        <div
                          key={request.id}
                          className="p-3.5 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/60 transition-all flex flex-col justify-between gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {request.image ? (
                                <img
                                  src={request.image}
                                  alt={request.product_name}
                                  className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-500 shrink-0">
                                  <MessageSquare className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="font-bold text-xs text-neutral-900 truncate">
                                  {request.product_name}
                                </h3>
                                <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                                  {request.description}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badge.bg}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          {request.admin_response && (
                            <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/70 text-[11px] text-neutral-600">
                              <span className="font-bold text-neutral-800">Admin: </span>
                              {request.admin_response}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-100/80">
                            <span>
                              {new Date(request.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <Link
                              href="/user-request"
                              className="font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-0.5"
                            >
                              <span>View details</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-neutral-200">
                    <MessageSquare className="mx-auto h-7 w-7 text-neutral-300 mb-2" />
                    <p className="text-xs font-bold text-neutral-700">No sourcing requests yet</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Can't find what you need? We can source it for you.</p>
                    <Link
                      href="/user-request"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-4 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Total: <strong className="text-neutral-900">{stats?.requests_count ?? 0} requests</strong></span>
                <Link
                  href="/user-request"
                  className="font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1"
                >
                  <span>Manage Requests</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
