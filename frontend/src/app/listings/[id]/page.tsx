'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Listing, AvailabilityRange } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { PhotoGalleryModal } from '@/components/PhotoGalleryModal';
import { PriceBreakdownCard } from '@/components/PriceBreakdownCard';
import { MockCheckoutModal } from '@/components/MockCheckoutModal';
import { ToastContainer } from '@/components/Toast';
import {
  Star,
  Heart,
  Share2,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Utensils,
  Waves,
  Car,
  Wind,
  Laptop,
  Umbrella,
  Flame,
  Key,
  Compass,
  Sun,
  Grid,
  ShieldCheck,
  Award,
  ChevronLeft
} from 'lucide-react';

// Icon Map helper for amenities
const AMENITY_ICONS: Record<string, any> = {
  Wifi,
  Utensils,
  Waves,
  Car,
  Wind,
  Laptop,
  Umbrella,
  Flame,
  Key,
  Compass,
  Sun,
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listingId = parseInt(id);

  const { wishlistIds, toggleWishlist } = useUser();
  const [listing, setListing] = useState<Listing | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Reservation Form State
  const [checkoutData, setCheckoutData] = useState({
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    nights: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [listingRes, availRes] = await Promise.all([
          api.getListingById(listingId),
          api.getPropertyAvailability(listingId),
        ]);
        setListing(listingRes);
        setAvailability(availRes);
      } catch (err: any) {
        setError(err.message || 'Listing not found.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-md w-2/3" />
          <div className="h-4 bg-gray-200 rounded-md w-1/3" />
          <div className="aspect-16/9 w-full bg-gray-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The requested listing does not exist.'}</p>
          <Link href="/" className="btn-primary">
            Return to Explore Page
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = wishlistIds.has(listing.id);
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{ id: 0, image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', is_primary: true, display_order: 0 }];

  const handleOpenCheckout = (checkIn: string, checkOut: string, guests: number, nights: number, total: number) => {
    setCheckoutData({
      checkIn,
      checkOut,
      guestsCount: guests,
      nights,
      totalPrice: total,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to explore
        </Link>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {listing.title}
            </h1>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-gray-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {listing.rating.toFixed(2)}
              </span>
              <span>•</span>
              <span className="underline font-semibold">{listing.review_count} reviews</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                {listing.location_city}, {listing.location_country}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleWishlist(listing.id)}
              className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50 font-semibold text-sm transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#FF385C] text-[#FF385C]' : 'text-gray-700'}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Airbnb Photo Grid (1 Large Left + 4 Right Grid) */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-lg bg-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[450px]">
            {/* Primary Large Image */}
            <div className="md:col-span-2 relative h-full cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
              <img
                src={images[0]?.image_url}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>

            {/* Right 4 Sub Images */}
            <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
              {images.slice(1, 5).map((img, idx) => (
                <div key={img.id || idx} className="relative h-full cursor-pointer group" onClick={() => setIsGalleryOpen(true)}>
                  <img
                    src={img.image_url}
                    alt={`${listing.title} sub ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Show All Photos Button */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="absolute bottom-4 right-4 bg-white text-gray-900 border border-gray-300 font-semibold text-xs py-2 px-4 rounded-xl shadow-md flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Grid className="w-4 h-4" />
            Show all photos ({images.length})
          </button>
        </div>

        {/* Main Content Layout (Left Details + Right Sticky Pricing) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details, Amenities, Host, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Property Overview Badges */}
            <div className="border-b border-gray-200 pb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {listing.property_type} hosted by {listing.host?.name || 'Superhost Sarah'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {listing.max_guests} guests • {listing.bedrooms || 1} bedrooms • {listing.beds || 1} beds • {listing.bathrooms || 1} baths
                </p>
              </div>
              <img
                src={listing.host?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}
                alt={listing.host?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-xs"
              />
            </div>

            {/* Highlights */}
            <div className="border-b border-gray-200 pb-8 space-y-4">
              <div className="flex items-start gap-4">
                <Award className="w-6 h-6 text-[#FF385C] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Superhost</h3>
                  <p className="text-sm text-gray-500">Superhosts are experienced, highly rated hosts committed to providing great stays.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#FF385C] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Free cancellation for 48 hours</h3>
                  <p className="text-sm text-gray-500">Get a full refund if you change your mind.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this space</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {listing.amenities && listing.amenities.length > 0 ? (
                  listing.amenities.map((amenity) => {
                    const IconComp = AMENITY_ICONS[amenity.icon_name || 'Wifi'] || Wifi;
                    return (
                      <div key={amenity.id} className="flex items-center gap-3 text-gray-800 text-sm font-medium p-2">
                        <IconComp className="w-5 h-5 text-gray-600 shrink-0" />
                        <span>{amenity.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-sm">Essential amenities provided.</p>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <h3 className="text-2xl font-extrabold text-gray-900">
                  {listing.rating.toFixed(2)} • {listing.review_count} reviews
                </h3>
              </div>

              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listing.reviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                          alt={rev.user?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{rev.user?.name || 'Guest User'}</p>
                          <p className="text-xs text-gray-500">{new Date(rev.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet for this listing.</p>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Pricing & Reservation Card */}
          <div className="lg:col-span-1">
            <PriceBreakdownCard
              listing={listing}
              availability={availability}
              onReserveClick={handleOpenCheckout}
            />
          </div>

        </div>

      </main>

      {/* Gallery Lightbox Modal */}
      <PhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={images}
        title={listing.title}
      />

      {/* Mock Checkout Modal */}
      <MockCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        listing={listing}
        checkIn={checkoutData.checkIn}
        checkOut={checkoutData.checkOut}
        guestsCount={checkoutData.guestsCount}
        nights={checkoutData.nights}
        totalPrice={checkoutData.totalPrice}
      />

      <ToastContainer />
    </div>
  );
}
