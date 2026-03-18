# 基金账本 Frontend UI 原型开发计划

## TL;DR

> **Quick Summary**: 从零开始搭建基金账本应用的完整 React 前端 UI 原型，包括项目初始化、设计系统实现、6 个核心页面、业务组件库、图表可视化和 Mock API 服务。
> 
> **Deliverables**: 
> - 完整的 Vite + React 18 + TypeScript 项目结构
> - Ant Design 5.x 主题定制 (色彩系统、间距、圆角)
> - 响应式布局 (Header + SideNav + 移动端适配)
> - 6 个核心页面 (Dashboard、账户管理、持仓详情、交易记录、数据分析、设置)
> - 15+ 可复用组件 (通用组件 + 业务组件)
> - Zustand + React Query 状态管理架构
> - MSW Mock API 服务 (匹配 PRD 数据模型)
> - ECharts 图表组件 (饼图、折线图)
> - 组件测试 + 工具函数测试 (Vitest + React Testing Library)
> 
> **Estimated Effort**: Large (预计 10 天工作量)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: 项目配置 → 设计系统 → 布局 → 核心页面 → 图表 → 测试

---

## Context

### Original Request
根据 docs/PRD.md 和 docs/UI_DESIGN.md，在 frontend 文件夹中完成 UI 前端的原型开发。

### Interview Summary
**Key Discussions**:
- 项目状态：Frontend 和 Backend 目录均为空，仅有 AGENTS.md 文件
- 技术栈确认：React 18 + TypeScript + Ant Design 5.x + Vite + pnpm
- 图表库：ECharts (PRD 指定)
- 状态管理：Zustand + React Query (Metis 推荐)
- API Mock：MSW (Mock Service Worker) 用于开发阶段

**Research Findings**:
- Ant Design 5.x 使用 ConfigProvider + theme token 进行主题定制
- Vite 官方推荐 create-vite 模板快速初始化
- ECharts 官方推荐 echarts-for-react 包装器
- Zustand persist 中间件支持 localStorage 持久化

### Metis Review
**Identified Gaps** (addressed):
- **Backend 依赖风险**: 使用 MSW 创建 Mock API，匹配 PRD 数据模型
- **状态管理架构**: 采用 Zustand (domain stores) + React Query (server state)
- **测试策略**: 组件测试 (React Testing Library) + 工具函数测试 (Vitest)
- **Scope Creep 防护**: 明确 MVP 范围，排除深色模式、实时推送等超出 PRD 的功能

---

## Work Objectives

### Core Objective
构建一个功能完整、设计精美、可交互的基金账本前端 UI 原型，支持账户管理、持仓追踪、交易记录、数据可视化等核心功能，使用 Mock 数据实现完整用户体验，为后续后端集成做好准备。

### Concrete Deliverables
- `frontend/` 完整项目目录结构
- `src/pages/Dashboard.tsx` - 首页/仪表盘
- `src/pages/Accounts.tsx` - 账户管理
- `src/pages/Holdings.tsx` - 持仓详情
- `src/pages/Transactions.tsx` - 交易记录
- `src/pages/Analytics.tsx` - 数据分析
- `src/pages/Settings.tsx` - 设置
- `src/components/Layout/` - 布局组件 (Header, SideNav, ResponsiveWrapper)
- `src/components/business/` - 业务组件 (AccountCard, HoldingTable, TransactionForm 等)
- `src/stores/` - Zustand stores (accountStore, holdingStore, transactionStore)
- `src/services/` - API 服务 + MSW Mock handlers
- `src/utils/calculators.ts` - 持仓成本/收益计算工具函数
- `src/utils/formatters.ts` - 数据格式化工具函数
- `src/hooks/` - 自定义 Hooks
- `src/__tests__/` - 测试文件
- `vite.config.ts`, `tsconfig.json`, `.eslintrc.cjs` - 配置文件

### Definition of Done
- [ ] 所有 6 个页面可正常导航和交互
- [ ] 所有表单验证通过 (基金代码 6 位数字、正数金额、有效日期)
- [ ] 持仓成本/收益计算准确 (加权平均法)
- [ ] 响应式布局在 375px、768px、1024px、1440px 断点正常显示
- [ ] 所有组件测试通过 (bun test)
- [ ] 所有工具函数测试通过 (bun test)
- [ ] Lighthouse 性能评分 > 90
- [ ] TypeScript 严格模式无错误

### Must Have
- Ant Design 5.x 主题定制 (Primary #1890FF, Success #52C41A, Error #FF4D4F)
- MSW Mock API 服务 (匹配 PRD 数据模型)
- Zustand + React Query 状态管理
- ECharts 图表 (饼图、折线图)
- 响应式设计 (移动/平板/桌面)
- 组件测试覆盖率 > 70%

### Must NOT Have (Guardrails)
- ❌ 深色模式 (不在 PRD 范围内)
- ❌ 实时数据推送 (PRD 明确说明手动刷新)
- ❌ 多用户认证系统 (PRD 说明单用户)
- ❌ 高级技术指标 (MACD、KDJ 等，PRD 明确排除)
- ❌ 移动 App (仅 Web 端)
- ❌ 使用 `any` 类型或 `@ts-ignore` (项目规范禁止)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO (全新项目)
- **Automated tests**: YES (TDD)
- **Framework**: Vitest + React Testing Library + @testing-library/jest-dom
- **If TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux) — Run command, send keystrokes, validate output
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.
> Target: 5-8 tasks per wave. Fewer than 3 per wave (except final) = under-splitting.

