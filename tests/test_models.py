from datetime import date
from decimal import Decimal

import pytest

from profkeep.models import (
    Account,
    Fund,
    FundNavHistory,
    Holding,
    IndexNavHistory,
    Transaction,
    TransactionType,
    init_db,
)


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


class TestAccount:
    def test_create_account(self):
        account = Account(name="测试账户", description="测试描述")
        assert account.name == "测试账户"
        assert account.description == "测试描述"

    def test_unique_name(self):
        from sqlmodel import Session

        from profkeep.models.database import engine

        account1 = Account(name="账户1")
        account2 = Account(name="账户1")

        with Session(engine) as session:
            session.add(account1)
            session.commit()

        with Session(engine) as session:
            session.add(account2)
            with pytest.raises(Exception):  # IntegrityError
                session.commit()


class TestFund:
    def test_create_fund(self):
        fund = Fund(code="000001", name="华夏成长", type="股票型")
        assert fund.code == "000001"
        assert fund.name == "华夏成长"
        assert fund.type == "股票型"

    def test_code_regex_validation(self):
        with pytest.raises(ValueError):
            Fund(code="abc123", name="测试基金")

    def test_unique_code(self):
        from sqlmodel import Session

        from profkeep.models.database import engine

        fund1 = Fund(code="000001", name="基金1")
        fund2 = Fund(code="000001", name="基金2")

        with Session(engine) as session:
            session.add(fund1)
            session.commit()

        with Session(engine) as session:
            session.add(fund2)
            with pytest.raises(Exception):
                session.commit()


class TestHolding:
    def test_create_holding(self):
        from sqlmodel import Session

        from profkeep.models.database import engine

        with Session(engine) as session:
            account = Account(name="账户1")
            fund = Fund(code="000001", name="测试基金")
            session.add(account)
            session.add(fund)
            session.commit()
            session.refresh(account)
            session.refresh(fund)

            holding = Holding(
                account_id=account.id,
                fund_id=fund.id,
                shares=Decimal("1000.1234"),
                cost_price=Decimal("1.5000"),
            )
            session.add(holding)
            session.commit()


class TestTransaction:
    def test_buy_transaction(self):
        tx = Transaction(
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )
        assert tx.type == TransactionType.buy
        assert tx.confirmed is True

    def test_buy_missing_shares(self):
        with pytest.raises(ValueError, match="买入交易必须填写份额和金额"):
            Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                amount=Decimal("1500.00"),
            )

    def test_buy_missing_amount(self):
        with pytest.raises(ValueError, match="买入交易必须填写份额和金额"):
            Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
            )

    def test_sell_transaction(self):
        tx = Transaction(
            type=TransactionType.sell,
            date=date(2024, 1, 15),
            shares=Decimal("500.0000"),
            amount=Decimal("800.00"),
        )
        assert tx.type == TransactionType.sell

    def test_sell_missing_shares(self):
        with pytest.raises(ValueError, match="卖出交易必须填写份额和金额"):
            Transaction(
                type=TransactionType.sell,
                date=date(2024, 1, 15),
                amount=Decimal("800.00"),
            )

    def test_dividend_cash(self):
        tx = Transaction(
            type=TransactionType.dividend_cash,
            date=date(2024, 1, 15),
            amount=Decimal("200.00"),
        )
        assert tx.type == TransactionType.dividend_cash

    def test_dividend_cash_missing_amount(self):
        with pytest.raises(ValueError, match="现金分红必须填写金额"):
            Transaction(
                type=TransactionType.dividend_cash,
                date=date(2024, 1, 15),
            )

    def test_dividend_cash_with_shares(self):
        with pytest.raises(ValueError, match="现金分红不能填写份额"):
            Transaction(
                type=TransactionType.dividend_cash,
                date=date(2024, 1, 15),
                amount=Decimal("200.00"),
                shares=Decimal("100.0000"),
            )

    def test_dividend_reinvest(self):
        tx = Transaction(
            type=TransactionType.dividend_reinvest,
            date=date(2024, 1, 15),
            shares=Decimal("100.0000"),
        )
        assert tx.type == TransactionType.dividend_reinvest

    def test_dividend_reinvest_missing_shares(self):
        with pytest.raises(ValueError, match="红利再投资必须填写份额"):
            Transaction(
                type=TransactionType.dividend_reinvest,
                date=date(2024, 1, 15),
            )

    def test_fee_default_zero(self):
        tx = Transaction(
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )
        assert tx.fee == Decimal("0")

    def test_fee_negative(self):
        with pytest.raises(ValueError):
            Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                fee=Decimal("-10.00"),
            )


class TestFundNavHistory:
    def test_create_nav_history(self):
        from sqlmodel import Session

        from profkeep.models.database import engine

        with Session(engine) as session:
            fund = Fund(code="000001", name="测试基金")
            session.add(fund)
            session.commit()
            session.refresh(fund)

            nav = FundNavHistory(
                fund_id=fund.id,
                date=date(2024, 1, 15),
                nav=Decimal("1.5000"),
                acc_nav=Decimal("2.0000"),
            )
            session.add(nav)
            session.commit()


class TestIndexNavHistory:
    def test_create_index_nav(self):
        from sqlmodel import Session

        from profkeep.models.database import engine

        with Session(engine) as session:
            index_nav = IndexNavHistory(
                code="000300.SH",
                date=date(2024, 1, 15),
                close=Decimal("3500.1234"),
            )
            session.add(index_nav)
            session.commit()
