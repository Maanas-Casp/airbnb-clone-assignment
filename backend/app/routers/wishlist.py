from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[schemas.WishlistOut])
def get_user_saved_wishlist(
    user_id: int = Query(1, description="Active user ID"),
    db: Session = Depends(get_db)
):
    return crud.get_user_wishlist(db, user_id=user_id)


@router.post("/{listing_id}")
def toggle_saved_listing(
    listing_id: int,
    user_id: int = Query(1, description="Active user ID"),
    db: Session = Depends(get_db)
):
    is_saved, message = crud.toggle_wishlist(db, user_id=user_id, listing_id=listing_id)
    return {"saved": is_saved, "message": message}
