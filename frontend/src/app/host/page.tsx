'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Listing, Booking } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { ListingFormModal } from '@/components/ListingFormModal';
import { ToastContainer } from '@/components/Toast';
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Building,
  CheckCircle,
  Eye,
  UserCheck
} from 'lucide-react';

export default function HostDashboardPage() {
  const { role, setRole, activeUserId, showToast } = useUser();
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Auto-switch role to host when visiting /host
  useEffect(() => {
    if (role !== 'host') {
      setRole('host');
    }
  }, [role, setRole]);

  const loadHostData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listingsData, bookingsData] = await Promise.all([
        api.getHostListings(activeUserId),
        api.getHostBookings(activeUserId),
      ]);
      setListings(listingsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching host data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadHostData();
  }, [loadHostData]);

  const handleOpenCreate = () => {
    setEditingListing(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsFormOpen(true);
  };

  const handleDeleteListing = async (listingId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteListing(listingId);
      showToast(`Deleted listing "${title}"`, 'success');
      loadHostData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Home className="w-8 h-8 text-[#FF385C]" />
                Host Dashboard
              </h1>
              <span className="bg-rose-100 text-[#FF385C] text-xs font-bold px-2.5 py-1 rounded-md">
                Host Mode Active
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Manage your property listings, create new stays, and monitor guest reservations.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Create New Listing
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building className="w-4 h-4" />
            My Owned Listings ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Guest Property Reservations ({bookings.length})
          </button>
        </div>

        {/* Tab 1: Owned Listings Grid */}
        {activeTab === 'listings' && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <Building className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No listings created yet</h3>
                <p className="text-gray-500 mb-6">Start earning by listing your apartment, villa, or home on Airbnb.</p>
                <button onClick={handleOpenCreate} className="btn-primary">
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const imgUrl = listing.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750';
                  return (
                    <div
                      key={listing.id}
                      className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative aspect-16/9 w-full bg-gray-200">
                        <img
                          src={imgUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-md">
                          {listing.category}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-gray-900 text-base truncate">{listing.title}</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {listing.location_city}, {listing.location_country} • {listing.property_type}
                        </p>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="font-extrabold text-gray-900 text-base">
                            ${listing.price_per_night} <span className="text-xs text-gray-500 font-normal">/ night</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Max {listing.max_guests} guests
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Preview Listing"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(listing)}
                            className="p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id, listing.title)}
                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Property Reservations Table */}
        {activeTab === 'bookings' && (
          <div>
            {isLoading ? (
              <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
            ) : bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No guest bookings yet</h3>
                <p className="text-gray-500">Reservations made on your listed properties will appear here.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Booking ID</th>
                        <th className="py-4 px-6">Property</th>
                        <th className="py-4 px-6">Guest</th>
                        <th className="py-4 px-6">Dates</th>
                        <th className="py-4 px-6">Nights</th>
                        <th className="py-4 px-6">Total Earnings</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-900">#{b.id}</td>
                          <td className="py-4 px-6 font-semibold text-gray-900 max-w-xs truncate">
                            {b.listing?.title || `Listing #${b.listing_id}`}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-gray-400" />
                              <span>{b.guest?.name || `Guest #${b.guest_id}`}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-700">
                            {b.check_in} → {b.check_out}
                          </td>
                          <td className="py-4 px-6 font-semibold">{b.total_nights} nights</td>
                          <td className="py-4 px-6 font-extrabold text-[#FF385C]">
                            ${b.total_price.toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Listing Form Modal */}
      <ListingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadHostData}
        listingToEdit={editingListing}
      />

      <ToastContainer />
    </div>
  );
}
