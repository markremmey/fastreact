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
    CookieTransport
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

# Authentication backend using JWT tokens in Cookie transport
# For production, you'd want cookie_secure=True. For local dev, False.
cookie_transport = CookieTransport(cookie_name="fastreact", cookie_max_age=3600, cookie_secure=False)
def get_jwt_strategy() -> JWTStrategy:
    logging.info("Cookie strategy invoked, a token will be generated.")
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy
)

class OAuthRedirectAuthenticationBackend(AuthenticationBackend):
    async def login(self, strategy: Strategy, user: User) -> Response:
        token = await strategy.write_token(user)
        frontend_url = os.environ.get("FRONTEND_URL", "http://127.0.0.1:5173")
        
        redirect_response = RedirectResponse(f"{frontend_url}/profile")
        
        redirect_response.set_cookie(
            key=self.transport.cookie_name,
            value=token,
            max_age=self.transport.cookie_max_age,
            path=self.transport.cookie_path,
            domain=self.transport.cookie_domain,
            secure=self.transport.cookie_secure,
            httponly=self.transport.cookie_httponly,
            samesite=self.transport.cookie_samesite,
        )
        
        return redirect_response

oauth_redirect_backend = OAuthRedirectAuthenticationBackend(
    name="google-oauth-redirect",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPIUsers instance helps generate routers for auth
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend, oauth_redirect_backend]  # list of authentication backends (here only JWT and OAuth)
)

# Current active user dependency for protected routes
current_active_user = fastapi_users.current_user(active=True)
