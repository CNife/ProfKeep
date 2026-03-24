from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from .account import utcnow

if TYPE_CHECKING:
    from .fund import Fund


class FundNavHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    nav: Decimal = Field(max_digits=10, decimal_places=4)
    acc_nav: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=4)
    cached_at: datetime = Field(default_factory=utcnow)

    fund_id: int = Field(foreign_key="fund.id", ondelete="CASCADE")
    fund: Optional["Fund"] = Relationship(back_populates="nav_history")

    __table_args__ = (UniqueConstraint("fund_id", "date", name="uq_fund_nav_history_fund_date"),)


class IndexNavHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(max_length=10)
    date: date
    close: Decimal = Field(max_digits=10, decimal_places=4)
    cached_at: datetime = Field(default_factory=utcnow)

    __table_args__ = (UniqueConstraint("code", "date", name="uq_index_nav_history_code_date"),)
