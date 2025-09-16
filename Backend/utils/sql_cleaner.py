import re
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_sql(fenced_sql: str) -> str:
    """Extracts the SQL inside a ```sql ... ``` fenced code block.
    Returns raw SQL without fences."""
    pattern = r"```sql\s*(.*?)```"
    match = re.search(pattern, fenced_sql, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    else:
        # If no fenced code block is found, return original text
        return fenced_sql.strip()

def is_safe_sql(query: str) -> bool:
    """Validate SQL query to ensure it's read-only (SELECT or WITH only).
    Returns True if safe, False if unsafe."""
    # Normalize whitespace & case
    q = query.strip().lower()
    
    # Must start with SELECT or WITH
    if not (q.startswith("select") or q.startswith("with")):
        logger.warning("⚠️ SQL must start with SELECT or WITH")
        return False
    
    # Forbidden keywords (destructive ops)
    forbidden = ["insert", "update", "delete", "drop", "alter", "truncate",
                "create", "replace", "merge", "grant", "revoke"]
    
    # Strict word-boundary check
    for word in forbidden:
        if re.search(rf"\b{word}\b", q):
            logger.warning(f"⚠️ Forbidden keyword detected: {word}")
            return False
    
    logger.info("✅ SQL validation passed - Query is safe")
    return True

class SQLCleaner:
    """
    Utility class for cleaning and extracting SQL from various formats.
    """
    
    @staticmethod
    def clean_sql_response(raw_response: str) -> str:
        """
        Clean SQL response from LLM.
        
        Args:
            raw_response: Raw response from LLM that may contain SQL
            
        Returns:
            Clean, executable SQL string
        """
        try:
            # Extract from fenced code blocks
            cleaned_sql = extract_sql(raw_response)
            
            # Ensure semicolon
            if cleaned_sql and not cleaned_sql.endswith(';'):
                cleaned_sql += ';'
            
            logger.info("🧹 SQL cleaning completed successfully")
            return cleaned_sql
            
        except Exception as e:
            logger.error(f"❌ Error during SQL cleaning: {e}")
            return raw_response.strip()
    
    @staticmethod
    def validate_sql_safety(sql: str) -> bool:
        """
        Validate SQL safety using simple pattern matching.
        
        Args:
            sql: SQL string to validate
            
        Returns:
            True if SQL appears safe, False otherwise
        """
        return is_safe_sql(sql)