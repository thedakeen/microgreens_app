from sqlalchemy import select, exc
from data.config import new_session, EntryOrm
from models.entry import EntryCreate, EntryRead
from fastapi import HTTPException, status


async def create_entry(data: EntryCreate, lot_id: int) -> EntryRead | None:
    try:
        async with new_session() as session:
            entry_dict = data.model_dump()
            entry_model = EntryOrm(**entry_dict, lot_id=lot_id)
            session.add(entry_model)
            await session.flush()
            await session.commit()
            entry = EntryRead.from_orm(entry_model)
            return entry
    except AttributeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Some parameters do not exist")

