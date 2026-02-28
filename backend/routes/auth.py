"""Auth routes: login, register, me."""
from fastapi import APIRouter, Depends, HTTPException, status

from schemas import LoginRequest, RegisterRequest, TokenResponse
from services.user_service import create_user
from utils.auth import verify_password, create_access_token
from utils.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user_doc = await __get_doc_by_email(data.email)
    
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user_doc.get("role") != data.role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid role for this login")
    if not user_doc.get("enabled", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    if not verify_password(data.password, user_doc["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token({"sub": str(user_doc["_id"]), "role": user_doc["role"]})
    return TokenResponse(access_token=token, role=user_doc["role"], user_id=str(user_doc["_id"]))


async def __get_doc_by_email(email: str):
    from database.connection import get_db
    db = await get_db()
    return await db.users.find_one({"email": email})


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    user = await create_user(email=data.email, password=data.password, name=data.name, role="user")
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    token = create_access_token({"sub": user["id"], "role": "user"})
    return TokenResponse(access_token=token, role="user", user_id=user["id"])


@router.get("/me")
async def me(current: dict = Depends(get_current_user)):
    return current