```
Wave 1 (Start Immediately — 项目初始化 + 基础配置):
├── Task 1: Vite + React 18 + TypeScript 项目初始化 [quick]
├── Task 2: Ant Design 5.x 主题配置 + 设计系统 tokens [quick]
├── Task 3: 路径别名 + ESLint + Prettier 配置 [quick]
├── Task 4: Vitest + React Testing Library 测试环境配置 [quick]
├── Task 5: MSW Mock Service Worker 配置 + 基础 handlers [quick]
├── Task 6: Zustand + React Query 项目级配置 [quick]
└── Task 7: 工具函数 (calculators, formatters) + TDD [quick]

Wave 2 (After Wave 1 — 布局组件 + 路由):
├── Task 8: Layout 组件 (Header, SideNav) + 响应式适配 [visual-engineering]
├── Task 9: React Router v6 路由配置 + 页面骨架 [quick]
├── Task 10: 通用组件 (DataCard, ProfitText, FundSelector) [visual-engineering]
├── Task 11: 业务组件 (AccountCard, HoldingTable) [visual-engineering]
├── Task 12: 业务组件 (TransactionForm, NetValueRefresh) [visual-engineering]
└── Task 13: ECharts 基础组件封装 (BaseChart, PieChart, LineChart) [visual-engineering]

Wave 3 (After Wave 2 — 核心页面开发):
├── Task 14: Dashboard 页面 — 资产总览 + 持仓列表 [visual-engineering]
├── Task 15: Accounts 页面 — 账户管理 CRUD [unspecified-high]
├── Task 16: Holdings 页面 — 持仓详情 + 净值走势 [visual-engineering]
├── Task 17: Transactions 页面 — 交易记录 + 筛选 + 分页 [unspecified-high]
├── Task 18: Analytics 页面 — 收益曲线 + 资产配置图表 [visual-engineering]
└── Task 19: Settings 页面 — 数据管理 + Tushare 配置 [quick]

Wave 4 (After Wave 3 — 状态管理 + API 集成):
├── Task 20: Zustand Stores (accountStore, holdingStore, transactionStore) [unspecified-high]
├── Task 21: React Query hooks (useAccounts, useHoldings, useTransactions) [unspecified-high]
├── Task 22: API Service 层 (services/api.ts, services/accountApi.ts, etc.) [quick]
├── Task 23: MSW Mock handlers 完善 (覆盖所有 PRD 端点) [quick]
├── Task 24: 表单验证逻辑 (Zod schemas) + 错误处理 [quick]
└── Task 25: 响应式优化 + 移动端适配调整 [visual-engineering]

Wave 5 (After Wave 4 — 测试 + 优化):
├── Task 26: 组件测试补充 (覆盖率提升至 70%+) [deep]
├── Task 27: 工具函数测试 (calculators.test.ts, formatters.test.ts) [deep]
├── Task 28: ECharts 图表测试 (数据转换逻辑，非视觉测试) [deep]
├── Task 29: 性能优化 (懒加载、虚拟滚动、图表 downsampling) [unspecified-high]
├── Task 30: Lighthouse 优化 (性能、无障碍、最佳实践) [unspecified-high]
└── Task 31: 文档完善 (README.md, component stories) [writing]

Wave FINAL (After ALL tasks — 独立 review, 4 并行):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 8 → Task 14 → Task 20 → Task 26 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Waves 1 & 2)
```

### Dependency Matrix (abbreviated — show ALL tasks in your generated plan)

- **1-7**: — — 8-13, 7
- **8-9**: 1-6 — 14-19, 2
- **10-13**: 1-6 — 14-19, 3
- **14-19**: 8-13 — 20-25, 4
- **20-25**: 14-19 — 26-31, 5
- **26-31**: 20-25 — F1-F4, FINAL
- **F1-F4**: 26-31 — Complete

> This is abbreviated for reference. YOUR generated plan must include the FULL matrix for ALL tasks.

### Agent Dispatch Summary

