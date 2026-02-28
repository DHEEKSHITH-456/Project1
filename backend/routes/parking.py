"""Parking locations and slots routes."""
from fastapi import APIRouter, Depends, HTTPException, status

from schemas import ParkingLocationCreate, ParkingLocationUpdate, SlotCreate, SlotUpdate
from services.parking_service import (
    list_locations,
    get_location,
    create_location,
    update_location,
    delete_location,
    list_slots,
    get_slot,
    add_slot,
    update_slot,
)
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/parking", tags=["parking"])


@router.get("")
async def get_parking_locations(skip: int = 0, limit: int = 100, current: dict = Depends(get_current_user)):
    return await list_locations(skip=skip, limit=limit)


@router.post("", dependencies=[Depends(require_role("admin"))])
async def post_parking_location(data: ParkingLocationCreate, current: dict = Depends(require_role("admin"))):
    loc = await create_location(
        name=data.name,
        address=data.address,
        coordinates=data.coordinates.model_dump(),
        total_slots=data.total_slots,
    )
    return loc


@router.get("/{location_id}")
async def get_parking_location(location_id: str, current: dict = Depends(get_current_user)):
    loc = await get_location(location_id)
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    slots = await list_slots(location_id)
    loc["slots"] = slots
    return loc


@router.put("/{location_id}", dependencies=[Depends(require_role("admin"))])
async def put_parking_location(location_id: str, data: ParkingLocationUpdate, current: dict = Depends(require_role("admin"))):
    loc = await update_location(
        location_id,
        name=data.name,
        address=data.address,
        coordinates=data.coordinates.model_dump() if data.coordinates else None,
        total_slots=data.total_slots,
    )
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return loc


@router.delete("/{location_id}", dependencies=[Depends(require_role("admin"))])
async def delete_parking_location(location_id: str, current: dict = Depends(require_role("admin"))):
    ok = await delete_location(location_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return {"message": "Location deleted"}


@router.post("/{location_id}/slots", dependencies=[Depends(require_role("admin"))])
async def post_slot(location_id: str, data: SlotCreate, current: dict = Depends(require_role("admin"))):
    slot = await add_slot(
        location_id=location_id,
        slot_number=data.slot_number,
        available=data.available,
        price_per_hour=data.price_per_hour,
    )
    return slot


@router.put("/{location_id}/slots/{slot_id}", dependencies=[Depends(require_role("admin"))])
async def put_slot(location_id: str, slot_id: str, data: SlotUpdate, current: dict = Depends(require_role("admin"))):
    slot = await update_slot(slot_id, available=data.available, price_per_hour=data.price_per_hour)
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    return slot
