"""Booking model."""
from datetime import datetime

from pydantic import BaseModel


class BookingBase(BaseModel):
    slot_id: str
    location_id: str
    start_time: datetime
    end_time: datetime


class BookingResponse(BookingBase):
    id: str
    booking_id: str
    user_id: str
    status: str  # confirmed, cancelled, completed
    created_at: datetime | None = None
    updated_at: datetime | None = None


def booking_from_doc(doc: dict) -> dict | None:
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc.get("user_id"))
    doc["location_id"] = str(doc.get("location_id"))
    doc["slot_id"] = str(doc.get("slot_id"))
    return doc
