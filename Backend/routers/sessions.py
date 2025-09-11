from fastapi import APIRouter, HTTPException, Request
from services.session_service import SessionService
import logging

router = APIRouter(prefix="/api", tags=["sessions"])

@router.post("/sessions")
async def handle_session(request: Request):
    """Handle session start, end, and update events"""
    try:
        # Handle both JSON and sendBeacon (plain text) requests
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            data = await request.json()
        else:
            # Handle sendBeacon data (plain text)
            body = await request.body()
            import json
            data = json.loads(body.decode('utf-8'))
        
        site_id = data.get('siteId')
        session_id = data.get('sessionId')
        action = data.get('action')  # 'start', 'end', or 'update'
        
        if not all([site_id, session_id, action]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        if action == "start":
            browser = data.get('browser')
            os = data.get('os')
            user_agent = data.get('userAgent')
            user_id = data.get('userId')  # visitor_uuid from frontend
            ip_address = request.client.host if request.client else None
            
            result = await SessionService.start_session(
                site_id, session_id, browser, os, user_agent, user_id, ip_address
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
        
        elif action == "update":
            session_duration = data.get('sessionDuration', 0)
            
            result = await SessionService.update_session_duration(session_id, session_duration)
            
            if not result:
                raise HTTPException(status_code=404, detail="Session not found")
                
            return {"status": "success", "message": "Session updated"}
        
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error handling session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")