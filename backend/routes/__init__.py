from .auth import router as auth_router
from .users import router as users_router
from .parking import router as parking_router
from .bookings import router as bookings_router
from .issues import router as issues_router
from .analytics import router as analytics_router

__all__ = [
    "auth_router",
    "users_router",
    "parking_router",
    "bookings_router",
    "issues_router",
    "analytics_router",
]
