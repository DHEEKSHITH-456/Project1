"""Issue (parking problem report) model."""
from datetime import datetime

from pydantic import BaseModel


class IssueBase(BaseModel):
    location_id: str
    vehicle_number: str
    description: str
    image_url: str | None = None


class IssueResponse(IssueBase):
    id: str
    user_id: str
    status: str  # open, in_progress, resolved
    admin_notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    resolved_at: datetime | None = None


def issue_from_doc(doc: dict) -> dict | None:
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc.get("user_id"))
    doc["location_id"] = str(doc.get("location_id"))
    return doc
