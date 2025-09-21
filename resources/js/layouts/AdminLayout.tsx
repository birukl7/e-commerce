import { ReactNode, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, Settings as SettingsIcon, Percent } from 'lucide-react';
import { type SharedData } from '@/types';
import { SidebarProvider } from '@/components/ui/sidebar';

type AdminLayoutProps = {
    children: ReactNode;
    title?: string;
};

// Default navigation items for the sidebar
const defaultNavItems = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Products', href: '/admin/products', icon: Package },
    { title: 'Categories', href: '/admin/categories', icon: Tag },
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Customers', href: '/admin/customers', icon: Users },
    { title: 'Tax Settings', href: '/admin/tax-settings', icon: Percent },
    { title: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { url } = usePage<SharedData>();
    const [open, setOpen] = useState(true);
    
    // Generate breadcrumbs based on the current URL
    const getBreadcrumbs = (): { title: string; href: string }[] => {
        const segments = url.split('/').filter(Boolean);
        return segments.map((segment, index) => ({
            title: segment.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            href: `/${segments.slice(0, index + 1).join('/')}`
        }));
    };

    return (
        <SidebarProvider defaultOpen={true} open={open} onOpenChange={setOpen}>
            <div className="min-h-screen bg-gray-50">
                <Head title={title} />
                
                <AppHeader breadcrumbs={getBreadcrumbs()} />
                
                <div className="flex h-screen overflow-hidden">
                    <AppSidebar 
                        footerNavItems={[]} 
                        logoDisplay="full"
                        mainNavItems={defaultNavItems}
                    />
                    
                    <div className="relative flex flex-col flex-1 overflow-hidden">
                        <main className="flex-1 overflow-y-auto">
                            <div className="p-6 mx-auto max-w-7xl">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
