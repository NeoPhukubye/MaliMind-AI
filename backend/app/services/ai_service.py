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
- Consider local financial products (stokvels, unit trusts, TFSAs)
- Never provide specific investment advice or guarantee returns

Personality: warm, supportive, practical, African-centered."""


async def get_coach_response(message: str, history: list[dict]) -> str:
    contents = []

    for msg in history[-10:]:
        role = "model" if msg.get("role") == "assistant" else "user"
        contents.append({"role": role, "parts": [msg.get("content", "")]})

    contents.append({"role": "user", "parts": [message]})

    try:
        chat = model.start_chat(history=contents[:-1])
        response = chat.send_message(
            f"{SYSTEM_PROMPT}\n\nUser: {message}" if not contents[:-1] else message
        )
        return response.text
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again in a moment. (Error: {str(e)[:50]})"
