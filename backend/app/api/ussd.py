from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import USSDRequest, USSDResponse
from app.database.db import get_db
from app.core.auth import get_current_user_id

router = APIRouter()

USSD_SESSIONS: dict[str, dict] = {}


@router.post("/callback", response_model=USSDResponse)
async def ussd_callback(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    session_id = body.get("sessionId", "unknown")
    phone = body.get("phoneNumber", "")
    text = body.get("text", "")

    if session_id not in USSD_SESSIONS:
        USSD_SESSIONS[session_id] = {"step": "main", "data": {}}

    session = USSD_SESSIONS[session_id]
    text_parts = text.split("*") if text else []
    current = text_parts[-1] if text_parts else ""

    if session["step"] == "main" or not text:
        session["step"] = "main"
        response = "CON Welcome to MaliMind AI\n"
        response += "1. Check Balance\n"
        response += "2. Get Financial Tip\n"
        response += "3. Report Suspicious Activity\n"
        response += "4. Exit"
        return USSDResponse(response=response, endSession=False)

    if session["step"] == "main":
        if current == "1":
            session["step"] = "balance"
            return USSDResponse(response="END Your MaliMind balance feature is coming soon. Track your budget on the web app!", endSession=True)
        elif current == "2":
            session["step"] = "tip"
            return USSDResponse(response="END Tip: Save 20% of your income. Even small amounts build wealth over time.", endSession=True)
        elif current == "3":
            session["step"] = "report"
            return USSDResponse(response="CON Enter the suspicious number to report:", endSession=False)
        elif current == "4":
            return USSDResponse(response="END Thank you for using MaliMind AI. Be safe!", endSession=True)
        else:
            return USSDResponse(response="END Invalid option.", endSession=True)

    return USSDResponse(response="END Thank you for using MaliMind AI.", endSession=True)
