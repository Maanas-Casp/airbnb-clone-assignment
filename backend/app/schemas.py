from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import date, datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    name: str
    avatar_url: Optional[str] = None
    is_host: bool = False

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Amenity Schemas ---
class AmenityBase(BaseModel):
    name: str
    icon_name: Optional[str] = "Sparkles"
    category: str = "General"

class AmenityOut(AmenityBase):
    id: int

    class Config:
        from_attributes = True

# --- Listing Image Schemas ---
class ListingImageBase(BaseModel):
    image_url: str
    is_primary: bool = False
    display_order: int = 0

class ListingImageOut(ListingImageBase):
    id: int

    class Config:
        from_attributes = True

# --- Review Schemas ---
class ReviewCreate(BaseModel):
    user_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewOut(BaseModel):
    id: int
    listing_id: int
    user_id: int
    rating: int
    comment: str
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Listing Schemas ---
class ListingBase(BaseModel):
    title: str
    description: str
    category: str = "Iconic"
    property_type: str = "Entire home"
    location_city: str
    location_country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: float = 1.0

class ListingCreate(ListingBase):
    host_id: int
    image_urls: List[str] = []
    amenity_ids: List[int] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    property_type: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    image_urls: Optional[List[str]] = None
    amenity_ids: Optional[List[int]] = None

class ListingCardOut(BaseModel):
    id: int
    host_id: int
    title: str
    category: str
    property_type: str
    location_city: str
    location_country: str
    price_per_night: float
    max_guests: int
    rating: float
    review_count: int
    images: List[ListingImageOut] = []

    class Config:
        from_attributes = True

class ListingDetailOut(ListingCardOut):
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bedrooms: int
    beds: int
    bathrooms: float
    host: UserOut
    images: List[ListingImageOut] = []
    amenities: List[AmenityOut] = []
    reviews: List[ReviewOut] = []

    class Config:
        from_attributes = True

class PaginatedListingsOut(BaseModel):
    items: List[ListingCardOut]
    total: int
    page: int
    pages: int

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests_count: int = Field(..., ge=1)

class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests_count: int
    nightly_price: float
    total_nights: int
    total_price: float
    status: str
    created_at: datetime
    listing: Optional[ListingCardOut] = None

    class Config:
        from_attributes = True

class AvailabilityRange(BaseModel):
    check_in: date
    check_out: date

# --- Wishlist Schemas ---
class WishlistOut(BaseModel):
    id: int
    user_id: int
    listing_id: int
    created_at: datetime
    listing: ListingCardOut

    class Config:
        from_attributes = True
