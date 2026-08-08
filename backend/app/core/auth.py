from fastapi import Header, HTTPException, Depends
from jose import jwt, JWTError
import httpx
from app.config import settings

CLERK_JWKS_URL = "https://api.clerk.com/v1/jwks"
_jwks_cache = None


async def _get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(CLERK_JWKS_URL, headers={
                    "Authorization": f"Bearer {settings.clerk_secret_key}"
                })
                if res.status_code == 200:
                    _jwks_cache = res.json()
            except Exception:
                pass
    return _jwks_cache


async def get_current_user_id(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")

    token = authorization.replace("Bearer ", "")

    # For development: if no Clerk key configured, extract from token payload without verification
    if not settings.clerk_secret_key:
        try:
            payload = jwt.get_unverified_claims(token)
            user_id = payload.get("sub", "")
            if user_id:
                return user_id
        except Exception:
            pass
        raise HTTPException(status_code=401, detail="Invalid token")

    # Production: verify with Clerk JWKS
    try:
        jwks = await _get_jwks()
        if jwks:
            payload = jwt.decode(token, jwks, algorithms=["RS256"], options={"verify_aud": False})
            return payload.get("sub", "")
    except JWTError:
        pass

    raise HTTPException(status_code=401, detail="Invalid token")
