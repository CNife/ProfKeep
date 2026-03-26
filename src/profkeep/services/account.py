from sqlmodel import Session, select

from profkeep.models import database
from profkeep.models.account import Account


class AccountService:
    def __init__(self) -> None:
        pass

    def create_account(self, name: str, description: str | None = None) -> Account:
        if not name:
            from pydantic import ValidationError

            raise ValidationError.from_exception_data(
                "Account",
                [
                    {
                        "type": "string_too_short",
                        "loc": ("name",),
                        "msg": "String should have at least 1 character",
                        "input": name,
                        "ctx": {"min_length": 1},
                    }
                ],
            )

        with Session(database.engine) as session:
            existing = session.exec(select(Account).where(Account.name == name)).first()
            if existing:
                raise ValueError("账户名称已存在")

            account = Account.model_validate({"name": name, "description": description})
            session.add(account)
            session.commit()
            session.refresh(account)
            return account

    def get_account(self, account_id: int) -> Account:
        with Session(database.engine) as session:
            account = session.get(Account, account_id)
            if not account:
                raise ValueError("账户不存在")
            return account

    def get_all_accounts(self) -> list[Account]:
        with Session(database.engine) as session:
            return session.exec(select(Account).order_by(Account.created_at)).all()

    def update_account(self, account_id: int, name: str, description: str | None = None) -> Account:
        with Session(database.engine) as session:
            account = session.get(Account, account_id)
            if not account:
                raise ValueError("账户不存在")

            existing = session.exec(
                select(Account).where(Account.name == name, Account.id != account_id)
            ).first()
            if existing:
                raise ValueError("账户名称已存在")

            account.name = name
            account.description = description
            session.add(account)
            session.commit()
            session.refresh(account)
            return account

    def delete_account(self, account_id: int) -> None:
        with Session(database.engine) as session:
            account = session.get(Account, account_id)
            if not account:
                raise ValueError("账户不存在")

            session.delete(account)
            session.commit()
