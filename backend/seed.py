import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.models import Base, User, BudgetData, SavingsData, Transaction, Stokvel, StokvelMember, StokvelContribution
from app.config import settings

DATABASE_URL = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

DEMO_USER_CLERK_ID = "demo-user-0712345678"
DEMO_USER_EMAIL = "demo@malimind.ai"
DEMO_USER_NAME = "Demo User"

CATEGORIES = [
    {"name": "Groceries", "amount": 4500, "spent": 3200},
    {"name": "Transport", "amount": 2000, "spent": 1800},
    {"name": "Bills & Utilities", "amount": 3000, "spent": 2950},
    {"name": "Entertainment", "amount": 1500, "spent": 900},
    {"name": "Healthcare", "amount": 1000, "spent": 400},
]

GOALS = [
    {"name": "Emergency Fund", "target": 30000, "saved": 12500, "deadline": "2026-12-31"},
    {"name": "Holiday", "target": 20000, "saved": 8500, "deadline": "2026-06-30"},
    {"name": "New Laptop", "target": 15000, "saved": 6000, "deadline": "2026-09-30"},
]

MERCHANTS = [
    "Shoprite", "Checkers", "Pick n Pay", "Spar", "Woolworths", "Uber", "Bolt",
    "Petrol", "DSTV", "Netflix", "Spotify", "Cell C", "MTN", "Vodacom", "Telkom",
    "Clinic", "Pharmacy", "Restaurant", "Bar", "Movie", "Gym",
]

DESCRIPTIONS = [
    "Weekly groceries", "Fuel", "Airtime", "Data", "Electricity", "Water",
    "Rent", "Insurance", "Takeaway", "Movie night", "Gym membership", "Doctor visit",
    "Pharmacy", "Parking", "Bus fare", "Taxi", "Internet", "Netflix subscription",
]

STOKVEL_NAMES = [
    "Family Savings Circle", "Friends Stokvel", "Work Colleagues",
    "Community Grocery", "Holiday Club",
]

MEMBERS = [
    {"name": "Thandi M.", "phone": "0821111111"},
    {"name": "Sipho K.", "phone": "0832222222"},
    {"name": "Nomsa D.", "phone": "0843333333"},
    {"name": "Johan v.W.", "phone": "0854444444"},
    {"name": "Priya N.", "phone": "0865555555"},
]

SCAM_DESCRIPTIONS = [
    "Urgent: You have won! Claim now",
    "Lottery prize notification",
    "Account verification required",
    "Bitcoin investment opportunity",
    "Inheritance notification",
    "SARS tax refund",
    "Free money grant approved",
    "Loan approved - wire transfer",
    "OTP required for transaction",
    "Click this link to claim",
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        user = User(clerk_id=DEMO_USER_CLERK_ID, email=DEMO_USER_EMAIL, name=DEMO_USER_NAME)
        db.add(user)
        await db.commit()
        await db.refresh(user)

        budget = BudgetData(user_id=DEMO_USER_CLERK_ID, categories=CATEGORIES, income=25000)
        db.add(budget)

        savings = SavingsData(user_id=DEMO_USER_CLERK_ID, goals=GOALS)
        db.add(savings)

        now = datetime.utcnow()
        for i in range(40):
            days_ago = random.randint(0, 60)
            tx_date = now - timedelta(days=days_ago)
            is_income = random.random() < 0.1
            amount = random.uniform(50, 5000) if not is_income else random.uniform(5000, 35000)
            merchant = random.choice(MERCHANTS)
            desc = random.choice(DESCRIPTIONS)
            tx_type = "income" if is_income else "expense"

            flagged = False
            fraud_score = 0
            fraud_reasons = []
            if i < 5 and not is_income:
                desc = random.choice(SCAM_DESCRIPTIONS)
                fraud_score = random.randint(60, 95)
                fraud_reasons = ["Suspicious keywords detected", "Reported number"]
                flagged = fraud_score >= 40

            transaction = Transaction(
                user_id=DEMO_USER_CLERK_ID,
                amount=round(amount, 2),
                category="Income" if is_income else random.choice([c["name"] for c in CATEGORIES]),
                description=desc,
                transaction_type=tx_type,
                merchant=merchant,
                recipient=f"27{random.randint(100000000, 999999999)}" if not is_income and random.random() < 0.3 else None,
                flagged=flagged,
                fraud_score=fraud_score,
                fraud_reasons=fraud_reasons,
                smart_category="Income" if is_income else None,
                created_at=tx_date,
            )
            db.add(transaction)

        for sname in STOKVEL_NAMES:
            stokvel = Stokvel(
                user_id=DEMO_USER_CLERK_ID,
                name=sname,
                contribution_amount=random.choice([500, 1000, 1500, 2000]),
                frequency=random.choice(["monthly", "weekly"]),
                payout_rotation=[m["name"] for m in MEMBERS[:random.randint(2, 5)]],
                current_payout_index=random.randint(0, 3),
                start_date=(now - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d"),
            )
            db.add(stokvel)
            await db.commit()
            await db.refresh(stokvel)

            for member in MEMBERS[:random.randint(2, 5)]:
                sm = StokvelMember(stokvel_id=str(stokvel.id), name=member["name"], phone=member["phone"])
                db.add(sm)
            await db.commit()

            for j in range(random.randint(3, 8)):
                contrib_date = (now - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d")
                contrib = StokvelContribution(
                    stokvel_id=str(stokvel.id),
                    member_id=MEMBERS[random.randint(0, len(MEMBERS) - 1)]["name"],
                    amount=random.choice([500, 1000, 1500, 2000]),
                    date=contrib_date,
                    note="Monthly contribution",
                )
                db.add(contrib)

        await db.commit()
        print("Demo data seeded successfully!")
        print(f"User: {DEMO_USER_EMAIL} (clerk_id: {DEMO_USER_CLERK_ID})")


if __name__ == "__main__":
    asyncio.run(seed())