- **1**: **7** — T1-T7 → `quick`
- **2**: **6** — T8 → `visual-engineering`, T9 → `quick`, T10-T13 → `visual-engineering`
- **3**: **6** — T14 → `visual-engineering`, T15 → `unspecified-high`, T16 → `visual-engineering`, T17 → `unspecified-high`, T18 → `visual-engineering`, T19 → `quick`
- **4**: **6** — T20 → `unspecified-high`, T21 → `unspecified-high`, T22-T24 → `quick`, T25 → `visual-engineering`
- **5**: **6** — T26-T28 → `deep`, T29-T30 → `unspecified-high`, T31 → `writing`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Vite + React 18 + TypeScript 项目初始化

  **What to do**:
  - 使用 `pnpm create vite@latest frontend --template react-ts` 创建项目
  - 安装基础依赖：react, react-dom, @types/react, @types/react-dom
  - 配置 vite.config.ts (基础配置，路径别名稍后配置)
  - 创建基础文件结构：src/main.tsx, src/App.tsx, src/index.css
  - 验证项目可正常运行：`pnpm dev`

  **Must NOT do**:
  - 不要配置复杂的路径别名 (Task 3 处理)
  - 不要安装额外插件 (按需安装)
  - 不要修改默认模板代码 (保持纯净)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: 标准化的项目初始化流程，使用官方模板，无需复杂决策
  - **Skills**: []
    - 无需特殊技能，标准 Vite 初始化流程

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-7)
  - **Blocks**: Tasks 8-31 (所有后续任务依赖项目初始化)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  **Pattern References** (existing code to follow):
  - Vite 官方模板：`https://vitejs.dev/guide/` - 标准 React + TypeScript 项目结构

  **External References** (libraries and frameworks):
  - Vite 官方文档：`https://vitejs.dev/guide/#scaffolding-your-first-vite-project` - 项目初始化命令
  - React 18 文档：`https://react.dev/reference/react-dom/client/createRoot` - createRoot API

  **WHY Each Reference Matters** (explain the relevance):
  - Vite 官方模板提供最佳实践的起点
  - React 18 使用新的 createRoot API 替代 ReactDOM.render

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  ```
  Scenario: 项目可正常启动
    Tool: interactive_bash (tmux)
    Preconditions: frontend 目录已创建
    Steps:
      1. cd frontend && pnpm install
      2. pnpm dev
      3. 检查终端输出是否包含 "Local: http://localhost:5173"
    Expected Result: 开发服务器成功启动在 localhost:5173
    Failure Indicators: 报错、端口冲突、依赖安装失败
    Evidence: .sisyphus/evidence/task-1-dev-server-start.png

  Scenario: TypeScript 类型检查通过
    Tool: Bash
    Preconditions: 项目已初始化
    Steps:
      1. cd frontend
      2. pnpm run typecheck (或 npx tsc --noEmit)
    Expected Result: 无 TypeScript 错误
    Failure Indicators: 类型错误输出
    Evidence: .sisyphus/evidence/task-1-typecheck-output.txt
  ```

  **Evidence to Capture:**
  - [ ] 开发服务器启动截图
  - [ ] TypeScript 检查输出

  **Commit**: YES (groups with 2-7)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/index.html`, `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/index.css`
  - Pre-commit: `pnpm run typecheck`

- [ ] 2. Ant Design 5.x 主题配置 + 设计系统 tokens

  **What to do**:
  - 安装 antd: `pnpm add antd`
  - 安装 @ant-design/icons: `pnpm add @ant-design/icons`
  - 创建 src/config/theme.ts 配置文件
  - 在 src/main.tsx 中配置 ConfigProvider
  - 实现 UI_DESIGN.md 中的色彩系统:
    - Primary Blue: #1890FF
    - Success Green: #52C41A
    - Error Red: #FF4D4F
    - Warning Orange: #FAAD14
  - 配置字体系统、间距系统、圆角系统

  **Must NOT do**:
  - 不要配置深色模式 (超出 MVP 范围)
  - 不要修改 Ant Design 组件默认样式 (使用 theme token)
  - 不要引入额外的 CSS 框架

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 遵循 Ant Design 官方文档的标准配置流程
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 需要理解设计系统与 Ant Design token 的映射关系

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-7)
  - **Blocks**: Tasks 8-31 (所有 UI 组件依赖主题配置)
  - **Blocked By**: None

  **References**:
  - Ant Design 官方文档：`https://ant.design/docs/react/customize-theme` - ConfigProvider theme API
  - UI_DESIGN.md:2.1 - 色彩系统详细规格
  - UI_DESIGN.md:2.2 - 字体系统详细规格
  - UI_DESIGN.md:2.3 - 间距系统详细规格
  - UI_DESIGN.md:2.4 - 圆角系统详细规格

  **Acceptance Criteria**:
  - [ ] src/config/theme.ts 创建完成，包含所有 design tokens
  - [ ] src/main.tsx 中 ConfigProvider 正确配置
  - [ ] 主色调验证：按钮、链接等组件使用 #1890FF
  - [ ] 成功色验证：盈利数据显示 #52C41A
  - [ ] 错误色验证：亏损数据显示 #FF4D4F

  **QA Scenarios**:
  ```
  Scenario: 主题色正确应用
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 导航到 http://localhost:5173
      2. 创建一个 Button 组件 (type="primary")
      3. 获取按钮背景色
      4. 断言颜色值为 rgb(24, 144, 255) 或等效的 #1890FF
    Expected Result: 主色调正确应用
    Failure Indicators: 颜色值不匹配
    Evidence: .sisyphus/evidence/task-2-theme-color-screenshot.png

  Scenario: 收益颜色条件渲染
    Tool: Playwright
    Preconditions: 页面包含收益显示组件
    Steps:
      1. 创建 ProfitText 组件，传入正收益值 (+1000)
      2. 断言文字颜色为 #52C41A
      3. 创建 ProfitText 组件，传入负收益值 (-1000)
      4. 断言文字颜色为 #FF4D4F
    Expected Result: 盈亏颜色正确区分
    Failure Indicators: 颜色颠倒或不变
    Evidence: .sisyphus/evidence/task-2-profit-color-test.png
  ```

  **Evidence to Capture:**
  - [ ] 主题色应用截图
  - [ ] 盈亏颜色测试截图
  - [ ] theme.ts 配置文件内容

  **Commit**: YES (groups with 1, 3-7)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/src/config/theme.ts`, `frontend/src/main.tsx`
  - Pre-commit: `pnpm run typecheck`

- [ ] 3. 路径别名 + ESLint + Prettier 配置

  **What to do**:
  - 配置 vite.config.ts 路径别名：@/components, @/pages, @/stores, @/services, @/utils, @/hooks, @/types, @/config
  - 安装 ESLint: `pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
  - 安装 Prettier: `pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier`
  - 创建 .eslintrc.cjs 配置文件 (React + TypeScript + Prettier)
  - 创建 .prettierrc 配置文件
  - 配置 package.json scripts: lint, format

  **Must NOT do**:
  - 不要使用过于严格的 ESLint 规则 (避免阻碍开发)
  - 不要配置复杂的 Prettier 规则 (保持默认)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准化的工具配置，有成熟的模板可循
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-7)
  - **Blocks**: Tasks 8-31 (所有代码文件需要 lint/format)
  - **Blocked By**: None

  **References**:
  - Vite 官方文档：`https://vitejs.dev/config/shared-options.html#resolve-alias` - 路径别名配置
  - TypeScript ESLint: `https://typescript-eslint.io/getting-started/` - ESLint 配置指南

  **Acceptance Criteria**:
  - [ ] 路径别名工作：`import Button from '@/components/Button'` 可正常解析
  - [ ] ESLint 无错误：`pnpm run lint` 通过
  - [ ] Prettier 格式化：`pnpm run format` 成功

  **QA Scenarios**:
  ```
  Scenario: 路径别名解析成功
    Tool: Bash
    Preconditions: 项目已配置路径别名
    Steps:
      1. 创建测试文件 src/test-alias.ts，导入 '@/config/theme'
      2. 运行 pnpm run typecheck
      3. 检查无模块解析错误
    Expected Result: TypeScript 成功解析路径别名
    Failure Indicators: "Cannot find module" 错误
    Evidence: .sisyphus/evidence/task-3-alias-test.txt

  Scenario: ESLint 检查通过
    Tool: Bash
    Preconditions: 项目已配置 ESLint
    Steps:
      1. pnpm run lint
      2. 检查输出无错误
    Expected Result: ESLint 检查通过
    Failure Indicators: lint 错误输出
    Evidence: .sisyphus/evidence/task-3-lint-output.txt
  ```

  **Evidence to Capture:**
  - [ ] vite.config.ts 别名配置
  - [ ] .eslintrc.cjs 内容
  - [ ] .prettierrc 内容
  - [ ] lint/format 命令输出

  **Commit**: YES (groups with 1-2, 4-7)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/vite.config.ts`, `frontend/.eslintrc.cjs`, `frontend/.prettierrc`, `frontend/package.json`
  - Pre-commit: `pnpm run lint`

- [ ] 4. Vitest + React Testing Library 测试环境配置

  **What to do**:
  - 安装 Vitest: `pnpm add -D vitest @vitejs/plugin-react`
  - 安装 React Testing Library: `pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`
  - 安装 jsdom: `pnpm add -D jsdom`
  - 创建 vite.config.ts 测试配置 (test 块)
  - 创建 src/__tests__/setup.ts (测试初始化文件)
  - 配置 package.json test script
  - 创建示例测试文件 src/__tests__/App.test.tsx

  **Must NOT do**:
  - 不要配置复杂的测试覆盖率要求 (后续任务补充)
  - 不要安装 Enzyme (已过时)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准化的测试环境配置
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5-7)
  - **Blocks**: Tasks 26-28 (测试任务依赖测试环境)
  - **Blocked By**: None

  **References**:
  - Vitest 官方文档：`https://vitest.dev/guide/` - 配置指南
  - React Testing Library: `https://testing-library.com/docs/react-testing-library/intro/` - 最佳实践

  **Acceptance Criteria**:
  - [ ] `pnpm run test` 可执行
  - [ ] 示例测试 App.test.tsx 通过
  - [ ] React Testing Library 查询 API 可用

  **QA Scenarios**:
  ```
  Scenario: 测试框架正常运行
    Tool: Bash
    Preconditions: 测试环境已配置
    Steps:
      1. pnpm run test
      2. 检查测试运行成功
    Expected Result: 所有测试通过
    Failure Indicators: 测试失败、配置错误
    Evidence: .sisyphus/evidence/task-4-test-run.txt

  Scenario: React Testing Library 查询可用
    Tool: Bash
    Preconditions: 测试环境已配置
    Steps:
      1. 创建测试文件使用 render, screen, fireEvent
      2. 运行测试
      3. 验证查询和事件触发工作正常
    Expected Result: RTL API 正常工作
    Failure Indicators: 导入错误、API 不可用
    Evidence: .sisyphus/evidence/task-4-rtl-test.txt
  ```

  **Evidence to Capture:**
  - [ ] vite.config.ts test 配置
  - [ ] src/__tests__/setup.ts 内容
  - [ ] 测试运行输出

  **Commit**: YES (groups with 1-3, 5-7)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/vite.config.ts`, `frontend/src/__tests__/setup.ts`, `frontend/src/__tests__/App.test.tsx`
  - Pre-commit: `pnpm run test`

- [ ] 5. MSW Mock Service Worker 配置 + 基础 handlers

  **What to do**:
  - 安装 MSW: `pnpm add -D msw`
  - 创建 src/mocks/handlers.ts (API handlers)
  - 创建 src/mocks/browser.ts (MSW 浏览器配置)
  - 在 src/main.tsx 中条件启用 MSW (开发环境)
  - 实现基础 handlers (基于 PRD 数据模型):
    - GET /api/accounts - 返回账户列表
    - GET /api/funds - 返回基金列表
    - GET /api/holdings - 返回持仓列表
    - GET /api/transactions - 返回交易记录
  - 创建 Mock 数据工厂函数 (生成真实感的测试数据)

  **Must NOT do**:
  - 不要实现复杂的业务逻辑 (Mock 数据即可)
  - 不要处理错误场景 (后续任务补充)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: MSW 有标准配置模式
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4, 6-7)
  - **Blocks**: Tasks 14-25 (页面开发依赖 Mock API)
  - **Blocked By**: None

  **References**:
  - MSW 官方文档：`https://mswjs.io/docs/getting-started` - 快速开始
  - PRD.md:3.3 - 数据库表结构 (Mock 数据模型)
  - PRD.md:3.4 - API 端点设计

  **Acceptance Criteria**:
  - [ ] MSW 在开发环境成功启用
  - [ ] 控制台显示 "[MSW] Mocking enabled."
  - [ ] 基础 handlers 返回 Mock 数据
  - [ ] Mock 数据符合 PRD 数据模型

  **QA Scenarios**:
  ```
  Scenario: MSW 成功拦截 API 请求
    Tool: Bash + curl
    Preconditions: 开发服务器已启动
    Steps:
      1. 启动开发服务器 pnpm dev
      2. 使用 curl 请求 http://localhost:5173/api/accounts
      3. 检查返回 Mock 数据
    Expected Result: 返回 Mock 账户列表
    Failure Indicators: 网络错误、返回空值
    Evidence: .sisyphus/evidence/task-5-msw-api-test.json

  Scenario: Mock 数据结构验证
    Tool: Bash
    Preconditions: MSW handlers 已创建
    Steps:
      1. 编写测试验证 handlers 返回的数据结构
      2. 检查包含 PRD 要求的字段 (id, name, description 等)
    Expected Result: 数据结构符合 PRD
    Failure Indicators: 字段缺失、类型错误
    Evidence: .sisyphus/evidence/task-5-mock-data-structure.json
  ```

  **Evidence to Capture:**
  - [ ] src/mocks/handlers.ts 内容
  - [ ] src/mocks/browser.ts 内容
  - [ ] API 测试响应

  **Commit**: YES (groups with 1-4, 6-7)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/src/mocks/handlers.ts`, `frontend/src/mocks/browser.ts`, `frontend/src/main.tsx`
  - Pre-commit: `pnpm run test`

- [ ] 6. Zustand + React Query 项目级配置

  **What to do**:
  - 安装 Zustand: `pnpm add zustand`
  - 安装 React Query: `pnpm add @tanstack/react-query`
  - 创建 src/stores/index.ts (Zustand store 导出)
  - 创建 src/hooks/useQueryClient.ts (React Query client 配置)
  - 在 src/main.tsx 中配置 QueryClientProvider
  - 创建示例 store (如 uiStore 用于测试)
  - 配置 Zustand persist 中间件 (localStorage 持久化)

  **Must NOT do**:
  - 不要实现完整的业务 stores (后续任务处理)
  - 不要配置复杂的 React Query 选项

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准化的状态管理库配置
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-5, 7)
  - **Blocks**: Tasks 20-21 (状态管理任务依赖配置)
  - **Blocked By**: None

  **References**:
  - Zustand 文档：`https://github.com/pmndrs/zustand` - 快速开始
  - React Query 文档：`https://tanstack.com/query/latest/docs/react/overview` - 配置指南

  **Acceptance Criteria**:
  - [ ] Zustand store 可创建和使用
  - [ ] React Query hooks 可用
  - [ ] QueryClientProvider 正确包裹 App

  **QA Scenarios**:
  ```
  Scenario: Zustand store 状态共享
    Tool: Bash
    Preconditions: Zustand 已配置
    Steps:
      1. 创建测试 store (counterStore)
      2. 在组件中使用 store
      3. 验证状态更新和订阅
    Expected Result: 状态管理正常工作
    Failure Indicators: 状态不更新、订阅失效
    Evidence: .sisyphus/evidence/task-6-zustand-test.txt

  Scenario: React Query 数据获取
    Tool: Bash
    Preconditions: React Query 已配置
    Steps:
      1. 创建测试 query (useTestQuery)
      2. 使用 MSW mock 数据
      3. 验证数据获取和缓存
    Expected Result: React Query 正常工作
    Failure Indicators: 数据获取失败、缓存失效
    Evidence: .sisyphus/evidence/task-6-react-query-test.txt
  ```

  **Evidence to Capture:**
  - [ ] src/stores/index.ts 内容
  - [ ] src/hooks/useQueryClient.ts 内容
  - [ ] 测试输出

  **Commit**: YES (groups with 1-5, 7)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/src/stores/index.ts`, `frontend/src/hooks/useQueryClient.ts`, `frontend/src/main.tsx`
  - Pre-commit: `pnpm run test`

- [ ] 7. 工具函数 (calculators, formatters) + TDD

  **What to do**:
  - 创建 src/utils/calculators.ts:
    - calculateCostPrice(transactions) - 加权平均成本计算
    - calculateProfit(holding, latestNetValue) - 持仓收益计算
    - calculateProfitRate(profit, cost) - 收益率计算
  - 创建 src/utils/formatters.ts:
    - formatCurrency(value) - 货币格式化 (¥1,234.56)
    - formatShares(value) - 份额格式化 (1,234.56 份)
    - formatProfitRate(value) - 收益率格式化 (+12.34%)
    - formatDate(date) - 日期格式化 (2026-03-18)
  - 创建 src/utils/__tests__/calculators.test.ts (TDD)
  - 创建 src/utils/__tests__/formatters.test.ts (TDD)
  - 遵循 PRD 3.5 节的算法公式

  **Must NOT do**:
  - 不要实现复杂的边界情况处理 (后续补充)
  - 不要使用 any 类型 (严格 TypeScript)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯函数工具，逻辑清晰，易于测试
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-6)
  - **Blocks**: Tasks 14-19 (页面需要工具函数)
  - **Blocked By**: None

  **References**:
  - PRD.md:3.5 - 持仓成本计算算法 (加权平均法)
  - PRD.md:2.2 US-5 - 收益计算验收标准

  **Acceptance Criteria**:
  - [ ] calculateCostPrice 正确实现加权平均算法
  - [ ] calculateProfit 返回正确的市值、成本、收益、收益率
  - [ ] formatCurrency 正确格式化人民币 (保留 2 位小数)
  - [ ] formatProfitRate 正确显示正负号 (+12.34%, -5.67%)
  - [ ] 所有测试通过 (覆盖率 100%)

  **QA Scenarios**:
  ```
  Scenario: 加权平均成本计算正确
    Tool: Bash
    Preconditions: calculators.ts 已实现
    Steps:
      1. 创建测试用例：两次买入 (500 份@1.20, 500 份@1.18)
      2. 计算成本价：(500*1.20 + 500*1.18) / 1000 = 1.19
      3. 断言结果 === 1.19
    Expected Result: 成本价计算准确
    Failure Indicators: 计算结果偏差 > 0.01
    Evidence: .sisyphus/evidence/task-7-cost-calculation-test.txt

  Scenario: 收益率格式化正确
    Tool: Bash
    Preconditions: formatters.ts 已实现
    Steps:
      1. 测试正收益：formatProfitRate(0.1234) → "+12.34%"
      2. 测试负收益：formatProfitRate(-0.0567) → "-5.67%"
      3. 测试零收益：formatProfitRate(0) → "0.00%"
    Expected Result: 格式化正确，包含正负号
    Failure Indicators: 格式错误、缺少正负号
    Evidence: .sisyphus/evidence/task-7-formatter-test.txt
  ```

  **Evidence to Capture:**
  - [ ] src/utils/calculators.ts 内容
  - [ ] src/utils/formatters.ts 内容
  - [ ] 测试文件和输出

  **Commit**: YES (groups with 1-6)
  - Message: `feat(frontend): project initialization with Vite + React + TypeScript`
  - Files: `frontend/src/utils/calculators.ts`, `frontend/src/utils/formatters.ts`, `frontend/src/utils/__tests__/calculators.test.ts`, `frontend/src/utils/__tests__/formatters.test.ts`
  - Pre-commit: `pnpm run test`

- [ ] 8. Layout 组件 (Header, SideNav) + 响应式适配

  **What to do**:
  - 创建 src/components/Layout/Header.tsx:
    - Logo + 应用标题 "基金账本"
    - 账户选择器 (Select 下拉)
    - 设置按钮、帮助按钮
  - 创建 src/components/Layout/SideNav.tsx:
    - 侧边菜单 (Dashboard, 账户管理，持仓详情，交易记录，数据分析，设置)
    - 使用 Ant Design Menu 组件
    - 高亮当前路由
  - 创建 src/components/Layout/index.ts (统一导出)
  - 实现响应式：移动端隐藏 SideNav，使用底部 Tab 导航
  - 添加 Ant Design Layout 组件 (Header, Sider, Content)

  **Must NOT do**:
  - 不要实现账户选择器的实际逻辑 (后续状态管理任务处理)
  - 不要实现移动端底部导航 (MVP 仅桌面端)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 布局组件，需要 Ant Design 组件使用和响应式设计
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 需要理解响应式布局模式和 Ant Design Layout

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Wave 1)
  - **Blocks**: Tasks 14-19 (所有页面依赖布局)
  - **Blocked By**: Tasks 1-3 (项目配置、主题、路由)

  **References**:
  - Ant Design Layout: `https://ant.design/components/layout` - 布局组件
  - Ant Design Menu: `https://ant.design/components/menu` - 导航菜单
  - UI_DESIGN.md:3.3 - 页面结构布局
  - UI_DESIGN.md:5.1.1 - Header 组件设计
  - UI_DESIGN.md:5.1.2 - SideNav 组件设计

  **Acceptance Criteria**:
  - [ ] Header 固定在顶部，高度 64px
  - [ ] SideNav 固定在左侧，宽度 200px
  - [ ] 菜单项正确高亮当前路由
  - [ ] 响应式：768px 以下 SideNav 隐藏
  - [ ] Logo 和标题正确显示

  **QA Scenarios**:
  ```
  Scenario: 布局组件渲染正确
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 导航到首页
      2. 检查 Header 存在且高度为 64px
      3. 检查 SideNav 存在且宽度为 200px
      4. 检查 Logo 和标题 "基金账本" 可见
    Expected Result: 布局正确渲染
    Failure Indicators: 布局错位、尺寸错误
    Evidence: .sisyphus/evidence/task-8-layout-desktop.png

  Scenario: 响应式适配 (移动端)
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 设置视口宽度为 375px (移动端)
      2. 检查 SideNav 隐藏
      3. 检查 Header 正常显示
    Expected Result: 移动端布局正确
    Failure Indicators: SideNav 未隐藏、布局错乱
    Evidence: .sisyphus/evidence/task-8-layout-mobile.png
  ```

  **Evidence to Capture:**
  - [ ] 桌面端布局截图 (1440px)
  - [ ] 移动端布局截图 (375px)
  - [ ] Header.tsx, SideNav.tsx 源码

  **Commit**: YES (groups with 9-13)
  - Message: `feat(layout): responsive layout components and routing setup`
  - Files: `frontend/src/components/Layout/Header.tsx`, `frontend/src/components/Layout/SideNav.tsx`, `frontend/src/components/Layout/index.ts`
  - Pre-commit: `pnpm run lint && pnpm run typecheck`

