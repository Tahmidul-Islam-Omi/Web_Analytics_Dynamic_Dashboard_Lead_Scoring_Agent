#!/usr/bin/env python3
"""
Test script for lead scoring functionality.
Run this to test the lead scoring calculations.
"""

import asyncio
import sys
import os

# Add the Backend directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.lead_scoring_service import LeadScoringService


def test_scoring_calculations():
    """Test the scoring calculation methods"""
    print("🧪 Testing Lead Scoring Calculations")
    print("=" * 50)
    
    # Test session duration scoring
    print("\n📊 Session Duration Scoring Tests:")
    test_cases = [
        (30, 5),    # 30 seconds = 5 points
        (120, 15),  # 2 minutes = 15 points
        (240, 25),  # 4 minutes = 25 points
        (480, 35),  # 8 minutes = 35 points
        (720, 40),  # 12 minutes = 40 points
    ]
    
    for duration, expected in test_cases:
        result = LeadScoringService.calculate_session_duration_score(duration)
        status = "✅" if result == expected else "❌"
        print(f"{status} {duration}s -> {result} points (expected {expected})")
    
    # Test page views scoring
    print("\n📄 Page Views Scoring Tests:")
    page_test_cases = [
        (1, 5),   # 1 page = 5 points
        (3, 15),  # 3 pages = 15 points
        (6, 30),  # 6 pages = 30 points (max)
        (10, 30), # 10 pages = 30 points (capped)
    ]
    
    for pages, expected in page_test_cases:
        result = LeadScoringService.calculate_page_views_score(pages)
        status = "✅" if result == expected else "❌"
        print(f"{status} {pages} pages -> {result} points (expected {expected})")
    
    # Test click events scoring
    print("\n🖱️  Click Events Scoring Tests:")
    click_test_cases = [
        (5, 0, 10),   # 5 regular clicks = 10 points
        (0, 2, 10),   # 2 important clicks = 10 points
        (10, 4, 30),  # 10 regular + 4 important = 30 points (capped)
        (20, 0, 30),  # 20 regular clicks = 30 points (capped)
    ]
    
    for regular, important, expected in click_test_cases:
        result = LeadScoringService.calculate_click_events_score(regular, important)
        status = "✅" if result == expected else "❌"
        print(f"{status} {regular} regular + {important} important -> {result} points (expected {expected})")
    
    print("\n🎯 Total Score Example:")
    # Example: 8 minutes + 4 pages + 3 regular clicks + 1 important click
    duration_score = LeadScoringService.calculate_session_duration_score(480)  # 8 min = 35 points
    page_score = LeadScoringService.calculate_page_views_score(4)              # 4 pages = 20 points
    click_score = LeadScoringService.calculate_click_events_score(3, 1)        # 3+1 clicks = 11 points
    total = duration_score + page_score + click_score
    
    print(f"Duration: {duration_score}/40")
    print(f"Pages: {page_score}/30")
    print(f"Clicks: {click_score}/30")
    print(f"Total: {total}/100")


async def test_database_functions():
    """Test database-related functions (requires running database)"""
    print("\n🗄️  Testing Database Functions")
    print("=" * 50)
    
    try:
        from config.database import db_manager
        
        # Try to connect to database
        success = await db_manager.connect()
        if not success:
            print("❌ Could not connect to database. Skipping database tests.")
            return
        
        print("✅ Database connection successful")
        
        # Test getting session analytics (this will likely fail with no data, but tests the query)
        from uuid import uuid4
        test_session_id = uuid4()
        
        analytics_data = await LeadScoringService.get_session_analytics_data(test_session_id)
        if analytics_data is None:
            print(f"✅ Correctly returned None for non-existent session: {test_session_id}")
        else:
            print(f"❌ Unexpected data returned for non-existent session")
        
        await db_manager.disconnect()
        print("✅ Database tests completed")
        
    except Exception as e:
        print(f"❌ Database test error: {e}")


async def main():
    """Run all tests"""
    print("🚀 Lead Scoring Service Tests")
    print("=" * 50)
    
    # Test calculations (no database required)
    test_scoring_calculations()
    
    # Test database functions (requires database)
    await test_database_functions()
    
    print("\n✅ All tests completed!")


if __name__ == "__main__":
    asyncio.run(main())