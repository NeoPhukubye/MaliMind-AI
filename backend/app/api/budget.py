from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.schemas import BudgetRequest, BudgetResponse
from app.database.db import get_db
from app.core.auth import get_current_user_id
from app.models.models import BudgetData

router = APIRouter()


@router.get("", response_model=BudgetResponse)
async def get_budget(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BudgetData).where(BudgetData.user_id == user_id)
    )
    budget = result.scalar_one_or_none()
    if not budget:
        return BudgetResponse(categories=[], income=0)
    return BudgetResponse(categories=budget.categories or [], income=budget.income)


@router.post("")
async def save_budget(
    req: BudgetRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BudgetData).where(BudgetData.user_id == user_id)
    )
    budget = result.scalar_one_or_none()

    if budget:
        budget.categories = [c.model_dump() for c in req.categories]
        budget.income = req.income
    else:
        budget = BudgetData(
            user_id=user_id,
            categories=[c.model_dump() for c in req.categories],
            income=req.income,
        )
        db.add(budget)

    await db.commit()
    return {"status": "saved"}
