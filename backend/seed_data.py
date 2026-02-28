"""Seed database with demo admin, users, parking, slots, and sample bookings/issues.
Run from backend directory: python seed_data.py
Requires: MongoDB running, and dependencies installed.
"""
import asyncio

from datetime import datetime, timedelta

from database.connection import get_db
from utils.auth import hash_password


async def seed():
    db = await get_db()
    #await db.client.drop_database("zypark")
    print("Old zypark database dropped")
    # Collections
    users = db.users
    parking_locations = db.parking_locations
    parking_slots = db.parking_slots
    bookings = db.bookings
    issues = db.issues

    print("USERS BEFORE SEED:", await users.count_documents({}))
    # Drop and recreate for clean demo (optional: comment out to append)
    # await users.delete_many({})
    # await parking_locations.delete_many({})
    # await parking_slots.delete_many({})
    # await bookings.delete_many({})
    # await issues.delete_many({})

    # Admin
    admin = await users.find_one({"email": "admin@zypark.com"})
    if not admin:
        await users.insert_one({
            "email": "admin@zypark.com",
            "password_hash": hash_password("admin123"),
            "role": "admin",
            "name": "System Admin",
            "enabled": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        print("Created admin: admin@zypark.com / admin123")

    # Demo user
    user = await users.find_one({"email": "user@zypark.com"})
    if not user:
        u = await users.insert_one({
            "email": "user@zypark.com",
            "password_hash": hash_password("user123"),
            "role": "user",
            "name": "Demo User",
            "enabled": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        user_id = u.inserted_id
        print("Created user: user@zypark.com / user123")
    else:
        user_id = user["_id"]

    # Parking locations
    loc1 = await parking_locations.find_one({"name": "Central Mall Parking"})
    if not loc1:
        r1 = await parking_locations.insert_one({
            "name": "Central Mall Parking",
            "address": "123 Main St, City Center",
            "coordinates": {"lat": 40.7128, "lng": -74.0060},
            "total_slots": 10,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        loc1_id = r1.inserted_id
        for i in range(1, 6):
            await parking_slots.insert_one({
                "location_id": loc1_id,
                "slot_number": f"A-{i:02d}",
                "available": i % 2 == 1,
                "price_per_hour": 2.5,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
        print("Created Central Mall Parking with 5 slots")
    else:
        loc1_id = loc1["_id"]

    loc2 = await parking_locations.find_one({"name": "Airport Terminal B"})
    if not loc2:
        r2 = await parking_locations.insert_one({
            "name": "Airport Terminal B",
            "address": "456 Airport Rd",
            "coordinates": {"lat": 40.6413, "lng": -73.7781},
            "total_slots": 20,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })
        loc2_id = r2.inserted_id
        for i in range(1, 11):
            await parking_slots.insert_one({
                "location_id": loc2_id,
                "slot_number": f"B-{i:02d}",
                "available": True,
                "price_per_hour": 4.0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
        print("Created Airport Terminal B with 10 slots")
    else:
        loc2_id = loc2["_id"]

    # Sample slot for booking (get first slot of loc1)
    slot_doc = await parking_slots.find_one({"location_id": loc1_id})
    if slot_doc and user_id:
        existing = await bookings.find_one({"user_id": user_id, "status": "confirmed"})
        if not existing:
            start = datetime.utcnow() + timedelta(hours=1)
            end = start + timedelta(hours=2)
            await bookings.insert_one({
                "booking_id": "ZP-2025-00001",
                "user_id": user_id,
                "location_id": loc1_id,
                "slot_id": slot_doc["_id"],
                "start_time": start,
                "end_time": end,
                "status": "confirmed",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            })
            print("Created sample booking for demo user")

    # Sample issue
    issue_exists = await issues.find_one({"user_id": user_id})
    if not issue_exists and user_id:
        await issues.insert_one({
            "user_id": user_id,
            "location_id": loc1_id,
            "vehicle_number": "XYZ-9999",
            "description": "Vehicle blocking two slots",
            "image_url": None,
            "status": "open",
            "admin_notes": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "resolved_at": None,
        })
        print("Created sample issue")
    print("USERS AFTER SEED:", await users.count_documents({}))
    print("Seed completed.")


if __name__ == "__main__":
    asyncio.run(seed())
