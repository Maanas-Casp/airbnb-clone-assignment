from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, not_, func
from datetime import date
from typing import Optional, List, Tuple
from app.models import Listing, ListingImage, Amenity, Booking, Review, Wishlist, User

# --- Listings Logic ---

def get_listings(
    db: Session,
    location: Optional[str] = None,
    category: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    amenity_ids: Optional[List[int]] = None,
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Listing], int]:
    query = db.query(Listing).options(joinedload(Listing.images))

    # Category Filter
    if category and category.lower() != "all":
        query = query.filter(Listing.category == category)

    # Location Filter (city or country matching)
    if location and location.strip():
        loc_pattern = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.location_city.ilike(loc_pattern),
                Listing.location_country.ilike(loc_pattern),
                Listing.title.ilike(loc_pattern)
            )
        )

    # Guest Capacity Filter
    if guests and guests > 0:
        query = query.filter(Listing.max_guests >= guests)

    # Price Range Filter
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Date Range Availability Filter: Exclude listings that have overlapping confirmed bookings
    if check_in and check_out:
        overlapping_subquery = db.query(Booking.listing_id).filter(
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in
        ).subquery()

        query = query.filter(not_(Listing.id.in_(overlapping_subquery)))

    total = query.count()
    offset = (page - 1) * limit
    listings = query.order_by(Listing.created_at.desc()).offset(offset).limit(limit).all()

    return listings, total


def get_listing_by_id(db: Session, listing_id: int) -> Optional[Listing]:
    return db.query(Listing).options(
        joinedload(Listing.host),
        joinedload(Listing.images),
        joinedload(Listing.amenities),
        joinedload(Listing.reviews).joinedload(Review.user)
    ).filter(Listing.id == listing_id).first()


def create_listing(db: Session, listing_data, image_urls: List[str], amenity_ids: List[int]) -> Listing:
    new_listing = Listing(
        host_id=listing_data.host_id,
        title=listing_data.title,
        description=listing_data.description,
        category=listing_data.category,
        property_type=listing_data.property_type,
        location_city=listing_data.location_city,
        location_country=listing_data.location_country,
        latitude=listing_data.latitude,
        longitude=listing_data.longitude,
        price_per_night=listing_data.price_per_night,
        max_guests=listing_data.max_guests,
        bedrooms=listing_data.bedrooms,
        beds=listing_data.beds,
        bathrooms=listing_data.bathrooms,
        rating=5.0,
        review_count=0
    )

    if amenity_ids:
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        new_listing.amenities = amenities

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    # Add images
    if image_urls:
        for idx, url in enumerate(image_urls):
            img = ListingImage(
                listing_id=new_listing.id,
                image_url=url,
                is_primary=(idx == 0),
                display_order=idx
            )
            db.add(img)
        db.commit()

    return get_listing_by_id(db, new_listing.id)


def update_listing(db: Session, listing_id: int, update_data, image_urls: Optional[List[str]] = None, amenity_ids: Optional[List[int]] = None) -> Optional[Listing]:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if field not in ["image_urls", "amenity_ids"] and hasattr(listing, field):
            setattr(listing, field, val)

    if amenity_ids is not None:
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        listing.amenities = amenities

    if image_urls is not None:
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for idx, url in enumerate(image_urls):
            img = ListingImage(
                listing_id=listing_id,
                image_url=url,
                is_primary=(idx == 0),
                display_order=idx
            )
            db.add(img)

    db.commit()
    return get_listing_by_id(db, listing_id)


def delete_listing(db: Session, listing_id: int) -> bool:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return False
    db.delete(listing)
    db.commit()
    return True


# --- Availability & Booking Logic ---

def is_date_range_overlapping(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    """
    Core Availability Validation Algorithm.
    Two date ranges [A_in, A_out] and [B_in, B_out] overlap iff:
        A_in < B_out AND A_out > B_in
    Back-to-back stays (A_in == B_out) are valid and NOT overlapping.
    """
    overlapping = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
        Booking.check_in < check_out,
        Booking.check_out > check_in
    ).first()

    return overlapping is not None


def create_booking(db: Session, listing_id: int, guest_id: int, check_in: date, check_out: date, guests_count: int) -> Tuple[Optional[Booking], str]:
    # 1. Basic Date Range Validations
    if check_out <= check_in:
        return None, "Check-out date must be after check-in date."

    if check_in < date.today():
        return None, "Check-in date cannot be in the past."

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return None, "Listing not found."

    if guests_count > listing.max_guests:
        return None, f"Maximum guests allowed for this property is {listing.max_guests}."

    # 2. Strict Overlap Check
    if is_date_range_overlapping(db, listing_id, check_in, check_out):
        return None, "Selected dates overlap with an existing reservation for this property."

    # 3. Calculate Nights & Price
    nights = (check_out - check_in).days
    total_price = listing.price_per_night * nights

    # 4. Create and Persist Booking
    booking = Booking(
        listing_id=listing_id,
        guest_id=guest_id,
        check_in=check_in,
        check_out=check_out,
        guests_count=guests_count,
        nightly_price=listing.price_per_night,
        total_nights=nights,
        total_price=total_price,
        status="confirmed"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Return full loaded object
    full_booking = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images)
    ).filter(Booking.id == booking.id).first()

    return full_booking, ""


def get_listing_availability(db: Session, listing_id: int) -> List[Booking]:
    """Returns all confirmed bookings for a listing to block dates in UI calendar"""
    return db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed"
    ).all()


def get_user_bookings(db: Session, user_id: int) -> List[Booking]:
    return db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images)
    ).filter(
        Booking.guest_id == user_id
    ).order_by(Booking.check_in.desc()).all()


def cancel_booking(db: Session, booking_id: int) -> Optional[Booking]:
    """Mark a booking as cancelled. Returns the updated booking or None if not found."""
    booking = db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images)
    ).filter(Booking.id == booking_id).first()
    if not booking:
        return None

    # Idempotent: if already cancelled, return as-is
    if booking.status == "cancelled":
        return booking

    booking.status = "cancelled"
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_host_listings(db: Session, host_id: int) -> List[Listing]:
    return db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.amenities)
    ).filter(Listing.host_id == host_id).order_by(Listing.created_at.desc()).all()


def get_host_bookings(db: Session, host_id: int) -> List[Booking]:
    return db.query(Booking).options(
        joinedload(Booking.listing).joinedload(Listing.images),
        joinedload(Booking.guest)
    ).join(Listing).filter(
        Listing.host_id == host_id
    ).order_by(Booking.created_at.desc()).all()


# --- Wishlist & Review Logic ---

def toggle_wishlist(db: Session, user_id: int, listing_id: int) -> Tuple[bool, str]:
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.listing_id == listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return False, "Removed from Wishlist"
    else:
        wishlist = Wishlist(user_id=user_id, listing_id=listing_id)
        db.add(wishlist)
        db.commit()
        return True, "Saved to Wishlist"


def get_user_wishlist(db: Session, user_id: int) -> List[Wishlist]:
    return db.query(Wishlist).options(
        joinedload(Wishlist.listing).joinedload(Listing.images)
    ).filter(Wishlist.user_id == user_id).all()
