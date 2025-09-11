from typing import Optional, Dict, Any
from uuid import UUID
from config.database import db_manager
import logging

logger = logging.getLogger(__name__)


class LeadScoringService:
    """
    Service for calculating and managing lead scores for sessions and users.
    
    Scoring Formula (Total: 100 points):
    - Session Duration: 40 points max
    - Page Views: 30 points max  
    - Click Events: 30 points max
    """
    
    # Scoring constants
    MAX_SESSION_SCORE = 40
    MAX_PAGE_SCORE = 30
    MAX_CLICK_SCORE = 30
    POINTS_PER_PAGE = 5
    POINTS_PER_REGULAR_CLICK = 2
    POINTS_PER_IMPORTANT_CLICK = 5
    
    # Important click text values (case-insensitive)
    IMPORTANT_CLICK_TEXTS = {"be an early bird", "get a demo"}
    
    @staticmethod
    def calculate_session_duration_score(duration_seconds: int) -> int:
        """
        Calculate session duration score based on time spent.
        
        Args:
            duration_seconds: Session duration in seconds
            
        Returns:
            Score out of 40 points
        """
        if duration_seconds < 60:  # < 1 min
            return 5
        elif duration_seconds < 180:  # 1-3 min
            return 15
        elif duration_seconds < 300:  # 3-5 min
            return 25
        elif duration_seconds < 600:  # 5-10 min
            return 35
        else:  # 10+ min
            return 40
    
    @staticmethod
    def calculate_page_views_score(page_count: int) -> int:
        """
        Calculate page views score.
        
        Args:
            page_count: Number of pages viewed
            
        Returns:
            Score out of 30 points
        """
        return min(page_count * LeadScoringService.POINTS_PER_PAGE, LeadScoringService.MAX_PAGE_SCORE)
    
    @staticmethod
    def calculate_click_events_score(regular_clicks: int, important_clicks: int) -> int:
        """
        Calculate click events score.
        
        Args:
            regular_clicks: Number of regular clicks
            important_clicks: Number of important clicks (high-value elements)
            
        Returns:
            Score out of 30 points
        """
        total_points = (regular_clicks * LeadScoringService.POINTS_PER_REGULAR_CLICK + 
                       important_clicks * LeadScoringService.POINTS_PER_IMPORTANT_CLICK)
        return min(total_points, LeadScoringService.MAX_CLICK_SCORE)
    
    @staticmethod
    async def get_session_analytics_data(session_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get analytics data for a session to calculate lead score.
        
        Args:
            session_id: Session UUID
            
        Returns:
            Dictionary with session analytics data or None if session not found
        """
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                # Get session data with duration
                session_data = await connection.fetchrow(
                    """
                    SELECT session_id, user_id, 
                           EXTRACT(EPOCH FROM session_duration)::int as duration_seconds
                    FROM sessions 
                    WHERE session_id = $1
                    """,
                    session_id
                )
                
                if not session_data:
                    logger.warning(f"Session not found: {session_id}")
                    return None
                
                # Get page views count
                page_views_count = await connection.fetchval(
                    """
                    SELECT COUNT(*) 
                    FROM page_views 
                    WHERE session_id = $1
                    """,
                    session_id
                )
                
                # Get click events data
                click_data = await connection.fetchrow(
                    """
                    SELECT 
                        COUNT(*) as total_clicks,
                        COUNT(CASE WHEN LOWER(element_text) IN ('be an early bird', 'get a demo') 
                              THEN 1 END) as important_clicks
                    FROM click_events 
                    WHERE session_id = $1
                    """,
                    session_id
                )
                
                regular_clicks = click_data['total_clicks'] - click_data['important_clicks']
                
                return {
                    'session_id': session_id,
                    'user_id': session_data['user_id'],
                    'duration_seconds': session_data['duration_seconds'] or 0,
                    'page_views_count': page_views_count or 0,
                    'regular_clicks': regular_clicks,
                    'important_clicks': click_data['important_clicks']
                }
                
        except Exception as e:
            logger.error(f"Error getting session analytics data: {e}")
            return None
    
    @staticmethod
    async def calculate_session_lead_score(session_id: UUID) -> Optional[int]:
        """
        Calculate and return the lead score for a session.
        
        Args:
            session_id: Session UUID
            
        Returns:
            Lead score (0-100) or None if calculation failed
        """
        try:
            # Get session analytics data
            analytics_data = await LeadScoringService.get_session_analytics_data(session_id)
            if not analytics_data:
                return None
            
            # Calculate individual scores
            duration_score = LeadScoringService.calculate_session_duration_score(
                analytics_data['duration_seconds']
            )
            
            page_score = LeadScoringService.calculate_page_views_score(
                analytics_data['page_views_count']
            )
            
            click_score = LeadScoringService.calculate_click_events_score(
                analytics_data['regular_clicks'],
                analytics_data['important_clicks']
            )
            
            # Calculate total score
            total_score = duration_score + page_score + click_score
            
            logger.info(
                f"Session {session_id} lead score breakdown: "
                f"Duration: {duration_score}/{LeadScoringService.MAX_SESSION_SCORE}, "
                f"Pages: {page_score}/{LeadScoringService.MAX_PAGE_SCORE}, "
                f"Clicks: {click_score}/{LeadScoringService.MAX_CLICK_SCORE}, "
                f"Total: {total_score}/100"
            )
            
            return total_score
            
        except Exception as e:
            logger.error(f"Error calculating session lead score: {e}")
            return None
    
    @staticmethod
    async def update_session_lead_score(session_id: UUID) -> bool:
        """
        Calculate and update the lead score for a session.
        
        Args:
            session_id: Session UUID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Calculate the lead score
            lead_score = await LeadScoringService.calculate_session_lead_score(session_id)
            if lead_score is None:
                return False
            
            # Update session with lead score
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.execute(
                    """
                    UPDATE sessions 
                    SET lead_score = $1 
                    WHERE session_id = $2
                    """,
                    lead_score, session_id
                )
                
                if result == "UPDATE 1":
                    logger.info(f"✅ Updated session {session_id} lead score to {lead_score}")
                    return True
                else:
                    logger.warning(f"❌ Failed to update session {session_id} lead score")
                    return False
                    
        except Exception as e:
            logger.error(f"Error updating session lead score: {e}")
            return False
    
    @staticmethod
    async def calculate_user_average_lead_score(user_id: UUID) -> Optional[float]:
        """
        Calculate the average lead score for a user across all their sessions.
        
        Args:
            user_id: User UUID
            
        Returns:
            Average lead score or None if calculation failed
        """
        try:
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.fetchrow(
                    """
                    SELECT AVG(lead_score)::int as avg_score, COUNT(*) as session_count
                    FROM sessions 
                    WHERE user_id = $1 AND lead_score IS NOT NULL
                    """,
                    user_id
                )
                
                if result and result['session_count'] > 0:
                    avg_score = result['avg_score'] or 0
                    logger.info(f"User {user_id} average lead score: {avg_score} from {result['session_count']} sessions")
                    return avg_score
                
                return 0
                
        except Exception as e:
            logger.error(f"Error calculating user average lead score: {e}")
            return None
    
    @staticmethod
    async def update_user_lead_score(user_id: UUID) -> bool:
        """
        Calculate and update the average lead score for a user.
        
        Args:
            user_id: User UUID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Calculate average lead score
            avg_score = await LeadScoringService.calculate_user_average_lead_score(user_id)
            if avg_score is None:
                return False
            
            # Update user with average lead score
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                result = await connection.execute(
                    """
                    UPDATE users 
                    SET lead_score = $1 
                    WHERE user_id = $2
                    """,
                    int(avg_score), user_id
                )
                
                if result == "UPDATE 1":
                    logger.info(f"✅ Updated user {user_id} lead score to {int(avg_score)}")
                    return True
                else:
                    logger.warning(f"❌ Failed to update user {user_id} lead score")
                    return False
                    
        except Exception as e:
            logger.error(f"Error updating user lead score: {e}")
            return False
    
    @staticmethod
    async def process_session_end_scoring(session_id: UUID) -> bool:
        """
        Complete lead scoring process when a session ends.
        Updates both session and user lead scores.
        
        Args:
            session_id: Session UUID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get session data to find user_id
            pool = await db_manager.get_connection()
            async with pool.acquire() as connection:
                session_data = await connection.fetchrow(
                    "SELECT user_id FROM sessions WHERE session_id = $1",
                    session_id
                )
                
                if not session_data or not session_data['user_id']:
                    logger.warning(f"Session {session_id} has no associated user")
                    # Still update session score even without user
                    return await LeadScoringService.update_session_lead_score(session_id)
                
                user_id = session_data['user_id']
            
            # Update session lead score
            session_updated = await LeadScoringService.update_session_lead_score(session_id)
            if not session_updated:
                logger.error(f"Failed to update session lead score for {session_id}")
                return False
            
            # Update user average lead score
            user_updated = await LeadScoringService.update_user_lead_score(user_id)
            if not user_updated:
                logger.error(f"Failed to update user lead score for {user_id}")
                return False
            
            logger.info(f"✅ Completed lead scoring for session {session_id} and user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing session end scoring: {e}")
            return False