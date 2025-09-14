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