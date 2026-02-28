"""Parking locations and slots CRUD."""
from datetime import datetime

from bson import ObjectId

from database import get_db
from models.parking import location_from_doc, slot_from_doc


async def list_locations(skip: int = 0, limit: int = 100):
    db = await get_db()
    cursor = db.parking_locations.find().skip(skip).limit(limit)
    out = []
    async for doc in cursor:
        loc = location_from_doc(doc)
        if loc:
            out.append(loc)
    return out


async def get_location(location_id: str):
    db = await get_db()
    try:
        doc = await db.parking_locations.find_one({"_id": ObjectId(location_id)})
        return location_from_doc(doc) if doc else None
    except Exception:
        return None


async def create_location(name: str, address: str, coordinates: dict, total_slots: int = 0):
    db = await get_db()
    now = datetime.utcnow()
    doc = {
        "name": name,
        "address": address,
        "coordinates": coordinates,
        "total_slots": total_slots,
        "created_at": now,
        "updated_at": now,
    }
    r = await db.parking_locations.insert_one(doc)
    doc["_id"] = r.inserted_id
    return location_from_doc(doc)


async def update_location(location_id: str, name: str | None = None, address: str | None = None, coordinates: dict | None = None, total_slots: int | None = None):
    db = await get_db()
    upd = {"updated_at": datetime.utcnow()}
    if name is not None:
        upd["name"] = name
    if address is not None:
        upd["address"] = address
    if coordinates is not None:
        upd["coordinates"] = coordinates
    if total_slots is not None:
        upd["total_slots"] = total_slots
    await db.parking_locations.update_one({"_id": ObjectId(location_id)}, {"$set": upd})
    return await get_location(location_id)


async def delete_location(location_id: str) -> bool:
    db = await get_db()
    await db.parking_slots.delete_many({"location_id": ObjectId(location_id)})
    r = await db.parking_locations.delete_one({"_id": ObjectId(location_id)})
    return r.deleted_count > 0


async def list_slots(location_id: str):
    db = await get_db()
    cursor = db.parking_slots.find({"location_id": ObjectId(location_id)})
    out = []
    async for doc in cursor:
        s = slot_from_doc(doc)
        if s:
            out.append(s)
    return out


async def get_slot(slot_id: str):
    db = await get_db()
    try:
        doc = await db.parking_slots.find_one({"_id": ObjectId(slot_id)})
        return slot_from_doc(doc) if doc else None
    except Exception:
        return None


async def add_slot(location_id: str, slot_number: str, available: bool = True, price_per_hour: float | None = None):
    db = await get_db()
    now = datetime.utcnow()
    doc = {
        "location_id": ObjectId(location_id),
        "slot_number": slot_number,
        "available": available,
        "price_per_hour": price_per_hour,
        "created_at": now,
        "updated_at": now,
    }
    r = await db.parking_slots.insert_one(doc)
    doc["_id"] = r.inserted_id
    doc["location_id"] = location_id
    return slot_from_doc(doc)


async def update_slot(slot_id: str, available: bool | None = None, price_per_hour: float | None = None):
    db = await get_db()
    upd = {"updated_at": datetime.utcnow()}
    if available is not None:
        upd["available"] = available
    if price_per_hour is not None:
        upd["price_per_hour"] = price_per_hour
    await db.parking_slots.update_one({"_id": ObjectId(slot_id)}, {"$set": upd})
    return await get_slot(slot_id)


async def count_locations() -> int:
    db = await get_db()
    return await db.parking_locations.count_documents({})