- [ ] 9. React Router v6 路由配置 + 页面骨架

  **What to do**:
  - 安装 React Router: `pnpm add react-router-dom`
  - 创建 src/router/index.tsx (路由配置)
  - 定义路由路径:
    - `/` - Dashboard
    - `/accounts` - 账户管理
    - `/holdings` - 持仓详情
    - `/transactions` - 交易记录
    - `/analytics` - 数据分析
    - `/settings` - 设置
  - 创建 6 个页面骨架组件 (仅返回占位文本)
  - 在 App.tsx 中配置 RouterProvider 或 BrowserRouter
  - 实现路由切换动画 (可选)

  **Must NOT do**:
  - 不要实现页面实际内容 (后续任务处理)
  - 不要配置复杂的路由守卫 (单用户无需权限)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准化的路由配置
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 8, 10-13)
  - **Blocks**: Tasks 14-19 (页面开发依赖路由)
  - **Blocked By**: Task 1-3 (项目配置)

  **References**:
  - React Router v6: `https://reactrouter.com/en/main/start/tutorial` - 快速开始
  - UI_DESIGN.md:4.1 - 页面清单

  **Acceptance Criteria**:
  - [ ] 所有 6 条路由配置正确
  - [ ] 导航到各路由无 404 错误
  - [ ] SideNav 菜单点击可切换路由
  - [ ] 浏览器前进/后退按钮工作正常

  **QA Scenarios**:
  ```
  Scenario: 路由导航正常
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 点击 SideNav 中的 "账户管理"
      2. 检查 URL 变为 /accounts
      3. 检查页面显示 "账户管理" 占位文本
      4. 点击 "持仓详情"
      5. 检查 URL 变为 /holdings
    Expected Result: 路由切换正常
    Failure Indicators: URL 不变、页面不更新
    Evidence: .sisyphus/evidence/task-9-routing-test.gif

  Scenario: 浏览器前进后退正常
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 导航到 /accounts
      2. 导航到 /holdings
      3. 点击浏览器后退按钮
      4. 检查回到 /accounts
    Expected Result: 历史记录正常
    Failure Indicators: 页面不更新、URL 不变
    Evidence: .sisyphus/evidence/task-9-browser-history-test.gif
  ```

  **Evidence to Capture:**
  - [ ] src/router/index.tsx 内容
  - [ ] 6 个页面骨架文件
  - [ ] 路由导航 GIF

  **Commit**: YES (groups with 8, 10-13)
  - Message: `feat(layout): responsive layout components and routing setup`
  - Files: `frontend/src/router/index.tsx`, `frontend/src/pages/Dashboard.tsx`, `frontend/src/pages/Accounts.tsx`, `frontend/src/pages/Holdings.tsx`, `frontend/src/pages/Transactions.tsx`, `frontend/src/pages/Analytics.tsx`, `frontend/src/pages/Settings.tsx`, `frontend/src/App.tsx`
  - Pre-commit: `pnpm run typecheck`

