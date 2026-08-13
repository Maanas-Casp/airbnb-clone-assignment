import sys
import os
from datetime import date, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from seed import seed_db

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING AIRBNB API INTEGRATION & OVERLAP TESTS")
    print("=" * 60)

    # 1. Reset and Seed Database
    seed_db()

    # 2. Health & Root Check
    resp = client.get("/")
    assert resp.status_code == 200, f"Root endpoint failed: {resp.text}"
    print("✓ Root endpoint & Health Check PASSED")

    # 3. Get Listings Grid
    resp = client.get("/api/listings")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data and len(data["items"]) >= 8
    print(f"✓ List listings PASSED ({len(data['items'])} items returned)")

    # 4. Filter by Category
    resp = client.get("/api/listings?category=Beachfront")
    assert resp.status_code == 200
    bf_data = resp.json()
    assert all(item["category"] == "Beachfront" for item in bf_data["items"])
    print(f"✓ Category Filter PASSED ({len(bf_data['items'])} Beachfront items)")

    # 5. Listing Detail Page
    listing_id = 1
    resp = client.get(f"/api/listings/{listing_id}")
    assert resp.status_code == 200
    detail = resp.json()
    assert detail["title"] is not None
    assert len(detail["images"]) > 0
    assert len(detail["amenities"]) > 0
    print(f"✓ Listing Details PASSED ('{detail['title']}')")

    # 6. Availability Check
    resp = client.get(f"/api/bookings/listings/{listing_id}/availability")
    assert resp.status_code == 200
    avail = resp.json()
    print(f"✓ Availability check PASSED ({len(avail)} active date ranges blocked)")

    # 7. BOOKING OVERLAP VALIDATION TESTS
    today = date.today()

    # Case A: Attempt Overlapping Reservation (DB has listing 1 booked from today+5 to today+10)
    overlap_payload = {
        "listing_id": 1,
        "guest_id": 1,
        "check_in": (today + timedelta(days=6)).isoformat(),
        "check_out": (today + timedelta(days=9)).isoformat(),
        "guests_count": 2
    }
    resp = client.post("/api/bookings", json=overlap_payload)
    assert resp.status_code == 400, f"Expected 400 Bad Request for overlapping booking, got {resp.status_code}: {resp.text}"
    assert "overlap" in resp.json()["detail"].lower()
    print("✓ OVERLAP TEST 1: Overlapping booking correctly REJECTED!")

    # Case B: Back-to-back stay (Check-in on existing check-out day: today+10 to today+12)
    back2back_payload = {
        "listing_id": 1,
        "guest_id": 1,
        "check_in": (today + timedelta(days=10)).isoformat(),
        "check_out": (today + timedelta(days=12)).isoformat(),
        "guests_count": 2
    }
    resp = client.post("/api/bookings", json=back2back_payload)
    assert resp.status_code == 201, f"Expected 201 Created for back-to-back stay, got {resp.status_code}: {resp.text}"
    b_data = resp.json()
    assert b_data["total_nights"] == 2
    assert b_data["total_price"] == 1300.0  # 650 * 2
    print("✓ OVERLAP TEST 2: Back-to-back stay correctly ACCEPTED!")

    # Case C: Overlapping again after back-to-back was inserted
    overlap_b2b_payload = {
        "listing_id": 1,
        "guest_id": 1,
        "check_in": (today + timedelta(days=11)).isoformat(),
        "check_out": (today + timedelta(days=13)).isoformat(),
        "guests_count": 2
    }
    resp = client.post("/api/bookings", json=overlap_b2b_payload)
    assert resp.status_code == 400
    print("✓ OVERLAP TEST 3: Sub-overlap after back-to-back insertion REJECTED!")

    # 8. Guest Trips
    resp = client.get("/api/bookings/my-trips?guest_id=1")
    assert resp.status_code == 200
    trips = resp.json()
    assert len(trips) >= 2
    print(f"✓ My Trips PASSED ({len(trips)} guest trips found)")

    # 9. Host CRUD Operations
    new_listing_payload = {
        "host_id": 2,
        "title": "Test Secluded Eco Cabin",
        "description": "Peaceful getaway in nature.",
        "category": "Cabins",
        "property_type": "Entire cabin",
        "location_city": "Lake Tahoe",
        "location_country": "United States",
        "price_per_night": 250.0,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1.0,
        "image_urls": ["https://images.unsplash.com/photo-1510798831971-661eb04b3739"],
        "amenity_ids": [1, 4]
    }
    resp = client.post("/api/listings", json=new_listing_payload)
    assert resp.status_code == 201
    created_listing = resp.json()
    created_id = created_listing["id"]
    print(f"✓ Host Create Listing PASSED (New Listing ID: {created_id})")

    # Update Listing
    update_payload = {
        "title": "Test Updated Eco Cabin",
        "price_per_night": 299.0
    }
    resp = client.put(f"/api/listings/{created_id}", json=update_payload)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Updated Eco Cabin"
    assert resp.json()["price_per_night"] == 299.0
    print("✓ Host Edit Listing PASSED")

    # Delete Listing
    resp = client.delete(f"/api/listings/{created_id}")
    assert resp.status_code == 204
    resp = client.get(f"/api/listings/{created_id}")
    assert resp.status_code == 404
    print("✓ Host Delete Listing PASSED")

    print("=" * 60)
    print("ALL API & AVAILABILITY ENGINE INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
