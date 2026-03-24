from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .fund import Fund
    from .holding import Holding
    from .transaction import Transaction


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Account(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    funds: list["Fund"] = Relationship(back_populates="account", cascade_delete=True)
    holdings: list["Holding"] = Relationship(back_populates="account", cascade_delete=True)
    transactions: list["Transaction"] = Relationship(back_populates="account", cascade_delete=True)
