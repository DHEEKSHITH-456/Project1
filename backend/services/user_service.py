"""User CRUD and auth-related operations."""
from datetime import datetime
from typing import Literal

from bson import ObjectId

from database import get_db
from models.user import user_from_doc
from utils.auth import hash_password


async def get_user_by_email(email: str):
    db = await get_db()
    doc = await db.users.find_one({"email": email})
    return user_from_doc(doc) if doc else None


async def get_user_by_id(user_id: str):
    db = await get_db()
    try:
        doc = await db.users.find_one({"_id": ObjectId(user_id)})
        return user_from_doc(doc) if doc else None
    except Exception:
        return None


async def get_user_doc_by_id(user_id: str):
    """Return raw document for auth checks (includes password_hash, enabled)."""
    db = await get_db()
    try:
        return await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


async def list_users(skip: int = 0, limit: int = 100):
    db = await get_db()
    cursor = db.users.find({"role": "user"}).skip(skip).limit(limit)
    users = []
    async for doc in cursor:
        u = user_from_doc(doc)
        if u:
            users.append(u)
    return users


async def create_user(email: str, password: str, name: str, role: Literal["admin", "user"] = "user"):
    db = await get_db()
    existing = await db.users.find_one({"email": email})
    if existing:
        return None
    now = datetime.utcnow()
    doc = {
        "email": email,
        "password_hash": hash_password(password),
        "name": name,
        "role": role,
        "enabled": True,
        "created_at": now,
        "updated_at": now,
    }
    r = await db.users.insert_one(doc)
    doc["_id"] = r.inserted_id
    return user_from_doc(doc)


async def update_user(user_id: str, name: str | None = None, enabled: bool | None = None):
    db = await get_db()
    upd = {"updated_at": datetime.utcnow()}
    if name is not None:
        upd["name"] = name
    if enabled is not None:
        upd["enabled"] = enabled
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": upd})
    return await get_user_by_id(user_id)


async def delete_user(user_id: str) -> bool:
    db = await get_db()
    r = await db.users.delete_one({"_id": ObjectId(user_id)})
    return r.deleted_count > 0


async def count_users(role: str | None = None) -> int:
    db = await get_db()
    q = {} if role is None else {"role": role}
    return await db.users.count_documents(q)
