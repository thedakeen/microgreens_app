from fastapi import APIRouter, status, Depends
from typing import List
from models.notification import CreateNotification, ReadNotification
from web.helpers import get_current_user_id
from service import notification as service

router = APIRouter(prefix="/lots", tags=["Notifications"])


@router.post("/{lot_id}/notification", status_code=status.HTTP_201_CREATED)
async def create_notification(notif: CreateNotification, lot_id: int,
                              user_id: int = Depends(get_current_user_id)) -> ReadNotification | None:
    created_notification = await service.create_notification(notif, lot_id, user_id)
    return created_notification


@router.get("/{lot_id}/notifications", status_code=status.HTTP_200_OK)
async def get_notifications(lot_id: int, user_id: int = Depends(get_current_user_id)) -> List[ReadNotification] | None:
    fetched_notification = await service.get_notifications(lot_id, user_id)
    return fetched_notification


@router.delete("/{lot_id}/notifications/{notification_id}", status_code=status.HTTP_200_OK)
async def delete_notification(lot_id: int, notification_id: int,
                              user_id: int = Depends(get_current_user_id)) -> dict | None:
    deleted_notification = await service.delete_notification(lot_id, notification_id, user_id)
    return deleted_notification
