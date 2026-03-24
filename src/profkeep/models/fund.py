from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from .account import utcnow

if TYPE_CHECKING:
    from .account import Account
    from .holding import Holding
    from .nav_history import FundNavHistory
    from .transaction import Transaction


class Fund(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    code: str = Field(max_length=6, unique=True, regex=r"^\d{6}$")
    name: str = Field(max_length=200)
    type: str | None = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    account_id: int | None = Field(default=None, foreign_key="account.id", ondelete="CASCADE")
    account: Account | None = Relationship(back_populates="funds")

    holdings: list[Holding] = Relationship(back_populates="fund")
    transactions: list[Transaction] = Relationship(back_populates="fund")
    nav_history: list[FundNavHistory] = Relationship(back_populates="fund", cascade_delete=True)
