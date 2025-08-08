from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS so your frontend can send requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing, allow all origins. Change in production!
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/api/track")
async def receive_tracking(request: Request):
    data = await request.json()
    print("Received tracking data:", data)
    return {"status": "success"}
