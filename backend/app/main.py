import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import listings, bookings, host, wishlist, amenities

# Create database tables if not already present
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airbnb Clone API",
    description="Full-stack SDE assignment backend API with FastAPI, SQLite, and date-overlap availability engine.",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
# Allow overriding allowed origins via ALLOWED_ORIGINS environment variable (comma-separated).
_allowed_origins_env = os.getenv('ALLOWED_ORIGINS')
if _allowed_origins_env:
    # Parse comma-separated list and strip whitespace
    allow_origins = [o.strip() for o in _allowed_origins_env.split(',') if o.strip()]
else:
    # Default to permissive behavior for local development
    allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(host.router)
app.include_router(wishlist.router)
app.include_router(amenities.router)

@app.get("/")
def root():
    return {
        "name": "Airbnb Clone API",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
