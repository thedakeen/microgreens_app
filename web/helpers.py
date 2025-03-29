from fastapi import HTTPException
from fastapi.params import Depends
from fastapi import HTTPException, status
from service.user import verify_token
from tools.аuthMiddleware import oauth2_scheme


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    user = await verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return int(user.id)