from datetime import datetime

from pydantic import BaseModel, Field


class CreateNotification(BaseModel):
    message: str
    scheduled_at: datetime


class ReadNotification(BaseModel):
    id: int
    lot_id: int
    message: str
    scheduled_at: datetime
    is_delivered: bool
    created_at: datetime

    class Config:
        from_attributes = True
