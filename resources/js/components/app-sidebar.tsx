import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';

interface AdminMenu {
    structure: Record<string, NavItem[]>;
    flatItems: NavItem[];
}

interface AppSidebarProps {
    mainNavItems?: NavItem[]; // Keep for backward compatibility
    footerNavItems: NavItem[];
    logoDisplay: string;
}

export function AppSidebar({ 
    mainNavItems = [], 
    footerNavItems,
    logoDisplay
}: AppSidebarProps) {
    const { adminMenu } = usePage<{ adminMenu?: AdminMenu }>().props;
    
    // Use dynamic admin menu if available, fallback to passed mainNavItems
    const navItems = adminMenu ? adminMenu.flatItems : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link className={`` + logoDisplay} href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className='mt-20'>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    ); 
}