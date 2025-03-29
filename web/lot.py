from sys import prefix

from fastapi import APIRouter, status, HTTPException
from fastapi.params import Depends
from typing import List

from models.lot import LotCreate, LotCreateResponse, LotsGetResponse, LotDetailResponse
from service import lot as lot_service
from service import entry as entry_service
from service.entry import delete_entry
from web.helpers import get_current_user_id

router = APIRouter(prefix="/lots", tags=["Lots"])


@router.post("/", response_model=LotCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_lot(lot: LotCreate, user_id: int = Depends(get_current_user_id)):
    lot = await lot_service.create_lot(lot_data=lot, user_id=user_id)
    return LotCreateResponse(id=lot.id)


@router.get("/", response_model=List[LotsGetResponse], status_code=status.HTTP_200_OK)
async def get_all_lots(current_user_id: int = Depends(get_current_user_id)):
    lots = await lot_service.get_lots(current_user_id)
    response = []
    for lot in lots:
        response.append(LotsGetResponse(
            id=lot.id,
            user_id=lot.user_id,
            microgreen_id=lot.microgreen_id,
            sowing_date=lot.sowing_date,
            substrate_type=lot.substrate_type,
            expected_harvest_date=lot.expected_harvest_date,
            created_at=lot.created_at,
            avatar_url=lot.microgreen.avatar if lot.microgreen else ""
        ))
    return response


@router.get("/{lot_id}", response_model=LotDetailResponse, status_code=status.HTTP_200_OK)
async def get_lot_detail_endpoint(lot_id: int, current_user_id: int = Depends(get_current_user_id)):
    lot = await lot_service.get_lot_detail(lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    if lot.user_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to access this lot")

    lot_data = {
        "id": lot.id,
        "user_id": lot.user_id,
        "microgreen_id": lot.microgreen_id,
        "sowing_date": lot.sowing_date,
        "substrate_type": lot.substrate_type,
        "expected_harvest_date": lot.expected_harvest_date,
        "created_at": lot.created_at,
        "avatar_url": lot.microgreen.avatar if lot.microgreen else "",
        "entries": lot.entries
    }
    return lot_data


@router.delete("/{lot_id}", status_code=status.HTTP_200_OK)
async def delete_lot(lot_id: int,
                            user_id: int = Depends(get_current_user_id)) -> dict | None:
    deleted_lot = await lot_service.delete_lot(lot_id, user_id)
    return deleted_lot


@router.delete("/{lot_id}/entry/{entry_id}", status_code=status.HTTP_200_OK)
async def delete_notification(lot_id: int, entry_id: int,
                              user_id: int = Depends(get_current_user_id)) -> dict | None:
    deleted_entry = await entry_service.delete_entry(lot_id, entry_id, user_id)
    return deleted_entry

