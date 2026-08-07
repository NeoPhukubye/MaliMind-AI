# MaliMind AI

> Your AI Financial Coach for Africa.

## Overview

MaliMind AI is an AI-powered financial coaching platform that helps users build healthier financial habits through intelligent budgeting, savings planning, debt optimization, and personalized financial guidance.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** FastAPI, Python 3.12
- **AI:** Google Gemini API
- **Database:** PostgreSQL
- **Auth:** Clerk
- **Payments:** RevenueCat

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker

```bash
docker-compose up
```

## Environment Variables

Copy `.env.example` files in both `frontend/` and `backend/` directories and fill in your keys.

## Features

- AI Financial Coach chat
- Budget Planner with category tracking
- Savings Goal Planner with progress
- Financial Health Score
- RevenueCat subscription paywall (Free / Pro tiers)
- Responsive dashboard with spending charts

## License

MIT
