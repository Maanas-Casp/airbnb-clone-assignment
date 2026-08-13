# Airbnb Clone — Full-Stack Assignment

IMPORTANT: This README documents the exact implementation contained in this repository (frontend + backend + SQLite). Do not assume additional features beyond what is implemented here.

---

## 1. Project Overview

This is an Airbnb-like full-stack assignment built with a Next.js + TypeScript frontend and a FastAPI backend using SQLite for persistence. The project implements core guest and host flows: explore/search, listing detail, booking with availability enforcement, host CRUD, wishlist, and reviews. Payments are mocked.

This README describes how to run, seed, test, and prepare the app for deployment using the actual commands present in this repository.

## 🚀 Live Deployment

| Component | Platform | Link |
|---|---|---|
| Frontend | Vercel | [Open Application](https://airbnb-clone-assignment-chi.vercel.app/) |
| Backend API | Render | [Open API](https://airbnb-clone-assignment.onrender.com/) |
| API Documentation | FastAPI / Swagger | [Open Swagger Docs](https://airbnb-clone-assignment.onrender.com/docs) |


---

## 2. Features (Implemented)

- Explore page with search by location, category filters, price range, guest capacity, and pagination ("Load more").
- Listing cards with photos, title, location, rating, price/night, and wishlist toggle.
- Listing detail page with photo gallery, description, amenities, host info, reviews, price breakdown and reservation UI.
- Booking flow with server-side availability checks, overlap prevention, night and price calculation, mock checkout, and My Trips (persistent bookings in SQLite).
- Host dashboard: create, edit, delete listings and view bookings for owned listings.
- Wishlist (save/unsave listings).
- Seed script to populate sample users, amenities, listings, images, bookings and reviews.

Note: Real authentication and real payments are NOT implemented. Persona switching (guest vs host) is mocked on the frontend.

---

## 3. Tech Stack

- Frontend: Next.js (App Router) + TypeScript + React
- Styling: Tailwind CSS
- Backend: FastAPI (Python) + SQLAlchemy
- Database: SQLite (backend/airbnb_app.db or created via seed.py)
- Running server: Uvicorn

---

## 4. Architecture Overview

User
  ↓
Next.js / TypeScript Frontend (calls REST API) -- NEXT_PUBLIC_API_URL
  ↓
FastAPI Backend (app.routers) — business logic in app.crud
  ↓
SQLite (SQLAlchemy models in app.models)

Responsibilities:
- Frontend: Explore, Search, Filters, Listing detail, Booking UI, My Trips, Host dashboard
- Backend: Listings API, Booking API + availability logic, Host CRUD, Wishlist, Reviews, DB seeding & tests
- Database: Users, Listings, ListingImages, Amenities, Bookings, Reviews, Wishlists, Listing<->Amenity join table

---

## 5. Project Structure (important files)

- backend/
  - app/
    - main.py           — FastAPI app startup & router includes
    - models.py         — SQLAlchemy models (tables & relationships)
    - crud.py           — Business logic (listings, bookings, availability)
    - routers/
      - listings.py     — /api/listings endpoints
      - bookings.py     — /api/bookings endpoints
      - host.py         — /api/host endpoints
      - wishlist.py     — /api/wishlist endpoints
      - amenities.py    — /api/amenities
    - database.py       — DB engine, Base, get_db
  - seed.py             — Reseed DB to known state (creates users, listings, bookings, etc.)
  - test_api.py         — Integration & availability test script (uses TestClient)
  - venv/               — Python virtualenv (project-specific)
  - airbnb_app.db       — SQLite DB file (created by seed or runtime)

- frontend/
  - src/
    - app/
      - page.tsx         — Explore page (pagination/load more)
      - listings/[id]/page.tsx — Listing detail + booking UI
      - host/page.tsx    — Host dashboard
    - components/        — ListingCard, ListingGrid, PriceBreakdownCard, MockCheckoutModal, etc.
    - lib/api.ts         — Client wrapper for API calls (uses NEXT_PUBLIC_API_URL)
    - context/UserContext.tsx — Mock persona & wishlist state
  - package.json

---

## 6. Database Schema (tables & key columns)

All models are defined in `backend/app/models.py`. Important tables and columns:

- users
  - id PK, email, name, avatar_url, is_host, created_at

- amenities
  - id PK, name, icon_name, category

- listings
  - id PK, host_id FK -> users.id, title, description, category, property_type,
    location_city, location_country, latitude, longitude, price_per_night,
    max_guests, bedrooms, beds, bathrooms, rating, review_count, created_at

- listing_images
  - id PK, listing_id FK -> listings.id, image_url, is_primary, display_order

- listing_amenities (join table)
  - listing_id FK, amenity_id FK (composite PK)

- bookings
  - id PK, listing_id FK -> listings.id, guest_id FK -> users.id,
    check_in (Date), check_out (Date), guests_count, nightly_price, total_nights, total_price, status, created_at

- reviews
  - id PK, listing_id FK, user_id FK, rating, comment, created_at

- wishlists
  - id PK, user_id FK, listing_id FK, created_at

Relationships are set up with SQLAlchemy ORM in models.py and used by the CRUD layer.

---

## 7. Database Relationships (high level)

- User (1) — (N) Listing  (host)
- Listing (1) — (N) ListingImage
- Listing (M) — (M) Amenity via listing_amenities
- Listing (1) — (N) Booking
- User (1) — (N) Booking (guest)
- Listing (1) — (N) Review
- User (1) — (N) Review
- User (1) — (N) Wishlist
- Listing (1) — (N) Wishlist

---

## 8. API Endpoints (actual names & routes used by frontend)

All API routes are prefixed with `/api` and defined in `backend/app/routers`.

Listings
- GET  /api/listings
  - Query params: location, category, check_in, check_out, guests, min_price, max_price, page, limit
  - Response: Paginated listings (items, total, page, pages)

- GET  /api/listings/{id}
  - Returns listing detail, images, amenities, host, reviews

- POST /api/listings
  - Create listing (host flow)

- PUT  /api/listings/{id}
  - Update listing

- DELETE /api/listings/{id}
  - Delete listing (204 on success)

Bookings & Availability
- POST /api/bookings
  - Body: { listing_id, guest_id, check_in, check_out, guests_count }
  - Server validates dates, guest count, listing existence, and checks for overlap (rejects overlapping confirmed bookings)

- GET  /api/bookings/listings/{listing_id}/availability
  - Returns confirmed booked date ranges for a listing

- GET  /api/bookings/my-trips?guest_id={id}
  - Returns bookings for a guest

Host
- GET /api/host/listings?host_id={id}
  - Returns listings owned by a host

- GET /api/host/bookings?host_id={id}
  - Returns bookings for properties owned by the host

Wishlist
- GET  /api/wishlist?user_id={id}
  - Returns wishlist items for a user

- POST /api/wishlist/{listing_id}?user_id={id}
  - Toggles wishlist entry for user/listing

Amenities
- GET /api/amenities
  - Returns list of available amenities

Error handling
- Routes return HTTP 4xx for validation errors with `detail` messages. Example: overlapping booking attempts return a detail message: "Selected dates overlap with an existing reservation for this property.".

---

## 9. Backend Setup (verified commands)

1. Activate virtualenv (project includes a venv at `backend/venv`):

   cd backend
   # If shell uses bash/zsh
   source ./venv/bin/activate

2. Seed the database (creates/overwrites `airbnb_app.db`):

   ./venv/bin/python3 seed.py

   This script drops and recreates tables, then inserts sample users, amenities, listings, images, bookings and reviews.

3. Run integration tests (resets DB as part of script):

   ./venv/bin/python3 test_api.py

4. Start the backend (development server):

   ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000

Notes:
- The test script and seed script are the project's verified mechanisms for deterministic DB state.
- Use the venv Python binaries so dependencies installed in the project's venv are used.

---

## 10. Frontend Setup (verified commands)

1. Install dependencies (from repository root):

   cd frontend
   npm install

2. Run dev server (default NEXT_PUBLIC_API_URL points to http://localhost:8000):

   npm run dev

   - Open http://localhost:3000

3. Build for production (verifies TypeScript and generates static pages):

   npm run build

4. Start production preview (if needed):

   npm run start

Notes:
- The frontend client uses `frontend/src/lib/api.ts` which reads API base URL from environment variable `NEXT_PUBLIC_API_URL`. By default it falls back to http://localhost:8000.

---

## 11. Database Seeding

Reseeding DB to a known initial state (recommended before deterministic manual tests):

1. Activate venv (backend/venv) and run:

   ./venv/bin/python3 seed.py

2. seed.py will:
   - Drop all tables and recreate schema
   - Insert sample users (guest id=1, host id=2, host id=3)
   - Insert amenities, listings (ids 1..8), listing images, and sample bookings + reviews

After seeding, the DB file `backend/airbnb_app.db` is populated and ready for local testing.

---

## 12. Running Tests (verified)

Integration & availability tests are included as `backend/test_api.py`.

Run with venv Python:

  ./venv/bin/python3 test_api.py

The script seeds the DB and runs a sequence of API checks (listings, availability and booking overlap tests, host CRUD). It prints pass/fail for each check.

---

## 13. Mock Authentication / User Personas

- Authentication is mocked. The frontend uses `UserContext` to switch personas.
- Default ids seeded by `seed.py`:
  - Guest: user id = 1 (John Guest)
  - Host:  user id = 2 (Sarah Jenkins)
- Host mode is enabled by visiting the Host dashboard; the UI switches role and sets `activeUserId` accordingly.

Note: There is no secure authentication flow — this is by design for the assignment. API endpoints take user ids as query/body parameters.

---

## 14. Mock Payment / Checkout

- Real payments are NOT implemented.
- The frontend includes `MockCheckoutModal` (a UI-only modal) to simulate payment confirmation.
- Booking creation is performed by calling POST /api/bookings after confirming in the mock checkout UI.

---

## 15. Environment Variables

- FRONTEND:
  - NEXT_PUBLIC_API_URL
    - Default: `http://localhost:8000` (set in `frontend/src/lib/api.ts` fallback)
    - In production, set this to the deployed backend URL (e.g., `https://api.example.com`) — do NOT leave this pointing to localhost in production.

- BACKEND:
  - The backend uses the SQLite DB in `backend/airbnb_app.db` by default. If changing DB location, update `backend/app/database.py` accordingly.

---

## 16. How to Run Locally (quick steps)

1. Backend: seed DB & start server

   cd backend
   source ./venv/bin/activate
   ./venv/bin/python3 seed.py
   ./venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

2. Frontend: start dev server

   cd frontend
   npm install
   npm run dev

3. Open the app: http://localhost:3000

4. Test booking flow: pick a listing, select dates that are not in availability returned by GET /api/bookings/listings/{id}/availability, Reserve, use Mock Checkout to confirm, then check My Trips.

---

## 17. Deployment Instructions (recommendation & special attention)

Recommended minimal approach:
- Frontend: Deploy to Vercel (Next.js compatible)
- Backend: Deploy to Render or Railway (supports FastAPI + Uvicorn)

Important considerations:
1. NEXT_PUBLIC_API_URL
   - Set to the backend's public URL in the frontend deployment settings (do not use http://localhost:8000).
2. CORS
   - Ensure backend CORS allows the deployed frontend origin. The backend code includes necessary CORS setup in `app/main.py` (verify allowed origins if modifying). If CORS is restrictive, add the frontend origin.
3. SQLite persistence
   - Many PaaS platforms use ephemeral filesystems for containers — the SQLite DB file may not persist across restarts or deployments.
   - Options:
     - Use a service that provides persistent disks (e.g., Render with persistent disk) so the SQLite file is preserved.
     - Or export data and use an external DB (Postgres) if required by the hosting provider. Changing DB type is a project change and is NOT required by the assignment unless the host forces it.
4. Startup commands for backend on host (example):
   - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Make sure `venv` is set up or use a system Python environment with dependencies installed.
5. Environment variables for backend:
   - None mandatory in current code, but configure CORS and DB path if needed.

Deployment is possible with the current code, but ensure SQLite persistence is considered when selecting a hosting provider.

---

## 18. Assumptions

- Authentication is intentionally simplified / mocked (the assignment permits this).
- Payments are mocked (no real payment integration).
- The backend enforces all booking and availability rules — the frontend performs helpful validation but cannot be relied upon to enforce booking correctness.
- Seed data created by `seed.py` is intended for demonstration and testing.

---

## 19. Known Limitations

- No production-grade authentication; API accepts user ids directly.
- SQLite file persistence depends on hosting provider specifics. On platforms with ephemeral file systems, database persistence requires additional configuration or a different DB.
- Minor potential frontend/backend price calc mismatch: frontend uses Math.ceil when converting ms -> nights while backend uses integer date difference. This typically does not cause mismatch with date-only inputs but can be harmonized if desired.

---

## 20. Future Improvements (not implemented now)

- Add real authentication (OAuth / JWT) and secure endpoints.
- Add a resilient production DB (Postgres) for hosted deployments.
- Add E2E tests (Cypress/Playwright) for automated UX flows.
- Visual calendar showing booked ranges on the listing detail page.

---

## Final notes & contacts

- All commands in this README were verified to work within this repository on the development machine using the included venv and package.json scripts.
- If you want, next I can:
  - Create a short `DEPLOYMENT.md` with exact Render/Vercel steps and environment variable examples.
  - Prepare a short evaluator checklist derived from the assignment PDF to guide the reviewer.

---

# End of README
