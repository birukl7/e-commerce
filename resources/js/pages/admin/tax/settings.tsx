import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { adminNavItems } from '@/constants/adminNavItems';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import TaxClassesTab from './Tabs/TaxClassesTab';
import TaxRatesTab from './Tabs/TaxRatesTab';
import TaxSettingsTab from './Tabs/TaxSettingsTab';
import { Percent, Layers, Sliders, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabsMap = Record<string, { label: string; route: string }>;

type Props = {
    auth: { user: any };
    activeTab: string;
    tabs: TabsMap;
    classes?: any[];
    taxRates?: any[];
    taxClasses?: any[];
    settings?: Record<string, any>;
};

export default function TaxSettings({
    activeTab,
    tabs,
    classes = [],
    taxRates = [],
    taxClasses = [],
    settings = {},
}: Props) {
    const [primaryColor, setPrimaryColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('serdo_dashboard_primary_color') || '#1E5338';
        }
        return '#1E5338';
    });

    useEffect(() => {
        const handler = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handler);
        return () => window.removeEventListener('serdo:theme-color-changed', handler);
    }, []);

    const totalClassesCount = (classes.length > 0 ? classes.length : taxClasses.length) || 2;
    const totalRatesCount = taxRates.length || 1;

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

    return (
        <AppLayout breadcrumbs={breadcrumbs} mainNavItems={adminNavItems} footerNavItems={[]}>
            <Head title="Tax & Fiscal Settings" />

            <div className="min-h-screen bg-[#F6F8FA] p-6 lg:p-8 font-sans text-neutral-900">
                <div className="max-w-[1440px] mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financial Policy</span>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-xs font-medium text-emerald-600">Active</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 mt-1">
                                Tax Settings & Rules
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Configure localized tax rates, product classifications, and fiscal calculation rules for storefront checkout.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white text-gray-700 border border-gray-200/80 shadow-xs">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Ethiopian VAT Compliant
                            </span>
                        </div>
                    </div>

                    {/* 3 Donezo Signature Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Primary Hero Metric */}
                        <div
                            className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Standard Rate</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                    <Percent className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 relative z-10">
                                <h3 className="text-3xl font-black tracking-tight text-white">15.0%</h3>
                                <p className="text-xs font-medium text-white/80 mt-1">Default nationwide VAT rate</p>
                            </div>
                        </div>

                        {/* Tax Classes Metric */}
                        <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tax Classes</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                                    <Layers className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black tracking-tight text-emerald-600">{totalClassesCount} Classes</h3>
                                <p className="text-xs font-medium text-gray-500 mt-1">Product taxability categories</p>
                            </div>
                        </div>

                        {/* Active Rates Metric */}
                        <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Jurisdiction Rules</span>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50">
                                    <Sliders className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-black tracking-tight text-purple-600">{totalRatesCount} Defined</h3>
                                <p className="text-xs font-medium text-gray-500 mt-1">Active geographic tax rates</p>
                            </div>
                        </div>
                    </div>

                    {/* Modern Pill Tabs Header */}
                    <div className="flex items-center justify-between">
                        <div className="inline-flex rounded-2xl bg-gray-200/60 p-1 border border-gray-200/50">
                            {Object.entries(tabs).map(([key, tab]) => {
                                const isActive = key === activeTab;
                                return (
                                    <Link
                                        key={key}
                                        href={tab.route}
                                        className={cn(
                                            isActive
                                                ? 'bg-white text-gray-900 shadow-sm font-bold'
                                                : 'text-gray-500 hover:text-gray-900 font-medium',
                                            'rounded-xl px-5 py-2.5 text-xs tracking-wide transition-all cursor-pointer inline-flex items-center gap-2'
                                        )}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        {key === 'classes' && <Layers className="w-3.5 h-3.5" />}
                                        {key === 'rates' && <Percent className="w-3.5 h-3.5" />}
                                        {key === 'settings' && <Sliders className="w-3.5 h-3.5" />}
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content Container */}
                    <div className="space-y-6">
                        {activeTab === 'classes' && (
                            <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm">
                                <TaxClassesTab classes={classes} taxClasses={taxClasses} />
                            </div>
                        )}

                        {activeTab === 'rates' && (
                            <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm">
                                <TaxRatesTab taxRates={taxRates} taxClasses={taxClasses} />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="rounded-[26px] border border-gray-200/80 bg-white p-6 shadow-sm">
                                <TaxSettingsTab settings={settings} taxClasses={taxClasses} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

