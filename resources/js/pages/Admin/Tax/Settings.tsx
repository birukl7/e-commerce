import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import TaxClassesTab from '@/Pages/Admin/Tax/Tabs/TaxClassesTab';
import TaxRatesTab from '@/Pages/Admin/Tax/Tabs/TaxRatesTab';
import TaxSettingsTab from '@/Pages/Admin/Tax/Tabs/TaxSettingsTab';

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
        <AdminLayout title="Tax Settings">
            <Head title="Tax Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                            {Object.entries(tabs).map(([key, tab]) => {
                                const isActive = key === activeTab;
                                return (
                                    <Tab key={key} as="div" className="outline-none">
                                        <Link
                                            href={tab.route}
                                            className={classNames(
                                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                                isActive
                                                    ? 'bg-white shadow text-blue-700'
                                                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                                                'block w-full text-center'
                                            )}
                                        >
                                            {tab.label}
                                        </Link>
                                    </Tab>
                                );
                            })}
                        </Tab.List>

                        <Tab.Panels className="mt-2">
                            <Tab.Panel className={classNames(
                                'rounded-xl bg-white p-3',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                            )}>
                                <TaxClassesTab 
                                    classes={classes} 
                                    taxClasses={taxClasses} 
                                />
                            </Tab.Panel>

                            <Tab.Panel className={classNames(
                                'rounded-xl bg-white p-3',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                            )}>
                                <TaxRatesTab 
                                    taxRates={taxRates} 
                                    taxClasses={taxClasses} 
                                />
                            </Tab.Panel>

                            <Tab.Panel className={classNames(
                                'rounded-xl bg-white p-3',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                            )}>
                                <TaxSettingsTab 
                                    settings={settings} 
                                    taxClasses={taxClasses} 
                                />
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </AdminLayout>
    );
}


