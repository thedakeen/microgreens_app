from pydantic import BaseModel, Field
from datetime import datetime

from typing import List

from models.entry import EntryRead

validationDesc = "This field is required"


# lot creating logic
class LotCreate(BaseModel):
    microgreen_id: int = Field(..., description=validationDesc)
    sowing_date: datetime = Field(..., description=validationDesc)
    substrate_type: str = Field(..., description=validationDesc)
    expected_harvest_date: datetime = Field(..., description=validationDesc)


class LotCreateResponse(BaseModel):
    id: int


# fetch all lots
class LotsGet(BaseModel):
    user_id: int


class LotsGetResponse(BaseModel):
    id: int
    user_id: int
    microgreen_id: int
    sowing_date: datetime
    substrate_type: str
    expected_harvest_date: datetime
    created_at: datetime
    avatar_url: str

    class Config:
        from_attributes = True

class LotDetailResponse(BaseModel):
    id: int
    user_id: int
    microgreen_id: int
    sowing_date: datetime
    substrate_type: str
    expected_harvest_date: datetime
    created_at: datetime
    avatar_url: str
    entries: List[EntryRead] = []

    class Config:
        from_attributes = True