import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import TaxClassesTab from '@/Pages/Admin/Tax/Tabs/TaxClassesTab';
import TaxRatesTab from '@/Pages/Admin/Tax/Tabs/TaxRatesTab';
import TaxSettingsTab from '@/Pages/Admin/Tax/Tabs/TaxSettingsTab';
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
    auth,
    activeTab,
    tabs,
    classes = [],
    taxRates = [],
    taxClasses = [],
    settings = {},
}: Props) {
    return (
        <AdminLayout title="Tax Settings">
            <Head title="Tax Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Tax Settings</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Configure tax classes, rates, and how taxes are calculated and displayed in your store.
                        </p>
                    </div>

                    {/* Tabs header */}
                    <div className="border-b border-border mb-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tax settings navigation">
                            {Object.entries(tabs).map(([key, tab]) => {
                                const isActive = key === activeTab;
                                return (
                                    <Link
                                        key={key}
                                        href={tab.route}
                                        className={cn(
                                            isActive
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground',
                                            'inline-flex items-center border-b-2 py-3 px-1 text-sm font-medium'
                                        )}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab content */}
                    <div className="space-y-6">
                        {activeTab === 'classes' && (
                            <div className="bg-card rounded-lg border shadow-sm">
                                <div className="p-4 sm:p-6">
                                    <TaxClassesTab classes={classes} taxClasses={taxClasses} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'rates' && (
                            <div className="bg-card rounded-lg border shadow-sm">
                                <div className="p-4 sm:p-6">
                                    <TaxRatesTab taxRates={taxRates} taxClasses={taxClasses} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-card rounded-lg border shadow-sm">
                                <div className="p-4 sm:p-6">
                                    <TaxSettingsTab settings={settings} taxClasses={taxClasses} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

