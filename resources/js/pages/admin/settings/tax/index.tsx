/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Percent, Layers, FileText, ArrowUpRight, Calculator, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

type Tab = {
    name: string;
    href: string;
    icon: any;
    component: React.ReactNode;
};

export default function TaxSettings() {
    const [primaryColor, setPrimaryColor] = useState<string>('#1E5338');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('serdo_dashboard_primary_color');
            if (saved) setPrimaryColor(saved);
        } catch {
            // Ignore
        }

        const handleThemeChange = (e: any) => {
            const color = typeof e.detail === 'string' ? e.detail : (e.detail?.color || e.detail?.hex);
            if (color) setPrimaryColor(color);
        };
        window.addEventListener('serdo:theme-color-changed', handleThemeChange);
        return () => window.removeEventListener('serdo:theme-color-changed', handleThemeChange);
    }, []);

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
            <Head title="Tax & Financial Settings | Donezo Style" />

            <div className="min-h-screen bg-[#F6F8FA] p-4 sm:p-6 lg:p-8 font-sans text-neutral-900 transition-colors duration-300">
                <div className="max-w-[1440px] mx-auto space-y-6">

                    {/* Title Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                                    Tax & Financial Settings
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                                    <ShieldCheck className="w-3 h-3 text-neutral-500" />
                                    Fiscal Compliance
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
                                Configure localized tax rates, product classifications, and calculation rules for your store checkout.
                            </p>
                        </div>
                    </div>

                    {/* Donezo 3-Card Metrics Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Card 1: Primary Accent */}
                        <div
                            className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-medium text-white/80">Default Calculation</span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                                    <ArrowUpRight className="w-4 h-4" style={{ color: primaryColor }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                    Standard 15%
                                </div>
                                <p className="text-[11px] text-white/70">Ethiopian standard VAT rate</p>
                            </div>
                        </div>

                        {/* Card 2: White Card */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Class Definitions</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                                    <Layers className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-extrabold tracking-tight text-neutral-900">
                                    Tiered Classes
                                </div>
                                <p className="text-[11px] text-neutral-400">Standard, reduced, and exempt product rules</p>
                            </div>
                        </div>

                        {/* Card 3: White Card */}
                        <div className="rounded-[26px] bg-white p-6 border border-neutral-100 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-semibold text-neutral-400">Automated Computation</span>
                                <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700">
                                    <Calculator className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-extrabold tracking-tight text-neutral-900">
                                    Checkout Sync
                                </div>
                                <p className="text-[11px] text-neutral-400">Real-time invoice calculation on customer order</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs Card */}
                    <div className="rounded-[26px] bg-white border border-neutral-100 shadow-xs p-6">
                        <Tabs defaultValue="rates" className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                                <TabsList className="bg-neutral-100/70 p-1 rounded-full border border-neutral-200/50">
                                    {tabs.map((tab) => (
                                        <TabsTrigger
                                            key={tab.href}
                                            value={tab.href.split('/').pop() || 'rates'}
                                            asChild
                                        >
                                            <Link
                                                href={tab.href}
                                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-xs text-neutral-500 hover:text-neutral-800"
                                            >
                                                <tab.icon className="h-3.5 w-3.5" />
                                                <span>{tab.name}</span>
                                            </Link>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {tabs.map((tab) => (
                                <TabsContent
                                    key={tab.href}
                                    value={tab.href.split('/').pop() || 'rates'}
                                    className="space-y-4 focus-visible:outline-none"
                                >
                                    {tab.component}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}

function TaxRates() {
    return (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Tax Rates Configuration</h2>
            <p className="text-xs text-neutral-400">
                Configure percentage and flat tax rates applied to geographical customer billing addresses.
            </p>
        </div>
    );
}

function TaxClasses() {
    return (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Tax Classes</h2>
            <p className="text-xs text-neutral-400">
                Categorize products and assign tailored tax brackets to specific catalog items.
            </p>
        </div>
    );
}

function TaxRules() {
    return (
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-1">Calculation Rules</h2>
            <p className="text-xs text-neutral-400">
                Establish precedence rules for combining shipping, discounts, and regional taxes.
            </p>
        </div>
    );
}
