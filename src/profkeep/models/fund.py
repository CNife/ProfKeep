from datetime import datetime
from re import match
from typing import TYPE_CHECKING, Optional

from pydantic import field_validator
from sqlmodel import Field, Relationship, SQLModel

from .account import utcnow

if TYPE_CHECKING:
    from .account import Account
    from .holding import Holding
    from .nav_history import FundNavHistory
    from .transaction import Transaction


class Fund(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(max_length=6, unique=True)
    name: str = Field(max_length=200)
    type: Optional[str] = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    account_id: Optional[int] = Field(default=None, foreign_key="account.id", ondelete="CASCADE")
    account: Optional["Account"] = Relationship(back_populates="funds")

    holdings: list["Holding"] = Relationship(back_populates="fund")
    transactions: list["Transaction"] = Relationship(back_populates="fund")
    nav_history: list["FundNavHistory"] = Relationship(back_populates="fund", cascade_delete=True)

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not match(r"^\d{6}$", v):
            raise ValueError("基金代码必须是6位数字")
        return v
