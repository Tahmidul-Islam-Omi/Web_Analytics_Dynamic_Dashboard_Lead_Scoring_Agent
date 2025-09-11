# Lead Scoring System

This document explains the lead scoring system implemented for the Web Analytics platform.

## Overview

The lead scoring system calculates engagement scores for user sessions and maintains average scores for users. Scores range from 0-100 points and are calculated based on three main factors:

- **Session Duration** (40 points max)
- **Page Views** (30 points max)  
- **Click Events** (30 points max)

## Scoring Formula

### Session Duration Score (40 points max)

| Duration | Points |
|----------|--------|
| < 1 min  | 5      |
| 1-3 min  | 15     |
| 3-5 min  | 25     |
| 5-10 min | 35     |
| 10+ min  | 40     |

### Page Views Score (30 points max)

- **5 points per page viewed**
- **Maximum 30 points** (6+ pages)

Formula: `min(page_count * 5, 30)`

### Click Events Score (30 points max)

- **Regular clicks**: 2 points each
- **Important clicks**: 5 points each
- **Maximum 30 points total**

**Important click elements** (case-insensitive):
- "Be an Early Bird"
- "Get a Demo"

Formula: `min((regular_clicks * 2) + (important_clicks * 5), 30)`

## Database Schema

### Sessions Table
```sql
ALTER TABLE sessions ADD COLUMN lead_score INT DEFAULT 0 
CHECK (lead_score >= 0 AND lead_score <= 100);
```

### Users Table
```sql
ALTER TABLE users ADD COLUMN lead_score INT DEFAULT 0 
CHECK (lead_score >= 0 AND lead_score <= 100);
```

## Implementation

### Core Service: `LeadScoringService`

Located in `services/lead_scoring_service.py`, this service provides:

#### Calculation Methods
- `calculate_session_duration_score(duration_seconds)` - Calculate duration score
- `calculate_page_views_score(page_count)` - Calculate page views score
- `calculate_click_events_score(regular_clicks, important_clicks)` - Calculate click score

#### Database Methods
- `get_session_analytics_data(session_id)` - Get session data for scoring
- `calculate_session_lead_score(session_id)` - Calculate total session score
- `update_session_lead_score(session_id)` - Update session score in database
- `calculate_user_average_lead_score(user_id)` - Calculate user average score
- `update_user_lead_score(user_id)` - Update user average score in database
- `process_session_end_scoring(session_id)` - Complete scoring process when session ends

### Automatic Scoring

Lead scores are automatically calculated when a session ends:

1. **Session End Trigger**: When `SessionService.end_session()` is called
2. **Session Score Calculation**: Based on duration, page views, and clicks
3. **Session Score Update**: Score is stored in `sessions.lead_score`
4. **User Score Update**: User's average score is recalculated and updated

### API Endpoints

#### Calculate Session Score
```http
POST /api/lead-score/session
Content-Type: application/json

{
  "sessionId": "uuid-here"
}
```

#### Update Session Score
```http
POST /api/lead-score/session/update
Content-Type: application/json

{
  "sessionId": "uuid-here"
}
```

#### Calculate User Score
```http
POST /api/lead-score/user
Content-Type: application/json

{
  "userId": "uuid-here"
}
```

#### Update User Score
```http
POST /api/lead-score/user/update
Content-Type: application/json

{
  "userId": "uuid-here"
}
```

#### Get Session Analytics
```http
GET /api/lead-score/session/{session_id}
```

Returns detailed analytics and score breakdown:
```json
{
  "success": true,
  "session_id": "uuid-here",
  "analytics": {
    "duration_seconds": 480,
    "page_views_count": 4,
    "regular_clicks": 3,
    "important_clicks": 1
  },
  "score_breakdown": {
    "duration_score": "35/40",
    "page_score": "20/30", 
    "click_score": "11/30",
    "total_score": "66/100"
  }
}
```

## Example Scenarios

### High Engagement User
- **Duration**: 8 minutes → 35 points
- **Pages**: 4 pages → 20 points
- **Clicks**: 3 regular + 1 important → 11 points
- **Total**: 66/100 points

### Very High Engagement User
- **Duration**: 12 minutes → 40 points
- **Pages**: 6 pages → 30 points
- **Clicks**: 5 regular + 2 important → 20 points
- **Total**: 90/100 points

### Low Engagement User
- **Duration**: 45 seconds → 5 points
- **Pages**: 1 page → 5 points
- **Clicks**: 1 regular → 2 points
- **Total**: 12/100 points

## Testing

### Unit Tests
Run calculation tests:
```bash
python test_lead_scoring_simple.py
```

### API Tests
Test endpoints (requires running server):
```bash
python test_api_endpoints.py
```

### Manual Testing
1. Start the server: `python main.py`
2. Create a session through the tracking script
3. Generate page views and clicks
4. End the session
5. Check the `sessions` and `users` tables for updated lead scores

## Integration Points

### Frontend Tracking Script
The tracking script (`track.js`) automatically triggers lead scoring when:
- Sessions end (page unload, tab close, etc.)
- Session duration updates are sent

### Session Service Integration
`SessionService.end_session()` automatically calls:
```python
await LeadScoringService.process_session_end_scoring(session_id)
```

### Database Triggers
Lead scores are updated in real-time:
1. Session ends → Session lead score calculated
2. Session lead score updated → User average lead score recalculated

## Performance Considerations

- Lead scoring calculations are performed asynchronously
- Database queries are optimized with proper indexing
- Scoring only occurs on session end to minimize overhead
- Connection pooling prevents database connection issues

## Monitoring and Debugging

### Logging
The service provides detailed logging:
- Score calculation breakdowns
- Database update confirmations
- Error handling and warnings

### Health Checks
Use the health endpoint to verify system status:
```http
GET /health
```

### Analytics Endpoint
Use the analytics endpoint to debug scoring issues:
```http
GET /api/lead-score/session/{session_id}
```

## Future Enhancements

Potential improvements to the scoring system:

1. **Dynamic Scoring Rules**: Configure scoring rules per website
2. **Time-based Decay**: Reduce scores for older sessions
3. **Behavioral Patterns**: Score based on user journey patterns
4. **A/B Testing**: Test different scoring algorithms
5. **Machine Learning**: Use ML models for predictive scoring