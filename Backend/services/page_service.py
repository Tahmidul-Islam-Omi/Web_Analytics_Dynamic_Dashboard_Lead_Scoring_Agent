from typing import Optional
from uuid import UUID
from config.database import db_manager
import logging

logger = logging.getLogger(__name__)


class PageService:
    @staticmethod
    async def get_or_create_page(website_id: int, url: str, title: Optional[str] = None) -> Optional[int]:
        """
        Get existing page or create new one. Returns page_id.
        """
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Try to get existing page
                result = await connection.fetchrow(
                    "SELECT page_id FROM pages WHERE website_id = $1 AND url = $2",
                    website_id, url
                )

                if result:
                    return result["page_id"]

                # Create new page
                result = await connection.fetchrow(
                    """
                    INSERT INTO pages (website_id, url, title) 
                    VALUES ($1, $2, $3) 
                    RETURNING page_id
                    """,
                    website_id, url, title
                )
                
                if result:
                    page_id = result["page_id"]
                    logger.info(f"Created new page: {page_id} for URL: {url}")
                    return page_id

                return None

        except Exception as e:
            logger.error(f"Error creating/getting page: {e}")
            return None

    @staticmethod
    async def create_page_view(session_id: UUID, visitor_uuid: UUID, page_id: int, site_id: str, referrer: Optional[str] = None) -> Optional[int]:
        """
        Create a new page view record. Also updates the previous page view's end time.
        """
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Get the database user_id from visitor_uuid
                user_result = await connection.fetchrow(
                    """
                    SELECT u.user_id 
                    FROM users u
                    JOIN websites w ON u.website_id = w.website_id
                    WHERE w.site_id = $1 AND u.visitor_uuid = $2
                    """,
                    site_id, str(visitor_uuid)
                )
                
                if not user_result:
                    logger.error(f"User not found for visitor_uuid: {visitor_uuid} and site_id: {site_id}")
                    return None
                
                db_user_id = user_result["user_id"]
                
                # First, update the previous page view's end time for this session
                await connection.execute(
                    """
                    UPDATE page_views 
                    SET view_end = NOW() 
                    WHERE session_id = $1 
                    AND view_end IS NULL
                    """,
                    session_id
                )

                # Create new page view
                result = await connection.fetchrow(
                    """
                    INSERT INTO page_views (session_id, user_id, page_id, referrer) 
                    VALUES ($1, $2, $3, $4) 
                    RETURNING view_id
                    """,
                    session_id, db_user_id, page_id, referrer
                )
                
                if result:
                    view_id = result["view_id"]
                    logger.info(f"Created page view: {view_id} for page: {page_id}, user: {db_user_id}")
                    return view_id

                return None

        except Exception as e:
            logger.error(f"Error creating page view: {e}")
            return None

    @staticmethod
    async def end_session_page_views(session_id: UUID) -> bool:
        """
        End all open page views for a session (called when session ends).
        """
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                await connection.execute(
                    """
                    UPDATE page_views 
                    SET view_end = NOW() 
                    WHERE session_id = $1 
                    AND view_end IS NULL
                    """,
                    session_id
                )
                
                logger.info(f"Ended page views for session: {session_id}")
                return True

        except Exception as e:
            logger.error(f"Error ending session page views: {e}")
            return False

    @staticmethod
    async def get_website_id_by_site_id(site_id: str) -> Optional[int]:
        """
        Get website_id from site_id for page creation.
        """
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.fetchrow(
                    "SELECT website_id FROM websites WHERE site_id = $1",
                    site_id
                )

                return result["website_id"] if result else None

        except Exception as e:
            logger.error(f"Error getting website_id: {e}")
            return None