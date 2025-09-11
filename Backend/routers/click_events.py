from fastapi import APIRouter, HTTPException, Request
from services.click_event_service import ClickEventService
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["click-events"])


class ClickEventRequest(BaseModel):
    siteId: str
    sessionId: UUID
    userId: UUID
    url: str
    elementSelector: str
    elementText: Optional[str] = None
    xCoord: Optional[int] = None
    yCoord: Optional[int] = None


@router.post("/click-events")
async def track_click_event(request: ClickEventRequest):
    """
    Track a click event.
    Creates page record if it doesn't exist, then creates click event record.
    """
    try:
        # Get website_id from site_id
        website_id = await ClickEventService.get_website_id_by_site_id(request.siteId)
        if not website_id:
            raise HTTPException(
                status_code=404,
                detail=f"Website not found for site_id: {request.siteId}"
            )

        # Get or create page
        page_id = await ClickEventService.get_or_create_page(
            website_id=website_id,
            url=request.url
        )
        
        if not page_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to create or retrieve page"
            )

        # Create click event
        click_id = await ClickEventService.create_click_event(
            session_id=request.sessionId,
            visitor_uuid=request.userId,
            page_id=page_id,
            site_id=request.siteId,
            element_selector=request.elementSelector,
            element_text=request.elementText,
            x_coord=request.xCoord,
            y_coord=request.yCoord
        )

        if not click_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to create click event"
            )

        logger.info(f"Click event tracked successfully: click_id={click_id}, page_id={page_id}")
        
        return {
            "success": True,
            "message": "Click event tracked successfully",
            "click_id": click_id,
            "page_id": page_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in track_click_event: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )