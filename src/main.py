import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from data.config import create_tables, delete_tables, seed_microgreens_library
from web import user, lot, entry, microgreen_library, notification
from tools.аuthMiddleware import AuthMiddleware
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # await delete_tables()
    # print("База пустая")
    await create_tables()
    print("База готова к работе")

    from data.config import seed_microgreens_library
    await seed_microgreens_library()

    yield
    print("Выключение")


app = FastAPI(lifespan=lifespan)


base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_dir = os.path.join(base_dir, "static")

app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user.router)
app.include_router(lot.router)
app.include_router(entry.router)
app.include_router(microgreen_library.router)
app.include_router(entry.router)
app.include_router(notification.router)


if __name__ == '__main__':
    uvicorn.run("main:app", reload=True)