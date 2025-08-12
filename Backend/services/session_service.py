import asyncpg
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from config.database import db_manager

class SessionService:
    @staticmethod
    async def start_session(
        site_id: str, 
        session_id: str, 
        browser: str, 
        os: str, 
        user_agent: str, 
        ip_address: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Start a new session"""
        try:
            print(f"🔄 Starting session: site_id={site_id}, session_id={session_id}")
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Get website_id from site_id
                website = await connection.fetchrow(
                    "SELECT website_id FROM websites WHERE site_id = $1",
                    site_id
                )
                
                if not website:
                    print(f"❌ Website not found for site_id: {site_id}")
                    return None
                
                website_id = website["website_id"]
                print(f"✅ Found website_id: {website_id}")
                
                # Insert new session
                result = await connection.fetchrow(
                    """
                    INSERT INTO sessions (session_id, website_id, browser, os, user_agent, ip_address, start_time)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING session_id, website_id, browser, os, start_time
                    """,
                    session_id, website_id, browser, os, user_agent, ip_address
                )
                
                if result:
                    print(f"✅ Session created successfully: {result['session_id']}")
                    return {
                        "session_id": str(result["session_id"]),
                        "website_id": result["website_id"],
                        "browser": result["browser"],
                        "os": result["os"],
                        "start_time": result["start_time"]
                    }
                
                print("❌ Session creation returned no result")
                return None
                
        except Exception as e:
            print(f"❌ Error starting session: {e}")
            return None 
    
    @staticmethod
    async def end_session(session_id: str, session_duration: int) -> bool:
        """End a session and update duration"""
        try:
            print(f"🔄 Ending session: session_id={session_id}, duration={session_duration}s")
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # First check if session exists
                existing = await connection.fetchrow(
                    "SELECT session_id FROM sessions WHERE session_id = $1",
                    session_id
                )
                
                if not existing:
                    print(f"❌ Session not found in database: {session_id}")
                    return False
                
                print(f"✅ Session found, updating...")
                
                # Update session with end time and duration
                result = await connection.execute(
                    """
                    UPDATE sessions 
                    SET end_time = NOW(), 
                        session_duration = make_interval(secs => $1)
                    WHERE session_id = $2
                    """,
                    session_duration, session_id
                )
                
                print(f"✅ Update result: {result}")
                
                # Check if session was found and updated
                return result == "UPDATE 1"
                
        except Exception as e:
            print(f"❌ Error ending session: {e}")
            return False
    
    @staticmethod
    async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by session_id"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.fetchrow(
                    """
                    SELECT s.session_id, s.website_id, s.browser, s.os, s.start_time, 
                           s.end_time, s.session_duration, s.ip_address, s.user_agent,
                           w.site_id, w.name as website_name
                    FROM sessions s
                    JOIN websites w ON s.website_id = w.website_id
                    WHERE s.session_id = $1
                    """,
                    session_id
                )
                
                if result:
                    return {
                        "session_id": str(result["session_id"]),
                        "website_id": result["website_id"],
                        "site_id": result["site_id"],
                        "website_name": result["website_name"],
                        "browser": result["browser"],
                        "os": result["os"],
                        "start_time": result["start_time"],
                        "end_time": result["end_time"],
                        "session_duration": result["session_duration"],
                        "ip_address": result["ip_address"],
                        "user_agent": result["user_agent"]
                    }
                
                return None
                
        except Exception as e:
            print(f"❌ Error fetching session: {e}")
            return None