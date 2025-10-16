import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

interface PaginationProps {
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

export const Pagination: React.FC<PaginationProps> = ({ links }) => {
  if (links.length <= 3) return null;

  return (
    <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{links[0].label.split(' ')[1]}</span> to{' '}
          <span className="font-medium">{links[0].label.split(' ')[3]}</span> of{' '}
          <span className="font-medium">{links[0].label.split(' ')[5]}</span> results
        </p>
      </div>
      <div className="flex-1 flex justify-between sm:justify-end">
        <InertiaLink
          href={links[0].url || '#'}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            !links[0].url
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          preserveScroll
          preserveState
        >
          Previous
        </InertiaLink>
        <div className="hidden md:flex space-x-1">
          {links.slice(1, -1).map((link, index) => (
            <InertiaLink
              key={index}
              href={link.url || '#'}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                link.active
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
              preserveScroll
              preserveState
            >
              {link.label}
            </InertiaLink>
          ))}
        </div>
        <InertiaLink
          href={links[links.length - 1].url || '#'}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            !links[links.length - 1].url
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          preserveScroll
          preserveState
        >
          Next
        </InertiaLink>
      </div>
    </nav>
  );
};
