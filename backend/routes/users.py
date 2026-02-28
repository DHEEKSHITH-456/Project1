"""User management routes (admin only)."""
from fastapi import APIRouter, Depends, HTTPException, status

from schemas import UserCreate, UserUpdate
from services.user_service import list_users, get_user_by_id, create_user, update_user, delete_user
from utils.deps import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def get_users(skip: int = 0, limit: int = 100, current: dict = Depends(require_role("admin"))):
    return await list_users(skip=skip, limit=limit)


@router.post("")
async def post_user(data: UserCreate, current: dict = Depends(require_role("admin"))):
    user = await create_user(email=data.email, password=data.password, name=data.name, role=data.role)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    return user


@router.get("/{user_id}")
async def get_user(user_id: str, current: dict = Depends(require_role("admin"))):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}")
async def put_user(user_id: str, data: UserUpdate, current: dict = Depends(require_role("admin"))):
    user = await update_user(user_id, name=data.name, enabled=data.enabled)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/{user_id}")
async def delete_user_route(user_id: str, current: dict = Depends(require_role("admin"))):
    ok = await delete_user(user_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": "User deleted"}
