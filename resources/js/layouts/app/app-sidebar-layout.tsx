import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { NavItem, type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[], mainNavItems?:NavItem[], footerNavItems?:NavItem[], sidebarStyle?: string, logoDisplay?:string }>) {
    // eslint-disable-next-line prefer-rest-params
    const { mainNavItems = [], footerNavItems = [], sidebarStyle } = arguments[0] || {};
    return (
        <AppShell variant="sidebar" sidebarStyle={sidebarStyle}>
            <AppSidebar
                // eslint-disable-next-line prefer-rest-params
                logoDisplay={arguments[0]?.logoDisplay}
                mainNavItems={mainNavItems}
                footerNavItems={footerNavItems}
            />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
