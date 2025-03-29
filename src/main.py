import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from data.config import create_tables, delete_tables
from web import user
from tools.аuthMiddleware import AuthMiddleware
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # await delete_tables()
    # print("База пустая")
    await create_tables()
    print("База готова к работе")
    yield
    print("Выключение")


app = FastAPI(lifespan=lifespan)
app.add_middleware(AuthMiddleware)
app.include_router(user.router)


if __name__ == '__main__':
    uvicorn.run("main:app", reload=True)