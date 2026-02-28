"""Parking location and slot schemas."""
from pydantic import BaseModel


class CoordinatesSchema(BaseModel):
    lat: float
    lng: float


class ParkingLocationCreate(BaseModel):
    name: str
    address: str
    coordinates: CoordinatesSchema
    total_slots: int = 0


class ParkingLocationUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    coordinates: CoordinatesSchema | None = None
    total_slots: int | None = None


class SlotCreate(BaseModel):
    slot_number: str
    available: bool = True
    price_per_hour: float | None = None


class SlotUpdate(BaseModel):
    available: bool | None = None
    price_per_hour: float | None = None
