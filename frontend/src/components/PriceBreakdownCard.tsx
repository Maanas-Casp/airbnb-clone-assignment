'use client';

import React, { useState, useEffect } from 'react';
import { Listing, AvailabilityRange } from '@/lib/types';
import { Star, ChevronDown, Lock } from 'lucide-react';

interface PriceBreakdownCardProps {
  listing: Listing;
  availability: AvailabilityRange[];
  onReserveClick: (checkIn: string, checkOut: string, guests: number, nights: number, total: number) => void;
}

export const PriceBreakdownCard: React.FC<PriceBreakdownCardProps> = ({
  listing,
  availability,
  onReserveClick,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultOutStr = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(defaultOutStr);
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [dateError, setDateError] = useState<string>('');

  // Calculate nights
  const calculateNights = (inDate: string, outDate: string): number => {
    if (!inDate || !outDate) return 0;
    const diffTime = new Date(outDate).getTime() - new Date(inDate).getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const nights = calculateNights(checkIn, checkOut);
  const basePrice = listing.price_per_night * nights;
  const cleaningFee = nights > 0 ? 120 : 0;
  const serviceFee = nights > 0 ? Math.round(basePrice * 0.1) : 0;
  const totalPrice = basePrice + cleaningFee + serviceFee;

  // Validate dates against existing bookings
  useEffect(() => {
    if (!checkIn || !checkOut) return;

    if (checkOut <= checkIn) {
      setDateError('Check-out date must be after check-in date');
      return;
    }

    const requestedIn = new Date(checkIn);
    const requestedOut = new Date(checkOut);

    const isOverlap = availability.some((range) => {
      const bookedIn = new Date(range.check_in);
      const bookedOut = new Date(range.check_out);
      return requestedIn < bookedOut && requestedOut > bookedIn;
    });

    if (isOverlap) {
      setDateError('Selected dates overlap with an existing booking');
    } else {
      setDateError('');
    }
  }, [checkIn, checkOut, availability]);

  const handleReserve = () => {
    if (nights <= 0) {
      setDateError('Please select valid check-in and check-out dates.');
      return;
    }
    if (dateError) return;
    onReserveClick(checkIn, checkOut, guestsCount, nights, totalPrice);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl sticky top-28 space-y-6">
      
      {/* Price & Rating Header */}
      <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
        <div>
          <span className="text-2xl font-black text-gray-900">${listing.price_per_night}</span>
          <span className="text-gray-500 text-sm font-medium ml-1">night</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{listing.rating.toFixed(2)}</span>
          <span className="text-gray-400">({listing.review_count})</span>
        </div>
      </div>

      {/* Date Pickers & Guest Input */}
      <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-3 border-r border-gray-300 focus-within:ring-2 focus-within:ring-black">
            <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
              CHECK-IN
            </label>
            <input
              type="date"
              value={checkIn}
              min={todayStr}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold outline-hidden cursor-pointer"
            />
          </div>
          <div className="p-3 focus-within:ring-2 focus-within:ring-black">
            <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
              CHECKOUT
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || todayStr}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold outline-hidden cursor-pointer"
            />
          </div>
        </div>
        <div className="p-3 focus-within:ring-2 focus-within:ring-black">
          <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">
            GUESTS
          </label>
          <select
            value={guestsCount}
            onChange={(e) => setGuestsCount(parseInt(e.target.value))}
            className="w-full bg-transparent text-xs font-semibold outline-hidden cursor-pointer"
          >
            {Array.from({ length: listing.max_guests }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} guest{i > 0 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {dateError && (
        <div className="bg-rose-50 text-rose-600 text-xs font-semibold p-3 rounded-xl border border-rose-200">
          {dateError}
        </div>
      )}

      {/* Reserve Button */}
      <button
        onClick={handleReserve}
        disabled={!!dateError || nights <= 0}
        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
          dateError || nights <= 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'btn-primary shadow-md hover:shadow-lg'
        }`}
      >
        Reserve Stay
      </button>

      <p className="text-center text-xs text-gray-500 font-medium">
        You won't be charged yet
      </p>

      {/* Calculation Breakdown */}
      {nights > 0 && !dateError && (
        <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="underline">${listing.price_per_night} × {nights} nights</span>
            <span>${basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>${cleaningFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Airbnb service fee</span>
            <span>${serviceFee}</span>
          </div>
          <div className="flex justify-between font-extrabold text-gray-900 text-base border-t border-gray-200 pt-3">
            <span>Total before taxes</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Availability Notice */}
      {availability.length > 0 && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{availability.length} date range(s) currently reserved for this listing.</span>
        </div>
      )}

    </div>
  );
};
