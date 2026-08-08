from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database.db import engine, Base
from app.api import budget, ai, savings, subscriptions, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="MaliMind AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(budget.router, prefix="/api/budget", tags=["budget"])
app.include_router(savings.router, prefix="/api/savings", tags=["savings"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["subscriptions"])


@app.get("/health")
async def health():
    return {"status": "ok"}
