from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Amenity
from app import schemas

router = APIRouter(prefix="/api/amenities", tags=["Amenities"])

@router.get("", response_model=List[schemas.AmenityOut])
def get_all_amenities(db: Session = Depends(get_db)):
    return db.query(Amenity).all()
