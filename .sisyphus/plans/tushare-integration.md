# Tushare API 集成工作计划

## TL;DR

> **快速摘要**: 创建 TushareService 服务类，封装基金净值、基金信息、指数日线三个 API 接口，实现数据获取、转换、存储功能，支持智能增量更新和容错处理。
>
> **交付物**:
>
> - `src/profkeep/services/tushare.py` - TushareService 服务类
> - `tests/integration/test_tushare_service.py` - 集成测试
>
> **预估工作量**: Medium
> **并行执行**: NO - 单文件顺序开发
> **关键路径**: 依赖验证 → 服务骨架 → 三个 API 方法 → 数据库集成 → 测试

---

## Context

### 原始需求

集成 Tushare API 到基金管理应用，实现基金净值、基金信息、指数数据的获取功能。API key 已配置在 `~/.tushare/token`，为付费版本。

### 访谈总结

**关键决策**:

1. **API 类型**: 付费版，无需限流处理
2. **测试策略**: 仅集成测试，不写单元测试
3. **刷新范围**: 刷新当前账户所有持仓基金
4. **历史范围**: 从基金首笔交易记录开始到现在的所有净值
5. **重复处理**: 覆盖更新已存在的净值记录
6. **错误处理**: 部分失败时继续处理其他基金，汇总失败列表

**研究发现**:

- 基金代码格式：场外基金使用 `000001.OF` 格式
- 指数代码：沪深300 是 `000300.SH`
- API 返回 DataFrame，需转换为数据库模型
- Tushare SDK 已在依赖中（pyproject.toml 已配置）

### Metis 审查

**已识别并解决的差距**:

- **历史数据范围**: 确定为从首笔交易开始，智能增量获取
- **幂等性行为**: 覆盖更新已存在的记录
- **批量错误处理**: 继续处理其他基金，汇总失败列表
- **数据验证**: 验证 DataFrame 非空，字段存在

**应用的保护措施**:

- 不修改数据库模式（使用现有模型）
- 不实现 UI 层（仅服务层）
- 不实现缓存层（由上层处理）
- 不创建抽象基类（单一服务类）
- 不添加详细日志（仅错误级别）

---

## Work Objectives

### 核心目标

创建 TushareService 服务类，提供基金净值、基金信息、指数日线数据的获取和存储功能，支持智能增量更新。

### 具体交付物

- `src/profkeep/services/tushare.py` - 完整的 TushareService 实现
- `tests/integration/test_tushare_service.py` - 集成测试文件

### 完成定义

- [ ] `TushareService` 类可成功初始化
- [ ] `get_fund_nav()` 方法可获取基金净值并存储到数据库
- [ ] `get_fund_info()` 方法可获取基金基本信息
- [ ] `get_index_daily()` 方法可获取指数日线数据
- [ ] 智能增量更新：从首笔交易开始获取净值
- [ ] 覆盖更新：已存在的记录被更新
- [ ] 错误容错：部分失败不影响其他基金
- [ ] 所有集成测试通过

### 必须有

- Token 自动加载功能
- DataFrame 到数据库模型的转换
- 网络错误重试机制（最多 3 次）
- 用户友好的错误提示
- 批量刷新时的失败汇总

### 必须没有（保护措施）

- 数据库模式修改
- UI 层实现
- 缓存层实现
- 抽象基类或接口
- 详细调试日志
- 免费版限流代码

---

## Verification Strategy

### 测试决策

- **基础设施存在**: NO - 需要创建测试目录和文件
- **自动化测试**: 集成测试
- **框架**: pytest
- **测试范围**: 实际调用 Tushare API，验证端到端流程

### QA 政策

每个任务包含代理执行的 QA 场景。证据保存到 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`。

- **服务层**: 使用 Python REPL — 导入服务，调用方法，验证返回值
- **数据库集成**: 使用 SQLModel Session — 查询数据库，验证数据存储
- **错误场景**: 模拟错误条件，验证异常处理

---

## Execution Strategy

### 并行执行波次

```text
Wave 1（前置验证 — 可立即开始）:
└── Task 1: 依赖验证与测试框架搭建 [quick]

Wave 2（核心实现 — 顺序执行）:
├── Task 2: TushareService 骨架 + Token 加载 [quick]
├── Task 3: get_fund_nav() 实现 [unspecified-high]
├── Task 4: get_fund_info() 实现 [quick]
└── Task 5: get_index_daily() 实现 [quick]

