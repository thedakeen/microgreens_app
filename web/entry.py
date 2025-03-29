from fastapi import APIRouter, status, security, Depends

from models.entry import EntryCreate, EntryRead
from typing import List
from service import entry as service

router = APIRouter(prefix="/lots", tags=["Entries"])


@router.post("/{lot_id}/entry", status_code=status.HTTP_201_CREATED)
async def create_entry(entry: EntryCreate, lot_id: int) -> EntryRead | None:
    created_entry = await service.create_entry(entry, lot_id)
    return created_entry


@router.get("/{lot_id}/entries", status_code=status.HTTP_200_OK)
async def get_entries(lot_id: int) -> List[EntryRead] | None:
    fetched_entries = await service.get_entries(lot_id)
    return fetched_entries
