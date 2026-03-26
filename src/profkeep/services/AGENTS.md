# 数据服务模块规则

## TushareService

封装 Tushare Pro API 的数据服务类，提供基金净值、基金信息、指数日线数据的获取和存储。

### 初始化

- Token 路径: `~/.profkeep/.tushare.key`
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
