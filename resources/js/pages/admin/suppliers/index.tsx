import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/inertia-react';
import AdminLayout from '@/layouts/admin-layout';
import { Pagination } from '@/components/pagination';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/button';
import { SupplierProfile, SupplierFilters } from '@/types/supplier';

interface Props {
  suppliers: {
    data: SupplierProfile[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  filters: SupplierFilters;
  statuses: Record<string, string>;
}

export default function SupplierIndex({ suppliers, filters, statuses }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/suppliers', { search, status }, { preserveState: true });
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    router.get('/admin/suppliers', {}, { preserveState: true });
  };

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      banned: 'bg-gray-100 text-gray-800',
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Manage Suppliers">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Suppliers</h3>
            <div className="flex space-x-3">
              <Button
                onClick={resetFilters}
                variant="secondary"
                disabled={!search && !status}
              >
                Clear Filters
              </Button>
              <Link
                href="/admin/suppliers/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Supplier
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 sm:px-6">
          <form onSubmit={handleSearch} className="flex-1 flex space-x-4">
            <div className="w-1/3">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suppliers..."
              />
            </div>
            <div className="w-1/3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                {Object.entries(statuses).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Supplier List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-b-lg">
          <ul className="divide-y divide-gray-200">
            {suppliers.data.length > 0 ? (
              suppliers.data.map((supplier) => (
                <li key={supplier.id}>
                  <Link
                    href={`/admin/suppliers/${supplier.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {supplier.business_name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(supplier.verification_status)}`}>
                            {statuses[supplier.verification_status]}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {supplier.business_email}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {supplier.phone}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Joined on{' '}
                            <time dateTime={supplier.created_at}>
                              {new Date(supplier.created_at).toLocaleDateString()}
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-gray-500">
                No suppliers found
              </li>
            )}
          </ul>

          {/* Pagination */}
          {suppliers.data.length > 0 && (
            <Pagination links={suppliers.links} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
