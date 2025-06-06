# backend/app/db.py
from typing import AsyncGenerator, List
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, relationship, DeclarativeMeta, declarative_base, Mapped, mapped_column
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyBaseOAuthAccountTableUUID, SQLAlchemyUserDatabase
from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")  # using SQLite file database

Base: DeclarativeMeta = declarative_base()

class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    """OAuth account model (stores external account details)."""
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):
    """User model (extends FastAPI Users base with OAuth relationship)."""
    oauth_accounts: Mapped[List[OAuthAccount]] = relationship("OAuthAccount", lazy="joined")

# Create async engine and session maker
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Create the DB tables on startup (for simplicity, using SQLite without Alembic migrations)
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency to get an async DB session
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# Dependency to get the User database adapter for FastAPI Users
async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)
