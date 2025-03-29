import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from data.config import create_tables, delete_tables, seed_microgreens_library
from web import user, lot, entry
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
app.add_middleware(AuthMiddleware)
app.include_router(user.router)
app.include_router(lot.router)

app.include_router(entry.router)


if __name__ == '__main__':
    uvicorn.run("main:app", reload=True)