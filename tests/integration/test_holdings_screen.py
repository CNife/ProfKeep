from unittest.mock import AsyncMock, patch

import pytest
from textual.app import App
from textual.widgets import Input, Label, LoadingIndicator, Static

from profkeep.models import init_db
from profkeep.models.fund import Fund
from profkeep.screens.holdings import AddHoldingModal, HoldingsScreen


class HoldingsTestApp(App):
    """测试用 App 包装 HoldingsScreen。"""

    def __init__(self, account_id: int = 1, account_name: str = "测试账户"):
        super().__init__()
        self.account_id = account_id
        self.account_name = account_name

    def on_mount(self) -> None:
        self.push_screen(HoldingsScreen(self.account_id, self.account_name))


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    """设置测试数据库。"""
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


class TestAddHoldingModal:
    """AddHoldingModal 测试。"""

    async def test_add_holding_modal_render(self):
        """测试 Modal 渲染。"""
        async with HoldingsTestApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            # 验证 Modal 打开
            modal = pilot.app.screen_stack[-1]
            assert isinstance(modal, AddHoldingModal)

            # 验证组件存在
            code_input = modal.query_one("#fund-code-input", Input)
            assert code_input is not None
            assert code_input.placeholder == "如 000001"

            error_label = modal.query_one("#fund-code-error", Label)
            assert error_label is not None

            loading = modal.query_one("#fund-query-loading", LoadingIndicator)
            assert loading is not None
            assert loading.visible is False

            name_display = modal.query_one("#fund-name-display", Static)
            assert name_display is not None

    async def test_fund_code_auto_query_success(self):
        """测试自动查询成功。"""
        mock_fund = Fund(id=1, code="110022", name="易方达消费行业", type="股票型")

        with patch("profkeep.screens.holdings.FundService") as MockFundService:
            mock_instance = AsyncMock()
            mock_instance.get_or_create.return_value = mock_fund
            MockFundService.return_value = mock_instance

            async with HoldingsTestApp().run_test() as pilot:
                await pilot.pause()
                await pilot.press("n")
                await pilot.pause()

                modal = pilot.app.screen_stack[-1]
                code_input = modal.query_one("#fund-code-input", Input)

                # 输入 6 位数字触发查询
                code_input.value = "110022"
                await pilot.pause()

                # 等待异步查询完成
                await pilot.pause()

                # 验证基金名称显示
                name_display = modal.query_one("#fund-name-display", Static)
                assert "易方达消费行业" in str(name_display.content)

                # 验证错误清空
                error_label = modal.query_one("#fund-code-error", Label)
                assert error_label.content == ""

                # 验证加载指示器隐藏
                loading = modal.query_one("#fund-query-loading", LoadingIndicator)
                assert loading.visible is False

                # 验证查询被调用
                mock_instance.get_or_create.assert_called_once_with("110022")

    async def test_fund_code_auto_query_invalid(self):
        """测试无效代码处理。"""
        with patch("profkeep.screens.holdings.FundService") as MockFundService:
            mock_instance = AsyncMock()
            mock_instance.get_or_create.side_effect = ValueError("基金代码不存在")
            MockFundService.return_value = mock_instance

            async with HoldingsTestApp().run_test() as pilot:
                await pilot.pause()
                await pilot.press("n")
                await pilot.pause()

                modal = pilot.app.screen_stack[-1]
                code_input = modal.query_one("#fund-code-input", Input)

                # 输入无效代码
                code_input.value = "999999"
                await pilot.pause()
                await pilot.pause()

                # 验证错误显示
                error_label = modal.query_one("#fund-code-error", Label)
                assert "基金代码不存在" in str(error_label.content)

                # 验证名称清空
                name_display = modal.query_one("#fund-name-display", Static)
                assert name_display.content == ""

                # 验证加载指示器隐藏
                loading = modal.query_one("#fund-query-loading", LoadingIndicator)
                assert loading.visible is False

    async def test_fund_code_auto_query_network_error(self):
        """测试网络错误处理。"""
        with patch("profkeep.screens.holdings.FundService") as MockFundService:
            mock_instance = AsyncMock()
            mock_instance.get_or_create.side_effect = Exception("网络错误")
            MockFundService.return_value = mock_instance

            async with HoldingsTestApp().run_test() as pilot:
                await pilot.pause()
                await pilot.press("n")
                await pilot.pause()

                modal = pilot.app.screen_stack[-1]
                code_input = modal.query_one("#fund-code-input", Input)

                # 输入代码触发网络错误
                code_input.value = "110022"
                await pilot.pause()
                await pilot.pause()

                # 验证错误显示
                error_label = modal.query_one("#fund-code-error", Label)
                assert "查询失败" in str(error_label.content)

                # 验证名称清空
                name_display = modal.query_one("#fund-name-display", Static)
                assert name_display.content == ""

                # 验证加载指示器隐藏
                loading = modal.query_one("#fund-query-loading", LoadingIndicator)
                assert loading.visible is False


class TestInputValidation:
    """输入验证测试。"""

    async def test_non_digit_input_filtered(self):
        """测试非数字输入被过滤。"""
        async with HoldingsTestApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]
            code_input = modal.query_one("#fund-code-input", Input)

            # 输入包含非数字字符
            code_input.value = "abc123"
            await pilot.pause()

            # 验证非数字被过滤
            assert code_input.value == "123"

    async def test_partial_code_no_query(self):
        """测试不满 6 位不触发查询。"""
        with patch("profkeep.screens.holdings.FundService") as MockFundService:
            mock_instance = AsyncMock()
            MockFundService.return_value = mock_instance

            async with HoldingsTestApp().run_test() as pilot:
                await pilot.pause()
                await pilot.press("n")
                await pilot.pause()

                modal = pilot.app.screen_stack[-1]
                code_input = modal.query_one("#fund-code-input", Input)

                # 输入不满 6 位
                code_input.value = "110"
                await pilot.pause()

                # 验证未触发查询
                mock_instance.get_or_create.assert_not_called()

                # 验证名称清空
                name_display = modal.query_one("#fund-name-display", Static)
                assert name_display.content == ""
