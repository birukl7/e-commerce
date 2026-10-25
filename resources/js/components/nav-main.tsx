import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
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
    const [primaryColor, setPrimaryColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
            } catch {
                return '#1E5338';
            }
        }
        return '#1E5338';
    });

    useEffect(() => {
        const handleThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) {
                setPrimaryColor(color);
            }
        };
        window.addEventListener('serdo:theme-color-changed', handleThemeChange);
        window.addEventListener('theme-color-changed', handleThemeChange);
        return () => {
            window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
            window.removeEventListener('theme-color-changed', handleThemeChange);
        };
    }, []);
    
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
        
        return (
            <div key={item.href} className={level > 0 ? 'pl-4' : ''}>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        asChild 
                        isActive={isActive} 
                        tooltip={{ children: item.title }}
                        className={`transition-all duration-200 text-sm font-medium ${
                            isActive
                                ? '!rounded-full !text-white shadow-sm font-semibold'
                                : 'hover:!rounded-full text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                        }`}
                        style={
                            isActive
                                ? {
                                      backgroundColor: primaryColor,
                                      color: '#ffffff',
                                      boxShadow: `0 4px 12px -2px ${primaryColor}40`,
                                  }
                                : undefined
                        }
                    >
                        <Link href={item.href} prefetch className="flex items-center gap-2.5 px-3 py-2">
                            {Icon && (
                                <div className={`h-5 w-5 flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                                    <Icon />
                                </div>
                            )}
                            <span className="truncate">{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                    {item.badge !== undefined && item.badge !== null && Number(item.badge) > 0 && (
                        <SidebarMenuBadge className="!bg-red-500 !text-white !rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1.5 text-xs font-semibold shadow-xs">
                            {Number(item.badge) > 99 ? '99+' : item.badge}
                        </SidebarMenuBadge>
                    )}
                </SidebarMenuItem>
                
                {/* Render tabs if they exist */}
                {item.tabs && item.tabs.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-neutral-100 pl-2">
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
                                        className={`text-xs font-medium transition-all duration-200 ${
                                            isTabActive
                                                ? '!rounded-full !text-white shadow-xs font-semibold'
                                                : 'hover:!rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                        }`}
                                        style={
                                            isTabActive
                                                ? {
                                                      backgroundColor: primaryColor,
                                                      color: '#ffffff',
                                                      boxShadow: `0 2px 8px -1px ${primaryColor}40`,
                                                  }
                                                : undefined
                                        }
                                    >
                                        <Link href={tab.href} prefetch className="flex items-center gap-2 px-3 py-1.5">
                                            {tab.icon && iconMap[tab.icon] && (
                                                <div className={`h-3.5 w-3.5 flex items-center justify-center shrink-0 ${isTabActive ? 'text-white' : 'text-neutral-400'}`}>
                                                    {React.createElement(iconMap[tab.icon], {})}
                                                </div>
                                            )}
                                            <span className="truncate">{tab.title}</span>
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
