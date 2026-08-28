from sqlalchemy import Column, String, Float, DateTime, JSON, Boolean, Integer, Date, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, date
import uuid
from enum import Enum as PyEnum
from app.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    clerk_id = Column(String, unique=True, nullable=False)
    is_pro = Column(Boolean, default=False)
    message_count = Column(Integer, default=0)
    message_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)


class BudgetData(Base):
    __tablename__ = "budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)
    income = Column(Float, default=0)
    categories = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SavingsData(Base):
    __tablename__ = "savings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)
    goals = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, default="Uncategorized")
    description = Column(String)
    transaction_type = Column(String, default="expense")  # income | expense
    merchant = Column(String)
    recipient = Column(String)
    flagged = Column(Boolean, default=False)
    fraud_score = Column(Integer, default=0)
    fraud_reasons = Column(JSON, default=list)
    smart_category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Stokvel(Base):
    __tablename__ = "stokvels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    contribution_amount = Column(Float, nullable=False)
    frequency = Column(String, default="monthly")  # weekly | monthly
    payout_rotation = Column(JSON, default=list)  # ordered list of member IDs/names
    current_payout_index = Column(Integer, default=0)
    start_date = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class StokvelMember(Base):
    __tablename__ = "stokvel_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stokvel_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    joined_at = Column(DateTime, default=datetime.utcnow)


class StokvelContribution(Base):
    __tablename__ = "stokvel_contributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stokvel_id = Column(String, nullable=False, index=True)
    member_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    note = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
