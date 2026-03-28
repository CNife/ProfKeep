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

## 异步操作模式

### 禁止使用 asyncio.run()

在 Textual 应用中，**禁止**使用 `asyncio.run()` 启动异步操作。它会阻塞主事件循环，导致 UI 卡死。

```python
# ❌ 错误：阻塞事件循环
def on_input_changed(self, event: Input.Changed) -> None:
    fund = asyncio.run(self.service.get_or_create(code))  # 阻塞！

# ✅ 正确：使用 run_worker()
def on_input_changed(self, event: Input.Changed) -> None:
    self.run_worker(self._query_fund(code), exclusive=True)

async def _query_fund(self, code: str) -> None:
    fund = await self.service.get_or_create(code)
    self.call_from_thread(lambda: self._update_display(fund))
```

### 异步更新 UI

- 使用 `run_worker()` 启动后台任务
- 使用 `call_from_thread()` 从后台线程更新 UI
- 使用 `exclusive=True` 防止重复执行

## 输入验证模式

### 实时输入过滤

```python
def on_input_changed(self, event: Input.Changed) -> None:
    if event.input.id == "fund-code-input":
        code = event.value.strip()
        # 只允许数字
        if code and not code.isdigit():
            event.input.value = code[:-1]  # 移除非法字符
            return
        # 满足条件时自动触发
        if len(code) == 6:
            self.run_worker(self._query_fund(code), exclusive=True)
```

### 错误显示

- 基金名称显示：使用 `Static` 组件（只读，id="fund-name-display"）
- 错误信息显示：使用 `Label` 组件（id="fund-code-error"）
- 加载状态：使用 `LoadingIndicator` 组件

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

## TransactionsScreen 实现模式

### 快捷键绑定

```python
class TransactionsScreen(Screen):
    BINDINGS = [
        ("n", "add_transaction", "新增"),
        ("e", "edit_transaction", "编辑"),
        ("d", "delete_transaction", "删除"),
        ("j", "cursor_down", "下移"),
        ("k", "cursor_up", "上移"),
        ("escape", "pop_screen", "返回"),
    ]
```

### 账户筛选

- 使用 `Select` 组件 (id="account-filter") 实现账户筛选
- `on_mount` 时调用 `AccountService.get_all_accounts()` 加载选项
- 默认选中第一个账户
- 筛选变更时重新加载对应账户的交易列表

### DataTable 列定义

交易列表包含 10 列，按顺序：

```python
table.add_columns(
    "日期",      # transaction.date
    "类型",      # transaction.type (显示中文：买入/卖出/现金分红/红利再投资)
    "基金代码",  # transaction.fund.code
    "基金名称",  # transaction.fund.name
    "份额",      # transaction.shares
    "金额",      # transaction.amount
    "手续费",    # transaction.fee
    "净值",      # transaction.net_value
    "确认状态",  # "已确认" / "未确认" (根据 transaction.confirmed)
    "备注",      # transaction.notes
)
```

### 空状态处理

```python
# DataTable 和空状态 Label 切换显示
table = self.query_one("#transactions-table", DataTable)
empty_state = self.query_one("#empty-state", Label)

if transactions:
    table.visible = True
    empty_state.visible = False
else:
    table.visible = False
    empty_state.visible = True
    empty_state.update("暂无交易记录，按 n 新增")
```

### 加载交易流程

```python
async def _load_transactions(self) -> None:
    """
    加载交易列表：
    1. 调用 TransactionService.auto_confirm_transactions() 触发 T+1 自动确认
    2. 调用 TransactionService.list_transactions(account_id) 获取列表
    3. 更新 DataTable 数据
    4. 切换空状态显示
    """
```

## TransactionFormModal 实现模式

### 动态表单字段

根据交易类型显示/隐藏字段：

| 字段 | buy | sell | dividend_cash | dividend_reinvest |
|------|-----|------|---------------|-------------------|
| 日期 | ✓ | ✓ | ✓ | ✓ |
| 基金代码 | ✓ | ✓ | ✓ | ✓ |
| 份额 | ✓ | ✓ | ✗ | ✓ |
| 金额 | ✓ | ✓ | ✓ | ✓ |
| 手续费 | ✓ | ✓ | ✗ | ✗ |
| 净值 | ✓ | ✓ | ✗ | ✗ |
| 备注 | ✓ | ✓ | ✓ | ✓ |

### 基金代码异步查询

```python
class TransactionFormModal(ModalScreen[None]):
    def on_input_changed(self, event: Input.Changed) -> None:
        if event.input.id == "fund-code-input":
            code = event.value.strip()
            # 只允许数字
            if code and not code.isdigit():
                event.input.value = code[:-1]
                return
            # 满 6 位自动查询
            if len(code) == 6:
                self.run_worker(self._query_fund(code), exclusive=True)

    async def _query_fund(self, code: str) -> None:
        """异步查询基金信息"""
        try:
            fund = await FundService.get_or_create(code)
            self.call_from_thread(lambda: self._update_fund_name(fund.name))
        except ValueError as e:
            self.call_from_thread(lambda: self._show_error(str(e)))
```

### 编辑模式

```python
def __init__(self, account_id: int, transaction: Transaction | None = None):
    super().__init__()
    self.account_id = account_id
    self.transaction = transaction  # None 为新增，有值为编辑
    self.edit_mode = transaction is not None
```

- 编辑模式下，表单预填充已有数据
- 标题显示 "新增交易" / "编辑交易"
- 提交时调用 `create_transaction()` 或 `update_transaction()`

### 提交验证

- 基金代码：必须 6 位数字
- 份额：正数，最多 4 位小数
- 金额：正数，最多 2 位小数
- 日期：有效日期格式 (YYYY-MM-DD)

## DeleteTransactionModal 实现模式

```python
class DeleteTransactionModal(ModalScreen[None]):
    BINDINGS = [("escape", "cancel", "取消")]

    def __init__(self, transaction_id: int):
        super().__init__()
        self.transaction_id = transaction_id

    def compose(self):
        yield Label("确认删除")
        yield Label("确定要删除这笔交易记录吗？")
        yield Button("确认", id="confirm", variant="error")
        yield Button("取消", id="cancel")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm":
            TransactionService.delete_transaction(self.transaction_id)
            self.dismiss(None)
        else:
            self.dismiss(None)
```

## 交易类型映射

```python
TRANSACTION_TYPE_LABELS = {
    "buy": "买入",
    "sell": "卖出",
    "dividend_cash": "现金分红",
    "dividend_reinvest": "红利再投资",
}
```
