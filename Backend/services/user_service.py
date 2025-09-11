from config.database import db_manager
from typing import Optional, Dict, Any
import asyncpg
from datetime import datetime

class UserService:
    
    @staticmethod
    async def create_user(site_id: str, visitor_uuid: str, browser: str = None, os: str = None, user_agent: str = None) -> Optional[Dict[str, Any]]:
        """Create a new user record for first-time visitors"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # First, get the website_id from site_id
                website_query = "SELECT website_id FROM websites WHERE site_id = $1"
                website_result = await connection.fetchrow(website_query, site_id)
                
                if not website_result:
                    print(f"❌ Website not found for site_id: {site_id}")
                    return None
                
                website_id = website_result['website_id']
                
                # Check if user already exists (shouldn't happen, but safety check)
                existing_query = """
                    SELECT user_id FROM users 
                    WHERE website_id = $1 AND visitor_uuid = $2
                """
                existing_user = await connection.fetchrow(existing_query, website_id, visitor_uuid)
                
                if existing_user:
                    print(f"⚠️ User already exists: {visitor_uuid}")
                    return {"user_id": str(existing_user['user_id']), "is_new": False}
                
                # Insert new user
                insert_query = """
                    INSERT INTO users (website_id, visitor_uuid, first_seen, last_seen, lead_score)
                    VALUES ($1, $2, NOW(), NOW(), 0)
                    RETURNING user_id, first_seen, last_seen
                """
                
                result = await connection.fetchrow(insert_query, website_id, visitor_uuid)
                
                if result:
                    print(f"✅ New user created: {visitor_uuid} for site: {site_id}")
                    return {
                        "user_id": str(result['user_id']),
                        "website_id": website_id,
                        "visitor_uuid": visitor_uuid,
                        "first_seen": result['first_seen'].isoformat(),
                        "last_seen": result['last_seen'].isoformat(),
                        "lead_score": 0,
                        "is_new": True
                    }
                
                return None
                
        except asyncpg.UniqueViolationError:
            print(f"⚠️ User already exists (race condition): {visitor_uuid}")
            return {"error": "User already exists"}
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    @staticmethod
    async def update_last_seen(site_id: str, visitor_uuid: str) -> bool:
        """Update the last_seen timestamp for returning users"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Get website_id and update last_seen in one query
                update_query = """
                    UPDATE users 
                    SET last_seen = NOW()
                    FROM websites 
                    WHERE users.website_id = websites.website_id 
                    AND websites.site_id = $1 
                    AND users.visitor_uuid = $2
                    RETURNING users.user_id
                """
                
                result = await connection.fetchrow(update_query, site_id, visitor_uuid)
                
                if result:
                    print(f"✅ Updated last_seen for user: {visitor_uuid}")
                    return True
                else:
                    print(f"⚠️ User not found for update: {visitor_uuid}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error updating user last_seen: {e}")
            return False
    
    @staticmethod
    async def get_user_by_visitor_uuid(site_id: str, visitor_uuid: str) -> Optional[Dict[str, Any]]:
        """Get user information by visitor UUID"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                query = """
                    SELECT u.user_id, u.website_id, u.visitor_uuid, 
                           u.first_seen, u.last_seen, u.lead_score
                    FROM users u
                    JOIN websites w ON u.website_id = w.website_id
                    WHERE w.site_id = $1 AND u.visitor_uuid = $2
                """
                
                result = await connection.fetchrow(query, site_id, visitor_uuid)
                
                if result:
                    return {
                        "user_id": str(result['user_id']),
                        "website_id": result['website_id'],
                        "visitor_uuid": result['visitor_uuid'],
                        "first_seen": result['first_seen'].isoformat(),
                        "last_seen": result['last_seen'].isoformat(),
                        "lead_score": result['lead_score']
                    }
                
                return None
                
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None
    
    @staticmethod
    async def update_lead_score(site_id: str, visitor_uuid: str, score: int) -> bool:
        """Update user's lead score"""
        try:
            if not (0 <= score <= 100):
                print(f"❌ Invalid lead score: {score}. Must be between 0 and 100.")
                return False
                
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                update_query = """
                    UPDATE users 
                    SET lead_score = $3
                    FROM websites 
                    WHERE users.website_id = websites.website_id 
                    AND websites.site_id = $1 
                    AND users.visitor_uuid = $2
                    RETURNING users.user_id
                """
                
                result = await connection.fetchrow(update_query, site_id, visitor_uuid, score)
                
                if result:
                    print(f"✅ Updated lead score for user: {visitor_uuid} to {score}")
                    return True
                else:
                    print(f"⚠️ User not found for lead score update: {visitor_uuid}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error updating lead score: {e}")
            return False