- [ ] 10. 通用组件 (DataCard, ProfitText, FundSelector)

  **What to do**:
  - 创建 src/components/common/DataCard.tsx:
    - 卡片容器，支持 title, extra, children
    - 悬停阴影效果
    - 响应式宽度
  - 创建 src/components/common/ProfitText.tsx:
    - 根据正负值自动显示红绿色
    - 支持前缀 (+/-) 和后缀 (元，%)
    - 支持 children 或 value prop
  - 创建 src/components/common/FundSelector.tsx:
    - 输入基金代码 (6 位数字验证)
    - 自动获取基金信息 (显示 loading)
    - 显示基金名称、类型、公司
  - 创建对应的 index.ts 导出文件
  - 编写组件故事 (可选，用于展示)

  **Must NOT do**:
  - 不要实现真实的基金信息获取 (使用 Mock)
  - 不要添加复杂的加载状态 (简单 loading 即可)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件开发，需要 Ant Design 组件使用和样式定制
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 需要理解组件设计和 Ant Design 集成

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-9, 11-13)
  - **Blocks**: Tasks 14-19 (页面需要这些组件)
  - **Blocked By**: Tasks 1-2 (主题配置)

  **References**:
  - Ant Design Card: `https://ant.design/components/card`
  - Ant Design Statistic: `https://ant.design/components/statistic`
  - Ant Design Input: `https://ant.design/components/input`
  - UI_DESIGN.md:5.1.3 - 数据卡片组件设计
  - UI_DESIGN.md:5.2.2 - 收益显示组件设计
  - UI_DESIGN.md:5.2.1 - 基金选择器组件设计

  **Acceptance Criteria**:
  - [ ] DataCard 正确渲染卡片样式和阴影
  - [ ] ProfitText 正收益显示绿色 (#52C41A)，负收益显示红色 (#FF4D4F)
  - [ ] FundSelector 输入 6 位数字后显示 Mock 基金信息
  - [ ] FundSelector 输入无效代码时显示错误提示

  **QA Scenarios**:
  ```
  Scenario: ProfitText 颜色条件渲染
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 渲染 ProfitText，value=1000 (正收益)
      2. 断言文字颜色为 #52C41A
      3. 渲染 ProfitText，value=-1000 (负收益)
      4. 断言文字颜色为 #FF4D4F
    Expected Result: 颜色正确区分盈亏
    Failure Indicators: 颜色颠倒或不变
    Evidence: .sisyphus/evidence/task-10-profit-text-color.png

  Scenario: FundSelector 基金代码验证
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 输入 "12345" (5 位)
      2. 移开焦点，检查是否显示错误 "基金代码为 6 位数字"
      3. 输入 "123456" (6 位)
      4. 检查显示 Mock 基金信息 (名称、类型、公司)
    Expected Result: 验证和 Mock 数据正确
    Failure Indicators: 验证失效、Mock 数据不显示
    Evidence: .sisyphus/evidence/task-10-fund-selector-test.png
  ```

  **Evidence to Capture:**
  - [ ] DataCard, ProfitText, FundSelector 源码
  - [ ] 颜色测试截图
  - [ ] 基金选择器测试截图

  **Commit**: YES (groups with 8-9, 11-13)
  - Message: `feat(layout): responsive layout components and routing setup`
  - Files: `frontend/src/components/common/DataCard.tsx`, `frontend/src/components/common/ProfitText.tsx`, `frontend/src/components/common/FundSelector.tsx`, `frontend/src/components/common/index.ts`
  - Pre-commit: `pnpm run lint && pnpm run typecheck`

- [ ] 11. 业务组件 (AccountCard, HoldingTable)

  **What to do**:
  - 创建 src/components/business/AccountCard.tsx:
    - 账户卡片，显示账户名称、总资产、总收益、收益率、基金数量
    - 操作按钮：查看持仓、记录交易、编辑、删除
    - 悬停效果 (上移 + 阴影)
    - 响应式：移动端单列，桌面端 3 列
  - 创建 src/components/business/HoldingTable.tsx:
    - 持仓表格，显示基金名称、份额、成本、市值、收益、收益率
    - 支持排序 (点击表头)
    - 支持分页 (Ant Design Pagination)
    - 操作列：买入、卖出、详情
  - 创建对应的 index.ts 导出

  **Must NOT do**:
  - 不要实现实际的数据获取 (使用 props 传入)
  - 不要实现删除确认对话框 (后续任务处理)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 业务 UI 组件，需要 Ant Design Table 和 Card 组件
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 需要理解表格设计和卡片布局

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-10, 12-13)
  - **Blocks**: Tasks 14-19 (页面需要这些组件)
  - **Blocked By**: Tasks 1-2, 10 (主题、通用组件)

  **References**:
  - Ant Design Table: `https://ant.design/components/table`
  - Ant Design Card: `https://ant.design/components/card`
  - UI_DESIGN.md:4.3.2 - 账户卡片设计
  - UI_DESIGN.md:4.2.2 - 持仓列表表格设计

  **Acceptance Criteria**:
  - [ ] AccountCard 正确显示账户信息
  - [ ] AccountCard 收益颜色根据正负显示绿/红
  - [ ] HoldingTable 正确渲染表格数据
  - [ ] HoldingTable 支持表头排序
  - [ ] HoldingTable 分页正常工作

  **QA Scenarios**:
  ```
  Scenario: AccountCard 渲染和交互
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 渲染 AccountCard，传入 Mock 账户数据
      2. 检查账户名称、资产、收益、收益率显示正确
      3. 悬停卡片，检查上移效果和阴影
      4. 点击 "查看持仓" 按钮，检查触发回调
    Expected Result: 卡片正确渲染和交互
    Failure Indicators: 数据错误、无悬停效果、按钮无响应
    Evidence: .sisyphus/evidence/task-11-account-card-test.gif

  Scenario: HoldingTable 排序和分页
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 渲染 HoldingTable，传入 15 条 Mock 持仓数据
      2. 点击 "收益率" 表头，检查排序 (升序→降序)
      3. 检查分页器显示 "1 / 2"
      4. 点击第 2 页，检查显示第 11-15 条数据
    Expected Result: 排序和分页正常
    Failure Indicators: 排序错误、分页失效
    Evidence: .sisyphus/evidence/task-11-holding-table-test.gif
  ```

  **Evidence to Capture:**
  - [ ] AccountCard, HoldingTable 源码
  - [ ] 卡片悬停效果 GIF
  - [ ] 表格排序分页 GIF

  **Commit**: YES (groups with 8-10, 12-13)
  - Message: `feat(layout): responsive layout components and routing setup`
  - Files: `frontend/src/components/business/AccountCard.tsx`, `frontend/src/components/business/HoldingTable.tsx`, `frontend/src/components/business/index.ts`
  - Pre-commit: `pnpm run lint && pnpm run typecheck`

