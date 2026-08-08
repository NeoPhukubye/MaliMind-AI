import httpx
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.models import User

REVENUECAT_BASE = "https://api.revenuecat.com/v1"
FREE_TIER_DAILY_LIMIT = 5


async def get_or_create_user(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.clerk_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(clerk_id=user_id, email=f"{user_id}@pending.com", name="User")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


async def get_subscription_status(user_id: str, db: AsyncSession) -> dict:
    user = await get_or_create_user(db, user_id)

    # Reset daily count if new day
    today = date.today()
    if user.message_date != today:
        user.message_date = today
        user.message_count = 0
        await db.commit()

    # Check RevenueCat for active entitlements
    is_pro = user.is_pro
    if settings.revenuecat_api_key:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    f"{REVENUECAT_BASE}/subscribers/{user_id}",
                    headers={
                        "Authorization": f"Bearer {settings.revenuecat_api_key}",
                        "Content-Type": "application/json",
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    entitlements = data.get("subscriber", {}).get("entitlements", {})
                    is_pro = "pro" in entitlements and entitlements["pro"].get("expires_date") is None
                    if user.is_pro != is_pro:
                        user.is_pro = is_pro
                        await db.commit()
        except Exception:
            pass

    return {
        "isPro": is_pro,
        "messageCount": user.message_count,
        "dailyLimit": FREE_TIER_DAILY_LIMIT if not is_pro else None,
    }


async def process_purchase(user_id: str, receipt: str, db: AsyncSession) -> dict:
    if not settings.revenuecat_api_key:
        return {"success": False, "message": "Subscription service not configured"}

    try:
        async with httpx.AsyncClient() as client:
            # Create/update subscriber in RevenueCat with the receipt
            res = await client.post(
                f"{REVENUECAT_BASE}/receipts",
                headers={
                    "Authorization": f"Bearer {settings.revenuecat_api_key}",
                    "Content-Type": "application/json",
                    "X-Platform": "stripe",
                },
                json={
                    "app_user_id": user_id,
                    "fetch_token": receipt,
                },
            )
            if res.status_code in (200, 201):
                user = await get_or_create_user(db, user_id)
                user.is_pro = True
                await db.commit()
                return {"success": True, "message": "Subscription activated"}
            else:
                return {"success": False, "message": "Payment verification failed"}
    except Exception as e:
        return {"success": False, "message": f"Service error: {str(e)[:100]}"}


async def handle_webhook(event: dict, db: AsyncSession) -> dict:
    """Handle RevenueCat webhook events for subscription lifecycle."""
    event_type = event.get("type", "")
    app_user_id = event.get("app_user_id", "")

    if not app_user_id:
        return {"status": "ignored", "reason": "no user id"}

    user = await get_or_create_user(db, app_user_id)

    if event_type in ("INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION"):
        user.is_pro = True
    elif event_type in ("CANCELLATION", "EXPIRATION", "BILLING_ISSUE"):
        user.is_pro = False

    await db.commit()
    return {"status": "processed", "event": event_type}


async def increment_message_count(user_id: str, db: AsyncSession) -> dict:
    """Increment daily message count. Returns whether the message is allowed."""
    user = await get_or_create_user(db, user_id)

    today = date.today()
    if user.message_date != today:
        user.message_date = today
        user.message_count = 0

    if user.is_pro:
        user.message_count += 1
        await db.commit()
        return {"allowed": True, "count": user.message_count}

    if user.message_count >= FREE_TIER_DAILY_LIMIT:
        return {"allowed": False, "count": user.message_count, "limit": FREE_TIER_DAILY_LIMIT}

    user.message_count += 1
    await db.commit()
    return {"allowed": True, "count": user.message_count}
