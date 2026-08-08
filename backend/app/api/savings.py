from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.schemas import SavingsRequest, SavingsResponse
from app.database.db import get_db
from app.core.auth import get_current_user_id
from app.models.models import SavingsData

router = APIRouter()


@router.get("", response_model=SavingsResponse)
async def get_savings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavingsData).where(SavingsData.user_id == user_id)
    )
    savings = result.scalar_one_or_none()
    if not savings:
        return SavingsResponse(goals=[])
    return SavingsResponse(goals=savings.goals or [])


@router.post("")
async def save_savings(
    req: SavingsRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavingsData).where(SavingsData.user_id == user_id)
    )
    savings = result.scalar_one_or_none()

    if savings:
        savings.goals = [g.model_dump() for g in req.goals]
    else:
        savings = SavingsData(
            user_id=user_id,
            goals=[g.model_dump() for g in req.goals],
        )
        db.add(savings)

    await db.commit()
    return {"status": "saved"}