Wave 3（数据库集成）:
├── Task 6: 数据转换与存储逻辑 [unspecified-high]
└── Task 7: 批量刷新 + 错误汇总 [unspecified-high]

Wave FINAL（验证 — 4 个并行审查）:
├── Task F1: 计划合规审计 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: 实际手动 QA (unspecified-high)
└── Task F4: 范围忠实度检查 (deep)
→ 展示结果 → 获取用户明确确认

关键路径: Task 1 → Task 2 → Task 3-5 → Task 6-7 → F1-F4 → 用户确认
并行加速: Wave 1 和 Wave 2 的部分任务可并行
最大并发: 2（Wave FINAL）
```

### 依赖矩阵

- **1**: — — 2-7
- **2**: 1 — 3-5, 1
- **3**: 2 — 6, 1
- **4**: 2 — 6, 1
- **5**: 2 — 7, 1
- **6**: 3, 4 — 7, 2
- **7**: 5, 6 — F1-F4, 2

### 代理调度摘要

- **Wave 1**: **1** — T1 → `quick`
- **Wave 2**: **4** — T2 → `quick`, T3 → `unspecified-high`, T4 → `quick`, T5 → `quick`
- **Wave 3**: **2** — T6 → `unspecified-high`, T7 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> 实现 + 测试 = 一个任务。不可分离。
> 每个任务必须有：推荐代理配置 + 并行化信息 + QA 场景。
> **没有 QA 场景的任务是不完整的。无例外。**

- [ ] 1. 依赖验证与测试框架搭建

  **做什么**:
  - 验证 `~/.tushare/token` 文件存在且可读
  - 创建 `tests/integration/` 目录
  - 创建空的测试文件 `tests/integration/test_tushare_service.py`
  - 验证 `tushare` 包已安装

  **禁止做的事**:
  - 不要修改 pyproject.toml（tushare 已在依赖中）
  - 不要创建单元测试（仅集成测试）

  **推荐代理配置**:
  - **Category**: `quick`
    - 原因: 简单的验证和目录创建任务
  - **Skills**: `[]`
  - **评估后省略的 Skills**:
    - `git-master`: 不涉及 git 操作

  **并行化**:
  - **可并行运行**: NO
  - **并行组**: 无（前置验证）
  - **阻塞**: Task 2-7
  - **被阻塞**: 无（可立即开始）

  **引用**（关键 - 要详尽）:

  **模式引用**（现有代码参考）:
  - `tests/test_models.py` - 现有测试文件结构
  - `tests/__init__.py` - 测试目录初始化

  **API/类型引用**（要实现的契约）:
  - `~/.tushare/token` - Token 文件位置（系统约定）

  **为什么每个引用重要**:
  - `tests/test_models.py`: 了解现有测试的组织方式
  - `~/.tushare/token`: 必须验证此文件存在，否则后续任务会失败

  **接受标准**:

  **如果是 TDD（测试启用）**:
  - 不适用（无测试）

  **QA 场景（强制 - 没有这些任务不完整）**:

  ```text
  场景: Token 文件验证 — 成功路径
    工具: Bash
    前置条件: ~/.tushare/token 文件存在
    步骤:
      1. cat ~/.tushare/token | head -c 20
      2. 验证输出非空且不以 "your_token" 开头
    预期结果: 文件内容的前 20 个字符被显示，非空
    失败指标: 文件不存在或内容为空
    证据: .sisyphus/evidence/task-1-token-validation.txt

  场景: 测试目录创建
    工具: Bash
    前置条件: tests/integration/ 目录不存在
    步骤:
      1. ls -la tests/integration/
      2. ls -la tests/integration/test_tushare_service.py
    预期结果: 目录和文件都存在
    失败指标: 目录或文件不存在
    证据: .sisyphus/evidence/task-1-test-dir.txt
  ```

  **要捕获的证据**:
  - [ ] Token 文件存在证明（截图或文件内容）
  - [ ] 测试目录结构证明（ls 输出）

  **提交**: NO
  - 原因: 空目录创建，不单独提交

---

- [ ] 2. TushareService 骨架 + Token 加载

  **做什么**:
  - 创建 `src/profkeep/services/tushare.py`
  - 实现 `TushareService` 类的 `__init__()` 方法
  - 从 `~/.tushare/token` 加载 token
  - 初始化 `tushare.pro_api()` 实例
  - 处理 token 文件不存在的情况（抛出 FileNotFoundError）
  - 添加基本的 docstring

  **禁止做的事**:
  - 不要添加限流装饰器（付费版不需要）
  - 不要创建抽象基类
  - 不要实现详细的日志

  **推荐代理配置**:
  - **Category**: `quick`
    - 原因: 简单的服务初始化逻辑
  - **Skills**: `[]`
  - **评估后省略的 Skills**:
    - `git-master`: 提交在任务完成后处理

  **并行化**:
  - **可并行运行**: NO
  - **并行组**: 无（依赖 Task 1）
  - **阻塞**: Task 3-5
  - **被阻塞**: Task 1

  **引用**:

  **模式引用**:
  - 无（新服务类）

  **API/类型引用**:
  - `tushare.pro_api()` - Tushare SDK 的 API 客户端初始化方法
  - `pathlib.Path` - Python 标准库路径处理

  **外部引用**:
  - Tushare 官方文档: <https://tushare.pro/document/2>

  **为什么每个引用重要**:
  - `tushare.pro_api()`: 这是初始化 Tushare 客户端的正确方式
  - `Path`: 用于读取 token 文件的标准方式

  **接受标准**:

  **QA 场景**:

  ```text
  场景: 服务初始化成功
    工具: Bash (Python REPL)
    前置条件: ~/.tushare/token 存在且有效
    步骤:
      1. uv run python -c "from profkeep.services.tushare import TushareService; s = TushareService(); print('OK')"
    预期结果: 输出 "OK"
    失败指标: 抛出异常或输出错误信息
    证据: .sisyphus/evidence/task-2-init-success.txt

  场景: Token 文件缺失报错
    工具: Bash (Python REPL)
    前置条件: 临时移动 ~/.tushare/token 到其他位置
    步骤:
      1. mv ~/.tushare/token ~/.tushare/token.bak
      2. uv run python -c "from profkeep.services.tushare import TushareService; s = TushareService()" 2>&1
      3. mv ~/.tushare/token.bak ~/.tushare/token
    预期结果: 抛出 FileNotFoundError，错误信息包含 "Tushare token not found"
    失败指标: 其他异常或成功初始化
    证据: .sisyphus/evidence/task-2-token-missing.txt
  ```

  **要捕获的证据**:
  - [ ] 服务初始化成功输出
  - [ ] Token 缺失时的错误信息

  **提交**: YES（与 Task 1 合并）
  - Message: `feat(services): add TushareService with token loading`
  - Files: `src/profkeep/services/tushare.py`, `tests/integration/test_tushare_service.py`
  - Pre-commit: 无

---

- [ ] 3. get_fund_nav() 实现

  **做什么**:
  - 实现 `get_fund_nav(fund_code: str, start_date: str | None = None)` 方法
  - 调用 `pro.fund_nav(ts_code=f"{fund_code}.OF", start_date=start_date)`
  - 处理返回的 DataFrame（可能为空）
  - 将 DataFrame 转换为 `FundNavHistory` 模型列表
  - 处理日期格式转换（`YYYYMMDD` → `date` 对象）
  - 处理 Decimal 类型转换
  - 实现重试机制（网络错误最多重试 3 次）
  - 添加 docstring 说明参数和返回值

  **禁止做的事**:
  - 不要在此任务中实现数据库存储逻辑（Task 6）
  - 不要添加限流逻辑
  - 不要修改 FundNavHistory 模型

  **推荐代理配置**:
  - **Category**: `unspecified-high`
    - 原因: 核心业务逻辑，需要仔细处理数据转换
  - **Skills**: `[]`
  - **评估后省略的 Skills**:
    - `tushare`: 这是实现任务，不是使用技能

  **并行化**:
  - **可并行运行**: NO
  - **并行组**: 无（依赖 Task 2）
  - **阻塞**: Task 6
  - **被阻塞**: Task 2

  **引用**:

  **API/类型引用**:
  - `src/profkeep/models/nav_history.py:FundNavHistory` - 目标数据模型
  - `tushare.fund_nav()` API 文档: <https://tushare.pro/document/2?doc_id=119>

  **为什么每个引用重要**:
  - `FundNavHistory`: 必须将 DataFrame 转换为此模型
  - `fund_nav()` 文档: 了解返回字段的含义和格式

  **接受标准**:

  **QA 场景**:

  ```text
  场景: 获取基金净值成功
    工具: Bash (Python REPL)
    前置条件: TushareService 已初始化，基金代码有效（如 000001）
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         s = TushareService()
         result = s.get_fund_nav('000001', start_date='20260101')
         print(f'获取到 {len(result)} 条净值记录')
         if result:
             print(f'第一条: 日期={result[0].date}, 净值={result[0].nav}')
         "
    预期结果: 输出净值记录数量 ≥ 0，如有记录则显示第一条
    失败指标: 抛出异常或返回 None
    证据: .sisyphus/evidence/task-3-nav-success.txt

  场景: 无效基金代码报错
    工具: Bash (Python REPL)
    前置条件: TushareService 已初始化
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         s = TushareService()
         try:
             result = s.get_fund_nav('999999')  # 不存在的基金代码
             print(f'结果: {result}')
         except ValueError as e:
             print(f'正确抛出错误: {e}')
         " 2>&1
    预期结果: 返回空列表或抛出 ValueError
    失败指标: 返回非空列表但包含无效数据
    证据: .sisyphus/evidence/task-3-invalid-code.txt
  ```

  **要捕获的证据**:
  - [ ] 成功获取净值的输出
  - [ ] 无效代码的错误处理

  **提交**: YES
  - Message: `feat(services): add get_fund_nav() method`
  - Files: `src/profkeep/services/tushare.py`
  - Pre-commit: 无

---

- [ ] 4. get_fund_info() 实现

  **做什么**:
  - 实现 `get_fund_info(fund_code: str) -> dict` 方法
  - 调用 `pro.fund_basic(ts_code=f"{fund_code}.OF")`
  - 将 DataFrame 转换为字典（包含 name, fund_type, management 等）
  - 处理基金不存在的情况（返回空字典或抛出 ValueError）
  - 添加 docstring

  **禁止做的事**:
  - 不要在此任务中实现 Fund 模型的存储（Task 6）
  - 不要添加额外字段（仅使用返回的字段）

  **推荐代理配置**:
  - **Category**: `quick`
    - 原因: 简单的 API 调用和数据提取
  - **Skills**: `[]`

  **并行化**:
  - **可并行运行**: YES
  - **并行组**: Wave 2（与 Task 3, 5 并行）
  - **阻塞**: Task 6
  - **被阻塞**: Task 2

  **引用**:

  **API/类型引用**:
  - `src/profkeep/models/fund.py:Fund` - 目标数据模型
  - `tushare.fund_basic()` API 文档: <https://tushare.pro/document/2?doc_id=19>

  **为什么每个引用重要**:
  - `Fund`: 了解需要哪些字段（name, type）
  - `fund_basic()` 文档: 了解返回字段

  **接受标准**:

  **QA 场景**:

  ```text
  场景: 获取基金信息成功
    工具: Bash (Python REPL)
    前置条件: TushareService 已初始化，基金代码有效
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         s = TushareService()
         info = s.get_fund_info('000001')
         print(f'基金名称: {info.get(\"name\", \"N/A\")}')
         print(f'基金类型: {info.get(\"fund_type\", \"N/A\")}')
         "
    预期结果: 输出基金名称和类型
    失败指标: 抛出异常或返回空字典
    证据: .sisyphus/evidence/task-4-info-success.txt

  场景: 无效基金代码
    工具: Bash (Python REPL)
    前置条件: TushareService 已初始化
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         s = TushareService()
         info = s.get_fund_info('999999')
         print(f'结果: {info}')
         "
    预期结果: 返回空字典或抛出 ValueError
    失败指标: 返回包含无效数据的字典
    证据: .sisyphus/evidence/task-4-invalid-code.txt
  ```

  **要捕获的证据**:
  - [ ] 成功获取基金信息的输出
  - [ ] 无效代码的处理结果

  **提交**: NO（与 Task 3 合并）
  - 原因: 同属核心 API 方法

---

- [ ] 5. get_index_daily() 实现

  **做什么**:
  - 实现 `get_index_daily(index_code: str, start_date: str, end_date: str) -> list[IndexNavHistory]`
  - 调用 `pro.index_daily(ts_code=index_code, start_date=start_date, end_date=end_date)`
  - 将 DataFrame 转换为 `IndexNavHistory` 模型列表
  - 处理日期和 Decimal 转换
  - 添加 docstring

  **禁止做什么**:
  - 不要在此任务中实现数据库存储（Task 6）
  - 不要添加额外的指数数据字段

  **推荐代理配置**:
  - **Category**: `quick`
    - 原因: 与 Task 4 类似的简单 API 调用
  - **Skills**: `[]`

  **并行化**:
  - **可并行运行**: YES
  - **并行组**: Wave 2（与 Task 3, 4 并行）
  - **阻塞**: Task 7
  - **被阻塞**: Task 2

  **引用**:

  **API/类型引用**:
  - `src/profkeep/models/nav_history.py:IndexNavHistory` - 目标数据模型
  - `tushare.index_daily()` API 文档: <https://tushare.pro/document/2?doc_id=95>
  - 沪深300 指数代码: `000300.SH`

  **为什么每个引用重要**:
  - `IndexNavHistory`: 目标数据模型
  - `index_daily()` 文档: 了解返回字段
  - 沪深300 代码: 测试时使用

  **接受标准**:

  **QA 场景**:

  ```text
  场景: 获取沪深300日线数据成功
    工具: Bash (Python REPL)
    前置条件: TushareService 已初始化
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         from datetime import date, timedelta
         s = TushareService()
         end = date.today().strftime('%Y%m%d')
         start = (date.today() - timedelta(days=30)).strftime('%Y%m%d')
         result = s.get_index_daily('000300.SH', start, end)
         print(f'获取到 {len(result)} 条指数数据')
         if result:
             print(f'最新: 日期={result[0].date}, 收盘={result[0].close}')
         "
    预期结果: 输出指数数据数量 ≥ 0
    失败指标: 抛出异常
    证据: .sisyphus/evidence/task-5-index-success.txt
  ```

  **要捕获的证据**:
  - [ ] 成功获取指数数据的输出

  **提交**: NO（与 Task 3, 4 合并）
  - 原因: 同属核心 API 方法

---

- [ ] 6. 数据转换与存储逻辑

  **做什么**:
  - 实现 `_save_nav_to_db(nav_list: list[FundNavHistory], session: Session)` 私有方法
  - 实现智能增量获取：查询数据库中该基金的首笔交易日期，作为 `start_date`
  - 实现覆盖更新：如果净值记录已存在，更新而非插入
  - 实现 `_save_fund_to_db(fund_info: dict, session: Session)` 方法
  - 实现 `_save_index_to_db(index_list: list[IndexNavHistory], session: Session)` 方法
  - 处理数据库约束冲突（UniqueConstraint）
  - 添加 docstring

  **禁止做的事**:
  - 不要修改数据库模型
  - 不要实现自动 Fund 创建（如果没有 Fund 记录，应该抛出错误）

  **推荐代理配置**:
  - **Category**: `unspecified-high`
    - 原因: 数据库集成逻辑较复杂，需要处理约束和更新
  - **Skills**: `[]`
  - **评估后省略的 Skills**:
    - `tushare`: 这是数据库逻辑，不涉及 Tushare API

  **并行化**:
  - **可并行运行**: NO
  - **并行组**: 无（依赖 Task 3-5）
  - **阻塞**: Task 7
  - **被阻塞**: Task 3, 4

  **引用**:

  **模式引用**:
  - `src/profkeep/models/database.py:get_session()` - Session 获取方式
  - `src/profkeep/models/nav_history.py:FundNavHistory` - 净值历史模型

  **API/类型引用**:
  - `sqlmodel.Session` - SQLModel 的 Session 类
  - `sqlalchemy.dialects.sqlite.insert()` - SQLite 的 INSERT ON CONFLICT 语法

  **为什么每个引用重要**:
  - `get_session()`: 了解如何获取数据库 session
  - `FundNavHistory`: 目标数据模型
  - `Session`: 数据库操作的核心接口

  **接受标准**:

  **QA 场景**:

  ```text
  场景: 净值存储到数据库成功
    工具: Bash (Python REPL)
    前置条件: TushareService 已初始化，数据库中有 Fund 记录
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         from profkeep.models import get_session, Fund

         s = TushareService()

         # 确保基金存在
         with next(get_session()) as session:
             fund = session.query(Fund).filter(Fund.code == '000001').first()
             if not fund:
                 fund = Fund(code='000001', name='测试基金')
                 session.add(fund)
                 session.commit()

         # 获取并存储净值
         nav_list = s.get_fund_nav('000001')
         with next(get_session()) as session:
             count = s._save_nav_to_db(nav_list, session)
             print(f'存储了 {count} 条净值记录')
         "
    预期结果: 输出存储的记录数量 > 0
    失败指标: 抛出异常或存储数量为 0
    证据: .sisyphus/evidence/task-6-nav-save.txt

  场景: 覆盖更新已存在的记录
    工具: Bash (Python REPL)
    前置条件: 数据库中已存在某日的净值记录
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService
         from profkeep.models import get_session, FundNavHistory
         from datetime import date

         s = TushareService()

         # 查询某个日期的记录数
         with next(get_session()) as session:
             count_before = session.query(FundNavHistory).filter(
                 FundNavHistory.fund_id == 1,
                 FundNavHistory.date == date(2026, 3, 25)
             ).count()

         # 再次获取并存储（应该覆盖）
         nav_list = s.get_fund_nav('000001')
         with next(get_session()) as session:
             s._save_nav_to_db(nav_list, session)

         # 查询记录数（应该相同，不是翻倍）
         with next(get_session()) as session:
             count_after = session.query(FundNavHistory).filter(
                 FundNavHistory.fund_id == 1,
                 FundNavHistory.date == date(2026, 3, 25)
             ).count()

         print(f'更新前: {count_before} 条，更新后: {count_after} 条')
         assert count_after == count_before, '记录数不应该增加'
         "
    预期结果: 更新前后记录数相同
    失败指标: 记录数增加（重复插入）
    证据: .sisyphus/evidence/task-6-overwrite.txt
  ```

  **要捕获的证据**:
  - [ ] 成功存储净值的输出
  - [ ] 覆盖更新验证

  **提交**: YES
  - Message: `feat(services): add database integration for Tushare data`
  - Files: `src/profkeep/services/tushare.py`
  - Pre-commit: 无

---

- [ ] 7. 批量刷新 + 错误汇总

  **做什么**:
  - 实现 `refresh_account_navs(account_id: int) -> RefreshResult` 方法
  - 查询账户下所有持仓基金（通过 Transaction 表）
  - 批量调用 `get_fund_nav()` 并存储
  - 实现错误容错：某基金失败不影响其他基金
  - 返回 `RefreshResult` 对象，包含成功列表和失败列表（含错误原因）
  - 添加 docstring 和使用示例

  **禁止做的事**:
  - 不要实现 UI 层的进度显示
  - 不要添加并行刷新（顺序处理即可）

  **推荐代理配置**:
  - **Category**: `unspecified-high`
    - 原因: 批量操作逻辑，需要处理部分失败
  - **Skills**: `[]`

  **并行化**:
  - **可并行运行**: NO
  - **并行组**: 无（依赖 Task 5, 6）
  - **阻塞**: F1-F4
  - **被阻塞**: Task 5, 6

  **引用**:

  **API/类型引用**:
  - `src/profkeep/models/transaction.py:Transaction` - 查询持仓基金
  - `src/profkeep/models/holding.py:Holding` - 持仓表

  **为什么每个引用重要**:
  - `Transaction`: 需要通过交易记录找到账户下的所有基金
  - `Holding`: 持仓表，可能包含当前持仓信息

  **接受标准**:

  **QA 场景**:

  ```text
  场景: 批量刷新成功
    工具: Bash (Python REPL)
    前置条件: 数据库中有账户和交易记录
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService

         s = TushareService()
         result = s.refresh_account_navs(account_id=1)

         print(f'成功: {len(result.success)} 只基金')
         print(f'失败: {len(result.failed)} 只基金')
         if result.failed:
             for fund_code, error in result.failed:
                 print(f'  {fund_code}: {error}')
         "
    预期结果: 输出成功和失败数量
    失败指标: 抛出未捕获的异常
    证据: .sisyphus/evidence/task-7-batch-success.txt

  场景: 部分失败时的容错
    工具: Bash (Python REPL)
    前置条件: 账户下有多个基金，包含一个无效代码
    步骤:
      1. uv run python -c "
         from profkeep.services.tushare import TushareService

         s = TushareService()
         result = s.refresh_account_navs(account_id=1)

         # 验证失败的基金不会阻止其他基金刷新
         assert len(result.success) > 0, '至少应该有成功的基金'
         print(f'容错测试通过: {len(result.success)} 成功, {len(result.failed)} 失败')
         "
    预期结果: 有成功的基金，失败的基金被记录
    失败指标: 所有基金都失败或整个方法抛出异常
    证据: .sisyphus/evidence/task-7-partial-failure.txt
  ```

  **要捕获的证据**:
  - [ ] 批量刷新结果输出
  - [ ] 部分失败的容错验证

  **提交**: YES
  - Message: `feat(services): add batch refresh with error tolerance`
  - Files: `src/profkeep/services/tushare.py`
  - Pre-commit: `uv run pytest tests/integration/test_tushare_service.py -v`

---

## Final Verification Wave

> 4 个审查代理并行运行。全部必须批准。展示整合结果给用户，获取明确"确认"后再完成工作。
>
> **不要在验证后自动继续。等待用户明确批准后再标记工作完成。**
> **在获取用户确认前，绝不要勾选 F1-F4。** 拒绝或用户反馈 → 修复 → 重新运行 → 再次展示 → 等待确认。

- [ ] F1. **计划合规审计** — `oracle`
  通读计划全文。对每个"必须有"：验证实现存在（读取文件、curl 端点、运行命令）。对每个"必须没有"：搜索代码库中的禁止模式 — 如果发现则拒绝并给出 file:line。检查 `.sisyphus/evidence/` 中的证据文件是否存在。比较交付物与计划。
  输出: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | 结论: APPROVE/REJECT`

