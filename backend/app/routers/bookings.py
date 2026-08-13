from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import crud, schemas
from app.models import Booking

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.post("", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
def create_reservation(booking_in: schemas.BookingCreate, db: Session = Depends(get_db)):
    booking, err_msg = crud.create_booking(
        db,
        listing_id=booking_in.listing_id,
        guest_id=booking_in.guest_id,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
        guests_count=booking_in.guests_count
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg or "Failed to create booking reservation"
        )

    return booking


@router.get("/my-trips", response_model=List[schemas.BookingOut])
def get_my_trips(
    guest_id: int = Query(1, description="ID of active guest user"),
    db: Session = Depends(get_db)
):
    return crud.get_user_bookings(db, user_id=guest_id)


@router.get("/listings/{listing_id}/availability", response_model=List[schemas.AvailabilityRange])
def get_property_availability(listing_id: int, db: Session = Depends(get_db)):
    bookings = crud.get_listing_availability(db, listing_id=listing_id)
    return [
        {"check_in": b.check_in, "check_out": b.check_out}
        for b in bookings
    ]


@router.post("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(booking_id: int, guest_id: int = Query(..., description="ID of cancelling guest"), db: Session = Depends(get_db)):
    """Cancel a booking by marking its status as 'cancelled'.

    This endpoint requires the caller to provide the guest_id of the user attempting the cancellation
    (mock personas). The booking can only be cancelled by its owner (booking.guest_id).
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # Validate ownership
    if booking.guest_id != guest_id:
        # Do not reveal booking existence details unnecessarily; use 403 Forbidden to indicate lack of permission
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You may only cancel your own bookings")

    # Delegate to CRUD which handles idempotent cancellation
    updated = crud.cancel_booking(db, booking_id=booking_id)
    if not updated:
        # Should not happen since we already loaded booking, but guard
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to cancel booking")
    return updated
