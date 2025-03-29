from pydantic import BaseModel
from datetime import datetime

class EntryCreate(BaseModel):
    entry_date: datetime
    description: str
    height: float
    moisture: float

class EntryRead(EntryCreate):
    id: int
    lot_id: int
    created_at: datetime
    photo_url: str

    class Config:
        from_attributes = True
