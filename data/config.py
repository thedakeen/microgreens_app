import os
from sqlalchemy import ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import Mapped, mapped_column, declarative_base, relationship
from sqlalchemy import select

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'db', 'microgreens_db.sqlite')}"

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
    __table_args__ = (
        UniqueConstraint('name', name='unique_microgreen_name'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    days_to_grow: Mapped[int]
    temperature: Mapped[str]
    light: Mapped[str]
    avatar: Mapped[str]

    lots: Mapped[list['LotOrm'] | None] = relationship('LotOrm', back_populates='microgreen', cascade="all, delete")


class UserOrm(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint('email', name='unique_user_email'),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str]
    hashed_password: Mapped[str]
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lots: Mapped[list['LotOrm'] | None] = relationship('LotOrm', back_populates='user', cascade="all, delete")


class LotOrm(Base):
    __tablename__ = 'lots'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    microgreen_id: Mapped[int] = mapped_column(ForeignKey('microgreens_library.id', ondelete='CASCADE'), nullable=False)
    sowing_date: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    substrate_type: Mapped[str]
    expected_harvest_date: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    user: Mapped['UserOrm'] = relationship('UserOrm', back_populates='lots')
    microgreen: Mapped['MicrogreenOrm'] = relationship('MicrogreenOrm', back_populates='lots')
    entries: Mapped[list['EntryOrm'] | None] = relationship('EntryOrm', back_populates='lot', cascade="all, delete")
    notifications: Mapped[list['NotificationOrm'] | None] = relationship('NotificationOrm', back_populates='lot',
                                                                         cascade="all, delete")


class EntryOrm(Base):
    __tablename__ = 'entries'
    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey('lots.id', ondelete='CASCADE'), nullable=False)
    entry_date: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    description: Mapped[str]
    photo_url: Mapped[str]
    height: Mapped[float]
    moisture: Mapped[float]
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lot: Mapped['LotOrm'] = relationship('LotOrm', back_populates='entries')


class NotificationOrm(Base):
    __tablename__ = 'notifications'
    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey('lots.id', ondelete='CASCADE'), nullable=False)
    message: Mapped[str]
    scheduled_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    is_delivered: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    lot: Mapped['LotOrm'] = relationship('LotOrm', back_populates='notifications')


async def seed_microgreens_library():
    async with new_session() as session:
        result = await session.execute(select(MicrogreenOrm))
        microgreens = result.scalars().all()
        if not microgreens:
            default_microgreens = [
                MicrogreenOrm(name="Basil", days_to_grow=15, temperature="22", light="Bright",
                              avatar="avatar_basil.png"),
                MicrogreenOrm(name="Radish", days_to_grow=10, temperature="20", light="Moderate",
                              avatar="avatar_radish.png"),
                MicrogreenOrm(name="Pea", days_to_grow=12, temperature="18", light="Bright", avatar="avatar_peas.png"),
                MicrogreenOrm(name="Sunflower", days_to_grow=10, temperature="22", light="Bright",
                              avatar="avatar_sunflower.png"),
                MicrogreenOrm(name="Cress", days_to_grow=7, temperature="20", light="Shade-Moderate",
                              avatar="avatar_cress.png"),
                MicrogreenOrm(name="Amaranth", days_to_grow=14, temperature="21", light="Bright",
                              avatar="avatar_amaranth.png"),
                MicrogreenOrm(name="Mustard", days_to_grow=8, temperature="20", light="Bright",
                              avatar="avatar_mustard.png"),
                MicrogreenOrm(name="Alfalfa", days_to_grow=9, temperature="19", light="Moderate",
                              avatar="avatar_alfalfa.png"),
                MicrogreenOrm(name="Broccoli", days_to_grow=11, temperature="22", light="Bright",
                              avatar="avatar_broccoli.png"),
                MicrogreenOrm(name="Spinach", days_to_grow=12, temperature="18", light="Moderate",
                              avatar="avatar_spinach.png"),
                MicrogreenOrm(name="Swiss Chard", days_to_grow=13, temperature="21", light="Bright",
                              avatar="avatar_chard.png"),
                MicrogreenOrm(name="Fennel", days_to_grow=14, temperature="20", light="Moderate",
                              avatar="avatar_fennel.png"),
                MicrogreenOrm(name="Arugula", days_to_grow=10, temperature="18", light="Bright",
                              avatar="avatar_arugula.png"),
                MicrogreenOrm(name="Lentil", days_to_grow=9, temperature="20", light="Moderate",
                              avatar="avatar_lentil.png"),
                MicrogreenOrm(name="Beet", days_to_grow=14, temperature="22", light="Bright", avatar="avatar_beet.png"),
            ]

            session.add_all(default_microgreens)
            await session.commit()
            print("Microgreens library seeded with default data.")
