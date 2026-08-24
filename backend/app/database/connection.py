import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError
from app.config import settings

logger = logging.getLogger("gold_silver.database")

# Global MongoClient and Database instances
_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_client() -> Optional[MongoClient]:
    """Retrieve or initialize the MongoDB client instance."""
    global _client
    if _client is None and settings.MONGODB_URI:
        # Check that placeholder hasn't been left untouched
        if "<DB_PASSWORD>" in settings.MONGODB_URI:
            logger.warning("MongoDB URI contains placeholder <DB_PASSWORD>. Database connection deferred.")
            return None
        try:
            _client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000,
                socketTimeoutMS=5000,
                retryWrites=True,
            )
        except ConfigurationError as e:
            logger.error("MongoDB configuration error (sanitized).")
            _client = None
        except Exception:
            logger.error("Failed to initialize MongoDB client.")
            _client = None
    return _client


def get_database() -> Optional[Database]:
    """Retrieve the active MongoDB database instance."""
    global _db
    if _db is None:
        client = get_client()
        if client is not None:
            _db = client[settings.DATABASE_NAME]
    return _db


def ping_database() -> bool:
    """Safely ping the MongoDB server to verify connectivity.
    
    Returns:
        bool: True if MongoDB is responsive and connected, False otherwise.
    """
    if not settings.MONGODB_URI or "<DB_PASSWORD>" in settings.MONGODB_URI:
        return False
        
    try:
        client = get_client()
        if client is None:
            return False
        # Ping the admin database
        client.admin.command("ping")
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError):
        return False
    except Exception:
        return False


def close_database_connection():
    """Close active MongoClient connection if open."""
    global _client, _db
    if _client is not None:
        try:
            _client.close()
        except Exception:
            pass
        _client = None
        _db = None
