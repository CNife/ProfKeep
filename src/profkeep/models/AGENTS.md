# 数据库模型规则

## ORM
使用 SQLModel（Pydantic + SQLAlchemy 融合）。

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