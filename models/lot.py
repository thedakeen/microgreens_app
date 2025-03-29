from pydantic import BaseModel, Field
from datetime import datetime


validationDesc = "This field is required"


# lot creating logic
class LotCreate(BaseModel):
    microgreen_type: int = Field(..., description=validationDesc)
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
    microgreen_type: int
    sowing_date: datetime
    substrate_type: str
    expected_harvest_date: datetime
    created_at: datetime
    avatar_url: str