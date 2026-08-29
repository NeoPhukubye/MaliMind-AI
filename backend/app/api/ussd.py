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
        session["data"] = {}
        response = "CON Welcome to MaliMind AI\n"
        response += "1. Check Balance\n"
        response += "2. Get Financial Tip\n"
        response += "3. Log Transaction\n"
        response += "4. Report Scam\n"
        response += "5. Stokvel Info\n"
        response += "6. Exit"
        return USSDResponse(response=response, endSession=False)

    if session["step"] == "main":
        if current == "1":
            session["step"] = "balance"
            return USSDResponse(
                response="END Your MaliMind balance tracking is available on the web app.\nDial *141*8# anytime for tips and scam alerts.",
                endSession=True,
            )
        elif current == "2":
            session["step"] = "tip"
            tips = [
                "Tip: Save 20% of your income. Even R100/month builds wealth.",
                "Tip: Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
                "Tip: Avoid payday loans. Interest rates can exceed 30%.",
                "Tip: Start an emergency fund. Aim for 3 months of expenses.",
                "Tip: Review your subscriptions monthly. Cancel what you don't use.",
            ]
            import random
            return USSDResponse(response=f"END {random.choice(tips)}", endSession=True)
        elif current == "3":
            session["step"] = "log_amount"
            return USSDResponse(response="CON Enter transaction amount (R):", endSession=False)
        elif current == "4":
            session["step"] = "report_number"
            return USSDResponse(response="CON Enter the suspicious number to report:", endSession=False)
        elif current == "5":
            session["step"] = "stokvel"
            return USSDResponse(
                response="CON Stokvel Services:\n1. Create Group\n2. View My Groups\n3. Record Contribution\n4. Back",
                endSession=False,
            )
        elif current == "6":
            return USSDResponse(response="END Thank you for using MaliMind AI. Be safe!", endSession=True)
        else:
            return USSDResponse(response="END Invalid option.", endSession=True)

    if session["step"] == "log_amount":
        try:
            amt = float(current.replace(",", ""))
            if amt <= 0:
                raise ValueError
            session["data"]["amount"] = amt
            session["step"] = "log_category"
            return USSDResponse(
                response="CON Select category:\n1. Groceries\n2. Transport\n3. Bills\n4. Entertainment\n5. Other",
                endSession=False,
            )
        except ValueError:
            return USSDResponse(response="END Invalid amount. Please try again.", endSession=True)

    if session["step"] == "log_category":
        categories = {"1": "Groceries", "2": "Transport", "3": "Bills & Utilities", "4": "Entertainment", "5": "Other"}
        cat = categories.get(current, "Other")
        session["data"]["category"] = cat
        session["step"] = "log_desc"
        return USSDResponse(response="CON Enter description (optional):", endSession=False)

    if session["step"] == "log_desc":
        desc = current.strip() or "USSD transaction"
        session["data"]["description"] = desc
        session["step"] = "log_confirm"
        return USSDResponse(
            response=f"CON Confirm:\nR{session['data']['amount']:.2f} - {session['data']['category']}\n{desc}\n1. Save\n2. Cancel",
            endSession=False,
        )

    if session["step"] == "log_confirm":
        if current == "1":
            session["step"] = "main"
            return USSDResponse(
                response=f"END Transaction saved.\nR{session['data']['amount']:.2f} - {session['data']['category']}",
                endSession=True,
            )
        else:
            session["step"] = "main"
            return USSDResponse(response="END Transaction cancelled.", endSession=True)

    if session["step"] == "report_number":
        session["data"]["reported_number"] = current.strip()
        session["step"] = "report_reason"
        return USSDResponse(response="CON Enter reason for report:", endSession=False)

    if session["step"] == "report_reason":
        session["data"]["reason"] = current.strip()
        session["step"] = "main"
        return USSDResponse(
            response=f"END Report submitted for {session['data'].get('reported_number', 'unknown')}.\nWe will investigate. Thank you.",
            endSession=True,
        )

    if session["step"] == "stokvel":
        if current == "1":
            session["step"] = "stokvel_create_name"
            return USSDResponse(response="CON Enter stokvel name:", endSession=False)
        elif current == "2":
            session["step"] = "main"
            return USSDResponse(response="END View your stokvels on the web app for full details.", endSession=True)
        elif current == "3":
            session["step"] = "stokvel_contrib_amount"
            return USSDResponse(response="CON Enter contribution amount (R):", endSession=False)
        elif current == "4":
            session["step"] = "main"
            return USSDResponse(response="END Returning to main menu.", endSession=True)
        else:
            return USSDResponse(response="END Invalid option.", endSession=True)

    if session["step"] == "stokvel_create_name":
        session["data"]["stokvel_name"] = current.strip()
        session["step"] = "stokvel_create_amount"
        return USSDResponse(response="CON Enter contribution amount per member (R):", endSession=False)

    if session["step"] == "stokvel_create_amount":
        try:
            amt = float(current.replace(",", ""))
            if amt <= 0:
                raise ValueError
            session["data"]["stokvel_amount"] = amt
            session["step"] = "main"
            return USSDResponse(
                response=f"END Stokvel '{session['data'].get('stokvel_name', '')}' created.\nR{amt:.2f} per member.\nManage members on the web app.",
                endSession=True,
            )
        except ValueError:
            return USSDResponse(response="END Invalid amount. Please try again.", endSession=True)

    if session["step"] == "stokvel_contrib_amount":
        try:
            amt = float(current.replace(",", ""))
            if amt <= 0:
                raise ValueError
            session["data"]["stokvel_contrib"] = amt
            session["step"] = "stokvel_contrib_member"
            return USSDResponse(response="CON Enter member name:", endSession=False)
        except ValueError:
            return USSDResponse(response="END Invalid amount. Please try again.", endSession=True)

    if session["step"] == "stokvel_contrib_member":
        session["data"]["member_name"] = current.strip()
        session["step"] = "main"
        return USSDResponse(
            response=f"END Contribution recorded.\nR{session['data'].get('stokvel_contrib', 0):.2f} from {session['data'].get('member_name', 'member')}",
            endSession=True,
        )

    return USSDResponse(response="END Thank you for using MaliMind AI.", endSession=True)
