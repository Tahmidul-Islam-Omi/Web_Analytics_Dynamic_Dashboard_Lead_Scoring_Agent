import os
import asyncpg
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.connection_pool: Optional[asyncpg.Pool] = None
        self.database_url = os.getenv("DATABASE_URL")
        
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
    
    async def connect(self):
        """Create database connection pool"""
        try:
            self.connection_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            print("✅ Database connection pool created successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to create database connection pool: {e}")
            return False
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.connection_pool:
            await self.connection_pool.close()
            print("🔌 Database connection pool closed")
    
    async def get_connection(self):
        """Get a connection from the pool"""
        if not self.connection_pool:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.connection_pool
    
    async def test_connection(self):
        """Test database connection"""
        try:
            async with self.connection_pool.acquire() as connection:
                await connection.execute("SELECT 1")
                print("✅ Database connection test successful")
                return True
        except Exception as e:
            print(f"❌ Database connection test failed: {e}")
            return False

# Global database manager instance
db_manager = DatabaseManager()