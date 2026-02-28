"""Auth request/response schemas."""
from typing import Literal

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Literal["admin", "user"]


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
