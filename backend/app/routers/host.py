from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/host", tags=["Host Dashboard"])

@router.get("/listings", response_model=List[schemas.ListingCardOut])
def get_host_owned_listings(
    host_id: int = Query(2, description="Active host user ID"),
    db: Session = Depends(get_db)
):
    return crud.get_host_listings(db, host_id=host_id)


@router.get("/bookings", response_model=List[schemas.BookingOut])
def get_host_property_bookings(
    host_id: int = Query(2, description="Active host user ID"),
    db: Session = Depends(get_db)
):
    return crud.get_host_bookings(db, host_id=host_id)
