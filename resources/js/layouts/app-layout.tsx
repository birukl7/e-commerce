import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { NavItem, type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    mainNavItems: NavItem[];
    footerNavItems: NavItem[];
    sidebarStyle?: string;
    logoDisplay?: string
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate  breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
