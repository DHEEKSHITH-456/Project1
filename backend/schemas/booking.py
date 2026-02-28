"""Booking request schemas."""
from datetime import datetime

from pydantic import BaseModel


class BookingCreate(BaseModel):
    slot_id: str
    location_id: str
    start_time: datetime
    end_time: datetime
