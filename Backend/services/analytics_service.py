from typing import Optional, Dict, Any
from config.database import db_manager
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    async def get_website_metrics(site_id: str) -> Optional[Dict[str, Any]]:
        """Get analytics metrics for a specific website"""
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Get website_id first
                website_result = await connection.fetchrow(
                    "SELECT website_id FROM websites WHERE site_id = $1",
                    site_id
                )
                
                if not website_result:
                    return None
                
                website_id = website_result["website_id"]
                
                # Get total page views
                page_views_result = await connection.fetchrow(
                    """
                    SELECT COUNT(*) as total_views
                    FROM page_views pv
                    JOIN sessions s ON pv.session_id = s.session_id
                    WHERE s.website_id = $1
                    """,
                    website_id
                )
                
                # Get unique visitors
                unique_visitors_result = await connection.fetchrow(
                    """
                    SELECT COUNT(DISTINCT u.user_id) as unique_visitors
                    FROM users u
                    WHERE u.website_id = $1
                    """,
                    website_id
                )
                
                # Get average session duration
                avg_duration_result = await connection.fetchrow(
                    """
                    SELECT AVG(EXTRACT(EPOCH FROM session_duration)) as avg_duration_seconds
                    FROM sessions
                    WHERE website_id = $1 AND session_duration IS NOT NULL
                    """,
                    website_id
                )
                
                # Get pages per session
                pages_per_session_result = await connection.fetchrow(
                    """
                    SELECT AVG(page_count) as avg_pages_per_session
                    FROM (
                        SELECT COUNT(*) as page_count
                        FROM page_views pv
                        JOIN sessions s ON pv.session_id = s.session_id
                        WHERE s.website_id = $1
                        GROUP BY pv.session_id
                    ) session_pages
                    """,
                    website_id
                )
                
                # Format the results
                total_views = page_views_result["total_views"] or 0
                unique_visitors = unique_visitors_result["unique_visitors"] or 0
                avg_duration_seconds = avg_duration_result["avg_duration_seconds"] or 0
                avg_pages = pages_per_session_result["avg_pages_per_session"] or 0
                
                # Format duration as minutes and seconds
                minutes = int(avg_duration_seconds // 60)
                seconds = int(avg_duration_seconds % 60)
                duration_formatted = f"{minutes}m {seconds}s"
                
                return {
                    "total_page_views": total_views,
                    "unique_visitors": unique_visitors,
                    "avg_session_duration": duration_formatted,
                    "avg_session_duration_seconds": avg_duration_seconds,
                    "pages_per_session": round(avg_pages, 1) if avg_pages else 0
                }
                
        except Exception as e:
            logger.error(f"Error getting website metrics: {e}")
            return None