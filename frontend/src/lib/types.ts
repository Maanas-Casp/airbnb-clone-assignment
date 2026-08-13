export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  is_host: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  icon_name?: string;
  category?: string;
}

export interface ListingImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface Listing {
  id: number;
  host_id: number;
  title: string;
  description?: string;
  category: string;
  property_type: string;
  location_city: string;
  location_country: string;
  latitude?: number;
  longitude?: number;
  price_per_night: number;
  max_guests: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  rating: number;
  review_count: number;
  host?: User;
  images: ListingImage[];
  amenities?: Amenity[];
  reviews?: Review[];
}

export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  nightly_price: number;
  total_nights: number;
  total_price: number;
  status: string;
  created_at: string;
  listing?: Listing;
  guest?: User;
}

export interface AvailabilityRange {
  check_in: string;
  check_out: string;
}

export interface Wishlist {
  id: number;
  user_id: number;
  listing_id: number;
  created_at: string;
  listing: Listing;
}
