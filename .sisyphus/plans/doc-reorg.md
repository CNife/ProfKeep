# 文档整理与 AGENTS.md 重构

## TL;DR

> **Quick Summary**: 修正人类文档中的过时信息（旧命名、不存在文件、限流描述），重构 AI Agent 文档消除冗余、补齐缺失的模块规则文件。
>
> **Deliverables**: 
> - 修正 `docs/PRD.md` 19 处过时信息（原 `prd.md`，已重命名）
> - 修正 `docs/IMPLEMENTATION.md` 4 处过时信息
> - 精简 `docs/AGENTS.md`（删除错位测试规范、重复段落）
> - 精简 `src/profkeep/screens/AGENTS.md`（删除服务层方法签名）
> - 增强根 `AGENTS.md`（测试规范 + widgets/utils 模块 + styles.tcss）
> - 新建 `src/profkeep/widgets/AGENTS.md`
> - 新建 `src/profkeep/utils/AGENTS.md`
>
> **Estimated Effort**: Short
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1-4 (独立并行) → Task 5-7 (独立并行)

---

## Context

### Original Request
用户要求根据项目规范整理 docs/ 下的文档和所有 AGENTS.md 文件，先汇总要改的地方确认后执行。

### Interview Summary
**Key Discussions**:
- 人类文档（docs/ + README.md）面向人类阅读，需要自包含，重复不是问题
- AI 文档（AGENTS.md + .sisyphus/）仅面向 Agent，需要精准无冗余
- 5 个 explore 代理已验证所有问题点

**Research Findings**:
- `docs/PRD.md`: 19 处过时信息（旧命名 4 处、状态 1 处、限流 3 处、不存在文件 11 处）
- `docs/IMPLEMENTATION.md`: 4 处过时（限流代码、项目结构、pyproject.toml、测试范围）
- 快捷键表在 5 处重复 → 人类文档保留各自副本，不需消除
- 交易类型/成本公式在多处重复 → 同上，人类文档保留
- `docs/AGENTS.md` 测试规范章节错位 + 内部重复
- `screens/AGENTS.md` 混入服务层方法签名
- `widgets/` 和 `utils/` 目录缺失 AGENTS.md

### Metis Review
无（本次为确定性文档整理，无架构风险）

---

## Work Objectives

### Core Objective
修正人类文档中的事实错误，重构 AI Agent 文档使其精准分工、消除冗余。

### Concrete Deliverables
- `docs/PRD.md` — 修正所有过时引用
- `docs/IMPLEMENTATION.md` — 删除过时内容
- `docs/AGENTS.md` — 结构整理
- `src/profkeep/screens/AGENTS.md` — 精简服务层内容
- 根 `AGENTS.md` — 补充测试规范 + 模块链接
- `src/profkeep/widgets/AGENTS.md` — 新建
- `src/profkeep/utils/AGENTS.md` — 新建

### Definition of Done
- [ ] 所有人类文档中无过时引用（旧命名、不存在文件、限流描述）
- [ ] 每个 AGENTS.md 只包含自己目录职责范围内的内容
- [ ] widgets/ 和 utils/ 有 AGENTS.md
- [ ] 根 AGENTS.md 包含完整的模块索引

### Must Have
- 修正所有 `fund-keeper`/`fund_keeper`/`.fundkeeper` → `profkeep`
- 修正所有不存在的文件引用
- 删除限流相关描述（项目使用付费版）
- 每个 AGENTS.md 职责边界清晰

### Must NOT Have (Guardrails)
- 不修改人类文档的快捷键表、交易类型表、成本公式（人类需要自包含）
- 不修改 README.md（已是最新）
- 不修改 WORKFLOW.md（无过时信息）
- 不创建空文件（widgets/utils AGENTS.md 需有实质内容）

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO（纯文档修改）
- **Automated tests**: None
- **Framework**: none
- **Agent-Executed QA**: ALWAYS（验证修改后的文件内容）

