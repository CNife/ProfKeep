import pytest
from pydantic import ValidationError

from profkeep.models import Fund, Holding, Transaction, TransactionType, init_db
from profkeep.services import AccountService


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


@pytest.fixture
def service():
    return AccountService()


class TestCreateAccount:
    def test_create_account(self, service):
        account = service.create_account(name="测试账户", description="测试描述")
        assert account.name == "测试账户"
        assert account.description == "测试描述"
        assert account.id is not None

    def test_create_account_duplicate_name(self, service):
        service.create_account(name="账户 1")
        with pytest.raises(ValueError, match="账户名称已存在"):
            service.create_account(name="账户 1")

    def test_create_account_empty_name(self, service):
        with pytest.raises(ValidationError):
            service.create_account(name="")


class TestGetAccount:
    def test_get_account(self, service):
        created = service.create_account(name="测试账户")
        account = service.get_account(created.id)
        assert account.id == created.id
        assert account.name == "测试账户"

    def test_get_account_not_found(self, service):
        with pytest.raises(ValueError, match="账户不存在"):
            service.get_account(999)

    def test_get_all_accounts(self, service):
        service.create_account(name="账户 1")
        service.create_account(name="账户 2")
        accounts = service.get_all_accounts()
        assert len(accounts) == 2
        assert accounts[0].name == "账户 1"
        assert accounts[1].name == "账户 2"


class TestUpdateAccount:
    def test_update_account(self, service):
        created = service.create_account(name="旧名称", description="旧描述")
        updated = service.update_account(created.id, name="新名称", description="新描述")
        assert updated.id == created.id
        assert updated.name == "新名称"
        assert updated.description == "新描述"

    def test_update_account_duplicate_name(self, service):
        service.create_account(name="账户 1")
        account2 = service.create_account(name="账户 2")
        with pytest.raises(ValueError, match="账户名称已存在"):
            service.update_account(account2.id, name="账户 1")


class TestDeleteAccount:
    def test_delete_account(self, service):
        created = service.create_account(name="测试账户")
        service.delete_account(created.id)
        with pytest.raises(ValueError, match="账户不存在"):
            service.get_account(created.id)

    def test_delete_account_cascade(self, service):
        from datetime import date

        from sqlmodel import Session

        from profkeep.models.database import engine

        account = service.create_account(name="测试账户")

        with Session(engine) as session:
            fund = Fund(code="000001", name="测试基金", account_id=account.id)
            session.add(fund)
            session.commit()
            session.refresh(fund)

            holding = Holding(
                account_id=account.id,
                fund_id=fund.id,
                shares=1000.1234,
                cost_price=1.5000,
            )
            session.add(holding)
            session.commit()

            transaction = Transaction(
                account_id=account.id,
                fund_id=fund.id,
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=1000.0000,
                amount=1500.00,
            )
            session.add(transaction)
            session.commit()

        service.delete_account(account.id)

        with Session(engine) as session:
            funds = session.query(Fund).filter(Fund.account_id == account.id).all()
            assert len(funds) == 0

            holdings = session.query(Holding).filter(Holding.account_id == account.id).all()
            assert len(holdings) == 0

            transactions = (
                session.query(Transaction).filter(Transaction.account_id == account.id).all()
            )
            assert len(transactions) == 0

    def test_delete_account_not_found(self, service):
        with pytest.raises(ValueError, match="账户不存在"):
            service.delete_account(999)
