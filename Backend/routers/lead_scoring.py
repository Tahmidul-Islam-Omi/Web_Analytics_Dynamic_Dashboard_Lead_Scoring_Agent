from fastapi import APIRouter, HTTPException
from services.lead_scoring_service import LeadScoringService
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["lead-scoring"])


class SessionScoreRequest(BaseModel):
    sessionId: UUID


class UserScoreRequest(BaseModel):
    userId: UUID


@router.post("/lead-score/session")
async def calculate_session_score(request: SessionScoreRequest):
    """
    Calculate and return lead score for a specific session.
    Useful for testing and debugging.
    """
    try:
        score = await LeadScoringService.calculate_session_lead_score(request.sessionId)
        
        if score is None:
            raise HTTPException(
                status_code=404,
                detail=f"Session not found or score calculation failed: {request.sessionId}"
            )
        
        return {
            "success": True,
            "session_id": str(request.sessionId),
            "lead_score": score,
            "message": f"Session lead score calculated: {score}/100"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating session score: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.post("/lead-score/session/update")
async def update_session_score(request: SessionScoreRequest):
    """
    Calculate and update lead score for a specific session in the database.
    """
    try:
        success = await LeadScoringService.update_session_lead_score(request.sessionId)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Session not found or update failed: {request.sessionId}"
            )
        
        return {
            "success": True,
            "session_id": str(request.sessionId),
            "message": "Session lead score updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session score: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.post("/lead-score/user")
async def calculate_user_score(request: UserScoreRequest):
    """
    Calculate and return average lead score for a specific user.
    """
    try:
        score = await LeadScoringService.calculate_user_average_lead_score(request.userId)
        
        if score is None:
            raise HTTPException(
                status_code=404,
                detail=f"User not found or score calculation failed: {request.userId}"
            )
        
        return {
            "success": True,
            "user_id": str(request.userId),
            "average_lead_score": score,
            "message": f"User average lead score calculated: {score}/100"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating user score: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.post("/lead-score/user/update")
async def update_user_score(request: UserScoreRequest):
    """
    Calculate and update average lead score for a specific user in the database.
    """
    try:
        success = await LeadScoringService.update_user_lead_score(request.userId)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"User not found or update failed: {request.userId}"
            )
        
        return {
            "success": True,
            "user_id": str(request.userId),
            "message": "User lead score updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user score: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.get("/lead-score/session/{session_id}")
async def get_session_analytics(session_id: UUID):
    """
    Get detailed analytics data for a session (for debugging).
    """
    try:
        analytics_data = await LeadScoringService.get_session_analytics_data(session_id)
        
        if not analytics_data:
            raise HTTPException(
                status_code=404,
                detail=f"Session not found: {session_id}"
            )
        
        # Calculate score breakdown
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
        total_score = duration_score + page_score + click_score
        
        return {
            "success": True,
            "session_id": str(session_id),
            "analytics": {
                "duration_seconds": analytics_data['duration_seconds'],
                "page_views_count": analytics_data['page_views_count'],
                "regular_clicks": analytics_data['regular_clicks'],
                "important_clicks": analytics_data['important_clicks']
            },
            "score_breakdown": {
                "duration_score": f"{duration_score}/{LeadScoringService.MAX_SESSION_SCORE}",
                "page_score": f"{page_score}/{LeadScoringService.MAX_PAGE_SCORE}",
                "click_score": f"{click_score}/{LeadScoringService.MAX_CLICK_SCORE}",
                "total_score": f"{total_score}/100"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )