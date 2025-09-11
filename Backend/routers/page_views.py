from fastapi import APIRouter, HTTPException, Request
from services.page_service import PageService
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["page-views"])


class PageViewRequest(BaseModel):
    siteId: str
    sessionId: UUID
    userId: UUID
    url: str
    title: Optional[str] = None
    referrer: Optional[str] = None


@router.post("/page-views")
async def track_page_view(request: PageViewRequest):
    """
    Track a page view event.
    Creates page record if it doesn't exist, then creates page view record.
    """
    try:
        # Get website_id from site_id
        website_id = await PageService.get_website_id_by_site_id(request.siteId)
        if not website_id:
            raise HTTPException(
                status_code=404,
                detail=f"Website not found for site_id: {request.siteId}"
            )

        # Get or create page
        page_id = await PageService.get_or_create_page(
            website_id=website_id,
            url=request.url,
            title=request.title
        )
        
        if not page_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to create or retrieve page"
            )

        # Create page view
        view_id = await PageService.create_page_view(
            session_id=request.sessionId,
            visitor_uuid=request.userId,
            page_id=page_id,
            site_id=request.siteId,
            referrer=request.referrer
        )

        if not view_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to create page view"
            )

        logger.info(f"Page view tracked successfully: view_id={view_id}, page_id={page_id}")
        
        return {
            "success": True,
            "message": "Page view tracked successfully",
            "view_id": view_id,
            "page_id": page_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in track_page_view: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )