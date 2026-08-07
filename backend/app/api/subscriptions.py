from fastapi import APIRouter
from app.schemas.schemas import SubscriptionPurchase, SubscriptionStatus
from app.services.revenuecat_service import get_subscription_status, process_purchase

router = APIRouter()


@router.get("/status/{user_id}", response_model=SubscriptionStatus)
async def status(user_id: str):
    return await get_subscription_status(user_id)


@router.post("/purchase")
async def purchase(req: SubscriptionPurchase):
    return await process_purchase(req.userId)


@router.post("/restore")
async def restore(req: SubscriptionPurchase):
    return await get_subscription_status(req.userId)
