"""User CRUD schemas."""
from typing import Literal

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: Literal["admin", "user"] = "user"


class UserUpdate(BaseModel):
    name: str | None = None
    enabled: bool | None = None
