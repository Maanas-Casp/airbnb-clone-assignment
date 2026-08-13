'use client';

import React, { useState } from 'react';
import { Search, X, MapPin, Calendar as CalendarIcon, Users, DollarSign } from 'lucide-react';

interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: string;
  maxPrice: string;
}

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters: SearchFilters;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const handleClear = () => {
    const reset = {
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      minPrice: '',
      maxPrice: '',
    };
    setFilters(reset);
    onSearch(reset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 relative border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Search Places to Stay</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-6">
          
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Where to?
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destination (e.g. Malibu, Paris, Kyoto, Aspen)..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Check-in Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Check-out Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
                />
              </div>
            </div>
          </div>

          {/* Guests & Price Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={filters.guests}
                  onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) || 1 })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Min Price ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Max Price ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-semibold text-gray-600 underline hover:text-gray-900"
            >
              Clear filters
            </button>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <Search className="w-4 h-4 stroke-[3]" />
                Search Listings
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
