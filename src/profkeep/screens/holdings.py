import contextlib
from decimal import Decimal

from textual.app import ComposeResult
from textual.containers import Container, Horizontal
from textual.screen import ModalScreen, Screen
from textual.widgets import (
    Button,
    DataTable,
    Footer,
    Header,
    Input,
    Label,
    LoadingIndicator,
    Static,
)

from profkeep.services import FundService
from profkeep.services.holding import HoldingService


class AddHoldingModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(self, account_id: int):
        super().__init__()
        self.account_id = account_id
        self._queried_fund_id: int | None = None

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("新增持仓")
            yield Label("基金代码（6位数字）")
            yield Input(id="fund-code-input", placeholder="如 000001")
            yield Label(id="fund-code-error", classes="error")
            yield LoadingIndicator(id="fund-query-loading")
            yield Static(id="fund-name-display", classes="fund-name")
            yield Label("份额")
            yield Input(id="shares-input", placeholder="如 1000.0000")
            yield Label("成本价")
            yield Input(id="cost-price-input", placeholder="如 1.5000")
            with Horizontal():
                yield Button("确认", id="confirm-add-button", variant="primary")
                yield Button("取消", id="cancel-button")

    def on_mount(self) -> None:
        """初始化时隐藏加载指示器。"""
        loading = self.query_one("#fund-query-loading", LoadingIndicator)
        loading.visible = False

    def on_input_changed(self, event: Input.Changed) -> None:
        """基金代码输入变化时自动查询。"""
        if event.input.id != "fund-code-input":
            return

        code = event.value.strip()

        # 只允许数字
        if code and not code.isdigit():
            event.input.value = "".join(c for c in code if c.isdigit())
            return

        # 满 6 位触发查询
        if len(code) == 6:
            self._trigger_query(code)
        else:
            self._clear_query_result()

    def _trigger_query(self, code: str) -> None:
        """触发异步查询。"""
        # 显示加载状态
        loading = self.query_one("#fund-query-loading", LoadingIndicator)
        loading.visible = True

        # 清空之前的错误和名称
        error_label = self.query_one("#fund-code-error", Label)
        error_label.update("")
        name_display = self.query_one("#fund-name-display", Static)
        name_display.update("")

        # 使用 run_worker 进行异步调用
        self.run_worker(self._query_fund(code), exclusive=True)

    async def _query_fund(self, code: str) -> None:
        """异步查询基金信息。"""
        try:
            fund_service = FundService()
            fund = await fund_service.get_or_create(code)

            # 更新 UI
            loading = self.query_one("#fund-query-loading", LoadingIndicator)
            loading.visible = False

            name_display = self.query_one("#fund-name-display", Static)
            name_display.update(fund.name)

            error_label = self.query_one("#fund-code-error", Label)
            error_label.update("")

            self._queried_fund_id = fund.id

        except ValueError as e:
            loading = self.query_one("#fund-query-loading", LoadingIndicator)
            loading.visible = False

            error_label = self.query_one("#fund-code-error", Label)
            error_label.update(str(e))

            name_display = self.query_one("#fund-name-display", Static)
            name_display.update("")

            self._queried_fund_id = None

        except Exception:
            loading = self.query_one("#fund-query-loading", LoadingIndicator)
            loading.visible = False

            error_label = self.query_one("#fund-code-error", Label)
            error_label.update("查询失败，请重试")

            name_display = self.query_one("#fund-name-display", Static)
            name_display.update("")

            self._queried_fund_id = None

    def _clear_query_result(self) -> None:
        """清空查询结果。"""
        loading = self.query_one("#fund-query-loading", LoadingIndicator)
        loading.visible = False

        name_display = self.query_one("#fund-name-display", Static)
        name_display.update("")

        error_label = self.query_one("#fund-code-error", Label)
        error_label.update("")

        self._queried_fund_id = None

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-add-button":
            shares_input = self.query_one("#shares-input", Input)
            cost_input = self.query_one("#cost-price-input", Input)

            shares_str = shares_input.value.strip()
            cost_str = cost_input.value.strip()

            # 检查是否已成功查询基金
            if self._queried_fund_id is None:
                error_label = self.query_one("#fund-code-error", Label)
                error_label.update("请先输入有效的基金代码")
                return

            if not shares_str or not cost_str:
                return

            try:
                shares = Decimal(shares_str)
                cost_price = Decimal(cost_str)

                holding_service = HoldingService()
                holding_service.create_holding(
                    account_id=self.account_id,
                    fund_id=self._queried_fund_id,
                    shares=shares,
                    cost_price=cost_price,
                )
            except ValueError:
                error_label = self.query_one("#fund-code-error", Label)
                error_label.update("份额或成本价格式错误")
                return

        self.dismiss()


class EditHoldingModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(
        self, holding_id: int, fund_code: str, fund_name: str, shares: Decimal, cost_price: Decimal
    ):
        super().__init__()
        self.holding_id = holding_id
        self.fund_code = fund_code
        self.fund_name = fund_name
        self.shares = shares
        self.cost_price = cost_price

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("编辑持仓")
            yield Label(f"基金: {self.fund_code} {self.fund_name}")
            yield Label("份额")
            yield Input(
                id="shares-input",
                value=str(self.shares),
                placeholder="如 1000.0000",
            )
            yield Label("成本价")
            yield Input(
                id="cost-price-input",
                value=str(self.cost_price),
                placeholder="如 1.5000",
            )
            with Horizontal():
                yield Button("确认", id="confirm-edit-button", variant="primary")
                yield Button("取消", id="cancel-button")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-edit-button":
            shares_input = self.query_one("#shares-input", Input)
            cost_input = self.query_one("#cost-price-input", Input)

            shares_str = shares_input.value.strip()
            cost_str = cost_input.value.strip()

            if not shares_str or not cost_str:
                return

            try:
                shares = Decimal(shares_str)
                cost_price = Decimal(cost_str)

                holding_service = HoldingService()
                holding_service.update_holding(
                    holding_id=self.holding_id,
                    shares=shares,
                    cost_price=cost_price,
                )
            except ValueError, Exception:
                # 静默处理错误，不阻断用户操作（Modal 关闭时不影响用户体验）
                pass

        self.dismiss()


class DeleteHoldingModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(self, holding_id: int, fund_code: str, fund_name: str):
        super().__init__()
        self.holding_id = holding_id
        self.fund_code = fund_code
        self.fund_name = fund_name

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("确认删除")
            yield Label(f"确定要删除 {self.fund_code} {self.fund_name} 的持仓吗？")
            with Horizontal():
                yield Button("确认删除", id="confirm-delete-button", variant="error")
                yield Button("取消", id="cancel-button")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-delete-button":
            holding_service = HoldingService()
            with contextlib.suppress(ValueError):
                holding_service.delete_holding(holding_id=self.holding_id)

        self.dismiss()


