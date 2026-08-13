import {
  Listing,
  PaginatedListings,
  Booking,
  AvailabilityRange,
  Wishlist,
  Amenity
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errorMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // Ignore JSON parse failure on error body
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  // --- Listings ---
  getListings: async (params?: {
    location?: string;
    category?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedListings> => {
    const query = new URLSearchParams();
    if (params?.location) query.append('location', params.location);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.check_in) query.append('check_in', params.check_in);
    if (params?.check_out) query.append('check_out', params.check_out);
    if (params?.guests) query.append('guests', params.guests.toString());
    if (params?.min_price) query.append('min_price', params.min_price.toString());
    if (params?.max_price) query.append('max_price', params.max_price.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI<PaginatedListings>(`/api/listings?${query.toString()}`);
  },

  getListingById: async (id: number): Promise<Listing> => {
    return fetchAPI<Listing>(`/api/listings/${id}`);
  },

  createListing: async (listingData: any): Promise<Listing> => {
    return fetchAPI<Listing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  updateListing: async (id: number, listingData: any): Promise<Listing> => {
    return fetchAPI<Listing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  },

  deleteListing: async (id: number): Promise<void> => {
    return fetchAPI<void>(`/api/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Bookings & Availability ---
  createBooking: async (bookingData: {
    listing_id: number;
    guest_id: number;
    check_in: string;
    check_out: string;
    guests_count: number;
  }): Promise<Booking> => {
    return fetchAPI<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  getMyTrips: async (guestId: number = 1): Promise<Booking[]> => {
    return fetchAPI<Booking[]>(`/api/bookings/my-trips?guest_id=${guestId}`);
  },

  getPropertyAvailability: async (listingId: number): Promise<AvailabilityRange[]> => {
    return fetchAPI<AvailabilityRange[]>(`/api/bookings/listings/${listingId}/availability`);
  },

  cancelBooking: async (bookingId: number, guestId: number): Promise<Booking> => {
    // Pass guestId as a query parameter to validate ownership on the backend (mock persona)
    return fetchAPI<Booking>(`/api/bookings/${bookingId}/cancel?guest_id=${guestId}`, {
      method: 'POST',
    });
  },

  // --- Host ---
  getHostListings: async (hostId: number = 2): Promise<Listing[]> => {
    return fetchAPI<Listing[]>(`/api/host/listings?host_id=${hostId}`);
  },

  getHostBookings: async (hostId: number = 2): Promise<Booking[]> => {
    return fetchAPI<Booking[]>(`/api/host/bookings?host_id=${hostId}`);
  },

  // --- Wishlist & Amenities ---
  getWishlist: async (userId: number = 1): Promise<Wishlist[]> => {
    return fetchAPI<Wishlist[]>(`/api/wishlist?user_id=${userId}`);
  },

  toggleWishlist: async (listingId: number, userId: number = 1): Promise<{ saved: boolean; message: string }> => {
    return fetchAPI<{ saved: boolean; message: string }>(`/api/wishlist/${listingId}?user_id=${userId}`, {
      method: 'POST',
    });
  },

  getAmenities: async (): Promise<Amenity[]> => {
    return fetchAPI<Amenity[]>('/api/amenities');
  }
};
