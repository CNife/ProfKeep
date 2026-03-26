# FundKeeper TUI 实施方案

**日期**: 2026-03-24
**状态**: 已确认

---

## 1. 项目概述

### 1.1 目标

开发基于 Textual 的基金管理 TUI 应用，实现单体应用架构，本地存储数据，手动刷新净值。

### 1.2 核心决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 技术栈 | Python + Textual | 学习目的，个人使用 |
| 架构 | 单体应用 | 简化部署，无前后端分离复杂度 |
| 打包 | `uv tool install` | 熟练 Python 开发者，无需编译 |
| 目标用户 | 仅自己 | 无需考虑非技术用户 |
| 目标平台 | Linux + macOS（Windows 兼容） | Python 跨平台 |
| 净值刷新 | 仅手动 | 避免 API 滥用，用户主动控制 |
| 成本计算 | 平均成本法 | 简化卖出成本追踪 |

---

## 2. 功能范围

### 2.1 MVP 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 多账户管理 | P0 | 新增/编辑/删除账户（级联删除） |
| 基金持仓列表 | P0 | 按账户展示持仓 |
| 持仓收益计算 | P0 | 实时计算收益和收益率 |
| 导入导出交易记录 | P0 | CSV 固定格式 |
| 录入交易记录 | P0 | 买入/卖出/现金分红/红利再投资 |
| 交易确认状态 | P0 | 未确认交易不计入持仓 |
| 净值刷新 | P0 | 手动刷新，Tushare API |
| 基金信息自动补全 | P0 | 输入代码时自动查询名称 |
| 收益曲线图 | P0 | Canvas 实现，Tab 切换时间范围 |

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
- 自动净值刷新

---

## 3. 持仓计算

### 3.1 成本计算方法

使用平均成本法（不追踪每笔卖出对应哪笔买入）：

```python
持仓成本 = Σ(买入金额 - 卖出金额) ÷ 当前持仓份额
持仓市值 = 持仓份额 × 最新净值
持仓收益 = 持仓市值 - 持仓成本
收益率 = 持仓收益 ÷ 持仓成本 × 100%
```

### 3.2 交易类型

| 类型 | 说明 | 影响份额 |
|------|------|---------|
| buy | 买入 | +份额 |
| sell | 卖出 | -份额 |
| dividend_cash | 现金分红 | 不变 |
| dividend_reinvest | 红利再投资 | +份额 |

### 3.3 确认状态

每笔交易有 `confirmed` 字段：

- **已确认**：计入持仓计算
- **未确认**：不计入持仓，仅作记录

---

## 4. 图表实现方案

### 4.1 收益曲线图类型

| 类型 | 数据 | 展示 |
|------|------|------|
| 单只基金持仓 | 收益曲线 + 成本线 | 双系列，Y轴百分比 |
| 单账户收益 | 收益曲线 + 沪深300 | 双系列对比 |
| 总账户收益 | 收益曲线 + 沪深300 | 双系列对比 |

### 4.2 技术实现

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

### 4.3 坐标轴设计

| 轴 | 内容 | 样式 |
|----|------|------|
| X轴 | 日期标签 | 月度刻度 |
| Y轴 | 百分比 | 10% 刻度间隔 |

### 4.4 时间范围

- 1 个月
- 6 个月
- 1 年
- 全部

### 4.5 交互方式

- **Tab 键**：在四个时间范围间循环切换
- 选择持仓后，在独立面板自动展示曲线
- 无需鼠标悬停/缩放

---

## 5. 数据库设计

### 5.1 表结构

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
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES funds(id),
    UNIQUE(account_id, fund_id)
);

-- 交易记录表
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    fund_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,         -- buy/sell/dividend_cash/dividend_reinvest
    date DATE NOT NULL,
    shares DECIMAL(15, 4),             -- 份额（买入/卖出/红利再投资）
    amount DECIMAL(15, 2),             -- 金额（现金分红）
    fee DECIMAL(10, 2) DEFAULT 0,
    net_value DECIMAL(10, 4),          -- 交易净值
    confirmed BOOLEAN DEFAULT TRUE,    -- 确认状态
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
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

### 5.2 数据库文件位置

```text
~/.profkeep/data.db
```

### 5.3 缓存策略

| 数据类型 | 缓存时间 | 刷新触发 |
|---------|---------|---------|
| 基金净值 | 7 天 | 手动刷新 `r` |
| 指数净值 | 7 天 | 手动刷新 `r` |
| 基金信息 | 长期 | 输入基金代码时自动获取 |

---

## 6. Tushare API 集成

### 6.1 Token 管理

```python
import tushare as ts

# 从 ~/.profkeep/.tushare.key 读取 token
token_path = Path.home() / ".profkeep" / ".tushare.key"
token = token_path.read_text().strip()
pro = ts.pro_api(token)
```

### 6.2 API 调用封装

