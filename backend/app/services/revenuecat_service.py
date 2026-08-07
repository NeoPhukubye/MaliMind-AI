import httpx
from app.config import settings

REVENUECAT_BASE = "https://api.revenuecat.com/v1"


async def get_subscription_status(user_id: str) -> dict:
    if not settings.revenuecat_api_key:
        return {"isPro": False, "messageCount": 0}

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{REVENUECAT_BASE}/subscribers/{user_id}",
                headers={"Authorization": f"Bearer {settings.revenuecat_api_key}"},
            )
            if res.status_code == 200:
                data = res.json()
                entitlements = data.get("subscriber", {}).get("entitlements", {})
                is_pro = "pro" in entitlements and entitlements["pro"].get("expires_date") is None
                return {"isPro": is_pro, "messageCount": 0}
    except Exception:
        pass

    return {"isPro": False, "messageCount": 0}


async def process_purchase(user_id: str) -> dict:
    # In production, verify purchase receipt with RevenueCat
    return {"success": True, "message": "Subscription activated"}
