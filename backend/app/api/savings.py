from fastapi import APIRouter
from app.schemas.schemas import SavingsRequest

router = APIRouter()

_savings_store = {}


@router.get("")
async def get_savings():
    data = _savings_store.get("default", {"goals": []})
    return data


@router.post("")
async def save_savings(req: SavingsRequest):
    _savings_store["default"] = {"goals": [g.model_dump() for g in req.goals]}
    return {"status": "saved"}
