"""HoldingService 单元测试。"""

import uuid
from datetime import date
from decimal import Decimal

import pytest
from sqlmodel import Session

from profkeep.models import Account, Fund, Holding, Transaction, TransactionType, database, init_db
from profkeep.services.holding import HoldingService


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    """设置临时测试数据库。"""
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


@pytest.fixture
def service():
    """创建 HoldingService 实例。"""
    return HoldingService()


@pytest.fixture
def setup_data(request):
    """创建测试用的账户和基金。"""
    unique_suffix = uuid.uuid4().hex[:6]
    unique_name = f"账户_{unique_suffix}"
    unique_code = f"{uuid.uuid4().hex[:6]}"
    with Session(database.engine) as session:
        account = Account(name=unique_name)
        fund = Fund(code=unique_code, name="测试基金")
        session.add(account)
        session.add(fund)
        session.commit()
        session.refresh(account)
        session.refresh(fund)
        yield {"account_id": account.id, "fund_id": fund.id}


class TestRecalculateBuyOnly:
    """测试买入交易生成持仓。"""

    def test_recalculate_buy_only(self, service, setup_data):
        """买入交易生成持仓。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 创建买入交易: shares=1000, amount=1500, fee=15
        with Session(database.engine) as session:
            tx = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                fee=Decimal("15.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx)
            session.commit()

        # 执行重算
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证持仓
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is not None
            assert holding.shares == Decimal("1000.0000")
            # 成本价 = (1500 + 15) / 1000 = 1.515
            assert holding.cost_price == Decimal("1.5150")


class TestRecalculateBuyAndSell:
    """测试买入 + 卖出后持仓更新。"""

    def test_recalculate_buy_and_sell(self, service, setup_data):
        """买入 + 卖出后持仓更新。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        with Session(database.engine) as session:
            # 买入: shares=1000, amount=1500, fee=15
            tx1 = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                fee=Decimal("15.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx1)

            # 卖出: shares=500, amount=800, fee=10
            tx2 = Transaction(
                type=TransactionType.sell,
                date=date(2024, 2, 15),
                shares=Decimal("500.0000"),
                amount=Decimal("800.00"),
                fee=Decimal("10.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx2)
            session.commit()

        # 执行重算
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证持仓
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is not None
            # 总份额 = 1000 - 500 = 500
            assert holding.shares == Decimal("500.0000")
            # 总成本 = (1500 + 15) - (800 - 10) = 1515 - 790 = 725
            # 成本价 = 725 / 500 = 1.45
            assert holding.cost_price == Decimal("1.4500")


class TestRecalculateZeroSharesDeletesHolding:
    """测试份额归零删除持仓。"""

    def test_recalculate_zero_shares_deletes_holding(self, service, setup_data):
        """份额归零删除持仓。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 先创建一个持仓
        with Session(database.engine) as session:
            holding = Holding(
                account_id=account_id,
                fund_id=fund_id,
                shares=Decimal("1000.0000"),
                cost_price=Decimal("1.5000"),
            )
            session.add(holding)
            session.commit()

        # 创建买入 + 卖出全部份额的交易
        with Session(database.engine) as session:
            tx1 = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx1)

            tx2 = Transaction(
                type=TransactionType.sell,
                date=date(2024, 2, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1600.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx2)
            session.commit()

        # 执行重算
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证持仓被删除
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is None


class TestRecalculateUnconfirmedExcluded:
    """测试未确认交易不计入。"""

    def test_recalculate_unconfirmed_excluded(self, service, setup_data):
        """未确认交易不计入。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        with Session(database.engine) as session:
            # 已确认买入: shares=1000
            tx1 = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx1)

            # 未确认买入: shares=500
            tx2 = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 20),
                shares=Decimal("500.0000"),
                amount=Decimal("750.00"),
                confirmed=False,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx2)
            session.commit()

        # 执行重算
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证持仓仅计算已确认交易
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is not None
            # 仅计算已确认的 1000 份额
            assert holding.shares == Decimal("1000.0000")
            assert holding.cost_price == Decimal("1.5000")


class TestRecalculateDividendReinvest:
    """测试红利再投资计入份额和成本。"""

    def test_recalculate_dividend_reinvest(self, service, setup_data):
        """红利再投资计入份额和成本。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        with Session(database.engine) as session:
            # 买入: shares=1000, amount=1500
            tx1 = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx1)

            # 红利再投资: shares=50, amount=75
            tx2 = Transaction(
                type=TransactionType.dividend_reinvest,
                date=date(2024, 3, 15),
                shares=Decimal("50.0000"),
                amount=Decimal("75.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx2)
            session.commit()

        # 执行重算
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证持仓
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is not None
            # 总份额 = 1000 + 50 = 1050
            assert holding.shares == Decimal("1050.0000")
            # 总成本 = 1500 + 75 = 1575
            # 成本价 = 1575 / 1050 = 1.5
            assert holding.cost_price == Decimal("1.5000")


class TestRecalculateDividendCashIgnored:
    """测试现金分红不影响持仓。"""

    def test_recalculate_dividend_cash_ignored(self, service, setup_data):
        """现金分红不影响持仓。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        with Session(database.engine) as session:
            # 买入: shares=1000, amount=1500
            tx1 = Transaction(
                type=TransactionType.buy,
                date=date(2024, 1, 15),
                shares=Decimal("1000.0000"),
                amount=Decimal("1500.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx1)

            # 现金分红: amount=100 (不影响份额和成本)
            tx2 = Transaction(
                type=TransactionType.dividend_cash,
                date=date(2024, 3, 15),
                amount=Decimal("100.00"),
                confirmed=True,
                account_id=account_id,
                fund_id=fund_id,
            )
            session.add(tx2)
            session.commit()

        # 执行重算
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证持仓不受现金分红影响
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is not None
            # 份额不变
            assert holding.shares == Decimal("1000.0000")
            # 成本价不变
            assert holding.cost_price == Decimal("1.5000")


class TestRecalculateNoTransactionsNoHolding:
    """测试无交易时无操作。"""

    def test_recalculate_no_transactions_no_holding(self, service, setup_data):
        """无交易时无操作。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 执行重算（无交易）
        service.recalculate_from_transactions(account_id, fund_id)

        # 验证无持仓创建
        with Session(database.engine) as session:
            holding = session.exec(
                Holding.__table__.select().where(
                    Holding.account_id == account_id, Holding.fund_id == fund_id
                )
            ).first()

            assert holding is None
