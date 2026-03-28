from datetime import date
from decimal import Decimal

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.screen import ModalScreen, Screen
from textual.widgets import Button, DataTable, Footer, Header, Input, Label, Select

from profkeep.models.transaction import Transaction, TransactionType
from profkeep.services import AccountService, FundService, TransactionService


class TransactionFormModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(
        self,
        account_id: int,
        transaction: Transaction | None = None,
    ):
        super().__init__()
        self.account_id = account_id
        self.transaction = transaction
        self._fund_name = ""

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("新增交易" if not self.transaction else "编辑交易")
            yield Label("交易类型")
            yield Select(
                [
                    ("买入", "buy"),
                    ("卖出", "sell"),
                    ("现金分红", "dividend_cash"),
                    ("红利再投资", "dividend_reinvest"),
                ],
                id="type-select",
                value=(self.transaction.type.value if self.transaction else "buy"),
            )
            yield Label("基金代码")
            yield Input(
                id="fund-code-input",
                placeholder="输入6位基金代码",
                value=(
                    self.transaction.fund.code if self.transaction and self.transaction.fund else ""
                ),
            )
            yield Label(id="fund-name-display")
            yield Label("交易日期")
            yield Input(
                id="date-input",
                placeholder="YYYY-MM-DD",
                value=(str(self.transaction.date) if self.transaction else str(date.today())),
            )
            yield Label("份额", id="shares-label")
            yield Input(
                id="shares-input",
                placeholder="输入份额",
                value=(
                    str(self.transaction.shares)
                    if self.transaction and self.transaction.shares
                    else ""
                ),
            )
            yield Label("金额", id="amount-label")
            yield Input(
                id="amount-input",
                placeholder="输入金额",
                value=(
                    str(self.transaction.amount)
                    if self.transaction and self.transaction.amount
                    else ""
                ),
            )
            yield Label("手续费")
            yield Input(
                id="fee-input",
                placeholder="输入手续费（可选）",
                value=(str(self.transaction.fee) if self.transaction else "0"),
            )
            yield Label("净值")
            yield Input(
                id="net-value-input",
                placeholder="输入净值（可选）",
                value=(
                    str(self.transaction.net_value)
                    if self.transaction and self.transaction.net_value
                    else ""
                ),
            )
            yield Label("备注")
            yield Input(
                id="notes-input",
                placeholder="输入备注（可选）",
                value=(self.transaction.notes or "" if self.transaction else ""),
            )
            with Horizontal():
                yield Button("确认", id="confirm-button", variant="primary")
                yield Button("取消", id="cancel-button")

    def on_mount(self) -> None:
        self._update_field_visibility()

    def on_select_changed(self, event: Select.Changed) -> None:
        if event.select.id == "type-select":
            self._update_field_visibility()

    def on_input_changed(self, event: Input.Changed) -> None:
        if event.input.id == "fund-code-input":
            code = event.value.strip()
            if code and not code.isdigit():
                event.input.value = code[:-1]
                return
            if len(code) == 6:
                self.run_worker(self._query_fund(code), exclusive=True)

    async def _query_fund(self, code: str) -> None:
        fund_service = FundService()
        try:
            fund = await fund_service.get_or_create(code)
            self._fund_name = fund.name
            self._update_fund_name()
        except ValueError as e:
            self._fund_name = str(e)
            self._update_fund_name()

    def _update_fund_name(self) -> None:
        fund_name_display = self.query_one("#fund-name-display", Label)
        fund_name_display.update(self._fund_name)

    def _update_field_visibility(self) -> None:
        type_select = self.query_one("#type-select", Select)
        tx_type = type_select.value

        shares_label = self.query_one("#shares-label", Label)
        shares_input = self.query_one("#shares-input", Input)
        amount_label = self.query_one("#amount-label", Label)
        amount_input = self.query_one("#amount-input", Input)

        if tx_type == "dividend_cash":
            shares_label.visible = False
            shares_input.visible = False
            amount_label.visible = True
            amount_input.visible = True
        elif tx_type == "dividend_reinvest":
            shares_label.visible = True
            shares_input.visible = True
            amount_label.visible = False
            amount_input.visible = False
        else:
            shares_label.visible = True
            shares_input.visible = True
            amount_label.visible = True
            amount_input.visible = True

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-button":
            self.run_worker(self._submit_transaction(), exclusive=True)
        else:
            self.dismiss()

    async def _submit_transaction(self) -> None:
        type_select = self.query_one("#type-select", Select)
        fund_code_input = self.query_one("#fund-code-input", Input)
        date_input = self.query_one("#date-input", Input)
        shares_input = self.query_one("#shares-input", Input)
        amount_input = self.query_one("#amount-input", Input)
        fee_input = self.query_one("#fee-input", Input)
        net_value_input = self.query_one("#net-value-input", Input)
        notes_input = self.query_one("#notes-input", Input)

        tx_type = TransactionType(type_select.value)
        fund_code = fund_code_input.value.strip()
        tx_date = date.fromisoformat(date_input.value.strip())
        shares = Decimal(shares_input.value.strip()) if shares_input.value.strip() else None
        amount = Decimal(amount_input.value.strip()) if amount_input.value.strip() else None
        fee = Decimal(fee_input.value.strip() or "0")
        net_value = (
            Decimal(net_value_input.value.strip()) if net_value_input.value.strip() else None
        )
        notes = notes_input.value.strip() or None

        if not fund_code:
            self.dismiss()
            return

        fund_service = FundService()
        fund = await fund_service.get_by_code(fund_code)
        if not fund:
            self.dismiss()
            return

        service = TransactionService()
        if self.transaction:
            service.update_transaction(
                transaction_id=self.transaction.id,
                type=tx_type,
                date=tx_date,
                shares=shares,
                amount=amount,
                fee=fee,
                net_value=net_value,
                notes=notes,
            )
        else:
            service.create_transaction(
                account_id=self.account_id,
                fund_id=fund.id,
                type=tx_type,
                date=tx_date,
                shares=shares,
                amount=amount,
                fee=fee,
                net_value=net_value,
                notes=notes,
            )
        self.dismiss()


class DeleteTransactionModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(self, transaction_id: int):
        super().__init__()
        self.transaction_id = transaction_id

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("确认删除")
            yield Label("确定要删除这条交易记录吗？")
            with Horizontal():
                yield Button("确认删除", id="confirm-delete-button", variant="error")
                yield Button("取消", id="cancel-button")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-delete-button":
            service = TransactionService()
            service.delete_transaction(transaction_id=self.transaction_id)
        self.dismiss()


class TransactionsScreen(Screen):
    BINDINGS = [
        ("n", "add_transaction", "新增"),
        ("e", "edit_transaction", "编辑"),
        ("d", "delete_transaction", "删除"),
        ("j", "cursor_down", "下移"),
        ("k", "cursor_up", "上移"),
        ("escape", "back", "返回"),
    ]

    def __init__(self, account_id: int | None = None):
        super().__init__()
        self.account_id = account_id

    def compose(self) -> ComposeResult:
        yield Header()
        with Vertical():
            yield Select(
                [],
                id="account-filter",
                prompt="选择账户",
            )
            yield DataTable(id="transactions-table")
            yield Label("暂无交易记录，按 n 新增", id="empty-state")
        yield Footer()

    def on_mount(self) -> None:
        self._load_accounts()
        self._load_transactions()

    def _load_accounts(self) -> None:
        service = AccountService()
        accounts = service.get_all_accounts()

        account_select = self.query_one("#account-filter", Select)
        options = [(account.name, str(account.id)) for account in accounts]
        account_select.set_options(options)

        if self.account_id:
            account_select.value = str(self.account_id)

    def _load_transactions(self) -> None:
        account_select = self.query_one("#account-filter", Select)
        selected_value = account_select.value
        selected_account_id = (
            int(selected_value) if selected_value != Select.NULL else self.account_id
        )

        service = TransactionService()

        # 自动确认 T+1 交易
        if selected_account_id:
            service.auto_confirm_transactions(account_id=selected_account_id)

        transactions = (
            service.list_transactions(account_id=selected_account_id) if selected_account_id else []
        )

        table = self.query_one("#transactions-table", DataTable)
        table.clear()

        if not transactions:
            table.visible = False
            empty_label = self.query_one("#empty-state", Label)
            empty_label.visible = True
        else:
            table.visible = True
            empty_label = self.query_one("#empty-state", Label)
            empty_label.visible = False

            table.add_columns(
                "ID",
                "类型",
                "基金代码",
                "基金名称",
                "日期",
                "份额",
                "金额",
                "手续费",
                "净值",
                "确认状态",
                "备注",
            )

            for tx in transactions:
                table.add_row(
                    str(tx.id),
                    tx.type.value,
                    tx.fund.code if tx.fund else "",
                    tx.fund.name if tx.fund else "",
                    str(tx.date),
                    str(tx.shares) if tx.shares else "",
                    str(tx.amount) if tx.amount else "",
                    str(tx.fee),
                    str(tx.net_value) if tx.net_value else "",
                    "已确认" if tx.confirmed else "未确认",
                    tx.notes or "",
                )

    def on_select_changed(self, event: Select.Changed) -> None:
        if event.select.id == "account-filter":
            self._load_transactions()

    def action_add_transaction(self) -> None:
        account_select = self.query_one("#account-filter", Select)
        account_id = int(account_select.value) if account_select.value else self.account_id

        if not account_id:
            return

        self.app.push_screen(
            TransactionFormModal(account_id=account_id),
            callback=self._on_modal_dismiss,
        )

    def action_edit_transaction(self) -> None:
        table = self.query_one("#transactions-table", DataTable)

        if table.row_count == 0:
            return

        cursor_row = table.cursor_row
        if cursor_row is None or cursor_row < 0:
            return

        row_key = table.get_row_at(cursor_row)
        if row_key:
            tx_id = int(row_key[0])

            service = TransactionService()
            tx = service.get_transaction(tx_id)

            self.app.push_screen(
                TransactionFormModal(account_id=tx.account_id, transaction=tx),
                callback=self._on_modal_dismiss,
            )

    def action_delete_transaction(self) -> None:
        table = self.query_one("#transactions-table", DataTable)

        if table.row_count == 0:
            return

        cursor_row = table.cursor_row
        if cursor_row is None or cursor_row < 0:
            return

        row_key = table.get_row_at(cursor_row)
        if row_key:
            tx_id = int(row_key[0])

            self.app.push_screen(
                DeleteTransactionModal(transaction_id=tx_id),
                callback=self._on_modal_dismiss,
            )

    def action_cursor_down(self) -> None:
        table = self.query_one("#transactions-table", DataTable)
        table.action_cursor_down()

    def action_cursor_up(self) -> None:
        table = self.query_one("#transactions-table", DataTable)
        table.action_cursor_up()

    def action_back(self) -> None:
        self.app.pop_screen()

    def _on_modal_dismiss(self, result: None) -> None:
        self._load_transactions()
