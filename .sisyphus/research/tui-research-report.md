# TUI 技术栈调研报告

**项目**: 基金账本  
**调研日期**: 2026-03-21  
**分支**: research-tui  

---

## 1. 调研背景

### 1.1 当前技术栈

| 层级 | 技术 |
|------|------|
| 后端 | FastAPI + SQLite + Tushare + SQLAlchemy |
| 前端 | React 18 + TypeScript + Ant Design 5.x + ECharts |
| 构建 | Vite + pnpm |

### 1.2 调研目标

1. 寻找现代 TUI 框架替代 Web 前端
2. 评估前后端合并为单体应用的可行性
3. 对比 Go 与 Python 技术栈

### 1.3 功能迁移需求

| 功能模块 | Web 实现 | TUI 挑战度 |
|---------|---------|-----------|
| 多账户管理 | 表单 + 列表 | 低 - 基础组件 |
| 基金持仓表格 | Ant Design Table | 中 - 滚动/排序 |
| 交易记录表单 | 表单组件 | 低 - 输入控件 |
| 资产配置饼图 | ECharts | 高 - 图表限制 |
| 收益曲线图 | ECharts | 高 - 图表限制 |
| 净值走势图 | ECharts | 高 - 图表限制 |

---

## 2. TUI 框架调研

### 2.1 Python 框架

#### Textual (推荐)

**GitHub**: https://github.com/Textualize/textual  
**Stars**: 30k+

| 特性 | 说明 |
|------|------|
| 架构 | 类 React 的组件化开发，CSS 样式系统 (TCSS) |
| 鼠标支持 | ✅ 完整支持点击、拖拽、滚动、悬停 |
| 中文支持 | ✅ Unicode 宽度自动处理 |
| 异步支持 | ✅ 原生 async/await |
| 布局系统 | ✅ Flexbox + Grid 布局 |
| 组件库 | DataTable, Tree, Tabs, ListView, Input, Sparkline 等 |

**优势**：
1. 现代化设计，CSS 样式系统，支持响应式布局
2. 开发效率高，组件化开发，热重载支持
3. 生态完善，Rich 库底层，丰富的样式和颜色支持
4. 文档质量高，官方教程、API 文档、示例代码完善
5. 社区活跃，由 Textualize 公司维护，持续更新

**代码示例**：

```python
from textual.app import App, ComposeResult
from textual.widgets import DataTable, Header, Footer

class FundApp(App):
    """基金账本 TUI 应用"""

    CSS_PATH = "style.tcss"

    def compose(self) -> ComposeResult:
        yield Header()
        yield DataTable()
        yield Footer()

    def on_mount(self) -> None:
        table = self.query_one(DataTable)
        table.add_columns("基金代码", "基金名称", "持仓份额", "持仓成本", "收益率")
        table.add_row("000001", "华夏成长", "1000.00", "1.500", "+5.23%")
```

#### pyTermTk (备选)

**GitHub**: https://github.com/ceccopierangiolieugenio/pyTermTk  
**Stars**: 1k+

| 特性 | 说明 |
|------|------|
| 架构 | Qt-like API，类似 Qt5/GTK/tkinter |
| 鼠标支持 | ✅ 完整支持，类似 Qt 事件处理 |
| Unicode/CJK | ✅ 明确支持全/半/零宽字符 |
| 依赖 | 无外部依赖，完全自包含 |
| 工具 | ttkDesigner 可视化设计工具 |

适合有 Qt 开发经验的团队，可视化设计工具可加速开发。

### 2.2 Go 框架

#### Bubble Tea

**GitHub**: https://github.com/charmbracelet/bubbletea  
**Stars**: 28k+

| 特性 | 说明 |
|------|------|
| 架构 | Elm Architecture (Model-Update-View) |
| 样式 | Lip Gloss (CSS-like) |
| 组件 | Bubbles 组件库 |
| 图表 | ntcharts (折线图、柱状图、饼图、K线图) |
| 鼠标支持 | ✅ 通过 BubbleZone 支持 |

**优势**：
1. 性能优异，编译为原生二进制
2. 分发方便，单文件，无运行时依赖
3. 图表支持完善，ntcharts 提供丰富的图表功能
4. 生态成熟，Charm 公司积极维护

