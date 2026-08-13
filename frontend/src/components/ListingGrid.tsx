'use client';

import React from 'react';
import { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';
import { Home } from 'lucide-react';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isLoading = false,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-9 my-8">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-3 animate-pulse">
            <div className="aspect-4/3 w-full rounded-2xl bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded-md w-3/4" />
            <div className="h-3 bg-gray-200 rounded-md w-1/2" />
            <div className="h-4 bg-gray-200 rounded-md w-1/3 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-rose-50 text-[#FF385C] p-6 rounded-full mb-4">
          <Home className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-500 max-w-md mb-6">
          Try adjusting your search criteria, dates, or category filters to find available properties.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="btn-outline text-sm"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-9 my-8">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
