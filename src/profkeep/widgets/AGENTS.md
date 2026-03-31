# UI 组件规则

## 目录职责

`widgets/` 目录用于存放可复用的 UI 组件，这些组件被 `screens/` 使用来构建界面。

## 当前状态

**目录为空** — 目前仅包含 `__init__.py` 文件。

## 待实现组件

根据实施方案（`docs/IMPLEMENTATION.md` §4.2），计划实现以下组件：

### ChartWidget

收益曲线图组件，基于 Textual Canvas 实现。

**功能特性**:
- 绘制收益曲线（单只基金/单账户/总账户）
- 支持双系列对比（收益曲线 + 成本线 或 收益曲线 + 沪深 300）
- Y 轴百分比刻度（10% 间隔）
- X 轴日期标签（月度刻度）
- Tab 键切换时间范围（1 个月/6 个月/1 年/全部）

**技术实现**:
```python
from textual.widget import Widget
from textual.canvas import Canvas

class ChartWidget(Widget):
    """收益曲线图组件"""
    
    def __init__(self, chart_type: str, data: ChartData):
        super().__init__()
        self.chart_type = chart_type  # "fund" | "account" | "total"
        self.data = data
        self.time_range = "all"  # "1m" | "6m" | "1y" | "all"
    
    def compose(self) -> ComposeResult:
        yield Canvas(id="chart-canvas")
    
    def render(self) -> Canvas:
        # 绘制坐标轴
        # 绘制网格线
        # 绘制曲线
        # 绘制标签
        pass
    
    def action_toggle_time_range(self) -> None:
        """Tab 键切换时间范围"""
        ranges = ["1m", "6m", "1y", "all"]
        current_idx = ranges.index(self.time_range)
        self.time_range = ranges[(current_idx + 1) % len(ranges)]
        self.refresh()
```

### FundInput

基金代码输入组件，带自动补全和验证功能。

**功能特性**:
- 6 位数字输入过滤
- 自动查询基金名称（Tushare API）
- 加载状态显示
- 错误提示（基金代码不存在）

**使用场景**:
- `TransactionFormModal` 中的基金代码输入
- 其他需要输入基金代码的表单

### Select

账户筛选下拉框组件。

**功能特性**:
- 加载账户列表
- 默认选中第一个账户
- 筛选变更事件通知

**使用场景**:
- `TransactionsScreen` 中的账户筛选

## 与 screens/ 的关系

**依赖方向**: `screens/` → `widgets/`

- `widgets/` 组件**不依赖**具体 Screen 实现
- `screens/` 组合使用 widgets 构建界面
- 组件通过事件（events）与 Screen 通信

**示例**:
```python
# Screen 使用组件
class TransactionsScreen(Screen):
    def compose(self) -> ComposeResult:
        yield FundInput(id="fund-input")
        yield ChartWidget(id="chart", chart_type="account")
    
    def on_fund_input_fund_selected(self, event: FundSelected) -> None:
        # 处理基金选中事件
        pass
```

## 组件设计规范

### 命名约定

- 组件类名：`PascalCase` + `Widget` 后缀（如 `ChartWidget`）
- 组件 ID：`kebab-case`（如 `id="chart-canvas"`）

### 事件命名

- 事件类名：`PascalCase` + 动词（如 `FundSelected`, `TimeRangeChanged`）
- 事件处理方法：`on_<component>_<event>`（如 `on_chart_time_range_changed`）

### 测试模式

组件应支持独立测试：

```python
async def test_chart_widget_renders():
    async with TestApp(ChartWidget(data=mock_data)).run_test() as pilot:
        canvas = pilot.app.screen.query_one(Canvas)
        assert canvas is not None
```

## 实施优先级

| 组件 | 优先级 | 依赖 |
|------|--------|------|
| ChartWidget | P0 | Canvas API, 收益计算逻辑 |
| FundInput | P1 | FundService |
| Select | P0 | AccountService |

---

**维护说明**: 实现新组件时，更新本文档的"待实现组件"章节。
