"""Issue report and update schemas."""
from pydantic import BaseModel


class IssueCreate(BaseModel):
    location_id: str
    vehicle_number: str
    description: str
    image_url: str | None = None


class IssueUpdate(BaseModel):
    status: str | None = None  # open, in_progress, resolved
    admin_notes: str | None = None
