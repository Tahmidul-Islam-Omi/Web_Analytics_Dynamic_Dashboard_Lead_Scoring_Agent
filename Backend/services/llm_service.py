import os
import logging
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    """
    Service class for handling LLM interactions with Google Gemini.
    Converts natural language queries to SQL.
    """
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Database schema
        self.schema = """-- Table: websites
CREATE TABLE websites (
    website_id SERIAL PRIMARY KEY,
    site_id VARCHAR(50) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: sessions
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id INT REFERENCES websites(website_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    browser TEXT NOT NULL,
    os TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP,
    session_duration INTERVAL,
    ip_address INET,
    user_agent TEXT,
    lead_score INT DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100)
);

-- Table: pages
CREATE TABLE pages (
    page_id SERIAL PRIMARY KEY,
    website_id INT REFERENCES websites(website_id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    UNIQUE(website_id, url)
);

-- Table: page_views
CREATE TABLE page_views (
    view_id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    page_id INT REFERENCES pages(page_id) ON DELETE CASCADE,
    view_start TIMESTAMP NOT NULL DEFAULT NOW(),
    view_end TIMESTAMP,
    duration INTERVAL GENERATED ALWAYS AS (view_end - view_start) STORED,
    referrer TEXT
);

-- Table: click_events
CREATE TABLE click_events (
    click_id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    page_id INT REFERENCES pages(page_id) ON DELETE CASCADE,
    element_selector TEXT NOT NULL,
    element_text TEXT,
    click_time TIMESTAMP NOT NULL DEFAULT NOW(),
    x_coord INT,
    y_coord INT
);

-- Table: users
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id INT REFERENCES websites(website_id) ON DELETE CASCADE,
    visitor_uuid VARCHAR(50) NOT NULL,
    first_seen TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
    lead_score INT DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    UNIQUE (website_id, visitor_uuid)
);"""
        
        # Base prompt template
        self.base_prompt = f"""You are an expert SQL generator. Here is the database schema:

{self.schema}

Rules:
1. The user will ask questions in natural language.
2. Convert the question into a correct SQL query using ONLY the given schema.
3. Always return the query inside a fenced code block with ```sql at the start and ``` at the end.
4. Do not add explanations, only output valid SQL.
5. If the question is not relevant to this schema, reply exactly with: "Not relevant".
6. Ensure SQL is clean, readable, and production-ready (avoid generic aliases like T1, T2).
7. Only return one query per request.
8. Use standard PostgreSQL syntax."""

    async def generate_sql_from_query(self, user_question: str) -> Optional[str]:
        """
        Convert natural language query to SQL using Gemini.
        
        Args:
            user_question: Natural language question from user
            
        Returns:
            Generated SQL query or error message
        """
        try:
            # Create the full prompt
            final_prompt = f"{self.base_prompt}\n\nQuestion: {user_question}\nAnswer:"
            
            logger.info(f"🤖 Generating SQL for query: {user_question}")
            
            # Generate response using Gemini
            response = self.model.generate_content(final_prompt)
            
            if response and response.text:
                logger.info(f"✅ Generated SQL response")
                return response.text.strip()
            else:
                logger.warning("⚠️ Empty response from Gemini")
                return "Unable to generate SQL query. Please try rephrasing your question."
                
        except Exception as e:
            logger.error(f"❌ Error generating SQL: {e}")
            return f"Error generating SQL query: {str(e)}"

# Create a singleton instance
llm_service = LLMService()