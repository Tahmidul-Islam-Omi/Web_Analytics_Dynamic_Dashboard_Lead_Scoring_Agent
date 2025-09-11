import asyncpg
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from config.database import db_manager
from services.lead_scoring_service import LeadScoringService

class SessionService:
    @staticmethod
    async def start_session(
        site_id: str, 
        session_id: str, 
        browser: str, 
        os: str, 
        user_agent: str, 
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Start a new session"""
        try:
            print(f"🔄 Starting session: site_id={site_id}, session_id={session_id}, user_id={user_id}")
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
                
                # Get user_uuid (database user_id) if user_id (visitor_uuid) is provided
                db_user_id = None
                if user_id:
                    user_result = await connection.fetchrow(
                        "SELECT user_id FROM users WHERE website_id = $1 AND visitor_uuid = $2",
                        website_id, user_id
                    )
                    if user_result:
                        db_user_id = user_result['user_id']
                        print(f"✅ Found database user_id: {db_user_id}")
                    else:
                        print(f"⚠️ User not found in database for visitor_uuid: {user_id}, creating session without user link")
                
                # Insert new session
                result = await connection.fetchrow(
                    """
                    INSERT INTO sessions (session_id, website_id, user_id, browser, os, user_agent, ip_address, start_time)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    RETURNING session_id, website_id, user_id, browser, os, start_time
                    """,
                    session_id, website_id, db_user_id, browser, os, user_agent, ip_address
                )
                
                if result:
                    print(f"✅ Session created successfully: {result['session_id']}")
                    return {
                        "session_id": str(result["session_id"]),
                        "website_id": result["website_id"],
                        "user_id": str(result["user_id"]) if result["user_id"] else None,
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
                
                # End any open page views for this session
                await connection.execute(
                    """
                    UPDATE page_views 
                    SET view_end = NOW() 
                    WHERE session_id = $1 
                    AND view_end IS NULL
                    """,
                    session_id
                )
                
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
                session_updated = result == "UPDATE 1"
                
                if session_updated:
                    # Calculate and update lead scores for session and user
                    print(f"🔄 Processing lead scoring for session: {session_id}")
                    scoring_success = await LeadScoringService.process_session_end_scoring(session_id)
                    if scoring_success:
                        print(f"✅ Lead scoring completed for session: {session_id}")
                    else:
                        print(f"⚠️ Lead scoring failed for session: {session_id}")
                
                return session_updated
                
        except Exception as e:
            print(f"❌ Error ending session: {e}")
            return False
    
    @staticmethod
    async def update_session_duration(session_id: str, session_duration: int) -> bool:
        """Update session duration without ending the session"""
        try:
            print(f"🔄 Updating session duration: session_id={session_id}, duration={session_duration}s")
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Update session duration
                result = await connection.execute(
                    """
                    UPDATE sessions 
                    SET session_duration = make_interval(secs => $1)
                    WHERE session_id = $2
                    """,
                    session_duration, session_id
                )
                
                return result == "UPDATE 1"
                
        except Exception as e:
            print(f"❌ Error updating session duration: {e}")
            return False
    
    @staticmethod
    async def get_session(session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by session_id"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.fetchrow(
                    """
                    SELECT s.session_id, s.website_id, s.user_id, s.browser, s.os, s.start_time, 
                           s.end_time, s.session_duration, s.ip_address, s.user_agent, s.lead_score,
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
                        "user_id": str(result["user_id"]) if result["user_id"] else None,
                        "site_id": result["site_id"],
                        "website_name": result["website_name"],
                        "browser": result["browser"],
                        "os": result["os"],
                        "start_time": result["start_time"],
                        "end_time": result["end_time"],
                        "session_duration": result["session_duration"],
                        "ip_address": result["ip_address"],
                        "user_agent": result["user_agent"],
                        "lead_score": result["lead_score"]
                    }
                
                return None
                
        except Exception as e:
            print(f"❌ Error fetching session: {e}")
            return None