- [ ] 12. 业务组件 (TransactionForm, NetValueRefresh)

  **What to do**:
  - 创建 src/components/business/TransactionForm.tsx:
    - 交易类型选择 (买入/卖出/分红) - Radio.Group
    - 账户选择 - Select
    - 基金代码输入 (带 FundSelector)
    - 交易日期 - DatePicker
    - 份额、金额、手续费 - InputNumber
    - 备注 - TextArea
    - 表单验证 (必填字段、数值范围、日期有效性)
    - 提交按钮 (loading 状态)
  - 创建 src/components/business/NetValueRefresh.tsx:
    - 显示当前净值
    - 刷新按钮 (loading 状态)
    - 更新时间 tooltip
  - 创建对应的 index.ts 导出

  **Must NOT do**:
  - 不要实现实际的 API 提交 (使用 onSubmit 回调)
  - 不要实现复杂的错误处理 (简单提示即可)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 表单组件开发，需要 Ant Design Form 组件和验证
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 需要理解表单设计和验证逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-11, 13)
  - **Blocks**: Tasks 15, 17 (账户和交易页面需要)
  - **Blocked By**: Tasks 1-2, 10 (主题、通用组件)

  **References**:
  - Ant Design Form: `https://ant.design/components/form`
  - Ant Design InputNumber: `https://ant.design/components/input-number`
  - Ant Design DatePicker: `https://ant.design/components/date-picker`
  - UI_DESIGN.md:4.5.2 - 交易记录表单设计
  - UI_DESIGN.md:5.2.3 - 净值刷新按钮设计

  **Acceptance Criteria**:
  - [ ] TransactionForm 所有字段正确渲染
  - [ ] 表单验证工作 (必填、基金代码 6 位、正数金额)
  - [ ] 提交时触发 onSubmit 回调
  - [ ] NetValueRefresh 显示净值和刷新按钮
  - [ ] 点击刷新触发 onRefresh 回调

  **QA Scenarios**:
  ```
  Scenario: TransactionForm 表单验证
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 打开 TransactionForm
      2. 不填任何字段，点击提交
      3. 检查显示所有必填字段错误提示
      4. 输入基金代码 "12345" (5 位)
      5. 检查显示 "基金代码为 6 位数字" 错误
      6. 输入金额 "-100" (负数)
      7. 检查显示 "金额必须大于 0" 错误
    Expected Result: 所有验证规则生效
    Failure Indicators: 验证未触发、错误信息错误
    Evidence: .sisyphus/evidence/task-12-form-validation.png

  Scenario: TransactionForm 成功提交
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 填写所有必填字段 (有效数据)
      2. 点击提交
      3. 检查按钮显示 loading
      4. 检查触发 onSubmit 回调
      5. 检查表单关闭
    Expected Result: 提交流程正常
    Failure Indicators: 未触发回调、表单未关闭
    Evidence: .sisyphus/evidence/task-12-form-submit.gif
  ```

  **Evidence to Capture:**
  - [ ] TransactionForm, NetValueRefresh 源码
  - [ ] 表单验证截图
  - [ ] 提交流程 GIF

  **Commit**: YES (groups with 8-11, 13)
  - Message: `feat(layout): responsive layout components and routing setup`
  - Files: `frontend/src/components/business/TransactionForm.tsx`, `frontend/src/components/business/NetValueRefresh.tsx`, `frontend/src/components/business/index.ts`
  - Pre-commit: `pnpm run lint && pnpm run typecheck`

