from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from services.user_service import UserService
from typing import Optional

router = APIRouter(prefix="/api/users", tags=["users"])

class UserCreateRequest(BaseModel):
    siteId: str
    userId: str  # This is the visitor_uuid from frontend
    browser: Optional[str] = None
    os: Optional[str] = None
    userAgent: Optional[str] = None

class UserUpdateRequest(BaseModel):
    siteId: str
    userId: str  # This is the visitor_uuid from frontend
    action: str  # "update_last_seen" or "update_lead_score"
    leadScore: Optional[int] = None

@router.post("")
async def create_user(request: UserCreateRequest):
    """Create a new user (first-time visitor)"""
    try:
        result = await UserService.create_user(
            site_id=request.siteId,
            visitor_uuid=request.userId,
            browser=request.browser,
            os=request.os,
            user_agent=request.userAgent
        )
        
        if result is None:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        if "error" in result:
            raise HTTPException(status_code=409, detail=result["error"])
        
        return {
            "success": True,
            "message": "User created successfully" if result.get("is_new") else "User already exists",
            "data": result
        }
        
    except Exception as e:
        print(f"❌ Error in create_user endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("")
async def update_user(request: UserUpdateRequest):
    """Update user information (last_seen, lead_score, etc.)"""
    try:
        if request.action == "update_last_seen":
            success = await UserService.update_last_seen(
                site_id=request.siteId,
                visitor_uuid=request.userId
            )
            
            if not success:
                raise HTTPException(status_code=404, detail="User not found")
            
            return {
                "success": True,
                "message": "User last_seen updated successfully"
            }
        
        elif request.action == "update_lead_score":
            if request.leadScore is None:
                raise HTTPException(status_code=400, detail="leadScore is required for update_lead_score action")
            
            success = await UserService.update_lead_score(
                site_id=request.siteId,
                visitor_uuid=request.userId,
                score=request.leadScore
            )
            
            if not success:
                raise HTTPException(status_code=404, detail="User not found or invalid lead score")
            
            return {
                "success": True,
                "message": f"User lead score updated to {request.leadScore}"
            }
        
        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use 'update_last_seen' or 'update_lead_score'")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in update_user endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{site_id}/{visitor_uuid}")
async def get_user(site_id: str, visitor_uuid: str):
    """Get user information by site_id and visitor_uuid"""
    try:
        user = await UserService.get_user_by_visitor_uuid(site_id, visitor_uuid)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "data": user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_user endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")