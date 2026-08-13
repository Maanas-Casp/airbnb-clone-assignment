'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Booking } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/Toast';
import { Briefcase, Calendar, MapPin, Users, CheckCircle, ChevronRight, Home } from 'lucide-react';

export default function MyTripsPage() {
  const { activeUserId, showToast } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadTrips() {
      setIsLoading(true);
      try {
        const data = await api.getMyTrips(activeUserId);
        setBookings(data);
      } catch (err) {
        console.error('Error fetching my trips:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, [activeUserId]);

  const handleCancel = async (bookingId: number) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;
    try {
      setCancellingId(bookingId);
    await api.cancelBooking(bookingId, activeUserId);
      showToast('Booking cancelled successfully.', 'success');
      // Refresh trips
      const data = await api.getMyTrips(activeUserId);
      setBookings(data);
    } catch (err: any) {
      console.error('Failed to cancel booking', err);
      showToast(err?.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#FF385C]" />
            My Trips
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage your upcoming and past property reservations.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 max-w-4xl">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
            <div className="bg-rose-50 text-[#FF385C] p-6 rounded-full mb-4">
              <Briefcase className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trips booked yet</h3>
            <p className="text-gray-500 mb-6">
              Time to dust off your bags and start planning your next adventure!
            </p>
            <Link href="/" className="btn-primary">
              Start Exploring Homes
            </Link>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            {bookings.map((booking) => {
              const listing = booking.listing;
              const imgUrl = listing?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750';

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-3xl p-5 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={imgUrl}
                      alt={listing?.title || 'Property'}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0"
                    />
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {booking.status}
                        </span>
                        <span className="text-xs text-gray-400">Booking #{booking.id}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base truncate">
                        {listing?.title || 'Airbnb Property'}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {listing?.location_city}, {listing?.location_country}
                      </p>
                    </div>
                  </div>

                  {/* Dates & Pricing Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Dates
                      </span>
                      <span className="font-bold text-gray-900">
                        {booking.check_in} → {booking.check_out} ({booking.total_nights} nights)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        Guests
                      </span>
                      <span className="font-semibold text-gray-900">
                        {booking.guests_count} guest{booking.guests_count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm">
                      <span className="font-bold text-gray-900">Total Paid</span>
                      <span className="font-extrabold text-[#FF385C]">${booking.total_price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer Link */}
                  {listing && (
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#FF385C] transition-colors"
                      >
                        <span>View property details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>

                      {/* Cancel button: only for confirmed future bookings */}
                      {booking.status === 'confirmed' && new Date(booking.check_in) > new Date() && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 px-3 py-2 rounded-md transition-colors"
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel booking'}
                        </button>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

      <ToastContainer />
    </div>
  );
}
