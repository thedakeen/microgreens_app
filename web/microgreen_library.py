from fastapi import APIRouter, status
from typing import List
from models.microgreen_library import MicrogreenRead

from service import microgreen_library as service

router = APIRouter(prefix="/microgreens", tags=["Microgreen_library"])


@router.get("", status_code=status.HTTP_200_OK)
async def get_microgreens() -> List[MicrogreenRead] | None:
    fetched_microgreens = await service.get_microgreens()
    return fetched_microgreens
