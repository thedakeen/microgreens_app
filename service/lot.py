from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from typing import List, Optional

from data.config import new_session, LotOrm
from models.lot import LotCreate, LotCreateResponse, LotsGetResponse

async def create_lot(lot_data: LotCreate, user_id: int) -> LotCreateResponse:
    async with new_session() as session:
        new_lot = LotOrm(
            user_id=user_id,
            microgreen_id=lot_data.microgreen_id,
            sowing_date=lot_data.sowing_date,
            substrate_type=lot_data.substrate_type,
            expected_harvest_date=lot_data.expected_harvest_date,
        )
        session.add(new_lot)
        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise HTTPException(status_code=400, detail="Error creating lot")
        await session.refresh(new_lot)
        return LotCreateResponse(id=new_lot.id)


async def get_lots(user_id: int) -> List[LotOrm]:
    async with new_session() as session:
        query = (
            select(LotOrm)
            .where(LotOrm.user_id == user_id)
            .options(selectinload(LotOrm.microgreen))
        )
        result = await session.execute(query)
        lots = result.scalars().all()
        return lots


async def get_lot_detail(lot_id: int) -> Optional[LotOrm]:
    async with new_session() as session:
        query = (
            select(LotOrm)
            .where(LotOrm.id == lot_id)
            .options(
                selectinload(LotOrm.microgreen),
                selectinload(LotOrm.entries)
            )
        )
        result = await session.execute(query)
        lot = result.scalars().first()
        return lot


async def delete_lot(lot_id: int, user_id: int) -> dict:
    lot = await get_lot_detail(lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access Forbidden!")

    try:
        async with new_session() as session:
            result = await session.execute(
                select(LotOrm).where(
                    LotOrm.id == lot_id,
                    LotOrm.id == lot_id
                )
            )
            lot = result.scalars().first()

            if not lot:
                raise HTTPException(status_code=404, detail="Lot not found")

            await session.delete(lot)
            await session.commit()

        return {"detail": "Lot successfully deleted"}

    except Exception as e:
        print(f"Error deleting lot: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete lot")