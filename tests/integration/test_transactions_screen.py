"""交易记录界面集成测试。"""

from datetime import date
from decimal import Decimal

import pytest
from textual.app import App
from textual.widgets import DataTable, Label, Select

from profkeep.models import init_db
from profkeep.models.transaction import TransactionType
from profkeep.screens.transactions import TransactionsScreen


class TransactionsTestApp(App):
    def __init__(self, account_id: int | None = None):
        super().__init__()
        self.account_id = account_id

    def on_mount(self) -> None:
        self.push_screen(TransactionsScreen(account_id=self.account_id))


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


def create_test_data():
    """创建测试数据：账户、基金、交易记录。"""
    from profkeep.services import AccountService

    account_service = AccountService()
    account = account_service.create_account(name="测试账户")

    # 创建基金（直接操作数据库，避免异步）
    from sqlmodel import Session

    from profkeep.models import database
    from profkeep.models.fund import Fund

    with Session(database.engine) as session:
        fund1 = Fund(code="000001", name="测试基金1", type="股票型")
        fund2 = Fund(code="000002", name="测试基金2", type="债券型")
        session.add(fund1)
        session.add(fund2)
        session.commit()
        session.refresh(fund1)
        session.refresh(fund2)

    return account, fund1, fund2


class TestScreenRendering:
    """屏幕渲染测试。"""

    async def test_screen_renders_with_transactions(self):
        """测试有交易记录时屏幕正常渲染。"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()
        tx_service.create_transaction(
            account_id=account.id,
            fund_id=fund1.id,
            type=TransactionType.buy,
            date=date(2024, 1, 1),
            shares=Decimal("100.00"),
            amount=Decimal("1000.00"),
        )

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            assert table is not None
            assert table.row_count == 1

    async def test_screen_empty_state(self):
        """测试空状态显示。"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            assert table.visible is False

            empty_label = pilot.app.screen.query_one("#empty-state", Label)
            assert empty_label.visible is True
            assert "暂无交易" in str(empty_label.content) or "暂无交易" in str(empty_label)

    async def test_account_filter(self):
        """测试账户筛选功能。"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()

        tx_service = TransactionService()
        tx_service.create_transaction(
            account_id=account.id,
            fund_id=fund1.id,
            type=TransactionType.buy,
            date=date(2024, 1, 1),
            shares=Decimal("100.00"),
            amount=Decimal("1000.00"),
        )

        async with TransactionsTestApp().run_test() as pilot:
            await pilot.pause()

            # 检查账户筛选下拉框存在
            account_select = pilot.app.screen.query_one("#account-filter", Select)
            assert account_select is not None


class TestKeyboardShortcuts:
    """键盘快捷键测试。"""

    async def test_j_k_navigation(self):
        """测试 j/k 上下导航。"""
        from profkeep.services import TransactionService

        account, fund1, fund2 = create_test_data()
        tx_service = TransactionService()

        # 创建多条交易记录
        for i in range(3):
            tx_service.create_transaction(
                account_id=account.id,
                fund_id=fund1.id,
                type=TransactionType.buy,
                date=date(2024, 1, i + 1),
                shares=Decimal("100.00"),
                amount=Decimal("1000.00"),
            )

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            initial_cursor = table.cursor_row

            await pilot.press("j")
            await pilot.pause()
            assert table.cursor_row >= initial_cursor

            await pilot.press("k")
            await pilot.pause()

    async def test_add_modal_opens_on_n(self):
        """测试按 n 打开新增交易弹窗。"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            assert len(pilot.app.screen_stack) > 1

    async def test_edit_modal_opens_on_e(self):
        """测试按 e 打开编辑交易弹窗。"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()
        tx_service.create_transaction(
            account_id=account.id,
            fund_id=fund1.id,
            type=TransactionType.buy,
            date=date(2024, 1, 1),
            shares=Decimal("100.00"),
            amount=Decimal("1000.00"),
        )

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            table.move_cursor(row=0)

            await pilot.press("e")
            await pilot.pause()

            assert len(pilot.app.screen_stack) > 1

    async def test_delete_modal_opens_on_d(self):
        """测试按 d 打开删除确认弹窗。"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()
        tx_service.create_transaction(
            account_id=account.id,
            fund_id=fund1.id,
            type=TransactionType.buy,
            date=date(2024, 1, 1),
            shares=Decimal("100.00"),
            amount=Decimal("1000.00"),
        )

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            table.move_cursor(row=0)

            await pilot.press("d")
            await pilot.pause()

            assert len(pilot.app.screen_stack) > 1


class TestFormDynamicFields:
    """表单动态字段测试。"""

    async def test_form_dynamic_fields_buy(self):
        """测试买入类型显示份额和金额字段。"""
        from textual.widgets import Input

        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 检查份额和金额输入框存在
            shares_input = modal.query_one("#shares-input", Input)
            amount_input = modal.query_one("#amount-input", Input)

            assert shares_input is not None
            assert amount_input is not None

    async def test_form_dynamic_fields_dividend_cash(self):
        """测试现金分红类型只显示金额字段。"""
        from textual.widgets import Input, Select

        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 选择现金分红类型
            type_select = modal.query_one("#type-select", Select)
            type_select.value = "dividend_cash"
            await pilot.pause()

            # 检查份额字段隐藏，金额字段显示
            shares_input = modal.query_one("#shares-input", Input)
            amount_input = modal.query_one("#amount-input", Input)

            # 现金分红时份额字段应该隐藏
            assert shares_input.visible is False
            assert amount_input.visible is True
