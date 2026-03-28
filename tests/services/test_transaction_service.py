"""TransactionService 单元测试。"""

import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlmodel import Session

from profkeep.models import Account, Fund, TransactionType, database, init_db
from profkeep.services.holding import HoldingService
from profkeep.services.transaction import TransactionService


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
    """创建 TransactionService 实例。"""
    return TransactionService()


@pytest.fixture
def setup_data():
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


class TestCreateBuyTransaction:
    """测试创建买入交易。"""

    def test_create_buy_transaction(self, service, setup_data):
        """创建买入交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
            fee=Decimal("15.00"),
        )

        assert tx.id is not None
        assert tx.type == TransactionType.buy
        assert tx.date == date(2024, 1, 15)
        assert tx.shares == Decimal("1000.0000")
        assert tx.amount == Decimal("1500.00")
        assert tx.fee == Decimal("15.00")
        assert tx.confirmed is True


class TestCreateSellTransaction:
    """测试创建卖出交易。"""

    def test_create_sell_transaction(self, service, setup_data):
        """创建卖出交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.sell,
            date=date(2024, 2, 15),
            shares=Decimal("500.0000"),
            amount=Decimal("800.00"),
            fee=Decimal("10.00"),
        )

        assert tx.id is not None
        assert tx.type == TransactionType.sell
        assert tx.shares == Decimal("500.0000")
        assert tx.amount == Decimal("800.00")


class TestCreateDividendCash:
    """测试创建现金分红。"""

    def test_create_dividend_cash(self, service, setup_data):
        """创建现金分红。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.dividend_cash,
            date=date(2024, 3, 15),
            amount=Decimal("100.00"),
        )

        assert tx.id is not None
        assert tx.type == TransactionType.dividend_cash
        assert tx.shares is None
        assert tx.amount == Decimal("100.00")


class TestCreateDividendReinvest:
    """测试创建红利再投资。"""

    def test_create_dividend_reinvest(self, service, setup_data):
        """创建红利再投资。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.dividend_reinvest,
            date=date(2024, 3, 15),
            shares=Decimal("50.0000"),
            amount=Decimal("75.00"),
        )

        assert tx.id is not None
        assert tx.type == TransactionType.dividend_reinvest
        assert tx.shares == Decimal("50.0000")
        assert tx.amount == Decimal("75.00")


class TestGetTransaction:
    """测试获取单个交易。"""

    def test_get_transaction(self, service, setup_data):
        """获取单个交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        created = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )

        tx = service.get_transaction(created.id)
        assert tx.id == created.id
        assert tx.type == TransactionType.buy

    def test_get_transaction_not_found(self, service):
        """交易不存在抛异常。"""
        with pytest.raises(ValueError, match="交易不存在"):
            service.get_transaction(99999)


class TestListTransactions:
    """测试列出交易。"""

    def test_list_transactions_by_account(self, service, setup_data):
        """按账户列出交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 创建 3 笔交易
        service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )
        service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.sell,
            date=date(2024, 2, 15),
            shares=Decimal("500.0000"),
            amount=Decimal("800.00"),
        )
        service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.dividend_cash,
            date=date(2024, 3, 15),
            amount=Decimal("100.00"),
        )

        txs = service.list_transactions(account_id)
        assert len(txs) == 3

    def test_list_transactions_sorted_by_date_desc(self, service, setup_data):
        """按日期倒序。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 按非日期顺序创建
        tx1 = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )
        tx3 = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.sell,
            date=date(2024, 3, 15),
            shares=Decimal("500.0000"),
            amount=Decimal("800.00"),
        )
        tx2 = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 2, 15),
            shares=Decimal("500.0000"),
            amount=Decimal("750.00"),
        )

        txs = service.list_transactions(account_id)
        # 应按日期倒序：3月 > 2月 > 1月
        assert txs[0].id == tx3.id
        assert txs[1].id == tx2.id
        assert txs[2].id == tx1.id


class TestUpdateTransaction:
    """测试更新交易。"""

    def test_update_transaction(self, service, setup_data):
        """更新交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )

        updated = service.update_transaction(
            tx.id, shares=Decimal("1200.0000"), amount=Decimal("1800.00")
        )

        assert updated.shares == Decimal("1200.0000")
        assert updated.amount == Decimal("1800.00")


