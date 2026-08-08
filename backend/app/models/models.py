from sqlalchemy import Column, String, Float, DateTime, JSON, Boolean, Integer, Date
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, date
import uuid
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
