"""Analytics for admin dashboard and reports."""
from datetime import datetime, timedelta

from database import get_db


async def overview_counts():
    db = await get_db()
    users = await db.users.count_documents({"role": "user"})
    locations = await db.parking_locations.count_documents({})
    bookings = await db.bookings.count_documents({})
    active_issues = await db.issues.count_documents({"status": {"$in": ["open", "in_progress"]}})
    return {
        "total_users": users,
        "total_locations": locations,
        "total_bookings": bookings,
        "active_issues": active_issues,
    }


async def daily_usage(days: int = 14):
    db = await get_db()
    start = datetime.utcnow() - timedelta(days=days)
    pipeline = [
        {"$match": {"created_at": {"$gte": start}, "status": "confirmed"}},
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    cursor = db.bookings.aggregate(pipeline)
    out = []
    async for doc in cursor:
        out.append({"date": doc["_id"], "count": doc["count"]})
    return out


async def peak_booking_hours():
    db = await get_db()
    pipeline = [
        {"$match": {"status": "confirmed"}},
        {"$group": {"_id": {"$hour": "$start_time"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    cursor = db.bookings.aggregate(pipeline)
    out = []
    async for doc in cursor:
        out.append({"hour": doc["_id"], "count": doc["count"]})
    return out


async def most_used_locations(limit: int = 10):
    db = await get_db()
    pipeline = [
        {"$match": {"status": "confirmed"}},
        {"$group": {"_id": "$location_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
        {"$lookup": {"from": "parking_locations", "localField": "_id", "foreignField": "_id", "as": "loc"}},
        {"$unwind": "$loc"},
        {"$project": {"location_id": {"$toString": "$_id"}, "location_name": "$loc.name", "count": 1}},
    ]
    cursor = db.bookings.aggregate(pipeline)
    out = []
    async for doc in cursor:
        out.append({"location_id": doc["location_id"], "location_name": doc["location_name"], "bookings": doc["count"]})
    return out


async def issue_resolution_times():
    db = await get_db()
    pipeline = [
        {"$match": {"status": "resolved", "resolved_at": {"$exists": True, "$ne": None}}},
        {"$project": {"created_at": 1, "resolved_at": 1, "diff_ms": {"$subtract": ["$resolved_at", "$created_at"]}}},
        {"$group": {"_id": None, "avg_ms": {"$avg": "$diff_ms"}}},
    ]
    cursor = db.issues.aggregate(pipeline)
    doc = await cursor.to_list(length=1)
    if doc and doc[0].get("avg_ms") is not None:
        return {"avg_resolution_hours": round(doc[0]["avg_ms"] / (1000 * 60 * 60), 2)}
    return {"avg_resolution_hours": 0}
