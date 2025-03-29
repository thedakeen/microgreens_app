from fastapi import APIRouter, status, security, Depends, HTTPException

from models.entry import EntryCreate, EntryRead
from typing import List
from service import entry as service
from service.lot import get_lot_detail
from web.helpers import get_current_user_id

router = APIRouter(prefix="/lots", tags=["Entries"])


# @router.post("/{lot_id}/entry", status_code=status.HTTP_201_CREATED)
# async def create_entry(entry: EntryCreate, lot_id: int) -> EntryRead | None:
#     created_entry = await service.create_entry(entry, lot_id)
#     return created_entry

@router.post("/{lot_id}/entry", response_model=EntryRead, status_code=status.HTTP_201_CREATED)
async def create_entry_endpoint(
    lot_id: int,
    entry: EntryCreate,
    current_user_id: int = Depends(get_current_user_id)
):
    lot = await get_lot_detail(lot_id)
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    if lot.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to add an entry to this lot"
        )
    created_entry = await service.create_entry(entry, lot_id)
    return created_entry


@router.get("/{lot_id}/entries",  status_code=status.HTTP_200_OK)
async def get_entries(lot_id: int) -> List[EntryRead] | None:
    fetched_entries = await service.get_entries(lot_id)
    return fetched_entries
