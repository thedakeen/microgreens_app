import os
import shutil
import uuid
from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select

from data.config import new_session, EntryOrm
from models.entry import EntryCreate, EntryRead
from typing import List

from service import lot, analysis


async def save_photo(upload: UploadFile, upload_dir: str = "../static/images/entries/") -> str:
    os.makedirs(upload_dir, exist_ok=True)
    file_extension = os.path.splitext(upload.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    # abs_path = os.path.abspath(file_path)
    # print(f"Saving file to: {abs_path}")

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save photo"
        )
    return file_path


async def create_entry(data: EntryCreate, lot_id: int, photo_url: str) -> EntryRead:
    try:
        async with new_session() as session:
            entry_dict = data.model_dump()
            entry_dict["photo_url"] = photo_url
            entry_model = EntryOrm(**entry_dict, lot_id=lot_id)
            session.add(entry_model)
            await session.flush()
            await session.commit()
            entry = EntryRead.from_orm(entry_model)
            await analysis.analyze_plant_data(lot_id)
            return entry
    except AttributeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some parameters do not exist"
        )


async def get_entries(lot_id: int) -> List[EntryRead] | None:
    try:
        async with new_session() as session:
            result = await session.execute(
                (select(EntryOrm).filter(EntryOrm.lot_id == lot_id))
            )
            entries = result.scalars().all()
            if not entries:
                return None
            return [EntryRead.from_orm(entry) for entry in entries]
    except Exception as e:
        print(f"Error fetching entries: {e}")
        return None


async def delete_entry(lot_id: int, entry_id: int, user_id: int) -> dict:
    lot_model = await lot.get_lot_detail(lot_id)
    if not lot_model:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot_model.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access Forbidden!")

    try:
        async with new_session() as session:
            result = await session.execute(
                select(EntryOrm).where(
                    EntryOrm.id == entry_id,
                    EntryOrm.lot_id == lot_id
                )
            )
            entry = result.scalars().first()

            if not entry:
                raise HTTPException(status_code=404, detail="Entry not found in the specified lot")

            await session.delete(entry)
            await session.commit()

        return {"detail": "Entry successfully deleted"}

    except Exception as e:
        print(f"Error deleting entry: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete entry")
