from textual.app import ComposeResult
from textual.containers import Container, Horizontal
from textual.screen import ModalScreen, Screen
from textual.widgets import Button, DataTable, Footer, Header, Input, Label

from profkeep.services import AccountService


class AddAccountModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("新增账户")
            yield Label("名称")
            yield Input(id="account-name-input", placeholder="输入账户名称")
            yield Label("描述")
            yield Input(id="account-description-input", placeholder="输入账户描述（可选）")
            with Horizontal():
                yield Button("确认", id="confirm-add-button", variant="primary")
                yield Button("取消", id="cancel-button")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-add-button":
            name_input = self.query_one("#account-name-input", Input)
            desc_input = self.query_one("#account-description-input", Input)

            name = name_input.value.strip()
            description = desc_input.value.strip() or None

            if name:
                service = AccountService()
                service.create_account(name=name, description=description)

        self.dismiss()


class EditAccountModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(self, account_id: int, name: str, description: str | None = None):
        super().__init__()
        self.account_id = account_id
        self.account_name = name
        self.account_description = description

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("编辑账户")
            yield Label("名称")
            yield Input(
                id="account-name-input",
                value=self.account_name,
                placeholder="输入账户名称",
            )
            yield Label("描述")
            yield Input(
                id="account-description-input",
                value=self.account_description or "",
                placeholder="输入账户描述（可选）",
            )
            with Horizontal():
                yield Button("确认", id="confirm-edit-button", variant="primary")
                yield Button("取消", id="cancel-button")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-edit-button":
            name_input = self.query_one("#account-name-input", Input)
            desc_input = self.query_one("#account-description-input", Input)

            name = name_input.value.strip()
            description = desc_input.value.strip() or None

            if name:
                service = AccountService()
                service.update_account(
                    account_id=self.account_id, name=name, description=description
                )

        self.dismiss()


class DeleteConfirmModal(ModalScreen[None]):
    BINDINGS = [("escape", "dismiss", "取消")]

    def __init__(self, account_id: int):
        super().__init__()
        self.account_id = account_id

    def compose(self) -> ComposeResult:
        with Container():
            yield Label("确认删除")
            yield Label("确定要删除这个账户吗？")
            with Horizontal():
                yield Button("确认删除", id="confirm-delete-button", variant="error")
                yield Button("取消", id="cancel-button")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-delete-button":
            service = AccountService()
            service.delete_account(account_id=self.account_id)

        self.dismiss()


class AccountsScreen(Screen):
    BINDINGS = [
        ("n", "add_account", "新增"),
        ("e", "edit_account", "编辑"),
        ("d", "delete_account", "删除"),
        ("j", "cursor_down", "下移"),
        ("k", "cursor_up", "上移"),
        ("escape", "back", "返回"),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        yield DataTable(id="accounts-table")
        yield Label("暂无账户，按 n 新增", id="empty-state")
        yield Footer()

    def on_mount(self) -> None:
        self._load_accounts()

    def _load_accounts(self) -> None:
        service = AccountService()
        accounts = service.get_all_accounts()

        table = self.query_one("#accounts-table", DataTable)
        table.clear()

        if not accounts:
            table.visible = False
            empty_label = self.query_one("#empty-state", Label)
            empty_label.visible = True
        else:
            table.visible = True
            empty_label = self.query_one("#empty-state", Label)
            empty_label.visible = False

            table.add_columns("ID", "名称", "描述", "创建时间")

            for account in accounts:
                table.add_row(
                    str(account.id),
                    account.name,
                    account.description or "",
                    account.created_at.strftime("%Y-%m-%d %H:%M"),
                )

    def action_add_account(self) -> None:
        self.app.push_screen(AddAccountModal(), callback=self._on_modal_dismiss)

    def action_edit_account(self) -> None:
        table = self.query_one("#accounts-table", DataTable)

        if table.row_count == 0:
            return

        cursor_row = table.cursor_row
        if cursor_row is None or cursor_row < 0:
            return

        row_key = table.get_row_at(cursor_row)
        if row_key:
            account_id = int(row_key[0])

            service = AccountService()
            account = service.get_account(account_id)

            self.app.push_screen(
                EditAccountModal(
                    account_id=account.id,
                    name=account.name,
                    description=account.description,
                ),
                callback=self._on_modal_dismiss,
            )

    def action_delete_account(self) -> None:
        table = self.query_one("#accounts-table", DataTable)

        if table.row_count == 0:
            return

        cursor_row = table.cursor_row
        if cursor_row is None or cursor_row < 0:
            return

        row_key = table.get_row_at(cursor_row)
        if row_key:
            account_id = int(row_key[0])

            self.app.push_screen(DeleteConfirmModal(account_id), callback=self._on_modal_dismiss)

    def action_cursor_down(self) -> None:
        table = self.query_one("#accounts-table", DataTable)
        table.action_cursor_down()

    def action_cursor_up(self) -> None:
        table = self.query_one("#accounts-table", DataTable)
        table.action_cursor_up()

    def action_back(self) -> None:
        self.app.pop_screen()

    def _on_modal_dismiss(self, result: None) -> None:
        self._load_accounts()
