from pydantic import BaseModel


class AuthRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None = None
    is_pro: bool = False
    created_at: str | None = None


class BudgetCategory(BaseModel):
    name: str
    amount: float
    spent: float = 0


class BudgetRequest(BaseModel):
    categories: list[BudgetCategory]
    income: float = 0


class BudgetResponse(BaseModel):
    categories: list[dict]
    income: float = 0


class SavingsGoal(BaseModel):
    name: str
    target: float
    saved: float = 0
    deadline: str | None = None


class SavingsRequest(BaseModel):
    goals: list[SavingsGoal]


class SavingsResponse(BaseModel):
    goals: list[dict]


class CoachRequest(BaseModel):
    message: str
    history: list[dict] = []


class CoachResponse(BaseModel):
    response: str


class SubscriptionPurchase(BaseModel):
    userId: str = ""
    receipt: str | None = None


class SubscriptionStatus(BaseModel):
    isPro: bool = False
    messageCount: int = 0
    dailyLimit: int | None = None


class TransactionCreate(BaseModel):
    amount: float
    category: str = "Uncategorized"
    description: str | None = None
    transaction_type: str = "expense"
    merchant: str | None = None
    recipient: str | None = None


class TransactionResponse(BaseModel):
    id: str
    amount: float
    category: str
    description: str | None = None
    transaction_type: str
    merchant: str | None = None
    recipient: str | None = None
    flagged: bool = False
    fraud_score: int = 0
    fraud_reasons: list[str] = []
    smart_category: str | None = None
    created_at: str | None = None


class StokvelCreate(BaseModel):
    name: str
    contribution_amount: float
    frequency: str = "monthly"
    payout_rotation: list[str] = []
    start_date: str | None = None


class StokvelResponse(BaseModel):
    id: str
    name: str
    contribution_amount: float
    frequency: str
    payout_rotation: list[str]
    current_payout_index: int
    start_date: str | None = None
    created_at: str | None = None


class StokvelMemberCreate(BaseModel):
    name: str
    phone: str | None = None


class StokvelMemberResponse(BaseModel):
    id: str
    stokvel_id: str
    name: str
    phone: str | None = None
    joined_at: str | None = None


class StokvelContributionCreate(BaseModel):
    member_id: str
    amount: float
    date: str
    note: str | None = None


class StokvelContributionResponse(BaseModel):
    id: str
    stokvel_id: str
    member_id: str
    amount: float
    date: str
    note: str | None = None
    created_at: str | None = None


class ScamShieldResponse(BaseModel):
    transaction_id: str
    flagged: bool
    fraud_score: int
    risk_level: str
    reasons: list[str]
    recommendation: str


class USSDRequest(BaseModel):
    sessionId: str
    phoneNumber: str
    text: str


class USSDResponse(BaseModel):
    response: str
    endSession: bool = False
