from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import db_manager

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

@app.post("/api/track")
async def receive_tracking(request: Request):
    data = await request.json()

    print("\n=== 📊 Page Analytics ===")
    print(f"👁 Page Views    : {data.get('pageViews')}")
    print(f"🖥 Browser       : {data.get('browser')}")
    print(f"💻 OS            : {data.get('os')}")
    print(f"⏱ Duration (sec): {data.get('sessionDuration')}")
    print("=========================\n")

    # Here you can add database operations to store the analytics data
    # For now, just return success
    return {"status": "success", "message": "Data received successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)