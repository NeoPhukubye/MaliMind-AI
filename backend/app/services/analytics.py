def calculate_financial_score(income: float, expenses: float, savings: float, debt: float) -> int:
    if income <= 0:
        return 0

    score = 50
    savings_ratio = savings / income if income > 0 else 0
    expense_ratio = expenses / income if income > 0 else 1
    debt_ratio = debt / income if income > 0 else 0

    # Savings contribution (up to +25)
    score += min(savings_ratio * 100, 25)

    # Expense ratio (up to +15 for spending under 70%)
    if expense_ratio < 0.5:
        score += 15
    elif expense_ratio < 0.7:
        score += 10
    elif expense_ratio < 0.9:
        score += 5

    # Debt penalty (up to -20)
    if debt_ratio > 0.5:
        score -= 20
    elif debt_ratio > 0.3:
        score -= 10

    return max(0, min(100, int(score)))
