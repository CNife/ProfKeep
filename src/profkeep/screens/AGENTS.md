# UI/屏幕规则

## 快捷键设计（Vim 风格）

| 按键 | 功能 | 上下文 |
|------|------|--------|
| `a` | 账户管理 | 全局 |
| `h` | 持仓列表 | 全局 |
| `t` | 交易记录 | 全局 |
| `c` | 收益曲线 | 全局 |
| `n` | 新增 | 列表页 |
| `e` | 编辑 | 列表页 |
| `d` | 删除 | 列表页 |
| `r` | 刷新净值 | 全局 |
| `i` | 导入 | 列表页 |
| `x` | 导出 | 列表页 |
| `?` | 帮助 | 全局 |
| `q` | 退出 | 全局 |
| `j/k` | 上下移动 | 列表 |
| `Enter` | 确认/查看详情 | 全局 |
| `Esc` | 返回/取消 | 全局 |

## 界面约束

- **错误处理**: 使用弹窗模态框展示错误
- **净值刷新**: 仅手动刷新（按 r 键），不自动刷新
- **验证时机**: 提交时验证，不实时验证

## Screen 实现模式

### 组件查询

- 使用 `self.query_one("#id", Component)` 查询组件
- DataTable 使用 `id="xxx-table"` 命名约定
- 空状态使用 `id="empty-state"` Label 组件

### DataTable 导航

```python
# 设置光标位置（cursor_row 是只读属性）
table = self.query_one(DataTable)
table.move_cursor(row=0)  # 移动到第一行

# 获取选中行数据
selected_row = table.cursor_row
```

### 导航实现

- 使用 `bind_escape = "pop_screen"` 实现 Esc 返回
- 使用 `self.push_screen(ModalScreen())` 打开弹窗
- 弹窗回调使用 `await self.push_screen_wait()` 或 `set_return_value()`

## Modal 组件模式

### ModalScreen 基类

- 继承 `ModalScreen` 创建模态弹窗
- 使用 `BINDINGS` 定义 Esc 关闭
- 通过 `self.dismiss(return_value)` 关闭并返回值

### 表单 Modal

```python
class AccountFormModal(ModalScreen):
    BINDINGS = [("escape", "cancel", "取消")]

    def compose(self):
        yield Input(placeholder="账户名称", id="name-input")
        yield TextArea(id="description-textarea")
        yield Button("确认", id="confirm", variant="primary")
        yield Button("取消", id="cancel")

    def action_cancel(self):
        self.dismiss(None)

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm":
            # 验证并提交
            self.dismiss({"name": name, "description": description})
```

### 确认 Modal

```python
class ConfirmDeleteModal(ModalScreen):
    BINDINGS = [("escape", "cancel", "取消")]

    def compose(self):
        yield Label(f"确定要删除账户 '{name}'？")
        yield Button("确认", id="confirm", variant="error")
        yield Button("取消", id="cancel")
```

## 测试模式

### Screen 测试

- Screen 没有 `run_test()` 方法，需要创建 App 包装
- 使用 `async with TestApp(screen).run_test() as pilot` 模式
- 使用 `pilot.app.screen.query_one()` 查询 Screen 内组件

### 测试示例

```python
class AccountsTestApp(App):
    def __init__(self):
        super().__init__()
        self.screen = AccountsScreen()

async def test_screen_renders():
    async with AccountsTestApp().run_test() as pilot:
        table = pilot.app.screen.query_one(DataTable)
        assert table.row_count == 0
```

### Modal 测试

- 使用 `pilot.app.screen_stack[-1]` 获取当前 Modal
- 使用 `await pilot.press("n")` 模拟按键
- 使用 `await pilot.pause()` 等待 UI 更新
- 按钮点击需要先 `focus()` 再按 `enter`

### 数据库隔离

- 复用 `setup_db` fixture 设置测试数据库
- 使用 `pytest.fixture(autouse=True)` 确保每个测试独立
- 测试中使用服务层 API 而非直接操作数据库
