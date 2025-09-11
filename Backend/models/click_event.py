from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class ClickEventBase(BaseModel):
    element_selector: str
    element_text: Optional[str] = None
    x_coord: Optional[int] = None
    y_coord: Optional[int] = None


class ClickEventCreate(ClickEventBase):
    site_id: str
    session_id: UUID
    user_id: UUID
    url: str


class ClickEvent(ClickEventBase):
    click_id: int
    session_id: UUID
    user_id: UUID
    page_id: int
    click_time: datetime

    class Config:
        from_attributes = True