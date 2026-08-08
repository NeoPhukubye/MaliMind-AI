from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import SubscriptionPurchase, SubscriptionStatus
from app.services.revenuecat_service import get_subscription_status, process_purchase, handle_webhook
from app.database.db import get_db
from app.core.auth import get_current_user_id

router = APIRouter()


@router.get("/status/{user_id}", response_model=SubscriptionStatus)
async def status(user_id: str, db: AsyncSession = Depends(get_db)):
    return await get_subscription_status(user_id, db)


@router.post("/purchase")
async def purchase(
    req: SubscriptionPurchase,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await process_purchase(user_id, req.receipt or "", db)


@router.post("/restore")
async def restore(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await get_subscription_status(user_id, db)


@router.post("/webhook")
async def webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """RevenueCat webhook endpoint for subscription events."""
    body = await request.json()
    event = body.get("event", body)
    return await handle_webhook(event, db)
