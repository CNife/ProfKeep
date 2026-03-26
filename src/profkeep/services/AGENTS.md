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
