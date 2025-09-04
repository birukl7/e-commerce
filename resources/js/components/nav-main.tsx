import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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
    FileImage 
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
};

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    // Handle both function icons (from frontend) and string icons (from backend)
                    let Icon: React.ComponentType | undefined;
                    
                    if (typeof item.icon === 'function') {
                        // Frontend icon (React component)
                        Icon = item.icon;
                    } else if (typeof item.icon === 'string') {
                        // Backend icon (string name)
                        Icon = iconMap[item.icon];
                    }
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {Icon ? <Icon /> : null}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
