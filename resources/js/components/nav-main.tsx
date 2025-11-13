import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { 
    LayoutDashboard, 
    Package, 
    CreditCard, 
    Users, 
    Tags, 
    MessageSquare, 
    ShoppingCart, 
    Settings, 
    FileImage,
    BarChart3,
    Percent,
    PackageCheck,
    AlertTriangle,
    PackageMinus,
    PackageX,
    History
} from 'lucide-react';

// Icon mapping for backend menu items
const iconMap: Record<string, React.ComponentType> = {
    LayoutDashboard,
    Package,
    CreditCard,
    Users,
    Tags,
    MessageSquare,
    ShoppingCart,
    Settings,
    FileImage,
    BarChart3,
    Percent,
    PackageCheck,
    AlertTriangle,
    PackageMinus,
    PackageX,
    History,
};

interface NavItemWithChildren extends NavItem {
    children?: NavItem[];
    tabs?: Array<{ title: string; href: string; icon?: string }>;
}

export function NavMain({ items = [] }: { items: NavItemWithChildren[] }) {
    const page = usePage();
    
    const renderNavItem = (item: NavItemWithChildren, level = 0) => {
        // Handle both function icons (from frontend) and string icons (from backend)
        let Icon: React.ComponentType | undefined;
        
        if (typeof item.icon === 'function' || (typeof item.icon === 'object' && item.icon !== null)) {
            // Frontend icon (React component or forwardRef exotic component)
            Icon = item.icon as React.ComponentType;
        } else if (typeof item.icon === 'string') {
            // Backend icon (string name)
            Icon = iconMap[item.icon];
        }
        
        // Check if current URL matches the item's href or any of its children or tabs
        const isActive = isItemActive(item, page.url);
        
        // Check if any tab is active
        const activeTab = item.tabs?.find(tab => 
            page.url === tab.href || 
            (page.url.startsWith(tab.href) && 
             (page.url[tab.href.length] === '/' || 
              page.url.length === tab.href.length))
        );
        
        return (
            <div key={item.href} className={level > 0 ? 'pl-4' : ''}>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        asChild 
                        isActive={isActive} 
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href} prefetch>
                            {Icon && <div className="h-5 w-5 flex items-center justify-center"><Icon /></div>}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                    {item.badge !== undefined && item.badge !== null && Number(item.badge) > 0 && (
                        <SidebarMenuBadge className="!bg-red-500 !text-white !rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1.5 text-xs font-semibold">
                            {Number(item.badge) > 99 ? '99+' : item.badge}
                        </SidebarMenuBadge>
                    )}
                </SidebarMenuItem>
                
                {/* Render tabs if they exist */}
                {item.tabs && item.tabs.length > 0 && (
                    <div className="ml-8 mt-1 space-y-1">
                        {item.tabs.map((tab) => {
                            const isTabActive = page.url === tab.href || 
                                (page.url.startsWith(tab.href) && 
                                 (page.url[tab.href.length] === '/' || 
                                  page.url.length === tab.href.length));
                            
                            return (
                                <SidebarMenuItem key={tab.href}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={isTabActive}
                                        className="text-sm"
                                    >
                                        <Link href={tab.href} prefetch>
                                            {tab.icon && iconMap[tab.icon] && (
                                                <div className="h-4 w-4 flex items-center justify-center mr-1 text-muted-foreground">
                                                    {React.createElement(iconMap[tab.icon], {})}
                                                </div>
                                            )}
                                            <span>{tab.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </div>
                )}
                
                {/* Render children if they exist (for backward compatibility) */}
                {item.children && item.children.length > 0 && !item.tabs && (
                    <div className="ml-4 mt-1 space-y-1">
                        {item.children.map(child => renderNavItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map(item => renderNavItem(item))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

// Helper function to check if an item or any of its children is active
function isItemActive(item: NavItemWithChildren, currentUrl: string): boolean {
    // Normalize URLs for comparison
    const normalizeUrl = (url: string) => url.replace(/\/$/, '');
    const itemUrl = normalizeUrl(item.href);
    const normalizedUrl = normalizeUrl(currentUrl);
    
    // Check if this item is active
    if (itemUrl === normalizedUrl || 
        (normalizedUrl.startsWith(itemUrl) && 
         (normalizedUrl[itemUrl.length] === '/' || 
          normalizedUrl.length === itemUrl.length))) {
        return true;
    }
    
    // Special case for admin dashboard
    if (item.href === '/admin' && (normalizedUrl === '/admin' || normalizedUrl === '/admin-dashboard')) {
        return true;
    }
    
    // Check if any child is active
    if (item.children) {
        return item.children.some(child => isItemActive(child, currentUrl));
    }
    
    return false;
}
