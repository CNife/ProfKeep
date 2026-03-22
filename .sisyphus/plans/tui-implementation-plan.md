# FundKeeper TUI 实施方案

**日期**: 2026-03-22
**状态**: 待确认

---

## 1. 项目概述

### 1.1 目标

将现有的 Web 前端（React + Ant Design）替换为 TUI（Textual），实现单体应用架构。

### 1.2 核心决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 技术栈 | Python + Textual | 学习目的，个人使用 |
| 架构 | 单体应用 | 简化部署，无前后端分离复杂度 |
| 打包 | `uv tool install` | 熟练 Python 开发者，无需编译 |
| 目标用户 | 仅自己 | 无需考虑非技术用户 |
| 目标平台 | Linux + macOS（Windows 兼容） | Python 跨平台 |

---

## 2. 功能范围

### 2.1 MVP 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 多账户管理 | P0 | 新增/编辑/删除账户 |
| 基金持仓列表 | P0 | 按账户展示持仓 |
| 持仓收益计算 | P0 | 实时计算收益和收益率 |
| 导入导出交易记录 | P0 | CSV 格式 |
| 录入交易记录 | P0 | 买入/卖出/分红 |
| 净值刷新 | P0 | Tushare API |
| 收益曲线图 | P0 | Canvas 实现 |

### 2.2 后续迭代

| 功能 | 优先级 | 说明 |
|------|--------|------|
| PDF 报告导出 | P2 | Python 脚本 + 模板 |
| Excel 导出 | P2 | openpyxl |
| 柱状图 | P2 | 资产配置展示 |

### 2.3 不做

- 饼图（用柱状图替代）
- Web/浏览器集成
- 其他基金软件数据导入
- Windows 特定优化

---

## 3. 图表实现方案

### 3.1 收益曲线图类型

| 类型 | 数据 | 展示 |
|------|------|------|
| 单只基金持仓 | 收益曲线 + 成本线 | 双系列，Y轴百分比 |
| 单账户收益 | 收益曲线 + 沪深300 | 双系列对比 |
| 总账户收益 | 收益曲线 + 沪深300 | 双系列对比 |

### 3.2 技术实现

```python
# 使用 Textual Canvas
from textual.widget import Widget
from textual.canvas import Canvas

class ChartWidget(Widget):
    def render(self) -> Canvas:
        # 绘制坐标轴
        # 绘制网格线
        # 绘制曲线
        # 绘制标签
        pass
```

### 3.3 坐标轴设计

| 轴 | 内容 | 样式 |
|----|------|------|
| X轴 | 日期标签 | 月度刻度 |
| Y轴 | 百分比 | 10% 刻度间隔 |

### 3.4 时间范围

- 1 个月
- 6 个月
- 1 年
- 全部

### 3.5 交互方式

- 选择持仓后，在独立面板自动展示曲线
- 无需鼠标悬停/缩放

---

## 4. 数据库设计

### 4.1 表结构

```sql
-- 账户表
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 基金信息表
CREATE TABLE funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,  -- 6位基金代码
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),                  -- 股票型/混合型/债券型等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 持仓表（快照，加速启动）
CREATE TABLE holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    shares DECIMAL(15, 4) NOT NULL,    -- 持仓份额
    cost_price DECIMAL(10, 4) NOT NULL, -- 持仓成本价
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (fund_id) REFERENCES funds(id),
    UNIQUE(account_id, fund_id)
);

-- 交易记录表
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,         -- buy/sell/dividend
    date DATE NOT NULL,
    shares DECIMAL(15, 4),             -- 份额（买入/卖出）
    amount DECIMAL(15, 2),             -- 金额（分红）
    fee DECIMAL(10, 2) DEFAULT 0,
    net_value DECIMAL(10, 4),          -- 交易净值
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (fund_id) REFERENCES funds(id)
);

-- 基金净值历史表
CREATE TABLE fund_nav_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund_id INTEGER NOT NULL,
    date DATE NOT NULL,
    nav DECIMAL(10, 4) NOT NULL,       -- 单位净值
    acc_nav DECIMAL(10, 4),            -- 累计净值
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fund_id) REFERENCES funds(id),
    UNIQUE(fund_id, date)
);

-- 指数净值历史表（沪深300等）
CREATE TABLE index_nav_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(10) NOT NULL,         -- 指数代码，如 000300.SH
    date DATE NOT NULL,
    close DECIMAL(10, 4) NOT NULL,     -- 收盘价
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, date)
);
```

### 4.2 数据库文件位置

```
~/.fundkeeper/data.db
```

### 4.3 缓存策略

| 数据类型 | 缓存时间 | 刷新触发 |
|---------|---------|---------|
| 基金净值 | 7 天 | 打开应用时检查，手动刷新 `r` |
| 指数净值 | 7 天 | 同上 |
| 基金信息 | 长期 | 新增基金时获取 |

---

## 5. Tushare API 集成

### 5.1 Token 管理

```python
# Tushare 自动读取 ~/.tushare/token
# 无需额外处理
import tushare as ts
pro = ts.pro_api()
```

### 5.2 API 调用封装

```python
class TushareService:
    def get_fund_nav(self, fund_code: str) -> list[NavData]:
        """获取基金净值历史"""
        try:
            df = pro.fund_nav(ts_code=f"{fund_code}.OF")
            return self._parse_nav(df)
        except Exception as e:
            raise APIError(f"获取净值失败: {e}")
    
    def get_index_daily(self, index_code: str) -> list[IndexData]:
        """获取指数日线（沪深300: 000300.SH）"""
        try:
            df = pro.index_daily(ts_code=index_code)
            return self._parse_index(df)
        except Exception as e:
            raise APIError(f"获取指数失败: {e}")
```

### 5.3 错误处理

| 错误类型 | 处理方式 | 用户提示 |
|---------|---------|---------|
| 网络超时 | 重试 3 次 | "网络超时，请稍后重试" |
| Token 无效 | 停止请求 | "Tushare Token 无效，请检查配置" |
| 接口限流 | 等待重试 | "API 调用频率超限，请稍后重试" |
| 基金代码不存在 | 跳过 | "基金代码 {code} 不存在" |

### 5.4 限流处理

```python
import time
from functools import wraps

def rate_limit(seconds: float = 0.3):
    """Tushare 免费版限流：每分钟 200 次"""
    def decorator(func):
        last_call = [0.0]
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_call[0]
            if elapsed < seconds:
                time.sleep(seconds - elapsed)
            result = func(*args, **kwargs)
            last_call[0] = time.time()
            return result
        return wrapper
    return decorator
```

---

## 6. 用户界面设计

### 6.1 屏幕结构

