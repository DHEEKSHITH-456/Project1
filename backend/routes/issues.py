"""Issue reporting and management routes."""
from fastapi import APIRouter, Depends, HTTPException, status

from schemas import IssueCreate, IssueUpdate
from services.issue_service import list_issues, get_issue, create_issue, update_issue
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("")
async def get_issues_list(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    current: dict = Depends(get_current_user),
):
    user_id = None if current["role"] == "admin" else current["id"]
    return await list_issues(user_id=user_id, status=status_filter, skip=skip, limit=limit)


@router.post("", dependencies=[Depends(require_role("user"))])
async def post_issue(data: IssueCreate, current: dict = Depends(require_role("user"))):
    return await create_issue(
        user_id=current["id"],
        location_id=data.location_id,
        vehicle_number=data.vehicle_number,
        description=data.description,
        image_url=data.image_url,
    )


@router.get("/{issue_id}")
async def get_issue_route(issue_id: str, current: dict = Depends(get_current_user)):
    issue = await get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    if current["role"] == "user" and issue["user_id"] != current["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your issue")
    return issue


@router.put("/{issue_id}")
async def put_issue(issue_id: str, data: IssueUpdate, current: dict = Depends(get_current_user)):
    issue = await get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    if current["role"] == "user" and issue["user_id"] != current["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your issue")
    return await update_issue(issue_id, status=data.status, admin_notes=data.admin_notes)
