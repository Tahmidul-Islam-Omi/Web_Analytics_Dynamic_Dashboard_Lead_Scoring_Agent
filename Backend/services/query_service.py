import logging
from typing import Optional, Dict, Any
from .llm_service import llm_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryService:
    """
    Service class for handling search query operations.
    Processes natural language queries and converts them to SQL using LLM.
    """
    
    @staticmethod
    async def process_search_query(
        message: str, 
        site_id: Optional[str] = None, 
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a search query from the dashboard assistant.
        
        Args:
            message: The user's search query
            site_id: Optional site identifier for context
            user_id: Optional user identifier for context
            
        Returns:
            Dictionary containing processing results with generated SQL
        """
        try:
            # Log the query to console
            logger.info(f"🔍 Search Query: {message}")
            if site_id:
                logger.info(f"🌐 Site ID: {site_id}")
            if user_id:
                logger.info(f"👤 User ID: {user_id}")
            
            # Generate SQL using LLM service
            sql_response = await llm_service.generate_sql_from_query(message, original_query=message)
            
            if sql_response:
                logger.info(f"📝 Generated SQL response")
                return {
                    "success": True,
                    "message": "Query processed successfully",
                    "response": sql_response
                }
            else:
                logger.warning("⚠️ No SQL response generated")
                return {
                    "success": False,
                    "message": "Failed to generate SQL",
                    "response": "Unable to process your query. Please try rephrasing."
                }
            
        except Exception as e:
            logger.error(f"❌ Error processing search query: {e}")
            return {
                "success": False,
                "message": f"Error processing query: {str(e)}",
                "response": "An error occurred while processing your query. Please try again."
            }