**代码示例**：

```go
package main

import (
    tea "github.com/charmbracelet/bubbletea"
    "github.com/charmbracelet/lipgloss"
)

type model struct {
    funds  []Fund
    cursor int
}

func (m model) View() string {
    // 渲染 UI
}

func main() {
    p := tea.NewProgram(initialModel())
    p.Run()
}
```

### 2.3 框架对比总结

| 维度 | Textual (Python) | Bubble Tea (Go) |
|------|------------------|-----------------|
| 成熟度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 鼠标支持 | ✅ 原生完善 | ✅ 需 bubblezone |
| 中文支持 | ✅ 内置 wcwidth | ✅ 依赖终端 |
| 表格组件 | DataTable 完善 | bubbles/table |
| 图表支持 | Sparkline, 自定义 | ntcharts 完善 |
| 学习曲线 | 中等 | 中等 |

---

## 3. 前后端合并可行性

### 3.1 结论：完全可行

TUI 应用天然适合单体架构，可以消除前后端分离带来的复杂度。

### 3.2 架构对比

| 维度 | 前后端分离 (当前) | TUI 单体应用 |
|------|------------------|--------------|
| 进程数 | 2 (前端服务器 + 后端服务) | 1 |
| 通信方式 | HTTP API | 函数调用 |
| 数据序列化 | JSON | 无需 |
| 端口占用 | 需要 | 无需 |
| 启动时间 | 秒级 | 毫秒级 |
| 内存占用 | 高 (Node.js + Python) | 低 |
| 用户安装步骤 | 安装依赖 + 启动服务 | 下载运行 |
| 调试复杂度 | 高 (跨进程) | 低 |

### 3.3 Python 单体应用示例

```python
# 单文件单体应用
from textual.app import App, ComposeResult
from textual.widgets import DataTable, Button
import sqlite3
import tushare as ts

class FundKeeperApp(App):
    """基金账本 TUI - 单体应用"""
    
    CSS_PATH = "style.tcss"
    
    def __init__(self, db_path: str = "fundkeeper.db"):
        super().__init__()
        self.db = sqlite3.connect(db_path)
        self.db.row_factory = sqlite3.Row
        self.ts_api = ts.pro_api()
    
    def compose(self) -> ComposeResult:
        yield DataTable(id="holdings")
        yield Button("刷新净值", id="refresh")
    
    def on_mount(self) -> None:
        cursor = self.db.execute("SELECT * FROM holdings")
        table = self.query_one(DataTable)
        for row in cursor:
            table.add_row(row["fund_code"], row["fund_name"], ...)
    
    def refresh_nav(self) -> None:
        """直接调用 Tushare API 获取净值"""
        df = self.ts_api.fund_daily(ts_code="000001.OF")
        # 更新数据库和 UI
```

### 3.4 实际案例

| 项目 | 语言 | 框架 | 架构 |
|------|------|------|------|
| lazygit | Go | Bubble Tea | 单二进制 |
| finance-tracker-tui | Go | Bubble Tea | 单二进制 |
| sqlit | Python | Textual | pipx 安装 |
| ticker | Go | Bubble Tea | 单二进制 |

---

## 4. Go vs Python 技术栈对比

### 4.1 开发效率

| 维度 | Python | Go |
|------|--------|-----|
| 快速原型 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 代码量 | 少 | 多（显式错误处理） |
| 现有代码复用 | ✅ 直接复用 | ❌ 需要重写 |
| 数据处理库 | pandas, numpy 强大 | 有限 |
| 金融数据 API | tushare, akshare 成熟 | 需自己封装 |

### 4.2 性能

| 指标 | Python | Go |
|------|--------|-----|
| 启动时间 | ~300ms (Nuitka 后) | <10ms |
| 运行速度 | 慢 (解释型) | 快 (编译型) |
| 内存占用 | 较高 | 低 |
| 并发 | GIL 限制 | goroutine 原生 |

### 4.3 分发部署

