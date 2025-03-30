from fastapi import APIRouter, status, Depends
from web.helpers import get_current_user_id
from service import analysis as service

router = APIRouter(prefix="/lots", tags=["Analysis"])


@router.get("/{lot_id}/analysis", status_code=status.HTTP_200_OK)
async def create_notification(lot_id: int,
                              user_id: int = Depends(get_current_user_id)) -> dict | None:
    analyzed_plant_data = await service.get_cached_analysis(lot_id, user_id)
    return analyzed_plant_data

