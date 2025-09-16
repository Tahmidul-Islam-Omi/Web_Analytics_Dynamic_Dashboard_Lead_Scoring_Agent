from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.query_service import QueryService
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/query", tags=["query"])

class QueryRequest(BaseModel):
    message: str
    site_id: Optional[str] = None
    user_id: Optional[str] = None

from typing import Union

class QueryResponse(BaseModel):
    success: bool
    message: str
    response: Optional[Union[str, Dict[str, Any]]] = None

@router.post("/search", response_model=QueryResponse)
async def handle_search_query(request: QueryRequest):
    """
    Handle search queries from the frontend dashboard assistant.
    Processes and logs the query using QueryService.
    """
    try:
        # Process the search query using the service
        result = await QueryService.process_search_query(
            message=request.message,
            site_id=request.site_id,
            user_id=request.user_id
        )
        
        return QueryResponse(
            success=result["success"],
            message=result["message"],
            response=result["response"]
        )
        
    except Exception as e:
        logger.error(f"❌ Error handling search query: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing search query"
        )