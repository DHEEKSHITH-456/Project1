"""MongoDB connection and database instance."""
from motor.motor_asyncio import AsyncIOMotorClient

from config import settings

client: AsyncIOMotorClient | None = None


async def get_db():
    """Return database instance. Use in FastAPI Depends."""
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DB_NAME]


async def close_db():
    """Close MongoDB connection (e.g. on shutdown)."""
    global client
    if client:
        client.close()
        client = None
