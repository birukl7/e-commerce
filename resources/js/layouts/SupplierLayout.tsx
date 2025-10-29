import React, { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    BarChart3, 
    Package, 
    ShoppingCart, 
    DollarSign, 
    Settings, 
    User, 
    LogOut,
    Home,
    TrendingUp,
    FileText,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SupplierLayoutProps {
    children: ReactNode;
    title?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    supplier_profile?: {
        business_name: string;
        verification_status: string;
    };
}

interface PageProps {
    auth: {
        user: User;
    };
    supplier?: {
        business_name: string;
        verification_status: string;
    };
}

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/supplier/dashboard',
        icon: BarChart3,
        current: false,
    },
    {
        name: 'Products',
        href: '/supplier/products',
        icon: Package,
        current: false,
    },
    {
        name: 'Orders',
        href: '/supplier/orders',
        icon: ShoppingCart,
        current: false,
    },
    {
        name: 'Earnings',
        href: '/supplier/earnings',
        icon: DollarSign,
        current: false,
    },
    {
        name: 'Analytics',
        href: '/supplier/analytics',
        icon: TrendingUp,
        current: false,
    },
    {
        name: 'Reports',
        href: '/supplier/reports',
        icon: FileText,
        current: false,
    },
];

const settingsItems = [
    {
        name: 'Settings',
        href: '/supplier/settings',
        icon: Settings,
    },
    {
        name: 'Profile',
        href: '/supplier/profile',
        icon: User,
    },
];

export default function SupplierLayout({ children, title }: SupplierLayoutProps) {
    const { auth, supplier } = usePage<PageProps>().props;
    const user = auth.user;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'banned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'pending':
                return 'Pending Review';
            case 'rejected':
                return 'Rejected';
            case 'banned':
                return 'Banned';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-center border-b border-gray-200">
                        <Link href="/supplier/dashboard" className="flex items-center space-x-2">
                            <Package className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">Supplier Portal</span>
                        </Link>
                    </div>

                    {/* Supplier Info */}
                    <div className="border-b border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                <User className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {supplier?.business_name || user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <Badge className={getStatusColor(supplier?.verification_status || 'pending')}>
                                {getStatusText(supplier?.verification_status || 'pending')}
                            </Badge>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                        item.current
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Settings Section */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="space-y-1">
                            {settingsItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-1">
                            <Link
                                href="/"
                                className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                <Home className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                Back to Store
                            </Link>
                            
                            <Link
                                href="/logout"
                                method="post"
                                className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{title || 'Dashboard'}</h1>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                        </Button>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
