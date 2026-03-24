from textual.app import App
from textual.screen import Screen
from textual.widgets import Footer, Header


class MainScreen(Screen):
    BINDINGS = [
        ("q", "quit", "退出"),
    ]

    def compose(self):
        yield Header()
        yield Footer()


class FundKeeperApp(App):
    BINDINGS = [
        ("q", "quit", "退出"),
    ]

    def on_mount(self) -> None:
        self.push_screen(MainScreen())


def main():
    app = FundKeeperApp()
    app.run()


if __name__ == "__main__":
    main()
