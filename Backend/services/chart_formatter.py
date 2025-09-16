import os
import logging
import json
from typing import Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChartFormatter:
    """
    Service class for formatting SQL results into chart-ready data using LLM.
    """
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Chart formatting prompt template
        self.prompt_template = """You are a Chart Data Formatter for a Dynamic Dashboard Assistant.

### Context
- A user asks a natural-language query about data.
- That query is converted to SQL, executed, and the raw SQL result is returned in JSON format.
- Now your task is to transform the JSON result into chart-ready data for visualization.

### Input
1. User Query: "{user_query}"
2. SQL Result in JSON:
{sql_result_json}

### Instructions
- You must return **only JavaScript code** with two exports:
1. `chartEntries`: an array of objects in the form
{{ label: string, value: number, color: string, hoverColor: string }}
- `label` → Use a column suitable for the **X-axis** (shorten if text is too long).
- `value` → Use a numeric or quantifiable column for the **Y-axis**.
*If value is not directly numeric (e.g., time `0:00:02.138438`), convert it into a human-friendly numeric form like `2.13 seconds`.*
- `color` and `hoverColor` → Pick visually appealing, distinct, and harmonious colors.

2. `chartConfig`: an object with
- `datasetLabel`: a short descriptive title for the dataset (derived from the user query).

### Rules
- Always choose the **most meaningful X and Y axes** based on the user query and result.
- Clean or normalize values when necessary (e.g., durations → seconds, percentages → numeric, large text → shorter label).
- Avoid overly technical values that don't make sense in a chart.
- Colors must look good together (do not repeat exact same colors).
- Do not include any explanation, comments, or extra text — only return valid JavaScript code.

### Output Example
export const chartEntries = [
{{ label: "Faqs", value: 46.85, color: "#FF6384", hoverColor: "#FF4C6A" }},
{{ label: "Home Page", value: 6.29, color: "#36A2EB", hoverColor: "#2F8EDB" }},
{{ label: "Features", value: 2.50, color: "#FFCE56", hoverColor: "#E6B800" }},
{{ label: "Partners", value: 2.14, color: "#4BC0C0", hoverColor: "#36A8A8" }}
];

export const chartConfig = {{
datasetLabel: "Average View Duration (seconds) by Page"
}};"""

    def _clean_code_block(self, llm_response: str) -> str:
        """Removes triple backticks and optional language tags (e.g., ```javascript)."""
        return llm_response.replace("```javascript", "").replace("```", "").strip()
    
    def _add_helper_function(self, cleaned_response: str) -> str:
        """Add the generateChartData helper function to the cleaned response."""
        helper_function = """
// Helper function to generate chart data from entries
export const generateChartData = () => {
return {
labels: chartEntries.map(entry => entry.label),
values: chartEntries.map(entry => entry.value),
colors: {
backgroundColor: chartEntries.map(entry => entry.color),
hoverBackgroundColor: chartEntries.map(entry => entry.hoverColor),
},
label: chartConfig.datasetLabel
};
};"""
        return cleaned_response + helper_function

    async def format_chart_data(self, user_query: str, sql_result: Dict[str, Any]) -> Optional[str]:
        """
        Format SQL results into chart-ready JavaScript code using LLM.
        
        Args:
            user_query: Original user query from frontend
            sql_result: SQL execution results in JSON format
            
        Returns:
            JavaScript code for chart data or None if failed
        """
        try:
            # Convert SQL result to JSON string
            sql_result_json = json.dumps(sql_result, indent=2, default=str)
            
            # Create the full prompt
            full_prompt = self.prompt_template.format(
                user_query=user_query,
                sql_result_json=sql_result_json
            )
            
            logger.info(f"🎨 Formatting chart data for query: {user_query}")
            
            # Generate chart formatting response
            response = self.model.generate_content(full_prompt)
            
            if response and response.text:
                # Clean the response and add helper function
                cleaned_response = self._clean_code_block(response.text)
                complete_code = self._add_helper_function(cleaned_response)
                
                logger.info("✅ Chart data formatted successfully")
                logger.info("🎯 CHART-READY JAVASCRIPT CODE:")
                logger.info("=" * 60)
                logger.info(complete_code)
                logger.info("=" * 60)
                
                return complete_code
            else:
                logger.warning("⚠️ Empty response from chart formatter")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error formatting chart data: {e}")
            return None

# Create a singleton instance
chart_formatter = ChartFormatter()