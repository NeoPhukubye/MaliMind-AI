import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

SYSTEM_PROMPT = """You are MaliMind AI, a friendly and knowledgeable financial coach specializing in personal finance for people in Africa.

Your role:
- Help users budget, save, invest, and manage debt
- Give practical, actionable advice tailored to the user's situation
- Use South African Rand (R) as the default currency
- Be encouraging but honest about financial realities
- Keep responses concise (2-4 paragraphs max)
- Suggest specific steps the user can take today
- Consider local financial products (stokvels, unit trusts, TFSAs, tax-free savings, money market accounts)
- Reference current South African financial context (interest rates, inflation, load-shedding costs)
- Never provide specific investment advice or guarantee returns
- When the user's financial data is provided below, reference it naturally to give personalized advice

Personality: warm, supportive, practical, African-centered. Use occasional South African expressions when natural (e.g., "sharp", "eish")."""


def build_context_prompt(financial_context: dict | None) -> str:
    if not financial_context:
        return SYSTEM_PROMPT

    ctx = financial_context
    parts = [SYSTEM_PROMPT, "\n\n--- USER'S FINANCIAL SNAPSHOT ---"]

    if ctx.get("income"):
        parts.append(f"Monthly Income: R{ctx['income']:,.0f}")

    if ctx.get("categories"):
        total_budget = sum(c.get("amount", 0) for c in ctx["categories"])
        total_spent = sum(c.get("spent", 0) for c in ctx["categories"])
        parts.append(f"Total Budgeted: R{total_budget:,.0f} | Total Spent: R{total_spent:,.0f}")
        overspent = [c for c in ctx["categories"] if c.get("spent", 0) > c.get("amount", 0)]
        if overspent:
            parts.append(f"OVERSPENT categories: {', '.join(c['name'] + f' (R{c[\"spent\"] - c[\"amount\"]:,.0f} over)' for c in overspent)}")

    if ctx.get("goals"):
        parts.append("Savings Goals:")
        for g in ctx["goals"]:
            pct = (g.get("saved", 0) / g["target"] * 100) if g.get("target") else 0
            deadline_info = f" (deadline: {g['deadline']})" if g.get("deadline") else ""
            parts.append(f"  - {g['name']}: R{g.get('saved', 0):,.0f} / R{g['target']:,.0f} ({pct:.0f}%){deadline_info}")

    if ctx.get("financial_score") is not None:
        score = ctx["financial_score"]
        label = "Excellent" if score >= 80 else "Good" if score >= 60 else "Needs Work" if score >= 40 else "Critical"
        parts.append(f"Financial Health Score: {score}/100 ({label})")

    parts.append("--- END SNAPSHOT ---")
    parts.append("\nUse this data to give personalized, specific advice. Reference actual numbers when relevant.")

    return "\n".join(parts)


async def get_coach_response(message: str, history: list[dict], financial_context: dict | None = None) -> str:
    system = build_context_prompt(financial_context)
    contents = []

    for msg in history[-10:]:
        role = "model" if msg.get("role") == "assistant" else "user"
        contents.append({"role": role, "parts": [msg.get("content", "")]})

    contents.append({"role": "user", "parts": [message]})

    try:
        chat = model.start_chat(history=contents[:-1])
        prompt = f"{system}\n\nUser: {message}" if not contents[:-1] else message
        response = chat.send_message(prompt)
        return response.text
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again in a moment. (Error: {str(e)[:50]})"
