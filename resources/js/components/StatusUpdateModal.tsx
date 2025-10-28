import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from './button';
import { SupplierVerificationStatus } from '@/types/supplier';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: SupplierVerificationStatus;
  onStatusUpdate: (status: SupplierVerificationStatus, notes?: string) => Promise<void>;
  title?: string;
  description?: string;
  supplierName?: string;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onStatusUpdate,
  title = 'Update Supplier Status',
  description = 'Update the verification status of this supplier.',
  supplierName = 'this supplier',
}) => {
  const [selectedStatus, setSelectedStatus] = useState<SupplierVerificationStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions: { value: SupplierVerificationStatus; label: string; description: string }[] = [
    {
      value: 'pending',
      label: 'Pending',
      description: 'The supplier is under review.',
    },
    {
      value: 'approved',
      label: 'Approved',
      description: 'Approve the supplier to start selling products.',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      description: 'Reject the supplier application with a reason.',
    },
    {
      value: 'banned',
      label: 'Banned',
      description: 'Ban the supplier from the platform.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onStatusUpdate(selectedStatus, notes);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiresNotes = ['rejected', 'banned'].includes(selectedStatus);
  const isFormValid = !requiresNotes || (requiresNotes && notes.trim().length > 0);

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      open={isOpen}
      onClose={onClose}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="div"
            className="flex justify-between items-center mb-4"
          >
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-500 mb-4">
            {description}
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`status-${option.value}`}
                          name="status"
                          type="radio"
                          checked={selectedStatus === option.value}
                          onChange={() => setSelectedStatus(option.value)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor={`status-${option.value}`}
                          className="font-medium text-gray-700"
                        >
                          {option.label}
                        </label>
                        <p className="text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {requiresNotes && (
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {selectedStatus === 'rejected' 
                      ? 'Reason for rejection' 
                      : 'Reason for banning'}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder={`Provide a reason for ${selectedStatus === 'rejected' ? 'rejecting' : 'banning'} ${supplierName}...`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !isFormValid}
                isLoading={isSubmitting}
              >
                Update Status
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