```
┌─────────────────────────────────────────────────────────────┐
│ FundKeeper - [账户名称]                           [h 帮助] │
├─────────────────────────────────────────────────────────────┤
│ [a 账户] [h 持仓] [t 交易] [c 图表]                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 代码     名称           份额      成本    收益率    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 000001  华夏成长        1000.00   1.500   +5.23%   │   │
│  │ 110022  易方达消费      2000.00   2.100   -2.15%   │   │
│  │ 161725  招商中证白酒    500.00    1.200   +12.50%  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 总市值: ¥8,234.56  总成本: ¥7,800.00  总收益: +5.58%       │
├─────────────────────────────────────────────────────────────┤
│ [n 新增] [e 编辑] [d 删除] [r 刷新] [i 导入] [x 导出] [q 退出] │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 快捷键设计（Vim 风格）

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

### 6.3 鼠标支持

- 点击列表项选中
- 点击 Tab 切换页面
- 双击查看详情/编辑
- 滚动列表

---

## 7. 项目结构

```
fund-keeper/
├── src/
│   └── fund_keeper/
│       ├── __init__.py
│       ├── app.py                 # Textual App 入口
│       ├── screens/
│       │   ├── __init__.py
│       │   ├── accounts.py        # 账户管理
│       │   ├── holdings.py        # 持仓列表
│       │   ├── transactions.py    # 交易记录
│       │   └── charts.py          # 收益曲线
│       ├── widgets/
│       │   ├── __init__.py
│       │   ├── chart.py           # Canvas 图表组件
│       │   └── fund_input.py      # 基金代码输入（带搜索）
│       ├── models/
│       │   ├── __init__.py
│       │   ├── database.py        # SQLAlchemy 配置
│       │   ├── account.py
│       │   ├── fund.py
│       │   ├── holding.py
│       │   ├── transaction.py
│       │   └── nav_history.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── account_service.py
│       │   ├── holding_service.py
│       │   ├── transaction_service.py
│       │   ├── nav_service.py     # 净值获取
│       │   └── tushare.py         # API 封装
│       ├── utils/
│       │   ├── __init__.py
│       │   ├── calculators.py     # 持仓计算
│       │   ├── formatters.py      # 格式化
│       │   └── csv_handler.py     # CSV 导入导出
│       └── styles.tcss            # Textual CSS
├── tests/
│   ├── __init__.py
│   ├── test_calculators.py
│   └── test_services.py
├── pyproject.toml
└── README.md
```

### 7.1 pyproject.toml

```toml
[project]
name = "fund-keeper"
version = "0.1.0"
description = "基金账本 TUI 应用"
requires-python = ">=3.11"
dependencies = [
    "textual>=0.50.0",
    "sqlalchemy>=2.0.0",
    "tushare>=1.4.0",
    "pandas>=2.0.0",
]

[project.scripts]
fundkeeper = "fund_keeper.app:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100

[tool.ruff.format]
quote-style = "double"
```

---

## 8. 实施计划

### Phase 1: 基础框架（Week 1）

| Day | 任务 | 产出 |
|-----|------|------|
| 1 | 项目初始化 | pyproject.toml, 目录结构 |
| 1 | SQLAlchemy 模型 | models/ 完成 |
| 2 | 数据库初始化 | SQLite 建表 |
| 2 | Textual App 骨架 | app.py, screens/ |
| 3 | 账户管理界面 | accounts.py |
| 4 | 持仓列表界面 | holdings.py |
| 5 | Tushare API 封装 | tushare.py |

### Phase 2: 核心功能（Week 2）

| Day | 任务 | 产出 |
|-----|------|------|
| 1 | 交易记录录入 | transactions.py |
| 2 | 持仓计算算法 | calculators.py |
| 3 | 净值刷新 | nav_service.py |
| 4 | CSV 导入导出 | csv_handler.py |
| 5 | 集成测试 | 测试通过 |

### Phase 3: 图表功能（Week 3）

| Day | 任务 | 产出 |
|-----|------|------|
| 1-2 | Canvas 图表组件 | chart.py |
| 3 | 收益曲线集成 | charts.py |
| 4 | 基准对比 | 沪深300 数据 |
| 5 | UI 优化 | 样式调整 |

### Phase 4: 完善和发布（Week 4）

| Day | 任务 | 产出 |
|-----|------|------|
| 1-2 | 错误处理完善 | 友好错误提示 |
| 3 | 文档编写 | README |
| 4-5 | 测试和修复 | 稳定版本 |

---

## 9. 风险和缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Textual 学习曲线超预期 | 中 | 延期 | 边做边学，先实现简单功能 |
| Canvas 图表实现困难 | 中 | 功能削减 | 先用 Sparkline，后续优化 |
| Tushare API 限流 | 低 | 用户体验下降 | 缓存 + 手动刷新 |
| 大数据量性能问题 | 低 | 卡顿 | 分页加载，延迟计算 |

---

## 10. 待确认项

无。所有决策已明确。

---

**下一步**: 确认方案后开始 Phase 1 实施。