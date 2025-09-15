from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.chat_service import ChatService
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    site_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    success: bool
    message: str
    response: Optional[str] = None

@router.post("/query", response_model=ChatResponse)
async def handle_chat_query(request: ChatRequest):
    """
    Handle chat queries from the frontend dashboard assistant.
    Processes and logs the query using ChatService.
    """
    try:
        # Process the chat query using the service
        result = await ChatService.process_chat_query(
            message=request.message,
            site_id=request.site_id,
            user_id=request.user_id
        )
        
        return ChatResponse(
            success=result["success"],
            message=result["message"],
            response=result["response"]
        )
        
    except Exception as e:
        logger.error(f"❌ Error handling chat query: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing chat query"
        )