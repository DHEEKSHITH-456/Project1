"""Parking location and slot models."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float
    lng: float


class ParkingLocationBase(BaseModel):
    name: str
    address: str
    coordinates: Coordinates
    total_slots: int = 0


class ParkingLocationResponse(ParkingLocationBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ParkingSlotBase(BaseModel):
    slot_number: str
    available: bool = True
    price_per_hour: float | None = None


class ParkingSlotResponse(ParkingSlotBase):
    id: str
    location_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


def location_from_doc(doc: dict) -> dict | None:
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    if "coordinates" in doc and isinstance(doc["coordinates"], dict):
        doc["coordinates"] = dict(doc["coordinates"])
    return doc


def slot_from_doc(doc: dict) -> dict | None:
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc["location_id"] = str(doc.get("location_id", ""))
    return doc
