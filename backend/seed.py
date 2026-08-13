import os
import sys
from datetime import date, timedelta, datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models import User, Listing, ListingImage, Amenity, Booking, Review, Wishlist, listing_amenities

def seed_db():
    print("Resetting database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding Users...")
        guest = User(
            id=1,
            email="john.guest@example.com",
            name="John Guest",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            is_host=False
        )
        host1 = User(
            id=2,
            email="sarah.superhost@example.com",
            name="Sarah Jenkins",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
            is_host=True
        )
        host2 = User(
            id=3,
            email="michael.host@example.com",
            name="Michael Chen",
            avatar_url="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
            is_host=True
        )
        db.add_all([guest, host1, host2])
        db.commit()

        print("Seeding Amenities...")
        amenities_data = [
            {"id": 1, "name": "Fast Wi-Fi", "icon_name": "Wifi", "category": "Essentials"},
            {"id": 2, "name": "Gourmet Kitchen", "icon_name": "Utensils", "category": "Essentials"},
            {"id": 3, "name": "Private Pool", "icon_name": "Waves", "category": "Features"},
            {"id": 4, "name": "Free Parking", "icon_name": "Car", "category": "Facilities"},
            {"id": 5, "name": "Air Conditioning", "icon_name": "Wind", "category": "Essentials"},
            {"id": 6, "name": "Dedicated Workspace", "icon_name": "Laptop", "category": "Features"},
            {"id": 7, "name": "Beach Access", "icon_name": "Umbrella", "category": "Location"},
            {"id": 8, "name": "Hot Tub", "icon_name": "Flame", "category": "Features"},
            {"id": 9, "name": "Patio & BBQ Grill", "icon_name": "Flame", "category": "Outdoor"},
            {"id": 10, "name": "Self Check-in", "icon_name": "Key", "category": "Services"},
            {"id": 11, "name": "Ocean View", "icon_name": "Compass", "category": "Location"},
            {"id": 12, "name": "Fireplace", "icon_name": "Sun", "category": "Features"},
        ]
        amenity_objs = [Amenity(**a) for a in amenities_data]
        db.add_all(amenity_objs)
        db.commit()

        print("Seeding Listings...")
        listings_data = [
            {
                "id": 1,
                "host_id": 2,
                "title": "Modern Oceanfront Villa with Infinity Pool",
                "description": "Experience coastal luxury at its finest. This stunning architectural masterwork overlooks Carbon Beach in Malibu. Featuring floor-to-ceiling glass walls, a heated infinity pool, private beach access, and panoramic views of the Pacific Ocean. Enjoy sunset cocktails on the expansive teak terrace or cozy up by the indoor linear fireplace.",
                "category": "Beachfront",
                "property_type": "Entire villa",
                "location_city": "Malibu",
                "location_country": "United States",
                "latitude": 34.0381,
                "longitude": -118.6923,
                "price_per_night": 650.0,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.5,
                "rating": 4.95,
                "review_count": 28,
                "amenity_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            },
            {
                "id": 2,
                "host_id": 2,
                "title": "Minimalist Luxury Chalet with Mountain Panorama",
                "description": "Nestled in the pristine woods of Aspen, this Scandinavian-inspired timber chalet provides direct ski-in/ski-out access to Aspen Mountain. Designed for ultimate relaxation with a private outdoor hot tub, sauna, stone fireplace, and custom chef's kitchen.",
                "category": "Cabins",
                "property_type": "Entire chalet",
                "location_city": "Aspen",
                "location_country": "United States",
                "latitude": 39.1911,
                "longitude": -106.8175,
                "price_per_night": 820.0,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.0,
                "rating": 4.98,
                "review_count": 42,
                "amenity_ids": [1, 2, 4, 5, 6, 8, 10, 12]
            },
            {
                "id": 3,
                "host_id": 3,
                "title": "Haussmannian Penthouse overlooking Eiffel Tower",
                "description": "Live like Parisian royalty in the heart of the 7th arrondissement. Elegantly renovated 19th-century apartment featuring high ornate ceilings, herringbone parquet floors, private balcony with direct Eiffel Tower views, and walking distance to Musée d'Orsay.",
                "category": "Iconic",
                "property_type": "Entire apartment",
                "location_city": "Paris",
                "location_country": "France",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "price_per_night": 450.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.91,
                "review_count": 35,
                "amenity_ids": [1, 2, 5, 6, 10]
            },
            {
                "id": 4,
                "host_id": 3,
                "title": "Zen Bamboo Forest Sanctuary & Hot Spring Villa",
                "description": "Escape the bustle of the city into this tranquil Japanese traditional Machiya villa located near Arashiyama Bamboo Grove. Features a private outdoor Onsen hot spring bath, private Japanese rock garden, tatami tea rooms, and modern subterranean sleeping quarters.",
                "category": "OMG!",
                "property_type": "Entire house",
                "location_city": "Kyoto",
                "location_country": "Japan",
                "latitude": 35.0116,
                "longitude": 135.7681,
                "price_per_night": 380.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "rating": 4.97,
                "review_count": 51,
                "amenity_ids": [1, 2, 5, 6, 8, 10]
            },
            {
                "id": 5,
                "host_id": 2,
                "title": "Tuscan Vineyard Estate & Historic Olive Grove Villa",
                "description": "Set amidst rolling Chianti hills, this restored 16th-century stone villa offers timeless Italian charm paired with modern comforts. Includes a private wine cellar, infinity pool surrounded by olive trees, wood-fired pizza oven, and morning espresso service.",
                "category": "Countryside",
                "property_type": "Entire villa",
                "location_city": "Florence",
                "location_country": "Italy",
                "latitude": 43.7696,
                "longitude": 11.2558,
                "price_per_night": 540.0,
                "max_guests": 10,
                "bedrooms": 5,
                "beds": 6,
                "bathrooms": 5.0,
                "rating": 4.89,
                "review_count": 19,
                "amenity_ids": [1, 2, 3, 4, 8, 9, 10]
            },
            {
                "id": 6,
                "host_id": 3,
                "title": "Clifftop Eco-Glass House with Jungle Pool",
                "description": "Perched dramatically above the Ayung River valley in Ubud, this treehouse-style glass villa offers 360-degree views of lush tropical rainforests. Unwind in your private jungle pool, listen to natural waterfalls, and enjoy complimentary organic breakfasts.",
                "category": "Tropical",
                "property_type": "Treehouse",
                "location_city": "Bali",
                "location_country": "Indonesia",
                "latitude": -8.4095,
                "longitude": 115.1889,
                "price_per_night": 290.0,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.5,
                "rating": 4.96,
                "review_count": 64,
                "amenity_ids": [1, 3, 5, 6, 10, 11]
            },
            {
                "id": 7,
                "host_id": 2,
                "title": "SoHo Designer Loft with Private Roof Terrace",
                "description": "Soaring 14-foot ceilings, exposed brick walls, original cast-iron columns, and floor-to-ceiling windows define this authentic Manhattan loft. Located on a quiet cobblestone street in prime SoHo with access to a private landscaped rooftop garden.",
                "category": "Design",
                "property_type": "Entire loft",
                "location_city": "New York",
                "location_country": "United States",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "price_per_night": 580.0,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "rating": 4.88,
                "review_count": 22,
                "amenity_ids": [1, 2, 5, 6, 9, 10]
            },
            {
                "id": 8,
                "host_id": 3,
                "title": "Santorini Caldera Cave Suite with Private Plunge Pool",
                "description": "Carved into the volcanic cliffs of Oia, this whitewashed traditional cave suite features unmatched views of the Aegean Sea caldera. Includes a heated cave plunge pool, sun-drenched terrace, daily champagne breakfast, and breathtaking sunset vistas.",
                "category": "Iconic",
                "property_type": "Cave home",
                "location_city": "Santorini",
                "location_country": "Greece",
                "latitude": 36.4618,
                "longitude": 25.3753,
                "price_per_night": 620.0,
                "max_guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1.0,
                "rating": 4.99,
                "review_count": 78,
                "amenity_ids": [1, 3, 5, 8, 10, 11]
            }
        ]

        images_data = [
            # Listing 1: Malibu
            (1, "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80", True, 0),
            (1, "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", False, 1),
            (1, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", False, 2),
            (1, "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", False, 3),

            # Listing 2: Aspen
            (2, "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80", True, 0),
            (2, "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80", False, 1),
            (2, "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", False, 2),

            # Listing 3: Paris
            (3, "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", True, 0),
            (3, "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", False, 1),
            (3, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", False, 2),

            # Listing 4: Kyoto
            (4, "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", True, 0),
            (4, "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80", False, 1),

            # Listing 5: Florence
            (5, "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80", True, 0),
            (5, "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80", False, 1),

            # Listing 6: Bali
            (6, "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80", True, 0),
            (6, "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", False, 1),

            # Listing 7: New York
            (7, "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80", True, 0),
            (7, "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80", False, 1),

            # Listing 8: Santorini
            (8, "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80", True, 0),
            (8, "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", False, 1),
        ]

        all_amenities = {a.id: a for a in db.query(Amenity).all()}

        for ld in listings_data:
            amenity_ids = ld.pop("amenity_ids")
            listing = Listing(**ld)
            for aid in amenity_ids:
                if aid in all_amenities:
                    listing.amenities.append(all_amenities[aid])
            db.add(listing)

        db.commit()

        for l_id, img_url, is_prim, disp_ord in images_data:
            img = ListingImage(
                listing_id=l_id,
                image_url=img_url,
                is_primary=is_prim,
                display_order=disp_ord
            )
            db.add(img)

        db.commit()

        print("Seeding Sample Bookings for Availability Testing...")
        today = date.today()
        # Booking 1: Malibu property booked next week
        booking1 = Booking(
            listing_id=1,
            guest_id=1,
            check_in=today + timedelta(days=5),
            check_out=today + timedelta(days=10),
            guests_count=2,
            nightly_price=650.0,
            total_nights=5,
            total_price=3250.0,
            status="confirmed"
        )
        # Booking 2: Paris property booked in 2 weeks
        booking2 = Booking(
            listing_id=3,
            guest_id=1,
            check_in=today + timedelta(days=14),
            check_out=today + timedelta(days=18),
            guests_count=2,
            nightly_price=450.0,
            total_nights=4,
            total_price=1800.0,
            status="confirmed"
        )
        db.add_all([booking1, booking2])
        db.commit()

        print("Seeding Sample Reviews...")
        review1 = Review(
            listing_id=1,
            user_id=1,
            rating=5,
            comment="Unbelievable views! Waking up to the sound of waves hitting Carbon Beach was unforgettable. Sarah was a gracious host who provided great local recommendations."
        )
        review2 = Review(
            listing_id=3,
            user_id=1,
            rating=5,
            comment="The Eiffel Tower view from the private balcony is breathtaking! Perfect location, super clean, and wonderful host communication."
        )
        db.add_all([review1, review2])
        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