```python
class TushareService:
    def get_fund_nav(self, fund_code: str) -> list[NavData]:
        """获取基金净值历史"""
        try:
            df = pro.fund_nav(ts_code=f"{fund_code}.OF")
            return self._parse_nav(df)
        except Exception as e:
            raise APIError(f"获取净值失败: {e}")

    def get_fund_info(self, fund_code: str) -> FundInfo:
        """获取基金基本信息"""
        try:
            df = pro.fund_basic(ts_code=f"{fund_code}.OF")
            return self._parse_fund_info(df)
        except Exception as e:
            raise APIError(f"获取基金信息失败: {e}")

    def get_index_daily(self, index_code: str) -> list[IndexData]:
        """获取指数日线（沪深300: 000300.SH）"""
        try:
            df = pro.index_daily(ts_code=index_code)
            return self._parse_index(df)
        except Exception as e:
            raise APIError(f"获取指数失败: {e}")
```

### 6.3 错误处理

| 错误类型 | 处理方式 | 用户提示 |
|---------|---------|---------|
| 网络超时 | 重试 3 次 | 弹窗："网络超时，请稍后重试" |
| Token 无效 | 停止请求 | 弹窗："Tushare Token 无效，请检查配置" |
| 接口限流 | 等待重试 | 弹窗："API 调用频率超限，请稍后重试" |
| 基金代码不存在 | 跳过 | 弹窗："基金代码 {code} 不存在" |

### 6.4 限流处理

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

## 7. 用户界面设计

### 7.1 屏幕结构

```text
┌─────────────────────────────────────────────────────────────┐
│ FundKeeper - [账户名称]                           [? 帮助] │
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

### 7.2 快捷键设计（Vim 风格）

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
| `?` | 帮助（快捷键列表） | 全局 |
| `q` | 退出 | 全局 |
| `j/k` | 上下移动 | 列表 |
| `Tab` | 切换时间范围 | 图表页 |
| `Enter` | 确认/查看详情 | 全局 |
| `Esc` | 返回/取消 | 全局 |

### 7.3 鼠标支持

- 点击列表项选中
- 点击 Tab 切换页面
- 双击查看详情/编辑
- 滚动列表

### 7.4 错误展示

- 使用弹窗模态框显示错误信息
- 用户需按 Enter 或 Esc 确认关闭

### 7.5 帮助界面

- 按 `?` 显示快捷键列表
- 不包含详细操作指南

---

## 8. 数据验证

### 8.1 验证时机

- **提交时验证**：点击确认时验证所有字段
- 不做实时验证

### 8.2 验证规则

| 字段 | 规则 |
|------|------|
| 基金代码 | 必须为 6 位数字 |
| 份额 | 必须为正数，最多 4 位小数 |
| 金额 | 必须为正数，最多 2 位小数 |
| 日期 | 必须为有效日期格式 |
| 手续费 | 必须 ≥ 0 |

---

## 9. CSV 导入导出

### 9.1 格式

固定格式模板，包含表头：

```csv
日期,基金代码,交易类型,份额,金额,手续费,净值,确认状态,备注
2024-01-15,000001,buy,1000.00,1500.00,0,1.500,已确认,定投
2024-02-20,110022,sell,500.00,1200.00,5.00,2.400,已确认,
2024-03-10,161725,dividend_cash,,200.00,,,已确认,现金分红
```

### 9.2 交易类型映射

| CSV 值 | 系统类型 |
|--------|---------|
| buy | buy |
| sell | sell |
| dividend_cash | dividend_cash |
| dividend_reinvest | dividend_reinvest |

### 9.3 导入校验

- 检查格式（表头、列数）
- 检查数据类型
- 检查外键约束（基金代码是否存在）
- 错误时显示具体行号和错误原因

---

## 10. 项目结构

```text
profkeep/
├── src/
│   └── profkeep/
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
│   ├── test_models.py
│   ├── test_services.py
│   └── test_calculators.py
├── docs/
│   ├── AGENTS.md
│   ├── IMPLEMENTATION.md          # 本文档
│   └── DATABASE.md                # 数据库设计文档（待创建）
├── pyproject.toml
└── README.md
```

### 10.1 pyproject.toml

```toml
[project]
name = "profkeep"
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
profkeep = "profkeep.app:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100

[tool.ruff.format]
quote-style = "double"
```

---

## 11. 实施计划

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
| 3 | 净值刷新 + 基金信息自动补全 | nav_service.py |
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
| 1-2 | 错误处理完善 | 弹窗错误提示 |
| 3 | 文档编写 | README |
| 4-5 | 测试和修复 | 稳定版本 |

---

## 12. 风险和缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Textual 学习曲线超预期 | 中 | 延期 | 边做边学，先实现简单功能 |
| Canvas 图表实现困难 | 中 | 功能削减 | 先用 Sparkline，后续优化 |
| Tushare API 限流 | 低 | 用户体验下降 | 缓存 + 手动刷新 |
| 大数据量性能问题 | 低 | 卡顿 | 分页加载，延迟计算 |

---

## 13. 测试范围

### 13.1 测试模块

| 模块 | 测试内容 |
|------|---------|
| models/ | 字段约束、外键关联、唯一性约束 |
| services/ | CRUD 操作、业务逻辑 |
| utils/calculators.py | 成本计算、收益率计算 |
| utils/csv_handler.py | CSV 格式验证、导入导出 |

### 13.2 不测试

- UI 层（screens/）：TUI 组件测试复杂度高
- Tushare API：外部依赖，使用 Mock 测试服务层

---

**下一步**: 开始 Phase 1 实施。
