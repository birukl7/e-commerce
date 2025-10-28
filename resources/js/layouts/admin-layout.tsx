import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head title={title} />
      
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin-dashboard" className="text-xl font-bold text-gray-800">
                  Admin Panel
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  href="/admin-dashboard" 
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  activeClassName="border-indigo-500"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/suppliers" 
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  activeClassName="border-indigo-500 text-gray-900"
                >
                  Suppliers
                </Link>
                {/* Add more navigation links as needed */}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* User dropdown would go here */}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="py-6">
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
