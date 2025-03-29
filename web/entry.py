from fastapi import APIRouter, status, security, Depends

from models.entry import EntryCreate, EntryRead

from service import entry as service

router = APIRouter(prefix="/lots", tags=["Entries"])


@router.post("/{lot_id}/entry", status_code=status.HTTP_201_CREATED)
async def create_entry(entry: EntryCreate, lot_id: int) -> EntryRead | None:
    created_entry = await service.create_entry(entry, lot_id)
    return created_entry

