
import AppLayout from '@/layouts/app-layout';
import MainLayout from '@/layouts/app/main-layout';
import { NavItem, type BreadcrumbItem } from '@/types';
import {  BrickWall, ListOrdered, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    }
];

const defaultMainNavItems: NavItem[] = [
  {
      title: 'BookMarked Products',
      href: '/dashboard',
      icon: Save,
  },
  {
    title: 'Orders',
    href: '/dashboard',
    icon: ListOrdered,
  },
  {
    title: 'Requests',
    href: '/dashboard',
    icon: BrickWall,
  },
  {
    title: 'Bought Products',
    href: '/dashboard',
    icon: ListOrdered,
  }
];

export default function Dashboard() {
    return (
      <MainLayout  title={'User Dashboard'} className={''} footerOff={false} contentMarginTop={'mt-[60px]'}>
          <AppLayout logoDisplay=' invisible' sidebarStyle='mt-[20px]' breadcrumbs={breadcrumbs} mainNavItems={defaultMainNavItems} footerNavItems={[]} >
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">

                    </div>
                    <div className="relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">

                    </div>
                    <div className="relative aspect-video  rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">

                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                </div>
            </div>
        </AppLayout>
      </MainLayout>
    );
}
