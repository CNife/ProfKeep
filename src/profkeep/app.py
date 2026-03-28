from textual.app import App
from textual.screen import Screen
from textual.widgets import Footer, Header

from profkeep.screens.accounts import AccountsScreen
from profkeep.screens.transactions import TransactionsScreen


class MainScreen(Screen):
    BINDINGS = [
        ("q", "quit", "退出"),
    ]

    def compose(self):
        yield Header()
        yield Footer()


class FundKeeperApp(App):
    BINDINGS = [
        ("a", "accounts", "账户"),
        ("h", "holdings", "持仓"),
        ("t", "transactions", "交易"),
        ("q", "quit", "退出"),
    ]

    def on_mount(self) -> None:
        self.push_screen(MainScreen())

    def action_accounts(self):
        self.push_screen(AccountsScreen())

    def action_transactions(self):
        self.push_screen(TransactionsScreen())

    def action_holdings(self):
        self.push_screen(AccountsScreen())


def main():
    app = FundKeeperApp()
    app.run()


if __name__ == "__main__":
    main()