- [ ] 13. ECharts 基础组件封装 (BaseChart, PieChart, LineChart)

  **What to do**:
  - 安装 ECharts: `pnpm add echarts`
  - 安装 echarts-for-react: `pnpm add echarts-for-react`
  - 创建 src/components/charts/BaseChart.tsx:
    - 封装 ReactECharts 组件
    - 支持 theme 配置 (与 Ant Design 主题集成)
    - 支持响应式 (notMerge: true)
    - 支持 loading 状态
  - 创建 src/components/charts/PieChart.tsx:
    - 资产配置饼图
    - 支持 dataKey, nameKey
    - 显示百分比标签
  - 创建 src/components/charts/LineChart.tsx:
    - 收益曲线/净值走势折线图
    - 支持时间范围选择
    - 显示 tooltip 和图例
  - 创建对应的 index.ts 导出

  **Must NOT do**:
  - 不要实现复杂的图表交互 (缩放、拖拽)
  - 不要添加过多的图表类型 (MVP 仅饼图和折线图)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 图表组件开发，需要 ECharts 配置和 React 集成
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 需要理解图表设计和数据可视化

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8-12)
  - **Blocks**: Tasks 14, 16, 18 (Dashboard、持仓、分析页面需要)
  - **Blocked By**: Tasks 1-2 (主题配置)

  **References**:
  - ECharts 官方文档：`https://echarts.apache.org/handbook/zh/get-started/`
  - echarts-for-react: `https://github.com/hustcc/echarts-for-react`
  - UI_DESIGN.md:4.2.2 - 资产配置饼图设计
  - UI_DESIGN.md:4.2.2 - 收益趋势折线图设计

  **Acceptance Criteria**:
  - [ ] BaseChart 正确渲染 ECharts
  - [ ] PieChart 显示饼图和百分比
  - [ ] LineChart 显示折线图和 tooltip
  - [ ] 图表响应式 (窗口缩放时自适应)
  - [ ] 图表主题色与 Ant Design 一致

  **QA Scenarios**:
  ```
  Scenario: PieChart 渲染正确
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 渲染 PieChart，传入 Mock 资产配置数据
      2. 检查饼图正确渲染 (扇形、标签、百分比)
      3. 检查颜色使用 Ant Design 色板
    Expected Result: 饼图正确显示
    Failure Indicators: 图表不渲染、标签错误、颜色错误
    Evidence: .sisyphus/evidence/task-13-pie-chart.png

  Scenario: LineChart 交互正常
    Tool: Playwright
    Preconditions: 应用已启动
    Steps:
      1. 渲染 LineChart，传入 Mock 收益曲线数据
      2. 鼠标悬停到折线上
      3. 检查显示 tooltip (日期、数值)
      4. 检查图例可点击切换系列
    Expected Result: 折线图交互正常
    Failure Indicators: tooltip 不显示、图例无效
    Evidence: .sisyphus/evidence/task-13-line-chart.gif
  ```

  **Evidence to Capture:**
  - [ ] BaseChart, PieChart, LineChart 源码
  - [ ] 饼图截图
  - [ ] 折线图交互 GIF

  **Commit**: YES (groups with 8-12)
  - Message: `feat(layout): responsive layout components and routing setup`
  - Files: `frontend/src/components/charts/BaseChart.tsx`, `frontend/src/components/charts/PieChart.tsx`, `frontend/src/components/charts/LineChart.tsx`, `frontend/src/components/charts/index.ts`
  - Pre-commit: `pnpm run lint && pnpm run typecheck`

