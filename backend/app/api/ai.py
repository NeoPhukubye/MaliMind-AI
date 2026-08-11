from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.schemas import CoachRequest, CoachResponse
from app.services.ai_service import get_coach_response
from app.services.revenuecat_service import increment_message_count
from app.services.analytics import calculate_financial_score
from app.database.db import get_db
from app.core.auth import get_current_user_id
from app.models.models import BudgetData, SavingsData

router = APIRouter()


@router.post("/coach", response_model=CoachResponse)
async def coach(
    req: CoachRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Enforce message limit server-side
    limit_check = await increment_message_count(user_id, db)
    if not limit_check["allowed"]:
        raise HTTPException(
            status_code=429,
            detail=f"Daily message limit reached ({limit_check['limit']} messages). Upgrade to Pro for unlimited access.",
        )

    # Fetch user's financial data for context-aware responses
    budget_result = await db.execute(select(BudgetData).where(BudgetData.user_id == user_id))
    budget = budget_result.scalar_one_or_none()

    savings_result = await db.execute(select(SavingsData).where(SavingsData.user_id == user_id))
    savings = savings_result.scalar_one_or_none()

    income = budget.income if budget else 0
    categories = budget.categories if budget else []
    goals = savings.goals if savings else []
    total_spent = sum(c.get("spent", 0) for c in categories)
    total_savings = sum(g.get("saved", 0) for g in goals)

    financial_context = {
        "income": income,
        "categories": categories,
        "goals": goals,
        "financial_score": calculate_financial_score(
            income=income, expenses=total_spent, savings=total_savings, debt=0
        ),
    }

    response = await get_coach_response(req.message, req.history, financial_context)
    return CoachResponse(response=response)
