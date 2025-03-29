import os
from sqlalchemy import ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import Mapped, mapped_column, declarative_base, relationship


DATABASE_URL = "sqlite+aiosqlite:///../db/microgreens_db.sqlite"

engine = create_async_engine(DATABASE_URL)
new_session = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def delete_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


class DatabaseOrm(Base):
    __tablename__ = 'databases'
    __table_args__ = (
        UniqueConstraint('user_id', 'db_name', name='unique_database_name'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    db_name: Mapped[str]
    user: Mapped['UserOrm'] = relationship('UserOrm', back_populates='databases')


class UserOrm(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str]
    hashed_password: Mapped[str]
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    databases: Mapped[list[DatabaseOrm] | None] = relationship(
        'DatabaseOrm', back_populates='user', cascade="all, delete"
    )
