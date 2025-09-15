from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import db_manager
from routers.websites import router as websites_router
from routers.sessions import router as sessions_router
from routers.users import router as users_router
from routers.page_views import router as page_views_router
from routers.click_events import router as click_events_router
from routers.lead_scoring import router as lead_scoring_router
from routers.analytics import router as analytics_router
from routers.query import router as query_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    print("🚀 Starting Web Analytics API...")
    
    # Connect to database
    success = await db_manager.connect()
    if not success:
        print("❌ Failed to connect to database. Shutting down...")
        raise RuntimeError("Database connection failed")
    
    # Test database connection
    test_success = await db_manager.test_connection()
    if not test_success:
        print("❌ Database connection test failed. Shutting down...")
        raise RuntimeError("Database connection test failed")
    
    print("✅ Web Analytics API started successfully!")
    
    yield  # This is where the application runs
    
    # Shutdown
    print("🛑 Shutting down Web Analytics API...")
    await db_manager.disconnect()
    print("✅ Web Analytics API shutdown complete!")

app = FastAPI(
    title="Web Analytics API", 
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS so your frontend can send requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing, allow all origins. Change in production!
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(websites_router)
app.include_router(sessions_router)
app.include_router(users_router)
app.include_router(page_views_router)
app.include_router(click_events_router)
app.include_router(lead_scoring_router)
app.include_router(analytics_router)
app.include_router(query_router)

@app.get("/")
async def read_root():
    return {"Hello": "World", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify database connection"""
    try:
        is_connected = await db_manager.test_connection()
        return {
            "status": "healthy" if is_connected else "unhealthy",
            "database": "connected" if is_connected else "disconnected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e)
        }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)