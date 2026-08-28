# MaliMind AI

> AI-Powered Financial Coaching for Africa

## The Problem

Over 60% of South Africans live paycheck to paycheck. Financial literacy is low, financial advisors are expensive, and existing tools aren't built for the African context — stokvels, TFSAs, and Rand-denominated budgets are ignored by global apps.

## Our Solution

MaliMind AI is a personal finance platform with an AI coach that understands African financial realities. It combines smart budgeting, savings goal tracking, transaction management with scam detection, stokvel group savings, and a conversational AI coach (powered by Google Gemini) that gives actionable, culturally-relevant financial advice — all monetized through a freemium subscription model via RevenueCat.

## Key Features

- **AI Financial Coach** — Gemini-powered chat with context-aware advice on budgeting, saving, investing, and debt management tailored to South Africa (stokvels, unit trusts, TFSAs)
- **Budget Planner** — Category-based budget tracking with visual progress bars and spending analysis
- **Savings Goals** — Set targets with deadlines, track progress, and get AI recommendations
- **Transaction Management** — Log transactions with smart categorization (Groceries, Transport, Bills, etc.)
- **Scam Shield** — Real-time 5-rule fraud scoring (velocity, reported numbers, scam keywords, unusual amounts, new recipients)
- **Stokvel Intelligence** — Group savings management with contribution tracking and payout rotation
- **Financial Health Score** — Dynamic score calculated from income/expense ratio, savings rate, and debt burden
- **Freemium Monetization** — 5 free AI messages/day, unlimited with Pro (R99/month via RevenueCat)
- **Responsive Design** — Full mobile and desktop experience with sidebar + bottom nav

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React Frontend │────▶│  FastAPI Backend  │────▶│  PostgreSQL │
│  (Clerk Auth)   │     │  (Auth Middleware)│     │  (Async)    │
└─────────────────┘     └──────┬───────────┘     └─────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌─────────┐ ┌────────┐ ┌──────────┐
              │ Gemini  │ │Revenue │ │  Clerk   │
              │   AI    │ │  Cat   │ │  JWKS    │
              └─────────┘ └────────┘ └──────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons |
| Auth | Clerk (frontend SDK + JWT verification) |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2 |
| AI | Google Gemini 1.5 Flash |
| Database | PostgreSQL 16 (via asyncpg) |
| Payments | RevenueCat (subscription management + webhooks) |
| Deployment | Docker Compose (3-service stack) |

## Quick Start

### Docker (Recommended)

```bash
cp backend/.env.example backend/.env
# Fill in your GEMINI_API_KEY, CLERK_SECRET_KEY, REVENUECAT_API_KEY
docker-compose up
```

App runs at `http://localhost:5173`, API at `http://localhost:8000`.

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # fill in keys
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Subscription Flow

1. User signs up free via Clerk → gets 5 AI messages/day
2. Server-side enforcement via `message_count` + `message_date` on User model
3. User hits limit → 429 response → upgrade prompt
4. Purchase verified through RevenueCat receipt validation
5. Webhook endpoint (`/api/subscriptions/webhook`) handles lifecycle events:
   - `INITIAL_PURCHASE` / `RENEWAL` → activate Pro
   - `CANCELLATION` / `EXPIRATION` → deactivate Pro

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `REVENUECAT_API_KEY` | RevenueCat secret API key |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `CORS_ORIGINS` | Allowed frontend origins |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (default: http://localhost:8000) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/coach` | Yes | Send message to AI coach (rate-limited) |
| GET | `/api/budget` | Yes | Get user's budget |
| POST | `/api/budget` | Yes | Save/update budget |
| GET | `/api/savings` | Yes | Get savings goals |
| POST | `/api/savings` | Yes | Save/update goals |
| GET | `/api/transactions` | Yes | List user transactions |
| POST | `/api/transactions` | Yes | Create transaction (with scam scoring) |
| GET | `/api/transactions/flagged` | Yes | Get flagged transactions |
| GET | `/api/transactions/summary` | Yes | 30-day spending breakdown |
| GET | `/api/transactions/{id}/scam-shield` | Yes | Get scam shield report for transaction |
| GET | `/api/stokvels` | Yes | List user's stokvels |
| POST | `/api/stokvels` | Yes | Create a stokvel group |
| GET | `/api/stokvels/{id}` | Yes | Get stokvel details |
| POST | `/api/stokvels/{id}/members` | Yes | Add member to stokvel |
| GET | `/api/stokvels/{id}/members` | Yes | List stokvel members |
| POST | `/api/stokvels/{id}/contributions` | Yes | Record contribution |
| GET | `/api/stokvels/{id}/contributions` | Yes | List contributions |
| GET | `/api/users/dashboard` | Yes | Dynamic financial dashboard |
| GET | `/api/users/me` | Yes | Get current user profile |
| POST | `/api/subscriptions/status/:id` | No | Check subscription status |
| POST | `/api/subscriptions/purchase` | Yes | Verify purchase receipt |
| POST | `/api/subscriptions/webhook` | No | RevenueCat webhook events |
| POST | `/api/ussd/callback` | No | Africa's Talking USSD webhook |

## What Makes This Different

- **Africa-first**: ZAR currency, local financial products, culturally relevant advice
- **Server-side security**: Auth middleware, rate limiting, and subscription enforcement all happen backend-side (not bypassable client-side)
- **Real monetization path**: RevenueCat integration with webhook lifecycle — ready for production
- **Production-ready**: Docker deployment, PostgreSQL persistence, async I/O throughout

## License

MIT
