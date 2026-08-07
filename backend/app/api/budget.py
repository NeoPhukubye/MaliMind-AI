from fastapi import APIRouter
from app.schemas.schemas import BudgetRequest, BudgetResponse

router = APIRouter()

# In-memory store for MVP (replace with DB in production)
_budget_store = {}


@router.get("")
async def get_budget():
    data = _budget_store.get("default", {"categories": [], "income": 0})
    return data


@router.post("")
async def save_budget(req: BudgetRequest):
    _budget_store["default"] = {
        "categories": [c.model_dump() for c in req.categories],
        "income": req.income,
    }
    return {"status": "saved"}
