#!/usr/bin/env python3
"""
Simple test for lead scoring calculations (no database required).
"""

import sys
import os

# Add the Backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_scoring_calculations():
    """Test the scoring calculation methods without database"""
    print("🧪 Testing Lead Scoring Calculations")
    print("=" * 50)
    
    # Import here to avoid database connection issues
    from services.lead_scoring_service import LeadScoringService
    
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
    
    print("\n🎯 Total Score Examples:")
    
    # Example 1: High engagement user
    print("\nExample 1 - High Engagement User:")
    duration_score = LeadScoringService.calculate_session_duration_score(480)  # 8 min = 35 points
    page_score = LeadScoringService.calculate_page_views_score(4)              # 4 pages = 20 points
    click_score = LeadScoringService.calculate_click_events_score(3, 1)        # 3 regular + 1 important = 11 points
    total = duration_score + page_score + click_score
    
    print(f"  Duration: {duration_score}/40 (8 minutes)")
    print(f"  Pages: {page_score}/30 (4 pages)")
    print(f"  Clicks: {click_score}/30 (3 regular + 1 important)")
    print(f"  Total: {total}/100")
    
    # Example 2: Very high engagement user
    print("\nExample 2 - Very High Engagement User:")
    duration_score = LeadScoringService.calculate_session_duration_score(720)  # 12 min = 40 points
    page_score = LeadScoringService.calculate_page_views_score(6)              # 6 pages = 30 points
    click_score = LeadScoringService.calculate_click_events_score(5, 2)        # 5 regular + 2 important = 20 points
    total = duration_score + page_score + click_score
    
    print(f"  Duration: {duration_score}/40 (12 minutes)")
    print(f"  Pages: {page_score}/30 (6 pages)")
    print(f"  Clicks: {click_score}/30 (5 regular + 2 important)")
    print(f"  Total: {total}/100")
    
    # Example 3: Low engagement user
    print("\nExample 3 - Low Engagement User:")
    duration_score = LeadScoringService.calculate_session_duration_score(45)   # 45 seconds = 5 points
    page_score = LeadScoringService.calculate_page_views_score(1)              # 1 page = 5 points
    click_score = LeadScoringService.calculate_click_events_score(1, 0)        # 1 regular click = 2 points
    total = duration_score + page_score + click_score
    
    print(f"  Duration: {duration_score}/40 (45 seconds)")
    print(f"  Pages: {page_score}/30 (1 page)")
    print(f"  Clicks: {click_score}/30 (1 regular click)")
    print(f"  Total: {total}/100")


if __name__ == "__main__":
    test_scoring_calculations()
    print("\n✅ All calculation tests completed!")