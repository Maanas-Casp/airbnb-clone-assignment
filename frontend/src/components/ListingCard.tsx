'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Listing } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { Star, Heart, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { wishlistIds, toggleWishlist } = useUser();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isFavorite = wishlistIds.has(listing.id);
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{ id: 0, image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', is_primary: true, display_order: 0 }];

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing.id);
  };

  return (
    <div className="group relative flex flex-col airbnb-card">
      <Link href={`/listings/${listing.id}`} className="block">
        
        {/* Image Container with Hover Carousel */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200">
          <img
            src={images[currentImgIndex]?.image_url || images[0].image_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {listing.category}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform z-10"
            aria-label="Save to Wishlist"
          >
            <Heart
              className={`w-6 h-6 drop-shadow-sm transition-colors ${
                isFavorite
                  ? 'fill-[#FF385C] text-[#FF385C]'
                  : 'fill-black/40 text-white stroke-[2]'
              }`}
            />
          </button>

          {/* Carousel Arrows on Hover */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? 'bg-white w-2.5' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-[15px] truncate pr-2">
              {listing.location_city}, {listing.location_country}
            </h3>
            <div className="flex items-center gap-1 shrink-0 text-sm font-medium text-gray-800">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{listing.rating.toFixed(2)}</span>
            </div>
          </div>

        <p className="text-gray-500 text-sm truncate">
            {listing.title}
          </p>

        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Up to {listing.max_guests} guests
            </span>
            <span>•</span>
            <span>{listing.property_type}</span>
          </div>

          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="font-bold text-gray-900 text-[15px]">
              ${listing.price_per_night}
            </span>
            <span className="text-gray-500 text-sm">night</span>
          </div>
        </div>

      </Link>
    </div>
  );
};
