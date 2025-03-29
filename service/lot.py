from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from data.config import new_session, Lots
from models.lot import LotCreate, LotCreateResponse


async def create_lot(lot_data: LotCreate, user_id: int) -> LotCreateResponse:
    async with new_session() as session:
        new_lot = Lots(
            user_id=user_id,
            microgreen_type=lot_data.microgreen_type,
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