from fastapi import APIRouter, HTTPException, Request
from models.website import WebsiteCreate, WebsiteResponse
from services.website_service import WebsiteService
import logging

router = APIRouter(prefix="/api", tags=["websites"])

@router.post("/websites", response_model=dict)
async def create_website(request: Request):
    """Create a new website for tracking"""
    try:
        data = await request.json()
        name = data.get('name')
        url = data.get('url')
        site_id = data.get('site_id')  # Optional
        
        if not all([name, url]):
            raise HTTPException(status_code=400, detail="Missing required fields: name, url")
        
        # Check if website already exists (if site_id provided)
        if site_id:
            existing = await WebsiteService.get_website_by_site_id(site_id)
            if existing:
                raise HTTPException(status_code=409, detail="Website with this site_id already exists")
        
        website = await WebsiteService.create_website(name, url, site_id)
        if not website:
            raise HTTPException(status_code=500, detail="Failed to create website")
        
        return {
            "status": "success",
            "message": "Website created successfully",
            "website": website
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error creating website: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")