- [ ] F2. **代码质量审查** — `unspecified-high`
  运行 `tsc --noEmit` + linter + `bun test`。审查所有变更文件：`as any`/`@ts-ignore`、空 catch、console.log、注释代码、未使用导入。检查 AI slop：过度注释、过度抽象、通用名称（data/result/item/temp）。
  输出: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | 结论`

- [ ] F3. **实际手动 QA** — `unspecified-high`（+ `playwright` skill 如果有 UI）
  从干净状态开始。执行每个任务的每个 QA 场景 — 遵循确切步骤，捕获证据。测试跨任务集成（功能协同工作，非隔离）。测试边缘情况：空状态、无效输入、快速操作。保存到 `.sisyphus/evidence/final-qa/`。
  输出: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | 结论`

- [ ] F4. **范围忠实度检查** — `deep`
  对每个任务：读取"做什么"、读取实际 diff（git log/diff）。验证 1:1 — 规格中的所有内容都已构建（无遗漏）、未构建规格之外的内容（无 creep）。检查"禁止做什么"合规性。检测跨任务污染：任务 N 触及任务 M 的文件。标记未说明的变更。
  输出: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | 结论`

---

## Commit Strategy

- **Task 1-2**: `feat(services): add TushareService with token loading` — src/profkeep/services/tushare.py, tests/integration/test_tushare_service.py
- **Task 3-5**: `feat(services): implement fund NAV, info and index data APIs` — src/profkeep/services/tushare.py
- **Task 6-7**: `feat(services): add database integration and batch refresh` — src/profkeep/services/tushare.py

---

## Success Criteria

### 验证命令

```bash
# 验证服务初始化
uv run python -c "from profkeep.services.tushare import TushareService; s = TushareService(); print('OK')"

# 验证基金净值获取
uv run python -c "from profkeep.services.tushare import TushareService; s = TushareService(); print(s.get_fund_nav('000001'))"

# 验证基金信息获取
uv run python -c "from profkeep.services.tushare import TushareService; s = TushareService(); print(s.get_fund_info('000001'))"

# 验证指数数据获取
uv run python -c "from profkeep.services.tushare import TushareService; s = TushareService(); print(s.get_index_daily('000300.SH', '20260101', '20260326'))"

# 运行集成测试
uv run pytest tests/integration/test_tushare_service.py -v
```

### 最终检查清单

- [ ] 所有"必须有"存在
- [ ] 所有"必须没有"不存在
- [ ] 所有测试通过
- [ ] Token 自动加载工作正常
- [ ] 三个 API 方法都可成功调用
- [ ] 错误处理正确
- [ ] 无数据库模式修改
- [ ] 无 UI 层实现
- [ ] 无缓存层实现
- [ ] 无抽象基类
