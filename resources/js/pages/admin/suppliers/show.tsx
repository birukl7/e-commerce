import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/inertia-react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/button';
import { SupplierProfile } from '@/types/supplier';
import { Dialog } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';

interface Props {
  supplier: SupplierProfile & {
    products_count: number;
    active_products: number;
  };
}

export default function SupplierShow({ supplier }: Props) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: supplier.verification_status,
    notes: '',
  });

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    router.put(
      `/admin/suppliers/${supplier.id}/status`,
      statusForm,
      {
        onSuccess: () => {
          setIsUpdatingStatus(false);
        },
      }
    );
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
    <AdminLayout title={`Supplier: ${supplier.business_name}`}>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {supplier.business_name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Supplier Details
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsUpdatingStatus(true)}
              >
                Update Status
              </Button>
              <Link
                href={`/admin/suppliers/${supplier.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Supplier
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Business Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {supplier.business_name}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(supplier.verification_status)}`}>
                  {supplier.verification_status.charAt(0).toUpperCase() + supplier.verification_status.slice(1)}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Business Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`mailto:${supplier.business_email}`} className="text-indigo-600 hover:text-indigo-900">
                  {supplier.business_email}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a href={`tel:${supplier.phone}`} className="text-indigo-600 hover:text-indigo-900">
                  {supplier.phone}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {supplier.address?.formatted || 'No address provided'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {supplier.tax_id || 'Not provided'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Commission Rate</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {supplier.default_commission_rate}%
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Products</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {supplier.products_count} ({supplier.active_products} active)
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(supplier.created_at).toLocaleDateString()}
              </dd>
            </div>
            {supplier.payout_method && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Payout Method</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {supplier.payout_method.type.charAt(0).toUpperCase() + supplier.payout_method.type.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {Object.entries(supplier.payout_method.details).map(([key, value]) => (
                            <span key={key} className="block">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          supplier.payout_method.is_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {supplier.payout_method.is_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Status Update Modal */}
      <Dialog
        open={isUpdatingStatus}
        onClose={() => setIsUpdatingStatus(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsUpdatingStatus(false)}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div>
              <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                Update Supplier Status
              </Dialog.Title>
              <form onSubmit={handleStatusUpdate} className="mt-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as any })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={statusForm.notes}
                        onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Add any notes about this status change..."
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      These notes will be visible to the supplier.
                    </p>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    Update Status
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsUpdatingStatus(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
}
