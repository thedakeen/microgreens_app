from fastapi import HTTPException, status
from sqlalchemy import select
from data.config import new_session
from typing import List
from service import entry, lot
import g4f
from g4f.client import AsyncClient
from g4f.Provider.OIVSCode import OIVSCode
from cachetools import LRUCache
from models import entry as entry_mod
from models import lot as lot_mod
from datetime import datetime

cache = LRUCache(maxsize=100)


async def request_to_AI(path: str, entries: List[entry_mod.EntryRead], lot_model: lot_mod.LotDetailResponse):
    client = AsyncClient(
        provider=OIVSCode
    )

    image = open(path, "rb")
    prompt = f"""
        Вот данные о растении (история изменений во времени):\n\n{entries}

        Фото последней записи (используйте для визуального анализа):\n

        Дата посева: {lot_model.sowing_date}  
        Ожидаемая дата сбора урожая: {lot_model.expected_harvest_date}  
        Текущая дата: {datetime.now()}  
        Осталось дней до сбора: {(lot_model.expected_harvest_date - datetime.now()).days}  
        
        ВАЖНО: учитывай количество данных о истории изменений растений при анализе, не делай поспешных выводов при недостаточной осведомленности

        Проведи анализ и опиши по каждому пункту строго в таком формате по 10-15 слов на каждый пункт, учитывай вопросы в скобках при ответе:

        1️⃣ Динамика роста: ТЕКСТ (Как изменялась высота растения во времени? Есть ли отклонения в росте?)

        2️⃣ Влажность: ТЕКСТ (Как менялся уровень влажности? Есть ли признаки чрезмерного или недостаточного полива?)

        3️⃣ Общее состояние растения: ТЕКСТ (Оцените внешний вид растения по последнему фото. Есть ли пожелтение, увядание или другие визуальные признаки проблем?)

        4️⃣ Рекомендации по уходу: ТЕКСТ (Требуется ли изменение режима полива, освещения или удобрений?)

        6️⃣ **Прогноз на сбор урожая**: ТЕКСТ (Успеют ли ростки вырасти до ожидаемой даты сбора? Сколько составит рисе задержки урожая (в погрешности пару дней)
        """

    response = await client.chat.completions.create(
        model=g4f.models.default,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        image=image
    )

    return response.choices[0].message.content


async def analyze_plant_data(lot_id: int):
    entries = await entry.get_entries(lot_id)
    if not entries:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough data!")

    cache.pop(lot_id, None)

    lot_detail = await lot.get_lot_detail(lot_id)
    latest_image_path = entries[-1].photo_url
    response = await request_to_AI(latest_image_path, entries, lot_detail)

    cache[lot_id] = response


async def get_cached_analysis(lot_id: int, user_id: int) -> dict | None:
    lot_model = await lot.get_lot_detail(lot_id)
    if not lot_model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
    if lot_model.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You are not allowed to add an entry to this lot"
        )
    cached_result = cache.get(lot_id)
    if cached_result:
        return {"result": cached_result}

    else:
        await analyze_plant_data(lot_id)