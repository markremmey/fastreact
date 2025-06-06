# backend/app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db import create_db_and_tables
from app.users import fastapi_users, auth_backend, google_oauth_client, current_active_user, oauth_redirect_backend
from app.schemas import UserRead, UserCreate, UserUpdate
import os
import logging
logging.basicConfig(level=logging.INFO)
from dotenv import load_dotenv
load_dotenv()
SECRET = os.getenv("SECRET", "CHANGE_THIS_IN_PRODUCTION")
app = FastAPI()
# CORS settings – allow the React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1",
        "https://lyceum-app.com",
        "https://www.lyceum-app.com",
    ],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include FastAPI Users authentication routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"]
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"]
)
# OAuth router for Google – directs users to Google's consent page and handles callbacks
# Creates /auth/google/authorize and /auth/google/callback
# /auth/google/authorize redirects to Google's consent page
# /auth/google/callback handles the callback from Google and redirects to the frontend
# This is specified via the frontend_url in the OAuthRedirectAuthenticationBackend class in users.py
app.include_router(
    fastapi_users.get_oauth_router(
        oauth_client=google_oauth_client,
        backend=oauth_redirect_backend,
        state_secret=SECRET,
        associate_by_email=True,
        is_verified_by_default=True,
    ),
    prefix="/auth/google",
    tags=["auth"]
)
# Protected route example (requires a valid authenticated user)
@app.get("/profile")
async def read_profile(user=Depends(current_active_user)):
    return {"email": user.email, "id": str(user.id)}

# Create DB tables at startup (for SQLite)
@app.on_event("startup")
async def startup_event():
    logging.info("Creating DB tables")
    await create_db_and_tables()
