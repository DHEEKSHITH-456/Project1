from .auth import LoginRequest, RegisterRequest, TokenResponse
from .user import UserCreate, UserUpdate
from .parking import (
    CoordinatesSchema,
    ParkingLocationCreate,
    ParkingLocationUpdate,
    SlotCreate,
    SlotUpdate,
)
from .booking import BookingCreate
from .issue import IssueCreate, IssueUpdate

__all__ = [
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "UserCreate",
    "UserUpdate",
    "CoordinatesSchema",
    "ParkingLocationCreate",
    "ParkingLocationUpdate",
    "SlotCreate",
    "SlotUpdate",
    "BookingCreate",
    "IssueCreate",
    "IssueUpdate",
]
