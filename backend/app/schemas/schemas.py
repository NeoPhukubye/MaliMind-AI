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
