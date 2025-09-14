from fastapi import APIRouter, HTTPException
from services.analytics_service import AnalyticsService
import logging

router = APIRouter(prefix="/api", tags=["analytics"])

@router.get("/analytics/{site_id}/metrics")
async def get_website_metrics(site_id: str):
    """Get analytics metrics for a specific website"""
    try:
        metrics = await AnalyticsService.get_website_metrics(site_id)
        
        if metrics is None:
            raise HTTPException(status_code=404, detail="Website not found")
        
        return {
            "status": "success",
            "metrics": metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error fetching analytics metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics/{site_id}/top-pages")
async def get_top_pages(site_id: str, limit: int = 5):
    """Get top pages by view count for a specific website"""
    try:
        top_pages = await AnalyticsService.get_top_pages(site_id, limit)
        
        if top_pages is None:
            raise HTTPException(status_code=404, detail="Website not found")
        
        return {
            "status": "success",
            "top_pages": top_pages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error fetching top pages: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics/{site_id}/recent-sessions")
async def get_recent_sessions(site_id: str, limit: int = 10):
    """Get recent sessions with duration, page count, and lead score"""
    try:
        recent_sessions = await AnalyticsService.get_recent_sessions(site_id, limit)
        
        if recent_sessions is None:
            raise HTTPException(status_code=404, detail="Website not found")
        
        return {
            "status": "success",
            "recent_sessions": recent_sessions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error fetching recent sessions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")