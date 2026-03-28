"""端到端交易管理测试 - 覆盖 QA 场景。"""

from datetime import date
from decimal import Decimal

import pytest
from textual.app import App
from textual.widgets import Button, DataTable, Input, Label, Select

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
    """创建测试数据：账户、基金。"""
    from sqlmodel import Session

    from profkeep.models import database
    from profkeep.models.fund import Fund
    from profkeep.services import AccountService

    account_service = AccountService()
    account = account_service.create_account(name="测试账户")

    with Session(database.engine) as session:
        fund1 = Fund(code="000001", name="华夏成长混合", type="混合型")
        fund2 = Fund(code="000002", name="易方达稳健债券", type="债券型")
        session.add(fund1)
        session.add(fund2)
        session.commit()
        session.refresh(fund1)
        session.refresh(fund2)

    return account, fund1, fund2


class TestScenario1_LaunchApp:
    """场景1: 启动应用"""

    async def test_app_launches_without_error(self):
        """验证应用启动无错误"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 验证屏幕存在
            assert pilot.app.screen is not None
            # 验证表格组件存在
            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            assert table is not None
            # 验证空状态显示
            empty_label = pilot.app.screen.query_one("#empty-state", Label)
            assert empty_label.visible is True


class TestScenario2_GlobalTKey:
    """场景2: 全局 t 键测试"""

    async def test_press_t_enters_transactions_screen(self):
        """验证按 t 键进入 TransactionsScreen"""
        from profkeep.app import FundKeeperApp

        async with FundKeeperApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("t")
            await pilot.pause()

            # 验证当前屏幕是 TransactionsScreen
            assert isinstance(pilot.app.screen, TransactionsScreen)


class TestScenario3_AddTransaction:
    """场景3: 新增交易测试"""

    async def test_add_buy_transaction(self):
        """测试新增买入交易"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 按 n 打开新增弹窗
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 验证弹窗标题
            title = modal.query_one(Label)
            assert "新增交易" in str(title.content)

            # 选择交易类型（默认是买入）
            type_select = modal.query_one("#type-select", Select)
            assert type_select.value == "buy"

            # 输入基金代码
            fund_code_input = modal.query_one("#fund-code-input", Input)
            fund_code_input.focus()
            for char in "000001":
                await pilot.press(char)
            await pilot.pause()

            # 输入交易日期
            date_input = modal.query_one("#date-input", Input)
            date_input.focus()
            date_input.value = "2024-01-15"

            # 输入份额
            shares_input = modal.query_one("#shares-input", Input)
            shares_input.focus()
            for char in "100.50":
                await pilot.press(char)

            # 输入金额
            amount_input = modal.query_one("#amount-input", Input)
            amount_input.focus()
            for char in "1000.00":
                await pilot.press(char)

            # 输入手续费
            fee_input = modal.query_one("#fee-input", Input)
            fee_input.focus()
            fee_input.value = "10.00"

            # 点击确认按钮
            confirm_btn = modal.query_one("#confirm-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证交易已创建
            tx_service = TransactionService()
            transactions = tx_service.list_transactions(account_id=account.id)
            assert len(transactions) == 1
            assert transactions[0].type == TransactionType.buy
            assert transactions[0].shares == Decimal("100.50")

    async def test_add_sell_transaction(self):
        """测试新增卖出交易"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 选择卖出类型
            type_select = modal.query_one("#type-select", Select)
            type_select.value = "sell"
            await pilot.pause()

            # 输入基金代码
            fund_code_input = modal.query_one("#fund-code-input", Input)
            fund_code_input.value = "000001"

            # 输入其他字段
            modal.query_one("#date-input", Input).value = "2024-02-01"
            modal.query_one("#shares-input", Input).value = "50.00"
            modal.query_one("#amount-input", Input).value = "500.00"
            modal.query_one("#fee-input", Input).value = "5.00"

            # 提交
            confirm_btn = modal.query_one("#confirm-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证
            tx_service = TransactionService()
            transactions = tx_service.list_transactions(account_id=account.id)
            assert len(transactions) == 1
            assert transactions[0].type == TransactionType.sell

    async def test_add_dividend_cash_transaction(self):
        """测试新增现金分红交易"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 选择现金分红类型
            type_select = modal.query_one("#type-select", Select)
            type_select.value = "dividend_cash"
            await pilot.pause()

            # 验证份额字段隐藏
            shares_input = modal.query_one("#shares-input", Input)
            assert shares_input.visible is False

            # 输入数据
            modal.query_one("#fund-code-input", Input).value = "000001"
            modal.query_one("#date-input", Input).value = "2024-03-01"
            modal.query_one("#amount-input", Input).value = "100.00"
            modal.query_one("#fee-input", Input).value = "0"

            # 提交
            confirm_btn = modal.query_one("#confirm-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证
            tx_service = TransactionService()
            transactions = tx_service.list_transactions(account_id=account.id)
            assert len(transactions) == 1
            assert transactions[0].type == TransactionType.dividend_cash
            assert transactions[0].amount == Decimal("100.00")

    async def test_add_dividend_reinvest_transaction(self):
        """测试新增红利再投资交易"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 选择红利再投资类型
            type_select = modal.query_one("#type-select", Select)
            type_select.value = "dividend_reinvest"
            await pilot.pause()

            # 验证金额字段隐藏
            amount_input = modal.query_one("#amount-input", Input)
            assert amount_input.visible is False

            # 输入数据
            modal.query_one("#fund-code-input", Input).value = "000001"
            modal.query_one("#date-input", Input).value = "2024-03-01"
            modal.query_one("#shares-input", Input).value = "10.50"
            modal.query_one("#fee-input", Input).value = "0"

            # 提交
            confirm_btn = modal.query_one("#confirm-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证
            tx_service = TransactionService()
            transactions = tx_service.list_transactions(account_id=account.id)
            assert len(transactions) == 1
            assert transactions[0].type == TransactionType.dividend_reinvest
            assert transactions[0].shares == Decimal("10.50")


class TestScenario4_EditTransaction:
    """场景4: 编辑交易测试"""

    async def test_edit_transaction(self):
        """测试编辑交易"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()

        # 创建一条交易
        tx = tx_service.create_transaction(
            account_id=account.id,
            fund_id=fund1.id,
            type=TransactionType.buy,
            date=date(2024, 1, 1),
            shares=Decimal("100.00"),
            amount=Decimal("1000.00"),
        )

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 验证交易显示
            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            assert table.row_count == 1

            # 选中第一行
            table.move_cursor(row=0)

            # 按 e 打开编辑弹窗
            await pilot.press("e")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 验证弹窗标题
            title = modal.query_one(Label)
            assert "编辑交易" in str(title.content)

            # 验证数据已填充
            shares_input = modal.query_one("#shares-input", Input)
            assert shares_input.value.startswith("100")

            # 修改份额
            shares_input.focus()
            shares_input.value = "200.00"

            # 提交
            confirm_btn = modal.query_one("#confirm-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证更新
            updated_tx = tx_service.get_transaction(tx.id)
            assert updated_tx.shares == Decimal("200.00")


class TestScenario5_DeleteTransaction:
    """场景5: 删除交易测试"""

    async def test_delete_transaction(self):
        """测试删除交易"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()

        # 创建一条交易
        tx = tx_service.create_transaction(
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
            assert table.row_count == 1

            # 选中第一行
            table.move_cursor(row=0)

            # 按 d 打开删除确认弹窗
            await pilot.press("d")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            # 验证确认弹窗内容
            labels = modal.query(Label)
            assert any("确认删除" in str(label.content) for label in labels)

            # 点击确认删除
            confirm_btn = modal.query_one("#confirm-delete-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证交易已删除
            with pytest.raises(ValueError, match="交易不存在"):
                tx_service.get_transaction(tx.id)

            # 验证表格为空
            assert table.row_count == 0

    async def test_cancel_delete(self):
        """测试取消删除"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()

        # 创建一条交易
        tx = tx_service.create_transaction(
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

            modal = pilot.app.screen_stack[-1]

            # 点击取消
            cancel_btn = modal.query_one("#cancel-button", Button)
            cancel_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证交易仍存在
            existing_tx = tx_service.get_transaction(tx.id)
            assert existing_tx is not None


class TestScenario6_EmptyState:
    """场景6: 空状态测试"""

    async def test_empty_state_display(self):
        """测试空状态显示"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 验证表格隐藏
            table = pilot.app.screen.query_one("#transactions-table", DataTable)
            assert table.visible is False

            # 验证空状态提示显示
            empty_label = pilot.app.screen.query_one("#empty-state", Label)
            assert empty_label.visible is True
            assert "暂无交易记录" in str(empty_label.content) or "暂无交易记录" in str(empty_label)

    async def test_empty_state_after_delete_all(self):
        """测试删除所有交易后显示空状态"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()

        # 创建一条交易
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
            assert table.visible is True

            # 删除交易
            table.move_cursor(row=0)
            await pilot.press("d")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]
            confirm_btn = modal.query_one("#confirm-delete-button", Button)
            confirm_btn.focus()
            await pilot.press("enter")
            await pilot.pause()

            # 验证空状态显示
            assert table.visible is False
            empty_label = pilot.app.screen.query_one("#empty-state", Label)
            assert empty_label.visible is True


class TestIntegration_JKNavigation:
    """集成测试: j/k 导航"""

    async def test_jk_navigation_with_multiple_transactions(self):
        """测试多条交易记录的 j/k 导航"""
        from profkeep.services import TransactionService

        account, fund1, _ = create_test_data()
        tx_service = TransactionService()

        # 创建多条交易
        for i in range(5):
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
            assert table.row_count == 5

            # 测试向下导航
            initial_row = table.cursor_row
            await pilot.press("j")
            await pilot.pause()
            assert table.cursor_row == initial_row + 1

            # 继续向下
            await pilot.press("j")
            await pilot.press("j")
            await pilot.press("j")
            await pilot.pause()
            assert table.cursor_row == 4  # 最后一行

            # 测试向上导航
            await pilot.press("k")
            await pilot.pause()
            assert table.cursor_row == 3


class TestEdgeCases:
    """边界情况测试"""

    async def test_edit_without_selection(self):
        """测试未选中时按 e 键"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 空表格时按 e
            await pilot.press("e")
            await pilot.pause()

            # 应该没有打开弹窗（只有默认 Screen 和 TransactionsScreen）
            assert len(pilot.app.screen_stack) == 2

    async def test_delete_without_selection(self):
        """测试未选中时按 d 键"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 空表格时按 d
            await pilot.press("d")
            await pilot.pause()

            # 应该没有打开弹窗（只有默认 Screen 和 TransactionsScreen）
            assert len(pilot.app.screen_stack) == 2

    async def test_escape_closes_modal(self):
        """测试 Esc 关闭弹窗"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 打开新增弹窗
            await pilot.press("n")
            await pilot.pause()
            # 应该有 3 个屏幕：默认 Screen + TransactionsScreen + Modal
            assert len(pilot.app.screen_stack) == 3

            # 按 Esc 关闭
            await pilot.press("escape")
            await pilot.pause()
            # 应该只剩 2 个屏幕
            assert len(pilot.app.screen_stack) == 2

    async def test_back_navigation(self):
        """测试返回导航"""
        account, _, _ = create_test_data()

        async with TransactionsTestApp(account_id=account.id).run_test() as pilot:
            await pilot.pause()

            # 按 Esc 返回
            await pilot.press("escape")
            await pilot.pause()

            # 验证 TransactionsScreen 已弹出，只剩默认 Screen
            assert len(pilot.app.screen_stack) == 1
