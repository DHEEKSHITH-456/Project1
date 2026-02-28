"""Analytics routes (admin only)."""
from fastapi import APIRouter, Depends

from services.analytics_service import overview_counts, daily_usage, peak_booking_hours, most_used_locations, issue_resolution_times
from utils.deps import require_role

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", dependencies=[Depends(require_role("admin"))])
async def get_overview(current: dict = Depends(require_role("admin"))):
    return await overview_counts()


@router.get("/usage", dependencies=[Depends(require_role("admin"))])
async def get_usage(days: int = 14, current: dict = Depends(require_role("admin"))):
    return await daily_usage(days=days)


@router.get("/peak-hours", dependencies=[Depends(require_role("admin"))])
async def get_peak_hours(current: dict = Depends(require_role("admin"))):
    return await peak_booking_hours()


@router.get("/top-locations", dependencies=[Depends(require_role("admin"))])
async def get_top_locations(limit: int = 10, current: dict = Depends(require_role("admin"))):
    return await most_used_locations(limit=limit)


@router.get("/issue-resolution", dependencies=[Depends(require_role("admin"))])
async def get_issue_resolution(current: dict = Depends(require_role("admin"))):
    return await issue_resolution_times()