class HoldingsScreen(Screen):
    BINDINGS = [
        ("n", "add_holding", "新增"),
        ("e", "edit_holding", "编辑"),
        ("d", "delete_holding", "删除"),
        ("r", "refresh_nav", "刷新净值"),
        ("j", "cursor_down", "下移"),
        ("k", "cursor_up", "上移"),
        ("escape", "back", "返回"),
    ]

    def __init__(self, account_id: int, account_name: str):
        super().__init__()
        self.account_id = account_id
        self.account_name = account_name

    def compose(self) -> ComposeResult:
        yield Header()
        yield DataTable(id="holdings-table")
        yield Label("暂无持仓，按 n 新增", id="empty-state")
        yield Label("", id="summary-label")
        yield Footer()

    def on_mount(self) -> None:
        self.title = f"持仓列表 - {self.account_name}"
        self._load_holdings()

    def _load_holdings(self) -> None:
        holding_service = HoldingService()
        holdings = holding_service.get_holdings_by_account(self.account_id)
        summary = holding_service.get_account_summary(self.account_id)

        table = self.query_one("#holdings-table", DataTable)
        table.clear()

        empty_label = self.query_one("#empty-state", Label)
        summary_label = self.query_one("#summary-label", Label)

        if not holdings:
            table.visible = False
            empty_label.visible = True
            summary_label.visible = False
        else:
            table.visible = True
            empty_label.visible = False
            summary_label.visible = True

            table.add_columns(
                "ID", "代码", "名称", "份额", "成本价", "最新净值", "市值", "收益", "收益率"
            )

            for h in holdings:
                nav_str = f"{h.latest_nav:.4f}" if h.latest_nav else "-"
                mv_str = f"¥{h.market_value:.2f}" if h.market_value else "-"
                profit_str = f"¥{h.profit:.2f}" if h.profit else "-"
                rate_str = f"{h.profit_rate:.2f}%" if h.profit_rate else "-"

                table.add_row(
                    str(h.holding.id),
                    h.fund.code,
                    h.fund.name,
                    f"{h.holding.shares:.4f}",
                    f"{h.holding.cost_price:.4f}",
                    nav_str,
                    mv_str,
                    profit_str,
                    rate_str,
                )

            total_cost_str = f"¥{summary.total_cost:.2f}"
            total_mv_str = (
                f"¥{summary.total_market_value:.2f}" if summary.total_market_value else "-"
            )
            total_profit_str = f"¥{summary.total_profit:.2f}" if summary.total_profit else "-"
            total_rate_str = (
                f"{summary.total_profit_rate:.2f}%" if summary.total_profit_rate else "-"
            )

            summary_label.update(
                f"总成本: {total_cost_str}  总市值: {total_mv_str}  "
                f"总收益: {total_profit_str}  总收益率: {total_rate_str}"
            )

    def action_add_holding(self) -> None:
        self.app.push_screen(AddHoldingModal(self.account_id), callback=self._on_modal_dismiss)

    def action_edit_holding(self) -> None:
        table = self.query_one("#holdings-table", DataTable)

        if table.row_count == 0:
            return

        cursor_row = table.cursor_row
        if cursor_row is None or cursor_row < 0:
            return

        row_key = table.get_row_at(cursor_row)
        if row_key:
            holding_id = int(row_key[0])
            fund_code = row_key[1]
            fund_name = row_key[2]
            shares = Decimal(row_key[3])
            cost_price = Decimal(row_key[4])

            self.app.push_screen(
                EditHoldingModal(
                    holding_id=holding_id,
                    fund_code=fund_code,
                    fund_name=fund_name,
                    shares=shares,
                    cost_price=cost_price,
                ),
                callback=self._on_modal_dismiss,
            )

    def action_delete_holding(self) -> None:
        table = self.query_one("#holdings-table", DataTable)

        if table.row_count == 0:
            return

        cursor_row = table.cursor_row
        if cursor_row is None or cursor_row < 0:
            return

        row_key = table.get_row_at(cursor_row)
        if row_key:
            holding_id = int(row_key[0])
            fund_code = row_key[1]
            fund_name = row_key[2]

            self.app.push_screen(
                DeleteHoldingModal(holding_id, fund_code, fund_name),
                callback=self._on_modal_dismiss,
            )

    def action_refresh_nav(self) -> None:
        from profkeep.services.tushare import TushareService

        with contextlib.suppress(Exception):
            tushare = TushareService()
            tushare.refresh_account_navs(self.account_id)

        self._load_holdings()

    def action_cursor_down(self) -> None:
        table = self.query_one("#holdings-table", DataTable)
        table.action_cursor_down()

    def action_cursor_up(self) -> None:
        table = self.query_one("#holdings-table", DataTable)
        table.action_cursor_up()

    def action_back(self) -> None:
        self.app.pop_screen()

    def _on_modal_dismiss(self, result: None) -> None:
        self._load_holdings()
