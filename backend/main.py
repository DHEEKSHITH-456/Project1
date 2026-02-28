"""ZyPark FastAPI application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import close_db, get_db
from routes import (
    auth_router,
    users_router,
    parking_router,
    bookings_router,
    issues_router,
    analytics_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure DB is reachable
    await get_db()
    yield
    await close_db()


app = FastAPI(
    title="ZyPark API",
    description="Smart Parking Assistance & Management",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(parking_router)
app.include_router(bookings_router)
app.include_router(issues_router)
app.include_router(analytics_router)


@app.get("/health")
def health():
    return {"status": "ok"}
