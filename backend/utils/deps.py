"""FastAPI dependencies for auth and role checks."""
from typing import Literal

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from services.user_service import get_user_doc_by_id
from utils.auth import decode_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload["sub"]
    user = await get_user_doc_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.get("enabled", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return {"id": user_id, "email": user["email"], "role": user["role"], "name": user.get("name", "")}


def require_role(role: Literal["admin", "user"]):
    async def _dep(current: dict = Depends(get_current_user)):
        if current["role"] != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current
    return _dep


RequireAdmin = Depends(require_role("admin"))
RequireUser = Depends(require_role("user"))
CurrentUser = Depends(get_current_user)
