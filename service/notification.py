from sqlalchemy import select
from typing import List
from fastapi import HTTPException, status
from data.config import new_session, NotificationOrm
from models.notification import ReadNotification, CreateNotification
from service import lot


async def create_notification(data: CreateNotification, lot_id: int, user_id: int) -> ReadNotification | None:
    lot_model = await lot.get_lot_detail(lot_id)
    if not lot_model:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot_model.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access Forbidden!")
    try:
        async with new_session() as session:
            entry_dict = data.model_dump()
            entry_model = NotificationOrm(**entry_dict, lot_id=lot_id)
            session.add(entry_model)
            await session.flush()
            await session.commit()
            entry = ReadNotification.from_orm(entry_model)
            return entry
    except Exception as e:
        print(f"Error creating notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to create notification")


async def get_notifications(lot_id: int, user_id: int) -> List[ReadNotification] | None:
    lot_model = await lot.get_lot_detail(lot_id)
    if not lot_model:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot_model.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access Forbidden!")
    try:
        async with new_session() as session:
            result = await session.execute(select(NotificationOrm).filter(NotificationOrm.lot_id == lot_id))
            entries = result.scalars().all()

            if not entries:
                return []

            return [ReadNotification.from_orm(entry) for entry in entries]
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")


async def delete_notification(lot_id: int, notification_id: int, user_id: int) -> dict:
    lot_model = await lot.get_lot_detail(lot_id)
    if not lot_model:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot_model.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access Forbidden!")

    async with new_session() as session:
        result = await session.execute(
            select(NotificationOrm).where(
                NotificationOrm.id == notification_id,
                NotificationOrm.lot_id == lot_id
            )
        )
        notification = result.scalars().first()

        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found in the specified lot")

        await session.delete(notification)
        await session.commit()

    return {"detail": "Notification successfully deleted"}
