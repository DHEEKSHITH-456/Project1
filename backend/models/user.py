"""User model and helpers."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    email: str
    name: str
    role: Literal["admin", "user"] = "user"
    enabled: bool = True


class UserInDB(UserBase):
    id: str | None = Field(None, alias="_id")
    password_hash: str = ""

    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


def user_from_doc(doc: dict) -> dict:
    """Convert MongoDB document to API-friendly dict (id, no password_hash)."""
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc
