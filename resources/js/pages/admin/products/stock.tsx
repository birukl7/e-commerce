import { Head } from '@inertiajs/react';
import { PackageCheck } from 'lucide-react';

export default function StockManagementPage() {
    return (
        <>
            <Head title="Stock Management" />
            
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                            <PackageCheck className="h-5 w-5 text-gray-500 mr-2" />
                            Stock Management
                        </h2>
                        <p className="mt-2 text-sm text-gray-700">
                            View and manage your product inventory and stock levels
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {/* Stock management content will go here */}
                        <div className="text-center py-12">
                            <PackageCheck className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Stock Management</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                This is where you'll manage your product inventory and stock levels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
