from pydantic import BaseModel


class MicrogreenRead(BaseModel):
    id: int
    name: str
    days_to_grow: int
    temperature: str
    light: str
    avatar: str

    class Config: from_attributes = True
