import { ChartAreaGradient } from '@/components/chart-area-gradient';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { ChartRadarDefault } from '@/components/chart-radar-default';
import { ChartRadialShape } from '@/components/chart-radial-shape';
import AppLayout from '@/layouts/app-layout';
import type { NavItem, BreadcrumbItem } from "@/types"
import {
  Bookmark,
  ShoppingBag,
  MessageSquare,
  Package2,
  LayoutDashboard,
} from "lucide-react"
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

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

export default function Dashboard() {
    return (
        <AppLayout 
            breadcrumbs={breadcrumbs} 
            mainNavItems={defaultMainNavItems} 
            footerNavItems={[]}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <ChartAreaGradient />
                    </div>
                    <div className="relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <ChartRadarDefault />
                    </div>
                    <div className="relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <ChartRadialShape />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    <ChartAreaInteractive/>
                </div>
            </div>
        </AppLayout>
    );
}
