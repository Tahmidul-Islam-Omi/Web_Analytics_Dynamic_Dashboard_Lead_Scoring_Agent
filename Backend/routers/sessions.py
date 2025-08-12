from fastapi import APIRouter, HTTPException, Request
from services.session_service import SessionService
import logging

router = APIRouter(prefix="/api", tags=["sessions"])

@router.post("/sessions")
async def handle_session(request: Request):
    """Handle session start and end events"""
    try:
        data = await request.json()
        site_id = data.get('siteId')
        session_id = data.get('sessionId')
        action = data.get('action')  # 'start' or 'end'
        
        if not all([site_id, session_id, action]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        if action == "start":
            browser = data.get('browser')
            os = data.get('os')
            user_agent = data.get('userAgent')
            ip_address = request.client.host if request.client else None
            
            result = await SessionService.start_session(
                site_id, session_id, browser, os, user_agent, ip_address
            )
            
            if not result:
                raise HTTPException(status_code=500, detail="Failed to start session")
                
            return {"status": "success", "message": "Session started", "session": result}
            
        elif action == "end":
            session_duration = data.get('sessionDuration', 0)
            
            result = await SessionService.end_session(session_id, session_duration)
            
            if not result:
                raise HTTPException(status_code=404, detail="Session not found")
                
            return {"status": "success", "message": "Session ended"}
        
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error handling session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")