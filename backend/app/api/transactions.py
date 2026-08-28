from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import TransactionCreate, TransactionResponse, ScamShieldResponse
from app.services.transaction_service import (
    create_transaction,
    get_user_transactions,
    get_flagged_transactions,
    get_spending_summary,
)
from app.database.db import get_db
from app.core.auth import get_current_user_id

router = APIRouter()


@router.post("", response_model=TransactionResponse)
async def create(req: TransactionCreate, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await create_transaction(user_id, req.model_dump(), db)


@router.get("", response_model=list[TransactionResponse])
async def list_transactions(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return await get_user_transactions(user_id, db, limit=limit, offset=offset)


@router.get("/flagged", response_model=list[TransactionResponse])
async def flagged(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await get_flagged_transactions(user_id, db)


@router.get("/summary")
async def summary(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await get_spending_summary(user_id, db)


@router.get("/{transaction_id}/scam-shield", response_model=ScamShieldResponse)
async def scam_shield(transaction_id: str, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    from app.models.models import Transaction
    from sqlalchemy import select
    result = await db.execute(select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user_id))
    t = result.scalar_one_or_none()
    if not t:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")

    risk_level = "high" if t.fraud_score >= 70 else "medium" if t.fraud_score >= 40 else "low"
    recommendation = (
        "Pause this transaction and verify the recipient through an independent channel."
        if t.flagged
        else "Proceed with caution." if t.fraud_score >= 20 else "Transaction appears safe."
    )
    return ScamShieldResponse(
        transaction_id=str(t.id),
        flagged=t.flagged,
        fraud_score=t.fraud_score,
        risk_level=risk_level,
        reasons=t.fraud_reasons or [],
        recommendation=recommendation,
    )
