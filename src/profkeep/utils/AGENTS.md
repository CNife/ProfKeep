# 工具函数模块规则

## 模块职责

`utils/` 目录存放纯函数工具，为服务层提供通用的数据处理、格式转换、计算逻辑等支持。

### 核心特征

- **纯函数**: 无状态、无副作用、可测试
- **无数据库依赖**: 不直接访问数据库，不涉及 Session 管理
- **被服务层调用**: 作为服务层的工具函数使用
- **可复用**: 跨服务通用的逻辑抽象

---

## 当前状态

**目录为空**，仅包含 `__init__.py` 文件。

后续将根据实际需求添加以下工具函数。

---

## 预留工具函数

### CSV 处理

负责 CSV 文件的导入导出逻辑，包括格式验证、数据转换、错误报告。

#### 职责范围

- **导出**: 将交易记录列表转换为 CSV 格式（固定表头）
- **导入**: 解析 CSV 文件，验证格式，返回结构化数据
- **验证**: 检查表头、列数、数据类型、交易类型枚举值
- **错误报告**: 返回错误行号和具体原因

#### CSV 格式规范

```csv
日期，基金代码，交易类型，份额，金额，手续费，净值，确认状态，备注
2024-01-15,000001,buy,1000.00,1500.00,0,1.500，已确认，定投
```

#### 预期函数签名

```python
def export_transactions_to_csv(transactions: list[Transaction], file_path: str) -> None
def import_transactions_from_csv(file_path: str) -> ImportResult
```

#### ImportResult 结构

```python
@dataclass
class ImportResult:
    success_count: int
    error_count: int
    errors: list[ImportError]  # 包含行号、列名、错误原因
```

---

### 格式化函数

负责数值、日期、百分比等数据的格式化展示。

#### 职责范围

- **数值格式化**: 份额（4 位小数）、金额（2 位小数）、净值（4 位小数）
- **百分比格式化**: 收益率（2 位小数，带正负号）
- **日期格式化**: `date` 对象与字符串互转（YYYY-MM-DD）
- **中文对齐**: 表格展示时的字符串填充对齐

#### 预期函数签名

```python
def format_shares(shares: Decimal) -> str           # "1,234.5678"
def format_amount(amount: Decimal) -> str           # "1,234.56"
def format_nav(nav: Decimal) -> str                 # "1.5000"
def format_return(rate: Decimal) -> str             # "+5.23%" / "-2.15%"
def parse_date(date_str: str) -> date               # "2024-01-15" → date(2024, 1, 15)
def format_date(date_obj: date) -> str              # date(2024, 1, 15) → "2024-01-15"
def align_chinese(text: str, width: int) -> str     # 中文填充对齐
```

---

### 计算函数

负责持仓收益、收益率等核心业务计算。

#### 职责范围

- **持仓成本计算**: 平均成本法
- **持仓收益计算**: 市值 - 成本
- **收益率计算**: 收益 / 成本 × 100%
- **T+1 日期计算**: 确认交易时判断 `date <= today - 1 day`

#### 计算公式

```python
# 平均成本法
总份额 = Σ(买入份额 + 红利再投资份额) - Σ(卖出份额)
总成本 = Σ(买入金额 + 买入手续费) - Σ(卖出金额 - 卖出手续费)
成本价 = 总成本 / 总份额  # 总份额 > 0 时

# 收益计算
持仓市值 = 总份额 × 最新净值
持仓收益 = 持仓市值 - 总成本
收益率 = 持仓收益 / 总成本 × 100%  # 总成本 > 0 时
```

#### 预期函数签名

```python
def calculate_average_cost(buys: list[Transaction], sells: list[Transaction]) -> tuple[Decimal, Decimal]
# 返回 (总份额，总成本)

def calculate_holding_return(shares: Decimal, cost: Decimal, current_nav: Decimal) -> tuple[Decimal, Decimal, Decimal]
# 返回 (市值，收益，收益率)

def is_t1_confirmed(transaction_date: date) -> bool
# 判断是否满足 T+1 确认条件
```

---

## 与 services/ 的关系

### 依赖方向

```
services/ → utils/
```

- **services/**: 负责业务逻辑、数据库操作、外部 API 调用
- **utils/**: 提供纯函数工具，被 services 调用

### 使用示例

```python
# services/transaction.py
from profkeep.utils import format_shares, parse_date, calculate_average_cost

class TransactionService:
    def create_transaction(self, ...):
        # 使用 utils 格式化日期
        date_obj = parse_date(date_str)
        
        # 使用 utils 计算持仓
        shares, cost = calculate_average_cost(buys, sells)
```

### 禁止事项

- **utils 不调用 services**: 避免循环依赖
- **utils 不访问数据库**: 保持纯函数特性
- **utils 不处理 UI 逻辑**: 不涉及 Textual 组件

---

## 测试要求

所有工具函数必须编写单元测试：

- **纯函数易测试**: 给定输入，验证输出
- **边界条件**: 零值、负值、空列表、极端值
- **格式化精度**: 小数位数、四舍五入规则
- **异常处理**: 无效输入抛出明确异常

---

## 添加新工具的流程

1. **确认必要性**: 是否跨服务复用？是否纯函数？
2. **编写测试**: 先写失败的测试（TDD）
3. **实现函数**: 最少代码让测试通过
4. **文档更新**: 在本文件添加函数签名和职责说明
5. **导出声明**: 在 `__init__.py` 中添加 `__all__`
