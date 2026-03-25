# 数据库模型规则

## ORM
使用 SQLModel（Pydantic + SQLAlchemy 融合）。

## Python 3.14 + SQLModel 类型注解兼容性

### 问题
SQLModel 0.0.37 与 Python 3.14 新式类型注解存在兼容性问题：
- `X | None` 联合类型语法在 SQLAlchemy mapper 初始化时无法解析
- `list[X]` 泛型语法在 relationship 中无法解析
- `from __future__ import annotations` 会导致 relationship 解析失败

### 解决方案

**必须使用字符串形式的类型注解：**

```python
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .account import Account
    from .fund import Fund

class Holding(SQLModel, table=True):
    # 普通字段使用 Optional[X]
    id: Optional[int] = Field(default=None, primary_key=True)

    # Relationship 字段必须使用字符串形式
    account: Optional["Account"] = Relationship(back_populates="holdings")
    fund: Optional["Fund"] = Relationship(back_populates="holdings")

class Account(SQLModel, table=True):
    # list 类型也必须使用字符串
    holdings: list["Holding"] = Relationship(back_populates="account")
```

**禁止使用：**
- `from __future__ import annotations`（会破坏 relationship 解析）
- `X | None` 语法（使用 `Optional[X]` 替代）
- `list[X]` 不加引号（使用 `list["X"]` 替代）

### 验证行为

SQLModel `table=True` 模型的验证特性：
- `__init__()` 构造时**不会触发** Pydantic 验证
- 必须使用 `Model.model_validate(data)` 才会触发完整验证
- `field_validator` 和 `model_validator` 仅在 `model_validate()` 时执行

## SQLite 配置
```sql
PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
PRAGMA temp_store=MEMORY;
```

## 模型约束
- 基金代码：6位纯数字字符串
- 交易类型验证：Pydantic `@model_validator` 实现
- Holdings 表：缓存字段，卖出时更新，份额=0时删除记录

## 交易类型

| 类型 | 说明 | 影响份额 |
|------|------|---------|
| buy | 买入 | +份额 |
| sell | 卖出 | -份额 |
| dividend_cash | 现金分红 | 不变 |
| dividend_reinvest | 红利再投资 | +份额 |

每笔交易有 `confirmed` 字段，未确认交易不计入持仓计算。

## 持仓成本计算

使用平均成本法（不追踪每笔卖出对应哪笔买入）：
```python
持仓成本 = 累计买入金额 - 累计卖出金额
成本价 = 持仓成本 ÷ 当前持仓份额
持仓市值 = 持仓份额 × 最新净值
持仓收益 = 持仓市值 - 持仓成本
收益率 = 持仓收益 ÷ 持仓成本 × 100%
```
