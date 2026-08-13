from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date

from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/listings", tags=["Listings"])

@router.get("", response_model=schemas.PaginatedListingsOut)
def list_listings(
    location: Optional[str] = Query(None, description="City, country, or location search term"),
    category: Optional[str] = Query(None, description="Category filter e.g. Iconic, Beachfront, Cabins"),
    check_in: Optional[date] = Query(None, description="Desired check-in date"),
    check_out: Optional[date] = Query(None, description="Desired check-out date"),
    guests: Optional[int] = Query(None, ge=1, description="Number of guests"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    if check_in and check_out and check_out <= check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )

    listings, total = crud.get_listings(
        db,
        location=location,
        category=category,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        page=page,
        limit=limit
    )

    pages = (total + limit - 1) // limit if limit > 0 else 1

    return {
        "items": listings,
        "total": total,
        "page": page,
        "pages": pages
    }


@router.get("/{id}", response_model=schemas.ListingDetailOut)
def get_listing_detail(id: int, db: Session = Depends(get_db)):
    listing = crud.get_listing_by_id(db, listing_id=id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with ID {id} not found"
        )
    return listing


@router.post("", response_model=schemas.ListingDetailOut, status_code=status.HTTP_201_CREATED)
def create_new_listing(listing_in: schemas.ListingCreate, db: Session = Depends(get_db)):
    listing = crud.create_listing(
        db,
        listing_data=listing_in,
        image_urls=listing_in.image_urls,
        amenity_ids=listing_in.amenity_ids
    )
    return listing


@router.put("/{id}", response_model=schemas.ListingDetailOut)
def update_existing_listing(id: int, listing_in: schemas.ListingUpdate, db: Session = Depends(get_db)):
    updated = crud.update_listing(
        db,
        listing_id=id,
        update_data=listing_in,
        image_urls=listing_in.image_urls,
        amenity_ids=listing_in.amenity_ids
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with ID {id} not found"
        )
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_listing(id: int, db: Session = Depends(get_db)):
    success = crud.delete_listing(db, listing_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with ID {id} not found"
        )
    return None
