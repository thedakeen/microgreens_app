from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
from sqlalchemy import select
from data.config import new_session, NotificationOrm, LotOrm, UserOrm

from exponent_server_sdk import PushClient, PushMessage
import asyncio

async def send_expo_notification(expo_push_token: str, body: str):
    message = PushMessage(
        to=expo_push_token,
        title="notification",
        body=body,
    )
    try:
        result = await asyncio.to_thread(lambda: PushClient().publish(message))
        return result
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return None

async def check_and_send_notifications():
    async with new_session() as session:
        query = select(NotificationOrm).where(
            NotificationOrm.scheduled_at <= datetime.utcnow(),
            NotificationOrm.is_delivered == False
        )

        result = await session.execute(query)
        notifications = result.scalars().all()

        for notif in notifications:
            lot = await session.get(LotOrm, notif.lot_id)
            if not lot:
                continue
            user = await session.get(UserOrm, lot.user_id)
            if not user or not user.expo_push_token:
                print(f"User {lot.user_id} has no expo push token")
                continue

            body = notif.message
            result = await send_expo_notification(user.expo_push_token, body)
            if result and result.get("success", False):
                notif.is_delivered = True
            else:
                print(f"Failed to send notification {notif.id}")

        await session.commit()

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_and_send_notifications, 'interval', minutes=1)
    scheduler.start()
    print("Push scheduler started.")
