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


class MicrogreenOrm(Base):
    __tablename__ = 'microgreens_library'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    days_to_grow: Mapped[int]
    temperature: Mapped[str]
    light: Mapped[str]
    avatar: Mapped[str]

    lots: Mapped[list['Lots']] = relationship('Lots', back_populates='microgreen')


class UserOrm(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str]
    hashed_password: Mapped[str]
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lots: Mapped[list['Lots']] = relationship('Lots', back_populates='user', cascade="all, delete")
    notifications: Mapped[list['Notifications']] = relationship('Notifications', back_populates='user',
                                                                cascade="all, delete")


class Lots(Base):
    __tablename__ = 'lots'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    microgreen_type: Mapped[int] = mapped_column(ForeignKey('microgreens_library.id', ondelete='CASCADE'),
                                                 nullable=False)
    sowing_date: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    substrate_type: Mapped[str]
    expected_harvest_date: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    user: Mapped['UserOrm'] = relationship('UserOrm', back_populates='lots')
    microgreen: Mapped['MicrogreenOrm'] = relationship('MicrogreenOrm', back_populates='lots')
    entries: Mapped[list['Entries']] = relationship('Entries', back_populates='lot', cascade="all, delete")


class Entries(Base):
    __tablename__ = 'entries'

    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey('lots.id', ondelete='CASCADE'), nullable=False)
    entry_date: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    description: Mapped[str]
    photo_url: Mapped[str]
    height: Mapped[float]
    moisture: Mapped[float]
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lot: Mapped['Lots'] = relationship('Lots', back_populates='entries')


class Notifications(Base):
    __tablename__ = 'notifications'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message: Mapped[str]
    scheduled_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    is_delivered: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    user: Mapped['UserOrm'] = relationship('UserOrm', back_populates='notifications')
