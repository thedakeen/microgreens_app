from sys import prefix

from fastapi import APIRouter
from fastapi.params import Depends

from models.lot import LotCreate, LotCreateResponse
from service import lot as lot_service
from web.helpers import get_current_user_id

router = APIRouter(prefix="/lots", tags=["Lots"])


@router.post("/", response_model=LotCreateResponse)
async def create_lot(lot: LotCreate, user_id: int = Depends(get_current_user_id)):
    lot = await lot_service.create_lot(lot_data=lot, user_id=user_id)
    return LotCreateResponse(id=lot.id)
