'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CategoryBar } from '@/components/CategoryBar';
import { ListingGrid } from '@/components/ListingGrid';
import { SearchBarModal } from '@/components/SearchBarModal';
import { ToastContainer } from '@/components/Toast';

export default function ExplorePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [filters, setFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    minPrice: '',
    maxPrice: '',
  });

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const PAGE_LIMIT = 12; // items per page

  const loadListings = useCallback(async (opts?: { append?: boolean; page?: number }) => {
    const requestedPage = opts?.page ?? 1;
    if (requestedPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const data = await api.getListings({
        category: activeCategory !== 'All' ? activeCategory : undefined,
        location: filters.location || undefined,
        check_in: filters.checkIn || undefined,
        check_out: filters.checkOut || undefined,
        guests: filters.guests > 1 ? filters.guests : undefined,
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        page: requestedPage,
        limit: PAGE_LIMIT,
      });

      if (opts?.append) {
        setListings((prev) => [...prev, ...data.items]);
      } else {
        setListings(data.items);
      }

      setPages(data.pages ?? 1);
      setPage(data.page ?? requestedPage);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeCategory, filters]);

  useEffect(() => {
    // When filters or category change, reset to first page
    setPage(1);
    loadListings({ page: 1, append: false });
  }, [activeCategory, filters, loadListings]);

  const handleResetFilters = () => {
    setActiveCategory('All');
    setFilters({
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      minPrice: '',
      maxPrice: '',
    });
    // reset pagination
    setPage(1);
  };

  const getSearchSummary = () => {
    return {
      location: filters.location || 'Anywhere',
      dates: filters.checkIn && filters.checkOut
        ? `${filters.checkIn.substring(5)} to ${filters.checkOut.substring(5)}`
        : 'Any week',
      guests: filters.guests > 1 ? `${filters.guests} guests` : 'Add guests',
    };
  };

  const handleLoadMore = async () => {
    if (page >= pages) return;
    const nextPage = page + 1;
    await loadListings({ page: nextPage, append: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Header Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        searchSummary={getSearchSummary()}
      />

      {/* Categories Filter Strip */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      {/* Main Content Grid Container */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Results Banner info if filtering */}
        {(filters.location || filters.checkIn || activeCategory !== 'All') && (
          <div className="mt-6 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3">
            <p className="text-sm font-medium text-gray-700">
              Showing results for{' '}
              <span className="font-bold text-gray-900">
                {activeCategory !== 'All' ? activeCategory : 'All Categories'}
              </span>
              {filters.location && (
                <>
                  {' in '}
                  <span className="font-bold text-gray-900">{filters.location}</span>
                </>
              )}
            </p>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#FF385C] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        <ListingGrid
          listings={listings}
          isLoading={isLoading}
          onResetFilters={handleResetFilters}
        />

        {/* Load More / Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center mt-6">
            {page < pages ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${isLoadingMore ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-outline'}`}
              >
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </button>
            ) : (
              <p className="text-sm text-gray-500">End of results</p>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Airbnb SDE Assignment Clone. Built with Next.js, FastAPI & SQLite.</p>
          <div className="flex items-center gap-6 font-medium text-gray-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Sitemap</span>
            <span>Company details</span>
          </div>
        </div>
      </footer>

      {/* Search Filter Modal */}
      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
      />

      <ToastContainer />
    </div>
  );
}
