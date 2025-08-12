from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional
import uuid

class WebsiteCreate(BaseModel):
    name: str
    url: str
    site_id: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class WebsiteResponse(BaseModel):
    website_id: int
    site_id: str
    name: str
    url: str
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }