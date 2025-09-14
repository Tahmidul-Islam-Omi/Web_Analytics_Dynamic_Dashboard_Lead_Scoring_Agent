import asyncpg
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime
from config.database import db_manager

class WebsiteService:
    @staticmethod
    async def create_website(name: str, url: str, site_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Create a new website entry"""
        try:
            # Generate site_id if not provided
            if not site_id:
                site_id = str(uuid.uuid4())[:8]
            
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Check if website with this site_id already exists
                existing = await connection.fetchrow(
                    "SELECT website_id FROM websites WHERE site_id = $1",
                    site_id
                )
                
                if existing:
                    return None  # Website already exists
                
                # Insert new website
                result = await connection.fetchrow(
                    """
                    INSERT INTO websites (site_id, name, url, created_at)
                    VALUES ($1, $2, $3, NOW())
                    RETURNING website_id, site_id, name, url, created_at
                    """,
                    site_id, name, url
                )
                
                if result:
                    return {
                        "website_id": result["website_id"],
                        "site_id": result["site_id"],
                        "name": result["name"],
                        "url": result["url"],
                        "created_at": result["created_at"]
                    }
                
                return None
                
        except Exception as e:
            print(f"❌ Error creating website: {e}")
            return None
    
    @staticmethod
    async def get_all_websites() -> List[Dict[str, Any]]:
        """Get all websites for dropdown selection"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                results = await connection.fetch(
                    """
                    SELECT website_id, site_id, name, url, created_at 
                    FROM websites 
                    ORDER BY created_at DESC
                    """
                )
                
                websites = []
                for result in results:
                    websites.append({
                        "website_id": result["website_id"],
                        "site_id": result["site_id"],
                        "name": result["name"],
                        "url": result["url"],
                        "created_at": result["created_at"],
                        "status": "active"  # Default status, can be enhanced later
                    })
                
                return websites
                
        except Exception as e:
            print(f"❌ Error fetching all websites: {e}")
            return []

    @staticmethod
    async def get_website_by_site_id(site_id: str) -> Optional[Dict[str, Any]]:
        """Get website by site_id"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.fetchrow(
                    "SELECT website_id, site_id, name, url, created_at FROM websites WHERE site_id = $1",
                    site_id
                )
                
                if result:
                    return {
                        "website_id": result["website_id"],
                        "site_id": result["site_id"],
                        "name": result["name"],
                        "url": result["url"],
                        "created_at": result["created_at"]
                    }
                
                return None
                
        except Exception as e:
            print(f"❌ Error fetching website: {e}")
            return None