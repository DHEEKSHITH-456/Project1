"""Booking CRUD and conflict checks."""
from datetime import datetime

from bson import ObjectId

from database import get_db
from models.booking import booking_from_doc


def _booking_id() -> str:
    """Generate human-readable booking ID."""
    import random
    return f"ZP-{datetime.utcnow().strftime('%Y')}-{random.randint(10000, 99999)}"


async def list_bookings(user_id: str | None = None, location_id: str | None = None, skip: int = 0, limit: int = 100):
    db = await get_db()
    q = {}
    if user_id:
        q["user_id"] = ObjectId(user_id)
    if location_id:
        q["location_id"] = ObjectId(location_id)
    cursor = db.bookings.find(q).sort("created_at", -1).skip(skip).limit(limit)
    out = []
    async for doc in cursor:
        b = booking_from_doc(doc)
        if b:
            b["user_id"] = str(doc.get("user_id"))
            b["location_id"] = str(doc.get("location_id"))
            b["slot_id"] = str(doc.get("slot_id"))
            out.append(b)
    return out


async def get_booking(booking_id: str):
    db = await get_db()
    try:
        doc = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        if doc:
            b = booking_from_doc(doc)
            b["user_id"] = str(doc.get("user_id"))
            b["location_id"] = str(doc.get("location_id"))
            b["slot_id"] = str(doc.get("slot_id"))
            return b
    except Exception:
        pass
    return None


async def get_booking_by_booking_id(booking_id_str: str):
    db = await get_db()
    doc = await db.bookings.find_one({"booking_id": booking_id_str})
    if doc:
        b = booking_from_doc(doc)
        b["user_id"] = str(doc.get("user_id"))
        b["location_id"] = str(doc.get("location_id"))
        b["slot_id"] = str(doc.get("slot_id"))
        return b
    return None


async def is_slot_available(slot_id: str, start: datetime, end: datetime, exclude_booking_id: str | None = None) -> bool:
    db = await get_db()
    q = {
        "slot_id": ObjectId(slot_id),
        "status": "confirmed",
        "$or": [
            {"start_time": {"$lt": end}, "end_time": {"$gt": start}},
        ],
    }
    if exclude_booking_id:
        q["_id"] = {"$ne": ObjectId(exclude_booking_id)}
    count = await db.bookings.count_documents(q)
    return count == 0


async def create_booking(user_id: str, slot_id: str, location_id: str, start_time: datetime, end_time: datetime):
    if not await is_slot_available(slot_id, start_time, end_time):
        return None
    db = await get_db()
    now = datetime.utcnow()
    doc = {
        "booking_id": _booking_id(),
        "user_id": ObjectId(user_id),
        "location_id": ObjectId(location_id),
        "slot_id": ObjectId(slot_id),
        "start_time": start_time,
        "end_time": end_time,
        "status": "confirmed",
        "created_at": now,
        "updated_at": now,
    }
    r = await db.bookings.insert_one(doc)
    doc["_id"] = r.inserted_id
    doc["user_id"] = user_id
    doc["location_id"] = location_id
    doc["slot_id"] = slot_id
    return booking_from_doc(doc)


async def cancel_booking(booking_id: str) -> bool:
    db = await get_db()
    r = await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}},
    )
    return r.modified_count > 0


async def count_bookings(status: str | None = None) -> int:
    db = await get_db()
    q = {} if status is None else {"status": status}
    return await db.bookings.count_documents(q)
