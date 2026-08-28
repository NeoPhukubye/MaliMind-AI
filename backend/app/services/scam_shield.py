import re
from collections import defaultdict
from datetime import datetime, timedelta


SCAM_KEYWORDS = [
    "urgent", "winner", "congratulations", "lottery", "prize", "claim",
    "refund", "tax", "irs", "sars", "account", "verify", "suspended",
    "click", "link", "bitcoin", "crypto", "investment", "guarantee",
    "free money", "grant", "loan approved", "wire transfer", "western union",
    "inheritance", "beneficiary", "million", "rand", "bank details",
    "pin", "password", "otp", "one time", "act now", "limited time",
]


async def evaluate_transaction(
    user_id: str,
    amount: float,
    recipient: str | None,
    merchant: str | None,
    description: str | None,
    recent_transactions: list[dict],
    reported_numbers: set[str] | None = None,
) -> dict:
    reasons = []
    score = 0

    reported_numbers = reported_numbers or set()

    if recipient and recipient in reported_numbers:
        score += 40
        reasons.append("Recipient number has been reported for scams")

    if recipient:
        digits = re.sub(r"\D", "", recipient)
        if len(digits) < 7 or len(digits) > 15:
            score += 20
            reasons.append("Suspicious recipient number format")

    text = f"{description or ''} {merchant or ''} {recipient or ''}".lower()
    matched_keywords = [kw for kw in SCAM_KEYWORDS if kw in text]
    if matched_keywords:
        score += min(len(matched_keywords) * 10, 30)
        reasons.append(f"Suspicious keywords detected: {', '.join(matched_keywords[:3])}")

    if amount > 0:
        if amount > 50000:
            score += 20
            reasons.append(f"Unusually large amount: R{amount:,.0f}")
        elif amount > 10000 and not recipient:
            score += 15
            reasons.append("Large amount without known recipient")

    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)
    recent_amounts = [
        t.get("amount", 0) for t in recent_transactions
        if datetime.fromisoformat(t.get("created_at", now.isoformat())) > one_hour_ago
    ]
    if len(recent_amounts) >= 3:
        score += 25
        reasons.append("High transaction velocity: 3+ transactions in last hour")

    if recipient:
        recent_recipients = [
            t.get("recipient") for t in recent_transactions[-20:]
            if t.get("recipient") and t.get("recipient") == recipient
        ]
        if not recent_recipients:
            score += 15
            reasons.append("New recipient — first time sending to this number")

    flagged = score >= 40
    if score >= 70:
        risk_level = "high"
    elif score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    if flagged:
        recommendation = "Pause this transaction and verify the recipient through an independent channel."
    elif score >= 20:
        recommendation = "Proceed with caution. Consider calling the recipient to confirm."
    else:
        recommendation = "Transaction appears safe based on current risk patterns."

    return {
        "flagged": flagged,
        "fraud_score": min(score, 100),
        "risk_level": risk_level,
        "reasons": reasons,
        "recommendation": recommendation,
    }


def categorize_transaction(description: str | None, merchant: str | None, amount: float) -> str:
    text = f"{description or ''} {merchant or ''}".lower()

    transport_keywords = ["uber", "bolt", "taxi", "fuel", "petrol", "gas", "parking", "bus", "train", "gautrain"]
    groceries_keywords = ["shoprite", "checkers", "pick n pay", "spar", "woolworths", "food", "grocery", "supermarket", "butcher", "bakery", "maize", "pap"]
    bills_keywords = ["electricity", "water", "municipal", "rent", "bond", "insurance", "dstv", "netflix", "spotify", "cell c", "mtn", "vodacom", "telkom", "airtime", "data"]
    health_keywords = ["clinic", "doctor", "pharmacy", "hospital", "medicine", "dental", "optometrist", "doctor", "mediclinic"]
    education_keywords = ["school", "tuition", "university", "college", "course", "book", "exam", "fees"]
    entertainment_keywords = ["movie", "cinema", "restaurant", "bar", "club", "game", "netflix", "spotify", "event", "ticket", "zoo", "park"]
    shopping_keywords = ["woolworths", "clothing", "fashion", "shoe", "dress", "mall", "online", "amazon", "takealot"]
    income_keywords = ["salary", "wage", "deposit", "refund", "dividend", "interest", "grant", "payment received"]

    categories = [
        (transport_keywords, "Transport"),
        (groceries_keywords, "Groceries"),
        (bills_keywords, "Bills & Utilities"),
        (health_keywords, "Healthcare"),
        (education_keywords, "Education"),
        (entertainment_keywords, "Entertainment"),
        (shopping_keywords, "Shopping"),
        (income_keywords, "Income"),
    ]

    for keywords, category in categories:
        if any(kw in text for kw in keywords):
            return category

    if amount > 0 and any(word in text for word in ["received", "deposit", "credit", "in"]):
        return "Income"

    if amount < 0 or (amount > 0 and any(word in text for word in ["paid", "debit", "purchase"])):
        return "Shopping"

    return "Uncategorized"
