from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import CoachRequest, CoachResponse
from app.services.ai_service import get_coach_response
from app.services.revenuecat_service import increment_message_count
from app.database.db import get_db
from app.core.auth import get_current_user_id

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

    response = await get_coach_response(req.message, req.history)
    return CoachResponse(response=response)
