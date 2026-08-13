'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';
import { Listing } from '@/lib/types';
import { X, CreditCard, ShieldCheck, Calendar, Users, CheckCircle2 } from 'lucide-react';

interface MockCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  nights: number;
  totalPrice: number;
}

export const MockCheckoutModal: React.FC<MockCheckoutModalProps> = ({
  isOpen,
  onClose,
  listing,
  checkIn,
  checkOut,
  guestsCount,
  nights,
  totalPrice,
}) => {
  const router = useRouter();
  const { activeUserId, showToast } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmPay = async () => {
    setIsSubmitting(true);
    try {
      await api.createBooking({
        listing_id: listing.id,
        guest_id: activeUserId,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount,
      });

      showToast('🎉 Reservation confirmed! Booking saved to My Trips.', 'success');
      onClose();
      router.push('/trips');
    } catch (err: any) {
      showToast(err.message || 'Failed to complete reservation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#FF385C]" />
            Confirm & Pay (Mock Checkout)
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Snapshot Card */}
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6">
          <img
            src={listing.images[0]?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'}
            alt={listing.title}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="flex flex-col gap-1 overflow-hidden">
            <h3 className="font-bold text-gray-900 text-sm truncate">{listing.title}</h3>
            <p className="text-xs text-gray-500 font-medium">{listing.location_city}, {listing.location_country}</p>
            <span className="text-xs font-semibold text-[#FF385C]">${listing.price_per_night} / night</span>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Dates
            </span>
            <span className="font-semibold text-gray-900">{checkIn} to {checkOut} ({nights} nights)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              Guests
            </span>
            <span className="font-semibold text-gray-900">{guestsCount} guest{guestsCount > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Mock Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Payment Method
          </label>
          <div className="flex items-center gap-3 border border-gray-300 rounded-xl p-3 bg-gray-50">
            <CreditCard className="w-6 h-6 text-[#FF385C]" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">Visa ending in 4242 (Mock)</span>
              <span className="text-xs text-gray-500">No real charge will be made</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-6">
          <span className="text-base font-bold text-gray-900">Total (USD)</span>
          <span className="text-2xl font-black text-gray-900">${totalPrice.toLocaleString()}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirmPay}
          disabled={isSubmitting}
          className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            `Confirm & Reserve ($${totalPrice.toLocaleString()})`
          )}
        </button>

      </div>
    </div>
  );
};
