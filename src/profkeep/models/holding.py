from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from .account import utcnow

if TYPE_CHECKING:
    from .account import Account
    from .fund import Fund


class Holding(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    shares: Decimal = Field(max_digits=15, decimal_places=4)
    cost_price: Decimal = Field(max_digits=10, decimal_places=4)
    updated_at: datetime = Field(default_factory=utcnow)

    account_id: int = Field(foreign_key="account.id", ondelete="CASCADE")
    account: Account | None = Relationship(back_populates="holdings")

    fund_id: int = Field(foreign_key="fund.id")
    fund: Fund | None = Relationship(back_populates="holdings")

    __table_args__ = (UniqueConstraint("account_id", "fund_id", name="uq_holdings_account_fund"),)
