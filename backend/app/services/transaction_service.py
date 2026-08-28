from datetime import datetime, timedelta
from app.models.models import Transaction
from app.services.scam_shield import evaluate_transaction, categorize_transaction
from app.database.db import get_db
from sqlalchemy import select, func


async def create_transaction(user_id: str, data: dict, db) -> dict:
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.created_at.desc()).limit(20)
    )
    recent = result.scalars().all()
    recent_data = [
        {
            "amount": t.amount,
            "recipient": t.recipient,
            "created_at": t.created_at.isoformat() if t.created_at else datetime.utcnow().isoformat(),
        }
        for t in recent
    ]

    scam_result = evaluate_transaction(
        user_id=user_id,
        amount=data["amount"],
        recipient=data.get("recipient"),
        merchant=data.get("merchant"),
        description=data.get("description"),
        recent_transactions=recent_data,
    )

    smart_category = categorize_transaction(
        data.get("description"),
        data.get("merchant"),
        data["amount"],
    )

    transaction = Transaction(
        user_id=user_id,
        amount=data["amount"],
        category=data.get("category", smart_category),
        description=data.get("description"),
        transaction_type=data.get("transaction_type", "expense"),
        merchant=data.get("merchant"),
        recipient=data.get("recipient"),
        flagged=scam_result["flagged"],
        fraud_score=scam_result["fraud_score"],
        fraud_reasons=scam_result["reasons"],
        smart_category=smart_category,
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return _transaction_to_dict(transaction)


async def get_user_transactions(user_id: str, db, limit: int = 50, offset: int = 0) -> list[dict]:
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    transactions = result.scalars().all()
    return [_transaction_to_dict(t) for t in transactions]


async def get_flagged_transactions(user_id: str, db) -> list[dict]:
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id, Transaction.flagged == True)
        .order_by(Transaction.created_at.desc())
    )
    transactions = result.scalars().all()
    return [_transaction_to_dict(t) for t in transactions]


async def get_spending_summary(user_id: str, db) -> dict:
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.created_at >= thirty_days_ago,
            Transaction.transaction_type == "expense",
        )
    )
    transactions = result.scalars().all()

    by_category = {}
    total_spent = 0
    for t in transactions:
        cat = t.smart_category or t.category or "Uncategorized"
        by_category[cat] = by_category.get(cat, 0) + t.amount
        total_spent += t.amount

    return {
        "total_spent": total_spent,
        "transaction_count": len(transactions),
        "by_category": by_category,
        "flagged_count": sum(1 for t in transactions if t.flagged),
    }


def _transaction_to_dict(t: Transaction) -> dict:
    return {
        "id": str(t.id),
        "amount": t.amount,
        "category": t.category,
        "description": t.description,
        "transaction_type": t.transaction_type,
        "merchant": t.merchant,
        "recipient": t.recipient,
        "flagged": t.flagged,
        "fraud_score": t.fraud_score,
        "fraud_reasons": t.fraud_reasons or [],
        "smart_category": t.smart_category,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }
