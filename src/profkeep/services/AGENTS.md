# 数据服务模块规则

## 服务层通用模式

### Session 管理

- **每个方法独立 Session**: 使用 `with Session(database.engine) as session` 上下文
- **动态 engine 引用**: 从 `profkeep.models import database` 导入模块，使用时访问 `database.engine`
- **目的**: 确保测试 monkeypatch 生效，避免跨测试数据污染

### 名称唯一性验证

```python
# 创建/更新时检查名称唯一性
existing = session.exec(select(Account).where(
    Account.name == name,
    Account.id != account_id  # 更新时排除自身
)).first()
if existing:
    raise ValueError(f"账户名 '{name}' 已存在")
```

### 空值验证

- 使用 `pydantic.ValidationError.from_exception_data()` 手动构造验证错误
- 在模型层无 `min_length` 约束时，服务层手动验证必填字段

### 级联删除

- 依赖 SQLModel `cascade_delete=True` 配置
- 删除主记录时，关联记录自动删除
- 无需手动删除关联数据

## TushareService

封装 Tushare Pro API 的数据服务类，提供基金净值、基金信息、指数日线数据的获取和存储。

### 初始化

- Token 路径：`~/.profkeep/.tushare.key`
- Token 文件不存在时抛出 `FileNotFoundError`，消息为 "Tushare token not found"

### API 代码格式

| 数据类型 | 代码格式 | 示例 |
|----------|----------|------|
| 场外基金 | `{code}.OF` | `000001.OF` |
| 指数 | 直接使用 | `000300.SH` |

### 字段映射

**基金净值** (`pro.fund_nav()`):

- `ann_date` → `FundNavHistory.date` (YYYYMMDD → date)
- `unit_nav` → `FundNavHistory.nav`
- `accum_nav` → `FundNavHistory.acc_nav`

**基金信息** (`pro.fund_basic()`):

- `name`, `fund_type`, `management`

**指数日线** (`pro.index_daily()`):

- `trade_date` → `IndexNavHistory.date`
- `close` → `IndexNavHistory.close`

### 数据存储

- 覆盖更新：已存在的净值记录会被更新
- 智能增量：`refresh_fund_nav()` 从首笔交易日期开始获取

### 错误处理

- 网络错误重试：最多 3 次，递增延迟
- 批量刷新容错：部分失败不影响其他基金
- `RefreshResult` 汇总成功和失败列表

### 禁止事项

- 不要添加限流逻辑（付费版无需限流）
- 不要修改数据库模式
- 不要实现 UI 层
- 不要创建抽象基类

## AccountService

账户管理服务类，提供账户 CRUD 操作。

### 方法签名

```python
class AccountService:
    def create_account(self, name: str, description: str | None = None) -> Account
    def get_account(self, account_id: int) -> Account
    def get_all_accounts(self) -> list[Account]
    def update_account(self, account_id: int, name: str, description: str | None = None) -> Account
    def delete_account(self, account_id: int) -> None
```

### 验证规则

- **名称唯一性**: 创建/更新时检查，抛出 `ValueError`
- **空名称**: 抛出 `pydantic.ValidationError`
- **不存在**: `get_*` 和 `delete_*` 时抛出 `ValueError`

### 实现模式

- 使用 `Account.model_validate()` 触发 Pydantic 验证器
- 返回对象前调用 `session.refresh()` 确保字段完整
- 删除操作依赖模型层 `cascade_delete=True` 配置

## FundService

基金信息服务类，提供基金信息的缓存查询和 Tushare API 集成。

### 缓存优先查询模式

```python
async def get_or_create(self, code: str) -> Fund:
    # 1. 先查本地缓存
    fund = self.get_by_code(code)
    if fund:
        return fund

    # 2. 缓存未命中，从 Tushare 获取
    fund = await self.create_from_tushare(code)
    return fund
```

### 异步方法

- 所有涉及外部 API 的方法必须是 `async`
- 使用 `async with Session()` 管理异步数据库会话

### 错误处理

- 无效基金代码：抛出 `ValueError("未找到该基金代码")`
- 网络错误：抛出 `ConnectionError("网络错误，请重试")`
- API 超时：抛出 `TimeoutError("查询超时，请重试")`

