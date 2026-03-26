import pytest
from textual.app import App
from textual.widgets import DataTable, Label

from profkeep.models import init_db
from profkeep.screens.accounts import AccountsScreen


class AccountsTestApp(App):
    def on_mount(self) -> None:
        self.push_screen(AccountsScreen())


@pytest.fixture(autouse=True)
def setup_db(tmp_path, monkeypatch):
    from profkeep.models import database

    db_file = tmp_path / "test.db"
    monkeypatch.setattr(database, "DB_PATH", db_file)
    monkeypatch.setattr(database, "engine", database.get_engine())
    init_db()
    yield


class TestScreenRendering:
    async def test_screen_renders(self):
        async with AccountsTestApp().run_test() as pilot:
            assert pilot.app.screen is not None

    async def test_empty_state(self):
        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()
            label = pilot.app.screen.query_one("#empty-state", Label)
            assert label is not None
            assert "暂无账户" in str(label.content) or "暂无账户" in str(label)

    async def test_list_accounts(self):
        from profkeep.services import AccountService

        service = AccountService()
        service.create_account(name="测试账户 1", description="描述 1")
        service.create_account(name="测试账户 2", description="描述 2")

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#accounts-table", DataTable)
            assert table is not None
            assert table.row_count == 2


class TestKeyboardShortcuts:
    async def test_press_n_opens_modal(self):
        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            assert len(pilot.app.screen_stack) > 1

    async def test_press_e_opens_modal(self):
        from profkeep.services import AccountService

        service = AccountService()
        service.create_account(name="测试账户")

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("e")
            await pilot.pause()

            assert len(pilot.app.screen_stack) > 1

    async def test_press_d_opens_confirm(self):
        from profkeep.services import AccountService

        service = AccountService()
        service.create_account(name="测试账户")

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("d")
            await pilot.pause()

            assert len(pilot.app.screen_stack) > 1

    async def test_jk_navigation(self):
        from profkeep.services import AccountService

        service = AccountService()
        service.create_account(name="账户 1")
        service.create_account(name="账户 2")
        service.create_account(name="账户 3")

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#accounts-table", DataTable)
            initial_cursor = table.cursor_row

            await pilot.press("j")
            await pilot.pause()
            assert table.cursor_row >= initial_cursor

            await pilot.press("k")
            await pilot.pause()


class TestCRUDFlows:
    async def test_add_account_flow(self):
        from profkeep.services import AccountService

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()
            await pilot.press("n")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            try:
                name_input = modal.query_one("#account-name-input")
                desc_input = modal.query_one("#account-description-input")
                confirm_btn = modal.query_one("#confirm-add-button")

                name_input.focus()
                await pilot.press("t", "e", "s", "t")

                desc_input.focus()
                await pilot.press("d", "e", "s", "c")

                confirm_btn.focus()
                await pilot.press("enter")
                await pilot.pause()

                service = AccountService()
                accounts = service.get_all_accounts()
                assert len(accounts) == 1
                assert accounts[0].name == "test"
            except Exception:
                pytest.fail("新增流程未实现")

    async def test_edit_account_flow(self):
        from profkeep.services import AccountService

        service = AccountService()
        account = service.create_account(name="旧名称", description="旧描述")
        assert account.id is not None

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#accounts-table", DataTable)
            table.move_cursor(row=0)

            await pilot.press("e")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            try:
                name_input = modal.query_one("#account-name-input")
                confirm_btn = modal.query_one("#confirm-edit-button")

                name_input.focus()
                await pilot.press(*[str(k) for k in "新名称"])

                confirm_btn.focus()
                await pilot.press("enter")
                await pilot.pause()

                updated = service.get_account(account.id)
                assert updated.name == "新名称"
            except Exception:
                pytest.fail("编辑流程未实现")

    async def test_delete_account_flow(self):
        from profkeep.services import AccountService

        service = AccountService()
        account = service.create_account(name="待删除账户")
        assert account.id is not None

        async with AccountsTestApp().run_test() as pilot:
            await pilot.pause()

            table = pilot.app.screen.query_one("#accounts-table", DataTable)
            table.move_cursor(row=0)

            await pilot.press("d")
            await pilot.pause()

            modal = pilot.app.screen_stack[-1]

            try:
                confirm_btn = modal.query_one("#confirm-delete-button")
                confirm_btn.focus()
                await pilot.press("enter")
                await pilot.pause()

                with pytest.raises(ValueError, match="账户不存在"):
                    service.get_account(account.id)
            except Exception:
                pytest.fail("删除流程未实现")
