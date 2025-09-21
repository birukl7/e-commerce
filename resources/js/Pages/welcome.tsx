import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ShoppingCart, Package, Tag, Search, ShieldCheck } from 'lucide-react';

export default function Welcome({ settings }: { settings: any }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Head title="Welcome" />
            
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">Welcome to</span>
                                    <span className="block text-indigo-600">
                                        {settings?.site_name || 'ShopHub'}
                                    </span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    {settings?.site_tagline || 'Your one-stop shop for all your needs'}
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link href={route('shop')}>
                                            <Button size="lg" className="w-full">
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                Start Shopping
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link href={route('login')}>
                                            <Button variant="outline" size="lg" className="w-full">
                                                Sign in
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A better way to shop online
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="mt-4">Wide Selection</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">Browse through our extensive collection of products across various categories.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="mt-4">Secure Payments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">Shop with confidence using our secure payment processing system.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Search className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="mt-4">Easy Search</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">Quickly find what you're looking for with our powerful search functionality.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-indigo-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to start shopping?</span>
                        <span className="block">Create your account today.</span>
                    </h2>
                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex rounded-md shadow">
                            <Link href={route('register')}>
                                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                                    Get started
                                </Button>
                            </Link>
                        </div>
                        <div className="ml-3 inline-flex">
                            <Link href={route('shop')}>
                                <Button variant="outline" size="lg" className="text-white border-white hover:bg-indigo-600">
                                    Shop now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
