from sys import prefix

from fastapi import APIRouter
from fastapi.params import Depends
from typing import List

from models.lot import LotCreate, LotCreateResponse, LotsGetResponse
from service import lot as lot_service
from web.helpers import get_current_user_id

router = APIRouter(prefix="/lots", tags=["Lots"])


@router.post("/", response_model=LotCreateResponse)
async def create_lot(lot: LotCreate, user_id: int = Depends(get_current_user_id)):
    lot = await lot_service.create_lot(lot_data=lot, user_id=user_id)
    return LotCreateResponse(id=lot.id)


@router.get("/", response_model=List[LotsGetResponse])
async def get_all_lots(current_user_id: int = Depends(get_current_user_id)):
    lots = await lot_service.get_lots(current_user_id)
    response = []
    for lot in lots:
        response.append(LotsGetResponse(
            id=lot.id,
            user_id=lot.user_id,
            microgreen_type=lot.microgreen_id,
            sowing_date=lot.sowing_date,
            substrate_type=lot.substrate_type,
            expected_harvest_date=lot.expected_harvest_date,
            created_at=lot.created_at,
            avatar_url=lot.microgreen.avatar if lot.microgreen else ""
        ))
    return response
