from fastapi import APIRouter, Depends
from app.schemas.schemas import AuthRequest, UserResponse
from app.services.budget_service import get_dashboard_data

router = APIRouter()


@router.post("/auth")
async def authenticate(req: AuthRequest):
    # In production, verify Clerk JWT token here
    return {
        "access_token": req.token,
        "user": {"id": "user-1", "email": "user@example.com", "name": "User"},
    }


@router.get("/me")
async def get_current_user():
    return {"id": "user-1", "email": "user@example.com", "name": "User", "is_pro": False}


@router.get("/dashboard")
async def dashboard():
    return get_dashboard_data()