- [ ] 14-31. Wave 3-5 核心页面、状态管理、测试任务 (详见完整计划)

  **Wave 3 (Tasks 14-19)**: 6 个核心页面开发
  - Task 14: Dashboard 页面 — 资产总览 + 持仓列表 + 图表
  - Task 15: Accounts 页面 — 账户 CRUD + 账户卡片列表
  - Task 16: Holdings 页面 — 持仓详情 + 净值走势图表
  - Task 17: Transactions 页面 — 交易记录 + 筛选 + 分页 + 表单
  - Task 18: Analytics 页面 — 收益曲线 + 资产配置 + 收益排名
  - Task 19: Settings 页面 — 数据管理 + Tushare 配置 + 显示设置

  **Wave 4 (Tasks 20-25)**: 状态管理 + API 集成
  - Task 20: Zustand Stores (accountStore, holdingStore, transactionStore)
  - Task 21: React Query hooks (useAccounts, useHoldings, useTransactions)
  - Task 22: API Service 层 (services/*.ts)
  - Task 23: MSW Mock handlers 完善
  - Task 24: 表单验证 (Zod schemas) + 错误处理
  - Task 25: 响应式优化 + 移动端适配

  **Wave 5 (Tasks 26-31)**: 测试 + 优化
  - Task 26: 组件测试补充 (覆盖率 70%+)
  - Task 27: 工具函数测试完善
  - Task 28: 图表测试 (数据转换逻辑)
  - Task 29: 性能优化 (懒加载、虚拟滚动)
  - Task 30: Lighthouse 优化
  - Task 31: 文档完善 (README, component stories)

  **Final Wave (Tasks F1-F4)**: 独立 Review
  - F1: Plan compliance audit (oracle)
  - F2: Code quality review (unspecified-high)
  - F3: Real manual QA (unspecified-high + playwright)
  - F4: Scope fidelity check (deep)

  完整任务详情已在计划框架中定义，执行时将展开每个任务的详细步骤、QA 场景和验收标准。

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(frontend): project initialization with Vite + React + TypeScript` — 7 files
- **Wave 2**: `feat(layout): responsive layout components and routing setup` — 5 files
- **Wave 3**: `feat(pages): core pages implementation (Dashboard, Accounts, Holdings, Transactions, Analytics, Settings)` — 6 files
- **Wave 4**: `feat(state): Zustand stores + React Query hooks + API services` — 8 files
- **Wave 5**: `test(frontend): component tests + utility tests + performance optimization` — 10 files
- **Final**: `chore: final QA and documentation` — 3 files

---

## Success Criteria

### Verification Commands
```bash
cd frontend && bun install                          # Expected: Dependencies installed successfully
cd frontend && bun run dev                          # Expected: Dev server starts on http://localhost:5173
cd frontend && bun run test                         # Expected: All tests pass (70%+ coverage)
cd frontend && bun run build                        # Expected: Production build succeeds
cd frontend && bun run lint                         # Expected: No lint errors
cd frontend && bun run typecheck                    # Expected: No TypeScript errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass (>70% coverage)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Responsive at 375px, 768px, 1024px, 1440px breakpoints
- [ ] Profit/loss calculations accurate (verified against PRD formulas)
- [ ] All form validations working (fund code, amounts, dates)
- [ ] Charts render correctly with mock data
- [ ] No `any` types or `@ts-ignore` in codebase
