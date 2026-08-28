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


def generate_insights(income: float, categories: list, goals: list, financial_score: int, flagged_count: int = 0) -> list[dict]:
    insights = []

    total_budget = sum(c.get("amount", 0) for c in categories)
    total_spent = sum(c.get("spent", 0) for c in categories)

    # Overspending warnings
    overspent = [c for c in categories if c.get("spent", 0) > c.get("amount", 0)]
    if overspent:
        names = ", ".join(c["name"] for c in overspent[:3])
        insights.append({
            "type": "warning",
            "title": "Overspending Alert",
            "message": f"You're over budget on: {names}. Consider adjusting your spending or increasing these budget limits.",
        })

    # Savings rate check
    if income > 0:
        savings_total = sum(g.get("saved", 0) for g in goals)
        savings_rate = savings_total / income * 100
        if savings_rate < 10:
            insights.append({
                "type": "tip",
                "title": "Boost Your Savings",
                "message": f"Your savings rate is {savings_rate:.0f}%. Financial experts recommend saving at least 20% of income. Even R{income * 0.1:,.0f}/month makes a difference.",
            })
        elif savings_rate >= 20:
            insights.append({
                "type": "success",
                "title": "Great Savings Habit!",
                "message": f"You're saving {savings_rate:.0f}% of your income. You're ahead of most South Africans — keep it up!",
            })

    # Budget utilization
    if total_budget > 0 and income > 0:
        budget_coverage = total_budget / income * 100
        if budget_coverage < 50:
            insights.append({
                "type": "tip",
                "title": "Budget More Categories",
                "message": f"Your budget only covers {budget_coverage:.0f}% of your income. Tracking more spending categories gives you better financial visibility.",
            })

    # Goal progress
    active_goals = [g for g in goals if g.get("target", 0) > 0]
    close_goals = [g for g in active_goals if g.get("saved", 0) / g["target"] >= 0.8]
    if close_goals:
        insights.append({
            "type": "success",
            "title": "Almost There!",
            "message": f"You're 80%+ to your '{close_goals[0]['name']}' goal. A little push and you'll hit your target!",
        })

    # Scam shield insights
    if flagged_count > 0:
        insights.append({
            "type": "warning",
            "title": "Scam Shield Alert",
            "message": f"{flagged_count} transaction(s) flagged as potentially fraudulent. Review them in the Transactions page to stay safe.",
        })
    else:
        insights.append({
            "type": "success",
            "title": "Scam Shield Active",
            "message": "No suspicious transactions detected this month. Keep monitoring your accounts.",
        })

    # Financial score guidance
    if financial_score < 40:
        insights.append({
            "type": "warning",
            "title": "Financial Health Needs Attention",
            "message": "Your score suggests high expenses relative to income. Start with one change: cut your biggest non-essential expense this month.",
        })
    elif financial_score >= 75:
        insights.append({
            "type": "success",
            "title": "Strong Financial Health",
            "message": "Your financial score is excellent. Consider exploring TFSAs or unit trusts to grow your wealth further.",
        })

    # Default if no data
    if not insights:
        insights.append({
            "type": "tip",
            "title": "Get Started",
            "message": "Set up your monthly income and budget categories to unlock personalized financial insights.",
        })

    return insights[:4]
