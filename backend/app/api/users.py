from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.schemas import AuthRequest, UserResponse
from app.database.db import get_db
from app.core.auth import get_current_user_id
from app.models.models import User, BudgetData, SavingsData
from app.services.analytics import calculate_financial_score, generate_insights

router = APIRouter()


@router.post("/auth")
async def authenticate(req: AuthRequest, db: AsyncSession = Depends(get_db)):
    from jose import jwt as jose_jwt
    try:
        payload = jose_jwt.get_unverified_claims(req.token)
        clerk_id = payload.get("sub", "")
        email = payload.get("email", f"{clerk_id}@user.app")
        name = payload.get("name", "User")
    except Exception:
        clerk_id = "anonymous"
        email = "user@example.com"
        name = "User"

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(clerk_id=clerk_id, email=email, name=name)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return {
        "access_token": req.token,
        "user": {"id": str(user.id), "email": user.email, "name": user.name, "is_pro": user.is_pro},
    }


@router.get("/me")
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.clerk_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return {"id": user_id, "email": "", "name": "User", "is_pro": False}
    return {"id": str(user.id), "email": user.email, "name": user.name, "is_pro": user.is_pro}


@router.get("/dashboard")
async def dashboard(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Get real budget data
    result = await db.execute(select(BudgetData).where(BudgetData.user_id == user_id))
    budget = result.scalar_one_or_none()

    result = await db.execute(select(SavingsData).where(SavingsData.user_id == user_id))
    savings = result.scalar_one_or_none()

    income = budget.income if budget else 0
    categories = budget.categories if budget else []
    total_spent = sum(c.get("spent", 0) for c in categories)
    total_budget = sum(c.get("amount", 0) for c in categories)

    goals = savings.goals if savings else []
    total_savings = sum(g.get("saved", 0) for g in goals)

    financial_score = calculate_financial_score(
        income=income,
        expenses=total_spent,
        savings=total_savings,
        debt=0,
    )

    spending_by_category = [
        {"name": c.get("name", ""), "amount": c.get("spent", 0)}
        for c in categories if c.get("spent", 0) > 0
    ]

    insights = generate_insights(
        income=income,
        categories=categories,
        goals=goals,
        financial_score=financial_score,
    )

    return {
        "totalBudget": total_budget,
        "totalSpent": total_spent,
        "totalSavings": total_savings,
        "financialScore": financial_score,
        "income": income,
        "spendingByCategory": spending_by_category or [
            {"name": "No data yet", "amount": 0}
        ],
        "insights": insights,
    }
