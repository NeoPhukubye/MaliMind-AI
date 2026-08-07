from openai import AsyncOpenAI
from app.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are MaliMind AI, a friendly and knowledgeable financial coach specializing in personal finance for people in Africa.

Your role:
- Help users budget, save, invest, and manage debt
- Give practical, actionable advice tailored to the user's situation
- Use South African Rand (R) as the default currency
- Be encouraging but honest about financial realities
- Keep responses concise (2-4 paragraphs max)
- Suggest specific steps the user can take today
- Consider local financial products (stokvels, unit trusts, TFSAs)
- Never provide specific investment advice or guarantee returns

Personality: warm, supportive, practical, African-centered."""


async def get_coach_response(message: str, history: list[dict]) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in history[-10:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

    messages.append({"role": "user", "content": message})

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again in a moment. (Error: {str(e)[:50]})"
