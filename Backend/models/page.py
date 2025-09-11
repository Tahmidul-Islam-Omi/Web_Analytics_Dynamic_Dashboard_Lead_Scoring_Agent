from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class PageBase(BaseModel):
    url: str
    title: Optional[str] = None


class PageCreate(PageBase):
    website_id: int


class Page(PageBase):
    page_id: int
    website_id: int

    class Config:
        from_attributes = True


class PageViewBase(BaseModel):
    referrer: Optional[str] = None


class PageViewCreate(PageViewBase):
    site_id: str
    session_id: UUID
    user_id: UUID
    url: str
    title: Optional[str] = None


class PageView(PageViewBase):
    view_id: int
    session_id: UUID
    user_id: UUID
    page_id: int
    view_start: datetime
    view_end: Optional[datetime] = None
    referrer: Optional[str] = None

    class Config:
        from_attributes = True