## TransactionService

交易记录管理服务类，提供交易 CRUD 操作、自动确认和持仓重算联动。

### 方法签名

```python
class TransactionService:
    def create_transaction(self, account_id: int, fund_id: int, type: TransactionType,
                          date: date, shares: Decimal | None = None,
                          amount: Decimal | None = None,
                          fee: Decimal = Decimal("0"),
                          net_value: Decimal | None = None,
                          notes: str | None = None,
                          confirmed: bool = True) -> Transaction

    def get_transaction(self, transaction_id: int) -> Transaction
    def list_transactions(self, account_id: int) -> list[Transaction]
    def update_transaction(self, transaction_id: int, **kwargs) -> Transaction
    def delete_transaction(self, transaction_id: int) -> None
    def auto_confirm_transactions(self, account_id: int) -> int
```

### 核心规则

- **模型验证**: 必须使用 `Transaction.model_validate()` 触发 Pydantic 验证器
- **持仓重算联动**: create/update/delete 后必须调用 `HoldingService.recalculate_from_transactions(account_id, fund_id)`
- **T+1 自动确认**: 加载交易列表时调用 `auto_confirm_transactions()`，将 `date <= today - 1 day` 的未确认交易批量确认为 `confirmed=True`
- **修改联动**: update 时若 `account_id` 或 `fund_id` 变更，需同时重算旧的和新 account+fund 组合的持仓

### 自动确认逻辑

```python
def auto_confirm_transactions(self, account_id: int) -> int:
    """
    自动确认 T+1 交易：
    1. 查询 account_id 下所有 confirmed=False 且 date <= (today - 1 day) 的交易
    2. 批量更新为 confirmed=True
    3. 对每个变更的 fund_id 调用 recalculate_from_transactions()
    4. 返回确认的交易数量
    """
```

### 验证规则

- **名称唯一性**: 不适用（交易无名称字段）
- **类型验证**: 通过 `Transaction.model_validate()` 触发模型层的 `@model_validator`
- **不存在**: `get_transaction` 和 `delete_transaction` 时抛出 `ValueError("交易不存在")`

### 实现模式

- 每个方法独立使用 `with Session(database.engine) as session`
- 创建/更新时使用 `model_validate()` 而非直接构造
- 返回对象前调用 `session.refresh()` 确保字段完整
- 删除操作前先记录 `account_id` 和 `fund_id` 用于后续重算

## HoldingService.recalculate_from_transactions()

从交易记录重算持仓的核心方法。

### 方法签名

```python
def recalculate_from_transactions(self, account_id: int, fund_id: int) -> None:
    """
    根据已确认交易记录重算持仓：
    1. 查询该 account_id + fund_id 下所有 confirmed=True 的交易
    2. 按平均成本法计算持仓
    3. 根据计算结果创建/更新/删除 Holding 记录
    """
```

### 计算公式

```python
# 累计买入份额 = Σ(buy.shares) + Σ(dividend_reinvest.shares)
# 累计卖出份额 = Σ(sell.shares)
# 累计买入金额 = Σ(buy.amount) + Σ(buy.fee) + Σ(dividend_reinvest.amount)
# 累计卖出金额 = Σ(sell.amount) - Σ(sell.fee)
# 总份额 = 累计买入份额 - 累计卖出份额
# 总成本 = 累计买入金额 - 累计卖出金额
# 成本价 = 总成本 / 总份额（总份额 > 0 时）
```

### 处理逻辑

| 持仓状态 | 总份额 | 操作 |
|----------|--------|------|
| 不存在 | > 0 | 创建 Holding |
| 存在 | > 0 | 更新 shares 和 cost_price |
| 存在 | = 0 | 删除 Holding |
| 不存在 | = 0 | 无操作 |

### 注意事项

- **仅计算已确认交易**: `confirmed=False` 的交易不计入
- **现金分红不影响持仓**: `dividend_cash` 类型不影响份额和持仓成本
- **平均成本法**: 不追踪每笔买入的成本，统一计算平均成本
