from datetime import datetime, date
from app.models.models import Stokvel, StokvelMember, StokvelContribution
from app.database.db import get_db
from sqlalchemy import select, func


async def create_stokvel(user_id: str, data: dict, db) -> dict:
    stokvel = Stokvel(
        user_id=user_id,
        name=data["name"],
        contribution_amount=data["contribution_amount"],
        frequency=data.get("frequency", "monthly"),
        payout_rotation=data.get("payout_rotation", []),
        start_date=data.get("start_date"),
    )
    db.add(stokvel)
    await db.commit()
    await db.refresh(stokvel)
    return _stokvel_to_dict(stokvel)


async def get_user_stokvels(user_id: str, db) -> list[dict]:
    result = await db.execute(select(Stokvel).where(Stokvel.user_id == user_id).order_by(Stokvel.created_at.desc()))
    stokvels = result.scalars().all()
    return [_stokvel_to_dict(s) for s in stokvels]


async def get_stokvel(stokvel_id: str, user_id: str, db) -> dict | None:
    result = await db.execute(select(Stokvel).where(Stokvel.id == stokvel_id, Stokvel.user_id == user_id))
    stokvel = result.scalar_one_or_none()
    return _stokvel_to_dict(stokvel) if stokvel else None


async def add_member(stokvel_id: str, user_id: str, data: dict, db) -> dict:
    result = await db.execute(select(Stokvel).where(Stokvel.id == stokvel_id, Stokvel.user_id == user_id))
    stokvel = result.scalar_one_or_none()
    if not stokvel:
        raise ValueError("Stokvel not found")

    member = StokvelMember(
        stokvel_id=stokvel_id,
        name=data["name"],
        phone=data.get("phone"),
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    if member.name not in stokvel.payout_rotation:
        stokvel.payout_rotation = stokvel.payout_rotation + [member.name]
        await db.commit()

    return _member_to_dict(member)


async def get_members(stokvel_id: str, user_id: str, db) -> list[dict]:
    result = await db.execute(
        select(StokvelMember).where(StokvelMember.stokvel_id == stokvel_id)
    )
    members = result.scalars().all()
    return [_member_to_dict(m) for m in members]


async def record_contribution(stokvel_id: str, user_id: str, data: dict, db) -> dict:
    result = await db.execute(select(Stokvel).where(Stokvel.id == stokvel_id, Stokvel.user_id == user_id))
    stokvel = result.scalar_one_or_none()
    if not stokvel:
        raise ValueError("Stokvel not found")

    contribution = StokvelContribution(
        stokvel_id=stokvel_id,
        member_id=data["member_id"],
        amount=data["amount"],
        date=data["date"],
        note=data.get("note"),
    )
    db.add(contribution)
    await db.commit()
    await db.refresh(contribution)
    return _contribution_to_dict(contribution)


async def get_contributions(stokvel_id: str, user_id: str, db) -> list[dict]:
    result = await db.execute(
        select(StokvelContribution)
        .where(StokvelContribution.stokvel_id == stokvel_id)
        .order_by(StokvelContribution.created_at.desc())
    )
    contributions = result.scalars().all()
    return [_contribution_to_dict(c) for c in contributions]


async def get_next_payout(stokvel_id: str, user_id: str, db) -> dict | None:
    result = await db.execute(select(Stokvel).where(Stokvel.id == stokvel_id, Stokvel.user_id == user_id))
    stokvel = result.scalar_one_or_none()
    if not stokvel:
        return None

    rotation = stokvel.payout_rotation or []
    idx = stokvel.current_payout_index % len(rotation) if rotation else 0

    today = date.today()
    start = datetime.strptime(stokvel.start_date, "%Y-%m-%d").date() if stokvel.start_date else today

    if stokvel.frequency == "monthly":
        next_date = start.replace(month=((start.month + idx - 1) % 12) + 1)
    else:
        next_date = start

    if rotation:
        return {
            "member": rotation[idx],
            "scheduled_date": str(next_date),
            "amount": stokvel.contribution_amount,
        }
    return None


def _stokvel_to_dict(s: Stokvel) -> dict:
    return {
        "id": str(s.id),
        "name": s.name,
        "contribution_amount": s.contribution_amount,
        "frequency": s.frequency,
        "payout_rotation": s.payout_rotation or [],
        "current_payout_index": s.current_payout_index,
        "start_date": s.start_date,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


def _member_to_dict(m: StokvelMember) -> dict:
    return {
        "id": str(m.id),
        "stokvel_id": m.stokvel_id,
        "name": m.name,
        "phone": m.phone,
        "joined_at": m.joined_at.isoformat() if m.joined_at else None,
    }


def _contribution_to_dict(c: StokvelContribution) -> dict:
    return {
        "id": str(c.id),
        "stokvel_id": c.stokvel_id,
        "member_id": c.member_id,
        "amount": c.amount,
        "date": c.date,
        "note": c.note,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
