from typing import Optional
from uuid import UUID
from config.database import db_manager
import logging

logger = logging.getLogger(__name__)


class ClickEventService:
    @staticmethod
    async def create_click_event(
        session_id: UUID, 
        visitor_uuid: UUID, 
        page_id: int, 
        site_id: str,
        element_selector: str,
        element_text: Optional[str] = None,
        x_coord: Optional[int] = None,
        y_coord: Optional[int] = None
    ) -> Optional[int]:
        """
        Create a new click event record.
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

                # Create new click event
                result = await connection.fetchrow(
                    """
                    INSERT INTO click_events (session_id, user_id, page_id, element_selector, element_text, x_coord, y_coord) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) 
                    RETURNING click_id
                    """,
                    session_id, db_user_id, page_id, element_selector, element_text, x_coord, y_coord
                )
                
                if result:
                    click_id = result["click_id"]
                    logger.info(f"Created click event: {click_id} for element: {element_selector}")
                    return click_id

                return None

        except Exception as e:
            logger.error(f"Error creating click event: {e}")
            return None

    @staticmethod
    async def get_website_id_by_site_id(site_id: str) -> Optional[int]:
        """
        Get website_id from site_id for page lookup.
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

    @staticmethod
    async def get_or_create_page(website_id: int, url: str) -> Optional[int]:
        """
        Get existing page or create new one. Returns page_id.
        Reused from PageService logic for consistency.
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

                # Create new page (without title for click events)
                result = await connection.fetchrow(
                    """
                    INSERT INTO pages (website_id, url) 
                    VALUES ($1, $2) 
                    RETURNING page_id
                    """,
                    website_id, url
                )
                
                if result:
                    page_id = result["page_id"]
                    logger.info(f"Created new page: {page_id} for URL: {url}")
                    return page_id

                return None

        except Exception as e:
            logger.error(f"Error creating/getting page: {e}")
            return None