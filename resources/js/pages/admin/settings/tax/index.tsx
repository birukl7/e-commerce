'use client';

import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Percent, Layers, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Tab = {
    name: string;
    href: string;
    icon: any;
    component: React.ReactNode;
};

export default function TaxSettings() {
    const tabs: Tab[] = [
        {
            name: 'Tax Rates',
            href: '/admin/settings/tax/rates',
            icon: Percent,
            component: <TaxRates />,
        },
        {
            name: 'Tax Classes',
            href: '/admin/settings/tax/classes',
            icon: Layers,
            component: <TaxClasses />,
        },
        {
            name: 'Tax Rules',
            href: '/admin/settings/tax/rules',
            icon: FileText,
            component: <TaxRules />,
        },
    ];

    return (
        <AdminLayout>
            <Head title="Tax Settings" />
            
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-semibold text-gray-900">Tax & Financial Settings</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Configure tax rates, classes, and rules for your store
                        </p>
                    </div>
                </div>
                
                <div className="mt-8">
                    <Tabs defaultValue="rates" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <TabsList>
                                {tabs.map((tab) => (
                                    <TabsTrigger 
                                        key={tab.href} 
                                        value={tab.href.split('/').pop() || 'rates'}
                                        asChild
                                    >
                                        <Link href={tab.href} className="flex items-center gap-2">
                                            <tab.icon className="h-4 w-4" />
                                            {tab.name}
                                        </Link>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        
                        {tabs.map((tab) => (
                            <TabsContent 
                                key={tab.href} 
                                value={tab.href.split('/').pop() || 'rates'}
                                className="space-y-4"
                            >
                                {tab.component}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
}

// Placeholder components for each tab
function TaxRates() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Rates</h2>
            <p className="text-muted-foreground">
                Configure tax rates for different regions and countries.
            </p>
            {/* Tax rates content will go here */}
        </div>
    );
}

function TaxClasses() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Classes</h2>
            <p className="text-muted-foreground">
                Manage tax classes for different types of products and customers.
            </p>
            {/* Tax classes content will go here */}
        </div>
    );
}

function TaxRules() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Rules</h2>
            <p className="text-muted-foreground">
                Set up rules for how taxes are calculated and applied.
            </p>
            {/* Tax rules content will go here */}
        </div>
    );
}
