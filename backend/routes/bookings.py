"""Booking routes (user: own only; admin: all)."""
from fastapi import APIRouter, Depends, HTTPException, status

from schemas import BookingCreate
from services.booking_service import list_bookings, get_booking, create_booking, cancel_booking
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("")
async def get_bookings(
    location_id: str | None = None,
    skip: int = 0,
    limit: int = 100,
    current: dict = Depends(get_current_user),
):
    user_id = None if current["role"] == "admin" else current["id"]
    return await list_bookings(user_id=user_id, location_id=location_id, skip=skip, limit=limit)


@router.post("", dependencies=[Depends(require_role("user"))])
async def post_booking(data: BookingCreate, current: dict = Depends(require_role("user"))):
    booking = await create_booking(
        user_id=current["id"],
        slot_id=data.slot_id,
        location_id=data.location_id,
        start_time=data.start_time,
        end_time=data.end_time,
    )
    if not booking:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slot not available for this time")
    return booking


@router.get("/{booking_id}")
async def get_booking_route(booking_id: str, current: dict = Depends(get_current_user)):
    booking = await get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if current["role"] == "user" and booking["user_id"] != current["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    return booking


@router.delete("/{booking_id}")
async def cancel_booking_route(booking_id: str, current: dict = Depends(get_current_user)):
    booking = await get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if current["role"] == "user" and booking["user_id"] != current["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    if booking.get("status") == "cancelled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already cancelled")
    ok = await cancel_booking(booking_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return {"message": "Booking cancelled"}
