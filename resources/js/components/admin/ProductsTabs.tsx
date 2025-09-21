import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Tab = {
    name: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
};

type ProductsTabsProps = {
    tabs: Tab[];
    className?: string;
};

export function ProductsTabs({ tabs, className }: ProductsTabsProps) {
    const { url } = usePage();
    
    return (
        <div className={className}>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Products navigation">
                    {tabs.map((tab) => {
                        const isCurrent = url.startsWith(tab.href) && 
                                      (url === tab.href || url[tab.href.length] === '/');
                        
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    isCurrent
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                                )}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                {tab.icon && (
                                    <tab.icon
                                        className={cn(
                                            isCurrent ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                            '-ml-0.5 mr-2 h-5 w-5'
                                        )}
                                        aria-hidden="true"
                                    />
                                )}
                                <span>{tab.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
