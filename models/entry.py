from pydantic import BaseModel
from datetime import datetime


class EntryCreate(BaseModel):
    entry_date: datetime
    description: str
    photo_url: str
    height: float
    moisture: float


class EntryRead(EntryCreate):
    id: int
    lot_id: int
    entry_date: datetime
    description: str
    photo_url: str
    height: float
    moisture: float
    created_at: datetime

    class Config:
        from_attributes = True


