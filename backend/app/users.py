# backend/app/users.py
import os, uuid
from typing import Optional
from fastapi import Depends, Request, APIRouter, Response
from fastapi_users import FastAPIUsers, BaseUserManager, UUIDIDMixin, models, schemas
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
    Strategy,
)
from fastapi_users.password import PasswordHelper
from httpx_oauth.clients.google import GoogleOAuth2
import logging
from fastapi.responses import RedirectResponse

from app.db import User, get_user_db  # our SQLAlchemy models and user DB dependency
from app.schemas import UserCreate, UserRead, UserUpdate  # Pydantic user schemas
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)

load_dotenv()
logging.info(f"GOOGLE_OAUTH_CLIENT_ID: {os.getenv('GOOGLE_OAUTH_CLIENT_ID')}")
logging.info(f"GOOGLE_OAUTH_CLIENT_SECRET: {os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')}")
router = APIRouter()
# OAuth client setup for Google
google_oauth_client = GoogleOAuth2(
    os.getenv("GOOGLE_OAUTH_CLIENT_ID"),
    os.getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
    name="google",
    scopes=["openid", "email", "profile"],
)

# Secret used for JWT tokens and OAuth state (should be a strong random value in production)
SECRET = os.getenv("SECRET", "CHANGE_THIS_IN_PRODUCTION")

# Define the UserManager class required by FastAPI Users to handle user events
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logging.info(f"User {user.email} registered.")

    # (Optionally override other event hooks like on_after_forgot_password, etc.)

# Dependency to get UserManager
async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

# Authentication backend using JWT tokens in Authorization header (Bearer auth)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
def get_jwt_strategy() -> JWTStrategy:
    logging.info("JWT Strategy invoked, a token will be generated.")
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy
)

class OAuthRedirectAuthenticationBackend(AuthenticationBackend):
    async def login(
        self, strategy: Strategy, user: User, response: Optional[Response] = None
    ) -> Response:
        token = await strategy.write_token(user)
        frontend_url = os.environ.get("FRONTEND_URL", "http://127.0.0.1:5173")
        redirect_url = f"{frontend_url}/auth/callback?token={token}"
        return RedirectResponse(redirect_url)

oauth_redirect_backend = OAuthRedirectAuthenticationBackend(
    name="google-oauth-redirect",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPIUsers instance helps generate routers for auth
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend]  # list of authentication backends (here only JWT)
)

# Current active user dependency for protected routes
current_active_user = fastapi_users.current_user(active=True)
