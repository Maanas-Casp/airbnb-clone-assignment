'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Wishlist } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { ListingGrid } from '@/components/ListingGrid';
import { ToastContainer } from '@/components/Toast';
import { Heart, Compass } from 'lucide-react';

export default function WishlistPage() {
  const { activeUserId, wishlistIds } = useUser();
  const [wishlistItems, setWishlistItems] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      setIsLoading(true);
      try {
        const data = await api.getWishlist(activeUserId);
        setWishlistItems(data);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWishlist();
  }, [activeUserId, wishlistIds]);

  const savedListings = wishlistItems.map(item => item.listing).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 fill-[#FF385C] text-[#FF385C]" />
            Saved Wishlist ({savedListings.length})
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Keep track of your favorite properties and plan upcoming stays.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <ListingGrid listings={[]} isLoading={true} />
        ) : savedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="bg-rose-50 text-[#FF385C] p-6 rounded-full mb-4">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">
              As you search, tap the heart icon on any listing to save your favorite stays here.
            </p>
            <Link href="/" className="btn-primary">
              Explore Properties
            </Link>
          </div>
        ) : (
          <ListingGrid listings={savedListings} />
        )}

      </main>

      <ToastContainer />
    </div>
  );
}
