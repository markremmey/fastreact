# backend/app/schemas.py
from pydantic import BaseModel
from uuid import UUID
from fastapi_users import schemas

class UserRead(schemas.BaseUser[UUID]):
    pass

class UserCreate(schemas.BaseUserCreate):
    pass

class UserUpdate(schemas.BaseUserUpdate):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"