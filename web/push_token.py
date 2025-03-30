from fastapi import APIRouter, security, status, Depends, HTTPException
from sqlalchemy import select

from data.config import new_session, UserOrm
from models.user import PushTokenUpdate
from web.helpers import get_current_user_id

router = APIRouter(prefix="/user", tags=["User"])

oauth2schema = security.OAuth2PasswordBearer(tokenUrl="user/login")



@router.post("/push-token", status_code=status.HTTP_200_OK)
async def update_push_token(token_data: PushTokenUpdate, user_id: int = Depends(get_current_user_id)):
    async with new_session() as session:
        query = select(UserOrm).where(UserOrm.id == user_id)
        result = await session.execute(query)
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.expo_push_token = token_data.expo_push_token
        await session.commit()
        return {"detail": "Push token updated successfully"}