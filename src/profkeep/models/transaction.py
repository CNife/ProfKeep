from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING, Optional, Self

from pydantic import model_validator
from sqlmodel import Field, Relationship, SQLModel

from .account import utcnow

if TYPE_CHECKING:
    from .account import Account
    from .fund import Fund


class TransactionType(StrEnum):
    buy = "buy"
    sell = "sell"
    dividend_cash = "dividend_cash"
    dividend_reinvest = "dividend_reinvest"


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: TransactionType
    date: date
    shares: Optional[Decimal] = Field(default=None, max_digits=15, decimal_places=4)
    amount: Optional[Decimal] = Field(default=None, max_digits=15, decimal_places=2)
    fee: Decimal = Field(default=Decimal("0"), max_digits=10, decimal_places=2, ge=0)
    net_value: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=4)
    confirmed: bool = Field(default=True)
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utcnow)

    account_id: int = Field(foreign_key="account.id", ondelete="CASCADE")
    account: Optional["Account"] = Relationship(back_populates="transactions")

    fund_id: int = Field(foreign_key="fund.id")
    fund: Optional["Fund"] = Relationship(back_populates="transactions")

    @model_validator(mode="after")
    def validate_type_fields(self) -> Self:
        if self.type == TransactionType.buy:
            if self.shares is None or self.amount is None:
                raise ValueError("买入交易必须填写份额和金额")
        elif self.type == TransactionType.sell:
            if self.shares is None or self.amount is None:
                raise ValueError("卖出交易必须填写份额和金额")
        elif self.type == TransactionType.dividend_cash:
            if self.amount is None:
                raise ValueError("现金分红必须填写金额")
            if self.shares is not None:
                raise ValueError("现金分红不能填写份额")
        elif self.type == TransactionType.dividend_reinvest:
            if self.shares is None:
                raise ValueError("红利再投资必须填写份额")
        return self
