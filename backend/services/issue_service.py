"""Issue reporting and status updates."""
from datetime import datetime

from bson import ObjectId

from database import get_db
from models.issue import issue_from_doc


async def list_issues(user_id: str | None = None, status: str | None = None, skip: int = 0, limit: int = 100):
    db = await get_db()
    q = {}
    if user_id:
        q["user_id"] = ObjectId(user_id)
    if status:
        q["status"] = status
    cursor = db.issues.find(q).sort("created_at", -1).skip(skip).limit(limit)
    out = []
    async for doc in cursor:
        i = issue_from_doc(doc)
        if i:
            i["user_id"] = str(doc.get("user_id"))
            i["location_id"] = str(doc.get("location_id"))
            out.append(i)
    return out


async def get_issue(issue_id: str):
    db = await get_db()
    try:
        doc = await db.issues.find_one({"_id": ObjectId(issue_id)})
        if doc:
            i = issue_from_doc(doc)
            i["user_id"] = str(doc.get("user_id"))
            i["location_id"] = str(doc.get("location_id"))
            return i
    except Exception:
        pass
    return None


async def create_issue(user_id: str, location_id: str, vehicle_number: str, description: str, image_url: str | None = None):
    db = await get_db()
    now = datetime.utcnow()
    doc = {
        "user_id": ObjectId(user_id),
        "location_id": ObjectId(location_id),
        "vehicle_number": vehicle_number,
        "description": description,
        "image_url": image_url,
        "status": "open",
        "admin_notes": None,
        "created_at": now,
        "updated_at": now,
        "resolved_at": None,
    }
    r = await db.issues.insert_one(doc)
    doc["_id"] = r.inserted_id
    doc["user_id"] = user_id
    doc["location_id"] = location_id
    return issue_from_doc(doc)


async def update_issue(issue_id: str, status: str | None = None, admin_notes: str | None = None):
    db = await get_db()
    upd = {"updated_at": datetime.utcnow()}
    if status is not None:
        upd["status"] = status
        if status == "resolved":
            upd["resolved_at"] = datetime.utcnow()
    if admin_notes is not None:
        upd["admin_notes"] = admin_notes
    await db.issues.update_one({"_id": ObjectId(issue_id)}, {"$set": upd})
    return await get_issue(issue_id)


async def count_issues(status: str | None = None) -> int:
    db = await get_db()
    q = {} if status is None else {"status": status}
    return await db.issues.count_documents(q)
