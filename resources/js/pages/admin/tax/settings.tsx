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

            <div className="px-4 sm:px-6 lg:px-8">
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

                        <Tab.Panels className="mt-6">
                            <Tab.Panel>
                                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                                    <div className="p-4 sm:p-6">
                                        <TaxClassesTab classes={classes} taxClasses={taxClasses} />
                                    </div>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel>
                                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                                    <div className="p-4 sm:p-6">
                                        <TaxRatesTab taxRates={taxRates} taxClasses={taxClasses} />
                                    </div>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel>
                                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                                    <div className="p-4 sm:p-6">
                                        <TaxSettingsTab settings={settings} taxClasses={taxClasses} />
                                    </div>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </AdminLayout>
    );
}


