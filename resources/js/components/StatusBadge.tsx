import React from 'react';
import { SupplierVerificationStatus } from '@/types/supplier';

interface StatusBadgeProps {
  status: SupplierVerificationStatus;
  className?: string;
}

const statusColors: Record<SupplierVerificationStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  approved: 'bg-green-50 text-green-700 ring-green-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  banned: 'bg-gray-50 text-gray-700 ring-gray-600/20',
};

const statusLabels: Record<SupplierVerificationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  banned: 'Banned',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset';
  const colorClasses = statusColors[status] || 'bg-gray-50 text-gray-600 ring-gray-500/10';
  
  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`}>
      {statusLabels[status] || status}
    </span>
  );
};

// A more compact version of the status badge for tables
export const TableStatusBadge: React.FC<StatusBadgeProps> = (props) => (
  <StatusBadge
    {...props}
    className={`${props.className || ''} px-1.5 py-0.5 text-[10px]`}
  />
);
