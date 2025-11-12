import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import TaxClassesTab from '@/Pages/Admin/Tax/Tabs/TaxClassesTab';
import TaxRatesTab from '@/Pages/Admin/Tax/Tabs/TaxRatesTab';
import TaxSettingsTab from '@/Pages/Admin/Tax/Tabs/TaxSettingsTab';
import { BarChart3, ShoppingCart, Tags, MessageSquare, Users, Settings, Percent } from 'lucide-react';

const adminNavItems = [
    { title: 'Dashboard', href: '/admin-dashboard', icon: BarChart3 },
    { title: 'Products', href: '/admin/products', icon: ShoppingCart },
    { title: 'Sales Dashboard', href: '/admin/sales', icon: BarChart3 },
    { title: 'Categories & Brands', href: '/admin/categories', icon: Tags },
    { title: 'Product Requests', href: '/admin/product-requests', icon: MessageSquare },
    { title: 'Stock Management', href: '/admin/stock', icon: ShoppingCart },
    { title: 'Customers', href: '/admin/customers', icon: Users },
    { title: 'Tax Settings', href: '/admin/tax/settings', icon: Percent, isActive: true },
    { title: 'Site Configuration', href: '/site-config', icon: Settings },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin-dashboard',
    },
    {
        title: 'Tax Settings',
        href: '/admin/tax/settings',
    },
];

function classNames(...classes: Array<string | boolean | undefined | null>) {
    return classes.filter(Boolean).join(' ');
}

type TabsMap = Record<string, { label: string; route: string }>

type Props = {
    auth: { user: any };
    activeTab: string;
    tabs: TabsMap;
    classes?: any[];
    taxRates?: any[];
    taxClasses?: any[];
    settings?: Record<string, any>;
};

export default function TaxSettings({ auth, activeTab, tabs, classes = [], taxRates = [], taxClasses = [], settings = {} }: Props) {
    const tabIndex = Object.keys(tabs).findIndex(key => key === activeTab);
    const [selectedIndex, setSelectedIndex] = useState(tabIndex >= 0 ? tabIndex : 0);

    useEffect(() => {
        const newIndex = Object.keys(tabs).findIndex(key => key === activeTab);
        if (newIndex >= 0) {
            setSelectedIndex(newIndex);
        }
    }, [activeTab, tabs]);

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Tax Settings" />

            <div className="flex w-full flex-col p-6 font-sans">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-semibold text-gray-900">Tax Settings</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage tax classes, rates, and configuration</p>
                    </div>
                </div>

                <div className="mt-6">
                    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                        <div className="border-b border-gray-200">
                            <Tab.List className="-mb-px grid grid-cols-3 gap-0">
                                {Object.entries(tabs).map(([key, tab]) => {
                                    const isActive = key === activeTab;
                                    return (
                                        <Tab key={key} as="div" className="outline-none">
                                            <Link
                                                href={tab.route}
                                                className={classNames(
                                                    'block w-full whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium text-center',
                                                    isActive
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                )}
                                            >
                                                {tab.label}
                                            </Link>
                                        </Tab>
                                    );
                                })}
                            </Tab.List>
                        </div>

                        <Tab.Panels className="mt-6 w-full">
                            <Tab.Panel>
                                <div className="overflow-hidden bg-white shadow sm:rounded-lg w-full">
                                    <div className="p-4 sm:p-6 w-full">
                                        <TaxClassesTab classes={classes} taxClasses={taxClasses} />
                                    </div>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel>
                                <div className="overflow-hidden bg-white shadow sm:rounded-lg w-full">
                                    <div className="p-4 sm:p-6 w-full">
                                        <TaxRatesTab taxRates={taxRates} taxClasses={taxClasses} />
                                    </div>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel>
                                <div className="overflow-hidden bg-white shadow sm:rounded-lg w-full">
                                    <div className="p-4 sm:p-6 w-full">
                                        <TaxSettingsTab settings={settings} taxClasses={taxClasses} />
                                    </div>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </AppLayout>
    );
}


