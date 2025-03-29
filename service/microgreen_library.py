from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from data.config import new_session, MicrogreenOrm
from models.microgreen_library import MicrogreenRead


async def get_microgreens() -> List[MicrogreenRead] | None:
    async with new_session() as session:
        query = (
            select(MicrogreenOrm)
        )
        result = await session.execute(query)
        microgreen_models = result.scalars().all()
        microgreens = [MicrogreenRead.from_orm(i) for i in microgreen_models]
        return microgreens