class TestDeleteTransaction:
    """测试删除交易。"""

    def test_delete_transaction(self, service, setup_data):
        """删除交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
        )

        service.delete_transaction(tx.id)

        with pytest.raises(ValueError, match="交易不存在"):
            service.get_transaction(tx.id)


class TestCreateTriggersHoldingRecalc:
    """测试创建后持仓自动更新。"""

    def test_create_triggers_holding_recalc(self, service, setup_data):
        """创建后持仓自动更新。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 创建买入交易: shares=1000, amount=1500, fee=15
        service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
            fee=Decimal("15.00"),
            confirmed=True,
        )

        # 验证持仓自动创建
        holding_service = HoldingService()
        holdings = holding_service.get_holdings_by_account(account_id)
        assert len(holdings) == 1
        assert holdings[0].holding.shares == Decimal("1000.0000")
        # 成本价 = (1500 + 15) / 1000 = 1.515
        assert holdings[0].holding.cost_price == Decimal("1.5150")


class TestUpdateTriggersHoldingRecalc:
    """测试更新后持仓重算。"""

    def test_update_triggers_holding_recalc(self, service, setup_data):
        """更新后持仓重算。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 创建买入交易
        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
            confirmed=True,
        )

        # 更新交易
        service.update_transaction(tx.id, shares=Decimal("2000.0000"), amount=Decimal("3000.00"))

        # 验证持仓更新
        holding_service = HoldingService()
        holdings = holding_service.get_holdings_by_account(account_id)
        assert holdings[0].holding.shares == Decimal("2000.0000")
        assert holdings[0].holding.cost_price == Decimal("1.5000")


class TestDeleteTriggersHoldingRecalc:
    """测试删除后持仓重算。"""

    def test_delete_triggers_holding_recalc(self, service, setup_data):
        """删除后持仓重算。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]

        # 创建买入交易
        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=date(2024, 1, 15),
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
            confirmed=True,
        )

        # 验证持仓存在
        holding_service = HoldingService()
        holdings = holding_service.get_holdings_by_account(account_id)
        assert len(holdings) == 1

        # 删除交易
        service.delete_transaction(tx.id)

        # 验证持仓被删除
        holdings = holding_service.get_holdings_by_account(account_id)
        assert len(holdings) == 0


class TestAutoConfirmPendingTransactions:
    """测试自动确认 T+1 交易。"""

    def test_auto_confirm_pending_transactions(self, service, setup_data):
        """自动确认 T+1 交易。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]
        today = date.today()
        yesterday = today - timedelta(days=1)
        day_before = today - timedelta(days=2)

        # 创建 3 笔交易：2 笔旧交易未确认，1 笔今天交易未确认
        tx1 = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=day_before,
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
            confirmed=False,
        )
        tx2 = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=yesterday,
            shares=Decimal("500.0000"),
            amount=Decimal("750.00"),
            confirmed=False,
        )
        tx3 = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=today,
            shares=Decimal("300.0000"),
            amount=Decimal("450.00"),
            confirmed=False,
        )

        # 执行自动确认
        count = service.auto_confirm_transactions(account_id)

        # 应确认 2 笔旧交易
        assert count == 2

        # 验证交易状态
        tx1_check = service.get_transaction(tx1.id)
        tx2_check = service.get_transaction(tx2.id)
        tx3_check = service.get_transaction(tx3.id)

        assert tx1_check.confirmed is True
        assert tx2_check.confirmed is True
        assert tx3_check.confirmed is False  # 今天的交易不确认

    def test_auto_confirm_already_confirmed_untouched(self, service, setup_data):
        """已确认交易不变。"""
        account_id = setup_data["account_id"]
        fund_id = setup_data["fund_id"]
        yesterday = date.today() - timedelta(days=1)

        # 创建已确认交易
        tx = service.create_transaction(
            account_id=account_id,
            fund_id=fund_id,
            type=TransactionType.buy,
            date=yesterday,
            shares=Decimal("1000.0000"),
            amount=Decimal("1500.00"),
            confirmed=True,
        )

        # 执行自动确认
        count = service.auto_confirm_transactions(account_id)

        # 已确认交易不计入
        assert count == 0

        # 验证交易状态不变
        tx_check = service.get_transaction(tx.id)
        assert tx_check.confirmed is True