| 维度 | Python | Go |
|------|--------|-----|
| 编译产物 | PyInstaller/Nuitka 打包 | 原生单二进制 |
| 文件大小 | 50-100MB | 8-15MB |
| 运行时依赖 | 内置到打包文件 | 无 |
| 跨平台编译 | ❌ 需目标平台构建 | ✅ 单命令 |
| 用户安装 | 下载解压运行 | 下载运行 |

### 4.4 现有代码复用分析

**Python TUI 可复用**：

| 模块 | 复用程度 |
|------|----------|
| models/ (SQLAlchemy 模型) | 100% |
| services/ (业务逻辑) | 100% |
| database/ (数据库配置) | 100% |
| utils/ (工具函数) | 100% |
| Tushare API 封装 | 100% |
| 持仓计算算法 | 100% |

**Go TUI 需要重写**：

| 模块 | 工作量 |
|------|--------|
| 数据模型 | 高 |
| 业务逻辑 | 高 |
| Tushare API | 高 |
| 持仓计算 | 中 |

---

## 5. 最终决策

### 5.1 决策结论

| 问题 | 答案 |
|------|------|
| 前后端能否合并为单体应用？ | **可以**，TUI 天然适合单体架构 |
| Python vs Go 推荐？ | **Python**，代码复用和开发效率优势明显 |

### 5.2 选择方案：Python + Textual 单体架构

**理由**：

1. **代码复用最大化**
   - 现有 SQLAlchemy 模型、业务逻辑、Tushare API 封装全部复用
   - 开发周期短，风险低

2. **开发效率高**
   - Textual 的 CSS 样式系统快速迭代 UI
   - 调试简单，单一进程

3. **功能满足需求**
   - DataTable 完善支持持仓列表
   - Sparkline 支持收益趋势
   - 鼠标和中文支持完善

4. **分发方案成熟**
   - Nuitka 编译保护源码
   - 单文件分发
   - 启动时间优化后可接受

### 5.3 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                 FundKeeper TUI 架构                      │
├─────────────────────────────────────────────────────────┤
│  UI 层: Textual (CSS 样式、组件化、异步)                  │
│  业务层: 复用现有 services/ 模块                          │
│  数据层: SQLite + SQLAlchemy (复用现有 models/)           │
│  数据源: Tushare (复用现有封装)                           │
│  打包: Nuitka --onefile                                  │
└─────────────────────────────────────────────────────────┘
```

### 5.4 迁移路线图

```
Week 1: 基础框架
├── Day 1-2: Textual 项目骨架
├── Day 3-4: DataTable 展示持仓
└── Day 5: 集成现有数据库和业务逻辑

Week 2: 功能完善
├── Day 1-2: 交易记录表单
├── Day 3-4: 净值刷新和收益计算
└── Day 5: Sparkline 图表

Week 3: 打包和优化
├── Day 1-2: Nuitka 打包配置
├── Day 3-4: 启动时间优化
└── Day 5: 测试和文档
```

### 5.5 预期成果

- 单文件可执行程序 (~50MB)
- 启动时间 <500ms
- 所有现有功能
- 无需 Python 环境运行

---

## 6. 附录

### 6.1 参考资源

**Textual**:
- 官方文档: https://textual.textualize.io/
- 教程: https://textual.textualize.io/tutorial/
- Widget Gallery: https://textual.textualize.io/widget_gallery

**Bubble Tea**:
- GitHub: https://github.com/charmbracelet/bubbletea
- Bubbles: https://github.com/charmbracelet/bubbles
- ntcharts: https://github.com/NimbleMarkets/ntcharts

**打包工具**:
- Nuitka: https://nuitka.net/
- PyInstaller: https://pyinstaller.org/

**实际案例**:
- lazygit: https://github.com/jesseduffield/lazygit
- sqlit: https://github.com/Maxteabag/sqlit
- ticker: https://github.com/achannarasappa/ticker

### 6.2 社区活跃度 (2026-03)

| 框架 | Stars | 维护者 | 推荐度 |
|------|-------|--------|--------|
| Textual | 30k+ | Textualize 公司 | ⭐⭐⭐⭐⭐ |
| Bubble Tea | 28k+ | Charm 公司 | ⭐⭐⭐⭐⭐ |
| pyTermTk | 1k+ | 个人 | ⭐⭐⭐⭐ |