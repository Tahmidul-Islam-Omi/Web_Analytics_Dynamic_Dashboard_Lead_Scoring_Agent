import logging
from typing import Optional, Dict, Any, List
from config.database import db_manager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SQLExecutor:
    """
    Service class for executing SQL queries safely against the database.
    """
    
    @staticmethod
    async def execute_query(sql: str) -> Dict[str, Any]:
        """
        Execute a SQL query and return the results.
        
        Args:
            sql: Clean, validated SQL query to execute
            
        Returns:
            Dictionary containing query results or error information
        """
        try:
            logger.info(f"🔄 Executing SQL query...")
            
            # Get database connection
            pool = await db_manager.get_connection()
            
            async with pool.acquire() as connection:
                # Execute the query
                result = await connection.fetch(sql)
                
                # Convert result to list of dictionaries
                if result:
                    # Convert asyncpg.Record objects to dictionaries
                    data = [dict(row) for row in result]
                    row_count = len(data)
                    
                    logger.info(f"✅ Query executed successfully - {row_count} rows returned")
                    
                    return {
                        "success": True,
                        "data": data,
                        "row_count": row_count,
                        "columns": list(data[0].keys()) if data else [],
                        "message": f"Query executed successfully. {row_count} rows returned."
                    }
                else:
                    logger.info("✅ Query executed successfully - No rows returned")
                    
                    return {
                        "success": True,
                        "data": [],
                        "row_count": 0,
                        "columns": [],
                        "message": "Query executed successfully. No rows returned."
                    }
                    
        except Exception as e:
            logger.error(f"❌ Error executing SQL query: {e}")
            
            return {
                "success": False,
                "data": [],
                "row_count": 0,
                "columns": [],
                "message": f"Error executing query: {str(e)}",
                "error": str(e)
            }
    
    @staticmethod
    def format_results_for_display(results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Return query results as JSON for the frontend.
        
        Args:
            results: Results dictionary from execute_query
            
        Returns:
            Raw JSON results dictionary
        """
        return results