### QA Policy
- **文档验证**: 使用 Read 工具读取修改后的文件，grep 确认过时引用已删除、新内容已添加

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (人类文档修正 — 全部独立，可并行):
├── Task 1: 修正 docs/PRD.md [deep]
├── Task 2: 修正 docs/IMPLEMENTATION.md [deep]

Wave 2 (AI 文档重构 — 全部独立，可并行):
├── Task 3: 精简 docs/AGENTS.md [quick]
├── Task 4: 精简 screens/AGENTS.md [quick]
├── Task 5: 增强根 AGENTS.md [quick]
├── Task 6: 新建 widgets/AGENTS.md [quick]
├── Task 7: 新建 utils/AGENTS.md [quick]
```

### Dependency Matrix

- **1-2**: — — 无依赖
- **3-7**: — — 无依赖

### Agent Dispatch Summary

- **Wave 1**: **2** — T1 → `deep`, T2 → `deep`
- **Wave 2**: **5** — T3-T7 → `quick`

---

## TODOs

- [x] 0. 重命名 `docs/prd.md` → `docs/PRD.md`，更新所有引用

  **What to do**:
  - `git mv docs/prd.md docs/PRD.md`
  - 更新 `AGENTS.md` 第34行：`docs/prd.md` → `docs/PRD.md`
  - 更新 `docs/AGENTS.md` 第12行和第27行：`prd.md` → `PRD.md`

  **Acceptance Criteria**:
  - [ ] `docs/PRD.md` 存在，`docs/prd.md` 不存在
  - [ ] `grep -r "prd\.md" AGENTS.md docs/AGENTS.md` 无结果

  **Commit**: YES
  - Message: `Rename prd.md to PRD.md`

---

- [x] 1. 修正 `docs/PRD.md` 过时信息

  **What to do**:
  - **状态行**（第3行）: "待开始" → "开发中"
  - **旧命名修正**:
    - 第91行: `~/.fundkeeper/data.db` → `~/.profkeep/data.db`
    - 第92行: `uv tool install fund-keeper` → `uv tool install profkeep`
    - 第203行: `fund-keeper/` → `ProfKeep/`
    - 第204行: `src/fund_keeper/` → `src/profkeep/`
  - **删除限流相关**:
    - 第56行: 删除 User Story 20（Tushare API 限流等待提示）
    - 第114行: 删除决策 11（免费版限流器描述）
    - 第255行: 删除风险表中 "Tushare API 限流" 行
  - **更新项目结构**（第202-238行）:
    - 目录名: `fund-keeper/` → `ProfKeep/`，`src/fund_keeper/` → `src/profkeep/`
    - 删除不存在的文件: `screens/charts.py`, `widgets/chart.py`, `widgets/fund_input.py`
    - 修正服务层文件名: `account_service.py` → `account.py`, `holding_service.py` → `holding.py`, `transaction_service.py` → `transaction.py`, 删除 `nav_service.py`
    - 删除 utils 下不存在的文件: `calculators.py`, `formatters.py`, `csv_handler.py`
  - **修正实施计划引用**（第242行）: 删除 `.sisyphus/plans/tui-implementation-plan.md` 引用

  **Must NOT do**:
  - 不删除快捷键描述、交易类型说明、成本计算公式（人类文档需要自包含）
  - 不修改 Out of Scope 章节
  - 不修改 User Stories 1-19, 21-35（除第20条限流外）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需要精确理解每处修改的上下文，避免误删
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1（与 Task 2 并行）
  - **Blocks**: 无
  - **Blocked By**: Task 0（文件重命名）

  **References**:
  - `docs/PRD.md` — 目标文件
  - `docs/IMPLEMENTATION.md` — 参考实际项目结构
  - `pyproject.toml` — 参考正确的依赖和构建配置

  **Acceptance Criteria**:
  - [ ] `grep -i "fund-keeper\|fund_keeper\|\.fundkeeper" docs/PRD.md` 无结果
  - [ ] `grep -i "限流" docs/PRD.md` 无结果
  - [ ] 项目结构部分列出的所有文件实际存在

  **Commit**: YES (与 Task 0 合并)
  - Message: `Fix outdated information in PRD.md`

---

- [x] 2. 修正 `docs/IMPLEMENTATION.md` 过时信息

  **What to do**:
  - **删除 §6.4 限流处理代码**（第288-306行）: 整个 `rate_limit` 装饰器代码块
  - **更新 §10 项目结构**（第428-476行）:
    - `screens/`: 删除 `charts.py`（不存在）
    - `widgets/`: 删除 `chart.py`, `fund_input.py`（不存在）
    - `services/`: `account_service.py` → `account.py`, `holding_service.py` → `holding.py`, `transaction_service.py` → `transaction.py`, 删除 `nav_service.py`
    - `utils/`: 删除 `calculators.py`, `formatters.py`, `csv_handler.py`（不存在）
  - **更新 §10.1 pyproject.toml**（第480-505行）:
    - `requires-python`: `>=3.11` → `>=3.14`
    - 添加 `sqlmodel>=0.0.37` 依赖
    - `build-system`: `hatchling` → `uv_build>=0.11.0,<0.12.0`
    - 更新 ruff 配置（添加 target-version, lint 规则等）
  - **修正 §13.2 测试范围**（第576行）: 删除"不测试 UI 层（screens/）"声明

  **Must NOT do**:
  - 不删除快捷键表（§7.2）、交易类型表（§3.2）、成本公式（§3.1）——人类文档需要自包含
  - 不修改数据库设计章节（§5）
  - 不修改 Tushare API 集成章节（§6.1-6.3）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 多处精确修改，需要理解上下文
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1（与 Task 1 并行）
  - **Blocks**: 无
  - **Blocked By**: 无

  **References**:
  - `docs/IMPLEMENTATION.md` — 目标文件
  - `pyproject.toml` — 参考实际配置
  - `src/profkeep/` — 参考实际目录结构

  **Acceptance Criteria**:
  - [ ] `grep -A5 "rate_limit" docs/IMPLEMENTATION.md` 无结果
  - [ ] 项目结构部分列出的所有文件实际存在
  - [ ] pyproject.toml 代码块与实际配置一致
  - [ ] 测试范围章节不再声明"不测试 UI 层"

  **Commit**: YES
  - Message: `Fix outdated information in IMPLEMENTATION.md`

---

- [x] 3. 精简 `docs/AGENTS.md`

  **What to do**:
  - **删除"核心文档"章节**（第25-30行）: 与"文档结构"章节重复
  - **删除"测试规范"章节**（第42行至文件末尾）: TDD 工作流程、pytest 配置、测试数据库隔离不属于文档管理职责
  - 更新文档结构树中 `prd.md` → `PRD.md`

  **Must NOT do**:
  - 不修改"文档结构"、"渐进式披露结构"、"文档维护要点"章节
  - 不修改文件路径引用

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 删除两个章节，更新一个引用
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 Task 4-7 并行）
  - **Blocks**: 无
  - **Blocked By**: Task 0（PRD.md 重命名）

  **References**:
  - `docs/AGENTS.md` — 目标文件
  - 根 `AGENTS.md` — 测试规范将移至此处

  **Acceptance Criteria**:
  - [ ] 文件不再包含"核心文档"章节
  - [ ] 文件不再包含"测试规范"章节
  - [ ] 文档结构树中引用 `PRD.md`

  **Commit**: YES
  - Message: `Clean up docs/AGENTS.md structure`

---

- [x] 4. 精简 `src/profkeep/screens/AGENTS.md`

  **What to do**:
  - **删除"加载交易流程"代码块**（第252-263行）: 描述调用 TransactionService 方法的流程，属于服务层逻辑，不属于 UI 规则
  - 保留所有 UI 相关内容: BINDINGS 快捷键示例、Modal 模式、DataTable 事件、异步操作、测试模式、输入验证、账户筛选、DataTable 列定义、空状态处理

  **Must NOT do**:
  - 不删除快捷键表（第3-21行）
  - 不删除 TransactionsScreen BINDINGS 示例（第198-208行）— 这是 UI 快捷键绑定
  - 不删除账户筛选说明（第210-215行）— 这是 UI 如何调用服务
  - 不删除 DataTable 列定义（第217-234行）— 这是 UI 展示
  - 不删除空状态处理（第236-250行）— 这是 UI 逻辑
  - 不删除 Modal 组件模式（第119-157行）
  - 不删除测试模式（第161-192行）
  - 不删除 TransactionFormModal 实现模式（第266-318行）

  **Must NOT do**:
  - 不删除快捷键表（第3-21行）
  - 不删除 Modal 组件模式（第119-157行）
  - 不删除测试模式（第161-192行）
  - 不删除 TransactionFormModal 实现模式（第266-318行）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 删除两个服务层代码段
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 Task 3, 5-7 并行）
  - **Blocks**: 无
  - **Blocked By**: 无

  **References**:
  - `src/profkeep/screens/AGENTS.md` — 目标文件
  - `src/profkeep/services/AGENTS.md` — 确认服务层内容已有定义

  **Acceptance Criteria**:
  - [ ] 文件不再包含"加载交易流程"代码块（调用 TransactionService 的流程描述）
  - [ ] 文件保留所有 UI 实现模式内容（BINDINGS 示例、Modal 模式、DataTable 事件等）

  **Commit**: YES
  - Message: `Remove service-layer content from screens/AGENTS.md`

---

- [x] 5. 增强根 `AGENTS.md`

  **What to do**:
  - **模块规则表** 新增两行:
    - `| UI 组件 | src/profkeep/widgets/AGENTS.md |`
    - `| 工具函数 | src/profkeep/utils/AGENTS.md |`
  - **文档与进度表** 更新: `docs/prd.md` → `docs/PRD.md`
  - **新增测试规范章节**（从 docs/AGENTS.md 移入）:
    - TDD 工作流程（RED → GREEN → REFACTOR）
    - pytest 配置（pytest >= 8.0.0, asyncio_mode = "auto"）
    - 测试数据库隔离（setup_db fixture, autouse=True）
  - **新增样式文件说明**: `styles.tcss` 文件位置和用途

  **Must NOT do**:
  - 不修改项目概述、代码规范、数据库、核心约束章节
  - 不修改现有模块规则表中的行

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 追加章节，不涉及删除或重构
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 Task 3-4, 6-7 并行）
  - **Blocks**: 无
  - **Blocked By**: Task 0（PRD.md 重命名）

  **References**:
  - `AGENTS.md` — 目标文件
  - `docs/AGENTS.md` — 参考要移入的测试规范内容
  - `src/profkeep/styles.tcss` — 样式文件

  **Acceptance Criteria**:
  - [ ] 模块规则表包含 widgets 和 utils 行
  - [ ] 文档表中引用 `docs/PRD.md`
  - [ ] 包含测试规范章节
  - [ ] 包含 styles.tcss 说明

  **Commit**: YES
  - Message: `Enhance root AGENTS.md with test specs and module links`

---

- [x] 6. 新建 `src/profkeep/widgets/AGENTS.md`

  **What to do**:
  - 创建文件，说明 widgets 目录职责
  - 记录当前目录为空（仅 `__init__.py`）
  - 预留 ChartWidget、FundInput 等组件的实现规范位置
  - 说明与 screens/ 的关系（widgets 是 screens 使用的可复用 UI 组件）

  **Must NOT do**:
  - 不创建空文件（需有实质内容）
  - 不复制 screens/AGENTS.md 的内容

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 新建小型规则文件
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 Task 3-5, 7 并行）
  - **Blocks**: 无
  - **Blocked By**: 无

  **References**:
  - `src/profkeep/widgets/` — 目标目录（当前仅 `__init__.py`）
  - `src/profkeep/screens/AGENTS.md` — 参考 widgets 的使用方式
  - `docs/IMPLEMENTATION.md` §4.2 — 参考图表技术方案

  **Acceptance Criteria**:
  - [ ] 文件存在且包含 widgets 目录职责说明
  - [ ] 说明当前目录为空，待实现组件列表
  - [ ] 说明与 screens 的依赖关系

  **Commit**: YES
  - Message: `Add widgets/AGENTS.md`

---

- [x] 7. 新建 `src/profkeep/utils/AGENTS.md`

  **What to do**:
  - 创建文件，说明 utils 目录职责
  - 记录当前目录为空（仅 `__init__.py`）
  - 预留 CSV 处理、格式化、计算工具等函数的实现规范位置
  - 说明与 services/ 的关系（utils 是 services 使用的纯函数工具）

  **Must NOT do**:
  - 不创建空文件（需有实质内容）
  - 不复制 services/AGENTS.md 的内容

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 新建小型规则文件
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2（与 Task 3-6 并行）
  - **Blocks**: 无
  - **Blocked By**: 无

  **References**:
  - `src/profkeep/utils/` — 目标目录（当前仅 `__init__.py`）
  - `src/profkeep/services/AGENTS.md` — 参考 utils 的使用场景
  - `docs/IMPLEMENTATION.md` §9 — 参考 CSV 格式规范

  **Acceptance Criteria**:
  - [ ] 文件存在且包含 utils 目录职责说明
  - [ ] 说明当前目录为空，待实现工具函数列表
  - [ ] 说明与 services 的依赖关系

  **Commit**: YES
  - Message: `Add utils/AGENTS.md`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check all 8 files were modified/created correctly.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Content Quality Review** — `unspecified-high`
  Read all modified files. Verify: no broken references, no orphaned content, no duplicate information between AGENTS.md files, human docs are self-contained, AI docs are precise and non-redundant.
  Output: `Broken refs [N] | Orphaned content [N] | Duplicates [N] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  Verify each acceptance criterion by reading the actual files: grep for old naming in PRD.md, grep for rate_limit in IMPLEMENTATION.md, verify widgets/AGENTS.md and utils/AGENTS.md exist and have content.
  Output: `Criteria [N/N pass] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 compliance. No modifications outside the 8 target files. No changes to README.md, WORKFLOW.md, or any source code.
  Output: `Tasks [N/N compliant] | Out-of-scope [CLEAN/N] | VERDICT`

---

## Commit Strategy

- **0**: `Rename prd.md to PRD.md and update references` — docs/prd.md→PRD.md, AGENTS.md, docs/AGENTS.md
- **1**: `Fix outdated information in PRD.md` — docs/PRD.md
- **2**: `Fix outdated information in IMPLEMENTATION.md` — docs/IMPLEMENTATION.md
- **3**: `Clean up docs/AGENTS.md structure` — docs/AGENTS.md
- **4**: `Remove service-layer content from screens/AGENTS.md` — src/profkeep/screens/AGENTS.md
- **5**: `Enhance root AGENTS.md with test specs and module links` — AGENTS.md
- **6**: `Add widgets/AGENTS.md` — src/profkeep/widgets/AGENTS.md
- **7**: `Add utils/AGENTS.md` — src/profkeep/utils/AGENTS.md

---

## Success Criteria

### Verification Commands
```bash
grep -i "fund-keeper\|fund_keeper\|\.fundkeeper" docs/PRD.md  # Expected: no output
grep -i "限流" docs/PRD.md  # Expected: no output
grep "rate_limit" docs/IMPLEMENTATION.md  # Expected: no output
test -f src/profkeep/widgets/AGENTS.md  # Expected: exit 0
test -f src/profkeep/utils/AGENTS.md  # Expected: exit 0
```

### Final Checklist
- [x] 所有人类文档中无过时引用
- [x] 每个 AGENTS.md 只包含自己目录职责范围内的内容
- [x] widgets/ 和 utils/ 有 AGENTS.md
- [x] 根 AGENTS.md 包含完整的模块索引和测试规范
- [x] 未修改 README.md、WORKFLOW.md、任何源代码文件
