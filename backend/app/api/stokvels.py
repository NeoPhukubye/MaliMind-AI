from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.schemas import (
    StokvelCreate,
    StokvelResponse,
    StokvelMemberCreate,
    StokvelMemberResponse,
    StokvelContributionCreate,
    StokvelContributionResponse,
)
from app.services.stokvel_service import (
    create_stokvel,
    get_user_stokvels,
    get_stokvel,
    add_member,
    get_members,
    record_contribution,
    get_contributions,
    get_next_payout,
)
from app.database.db import get_db
from app.core.auth import get_current_user_id

router = APIRouter()


@router.post("", response_model=StokvelResponse)
async def create(req: StokvelCreate, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await create_stokvel(user_id, req.model_dump(), db)


@router.get("", response_model=list[StokvelResponse])
async def list_stokvels(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    return await get_user_stokvels(user_id, db)


@router.get("/{stokvel_id}", response_model=StokvelResponse)
async def get_one(stokvel_id: str, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    s = await get_stokvel(stokvel_id, user_id, db)
    if not s:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Stokvel not found")
    return s


@router.post("/{stokvel_id}/members", response_model=StokvelMemberResponse)
async def add_stokvel_member(
    stokvel_id: str,
    req: StokvelMemberCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await add_member(stokvel_id, user_id, req.model_dump(), db)


@router.get("/{stokvel_id}/members", response_model=list[StokvelMemberResponse])
async def list_members(
    stokvel_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await get_members(stokvel_id, user_id, db)


@router.post("/{stokvel_id}/contributions", response_model=StokvelContributionResponse)
async def add_contribution(
    stokvel_id: str,
    req: StokvelContributionCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await record_contribution(stokvel_id, user_id, req.model_dump(), db)


@router.get("/{stokvel_id}/contributions", response_model=list[StokvelContributionResponse])
async def list_contributions(
    stokvel_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
):
    return await get_contributions(stokvel_id, user_id, db)


@router.get("/{stokvel_id}/next-payout")
async def next_payout(stokvel_id: str, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    payout = await get_next_payout(stokvel_id, user_id, db)
    if not payout:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No payout scheduled")
    return payout
