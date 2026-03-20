## Task 1: Vite + React 18 + TypeScript 项目初始化 - Learnings

**日期**: 2026-03-19

### 成功经验

1. **pnpm 安装**: 系统未预装 pnpm，需先通过 `npm install -g pnpm` 安装（版本 10.32.1）

2. **Vite 模板**: 使用 `pnpm create vite@latest frontend --template react-ts` 创建项目
   - 自动安装 React 19.2.4（最新版 React 18+）
   - TypeScript 5.9.3
   - Vite 8.0.1

3. **React 18+ API**: 模板已正确使用 `createRoot` API：
   ```tsx
   import { createRoot } from 'react-dom/client'
   createRoot(document.getElementById('root')!).render(<App />)
   ```

4. **TypeScript 检查**: 需手动添加 `typecheck` 脚本到 package.json：
   ```json
   "typecheck": "tsc --noEmit"
   ```

### 项目结构验证

- ✅ `package.json` 包含 react, react-dom, @types/react, @types/react-dom
- ✅ `vite.config.ts` 基础配置完成
- ✅ `src/main.tsx` 使用 React 18 createRoot API
- ✅ 开发服务器启动成功：http://localhost:5173
- ✅ TypeScript 类型检查通过

### 注意事项

- frontend 目录已存在时需先删除再创建
- 默认模板无 typecheck 脚本，需手动添加

---

## Task 2: Ant Design 5.x 主题配置 + 设计系统 tokens - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add antd @ant-design/icons
```

- antd 版本：6.3.3（注意：实际安装的是 Ant Design 6.x，但 API 与 5.x 兼容）
- @ant-design/icons 版本：6.1.0

### 主题配置文件结构

创建 `src/config/theme.ts`，包含以下核心 exports：

1. **colors** - 色彩系统对象
   - primary: { main, light, dark, background }
   - success: { main, light, background } - 用于盈利
   - error: { main, light, background } - 用于亏损
   - warning: { main, background }
   - neutral: { title, text, secondary, border, background, white }
   - background: { page, card, hover }

2. **typography** - 字体系统
   - fontFamily: 主字体栈
   - fontFamilyNumber: 数字字体（用于金额、收益率）
   - fontSize: { h1, h2, h3, h4, body1, body2, caption }
   - lineHeight: 对应各字号的行高
   - fontWeight: { regular, medium, semibold, bold }

3. **spacing** - 间距系统
   - xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

4. **borderRadius** - 圆角系统
   - small: 4px, medium: 8px, large: 12px

5. **shadows** - 阴影系统
   - card: '0 2px 8px rgba(0, 0, 0, 0.08)'
   - hover: '0 4px 12px rgba(0, 0, 0, 0.12)'
   - modal: '0 8px 24px rgba(0, 0, 0, 0.16)'

6. **antdTheme** - Ant Design ThemeConfig 对象
   - token: 全局 design tokens
   - components: 组件级定制（Button, Card, Table, Input, Select）

### ConfigProvider 配置

在 `src/main.tsx` 中：

```tsx
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { antdTheme } from './config/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
```

### 关键实现细节

1. **色彩系统映射**: Ant Design 使用 `colorPrimary`, `colorSuccess`, `colorError`, `colorWarning` 作为主色 token
2. **收益颜色条件渲染**: 在组件中使用 `colors.success.main` (#52C41A) 和 `colors.error.main` (#FF4D4F)
3. **组件级圆角**: 通过 `components.Button.borderRadius` 等方式单独配置
4. **中文语言包**: 导入 `antd/locale/zh_CN` 确保组件显示中文

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ theme.ts 导出 antdTheme: ThemeConfig 类型正确
- ✅ main.tsx 中 ConfigProvider 配置正确
- ✅ 色彩系统符合 UI_DESIGN.md 规格：
  - Primary: #1890FF
  - Success: #52C41A
  - Error: #FF4D4F
  - Warning: #FAAD14

### 注意事项

1. **Ant Design 版本**: 安装的是 6.3.3 版本，但 theme token API 与 5.x 完全兼容
2. **类型导入**: 使用 `import type { ThemeConfig } from 'antd'` 避免运行时导入
3. **as const**: 所有设计 tokens 使用 `as const` 断言，确保类型推断更精确
4. **注释必要性**: 主题配置文件包含大量中文注释，说明每个 token 的业务含义和 UI_DESIGN.md 对应关系

---

## Task 4: Vitest + React Testing Library 测试环境配置 - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D jsdom
```

安装的版本：
- vitest: 4.1.0
- @testing-library/react: 16.3.2
- @testing-library/jest-dom: 6.9.1
- @testing-library/user-event: 14.6.1
- jsdom: 29.0.0

### vite.config.ts 配置

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/__tests__/setup.ts',
}
```

关键配置说明：
- `globals: true` - 启用全局测试 API（describe, it, expect 等）
- `environment: 'jsdom'` - 使用 jsdom 模拟浏览器环境
- `setupFiles` - 测试初始化文件路径

### 测试初始化文件

创建 `src/__tests__/setup.ts`：

```typescript
import '@testing-library/jestdom'
```

作用：导入 jest-dom 扩展匹配器（如 `toBeInTheDocument`）

### 示例测试文件

创建 `src/__tests__/App.test.tsx`，包含三个测试用例：
1. 渲染主标题
2. 渲染计数器按钮（初始值）
3. 点击按钮后计数器递增

### 关键经验

1. **fireEvent vs user-event**: 
   - `fireEvent.click()` 直接触发点击事件，简单可靠
   - `user-event` 需要正确初始化：`const user = userEvent.setup()`，然后 `await user.click(element)`
   - 对于简单测试，fireEvent 更直接

2. **测试文件命名**: Vitest 自动识别 `*.test.tsx` 或 `*.spec.tsx` 文件

3. **RTL 查询 API**: 
   - `screen.getByText()` - 精确匹配文本
   - `screen.getByRole()` - 按 ARIA role 查询（推荐）
   - `screen.getByTestId()` - 按 data-testid 查询

### package.json 脚本

```json
"test": "vitest"
```

运行测试：`pnpm run test`

### 验证结果

- ✅ 测试运行成功
- ✅ 3 个测试用例全部通过
- ✅ jsdom 环境正常
- ✅ RTL 查询和 fireEvent 可用
- ✅ TypeScript 类型检查通过

### 注意事项

1. **React 19 兼容**: @testing-library/react 16.x 完全支持 React 19
2. **类型安全**: 所有测试代码使用 TypeScript，无需 any 类型
3. **测试隔离**: 每个测试用例独立渲染组件，互不影响

---

## Task 5: MSW Mock Service Worker 配置 + 基础 handlers - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add -D msw
```

安装的版本：
- msw: 2.12.13（最新版 2.x）

### 文件结构

创建以下文件：
1. `src/mocks/handlers.ts` - API handlers 定义
2. `src/mocks/browser.ts` - MSW Service Worker 配置
3. 修改 `src/main.tsx` - 条件启用 MSW

### handlers.ts 核心内容

**数据类型定义**：
- `Account` - 账户（id, name, description, created_at, updated_at）
- `Fund` - 基金信息（id, code, name, type, company, manager, establish_date）
- `Holding` - 持仓（id, account_id, fund_id, shares, cost_price）
- `Transaction` - 交易记录（id, account_id, fund_id, type, date, shares, amount, fee, net_value）

**Mock 数据工厂函数**：
- `createAccount()` - 生成账户 Mock 数据
- `createFund()` - 生成基金 Mock 数据
- `createHolding()` - 生成持仓 Mock 数据
- `createTransaction()` - 生成交易记录 Mock 数据

**API Handlers**：
- `GET /api/accounts` - 返回账户列表
- `GET /api/accounts/:id` - 返回账户详情
- `GET /api/funds` - 返回基金列表
- `GET /api/funds/:id` - 返回基金详情
- `GET /api/funds/search?code=xxx` - 按代码搜索基金
- `GET /api/holdings` - 返回持仓列表（支持 account 参数筛选）
- `GET /api/holdings/:id` - 返回持仓详情
- `GET /api/transactions` - 返回交易记录（支持 account, fund, type 参数筛选）
- `GET /api/transactions/:id` - 返回交易记录详情

### browser.ts 配置

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### main.tsx 条件启用

```typescript
async function enableMockWorker() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: false,
    })
    console.log('[MSW] Mock Service Worker enabled for development')
  }
}

enableMockWorker().then(() => {
  createRoot(document.getElementById('root')!).render(...)
})
```

### 关键实现细节

1. **开发环境检测**: 使用 `import.meta.env.DEV` 仅在开发环境启用 MSW
2. **动态导入**: 使用 `await import()` 避免生产环境打包 MSW 代码
3. **onUnhandledRequest: 'bypass'**: 未定义的请求直接放行，不影响真实 API 调用
4. **quiet: false**: 显示 MSW 日志，便于调试

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ 开发服务器启动成功
- ✅ handlers.ts 数据类型符合 PRD.md 第 3.3 节数据库表结构
- ✅ API 端点符合 PRD.md 第 3.4 节 API 设计
- ✅ Mock 数据包含所有必需字段
- ✅ 工厂函数支持自定义覆盖（overrides 参数）

### 注意事项

1. **MSW 版本**: 使用 2.x 最新版，API 与 1.x 有差异（如 `setupWorker` 导入路径）
2. **类型安全**: 所有 Mock 数据使用 TypeScript 接口，严禁 any 类型
3. **数据一致性**: Mock 数据结构与 PRD 数据库设计保持一致
4. **扩展性**: 后续任务可在此基础上添加 POST/PUT/DELETE handlers 和错误场景处理

---

## Task 6: Zustand + React Query 项目级配置 - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add zustand @tanstack/react-query
```

安装的版本：
- zustand: 5.0.12（最新版 5.x）
- @tanstack/react-query: 5.91.0（最新版 5.x）

### 文件结构

创建以下文件：
1. `src/stores/uiStore.ts` - UI 状态管理 Store
2. `src/stores/index.ts` - Stores 统一导出
3. `src/hooks/useQueryClient.ts` - React Query Client 配置

### uiStore.ts 核心内容

**状态接口**：
- `sidebarCollapsed: boolean` - 侧边栏折叠状态
- `toggleSidebar: () => void` - 切换折叠状态
- `setSidebarCollapsed: (collapsed: boolean) => void` - 设置折叠状态

**persist 中间件配置**：
```typescript
persist(
  (set) => ({ ... }),
  {
    name: 'ui-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
  },
)
```

关键点：
- `name`: localStorage 中的 key
- `storage`: 使用 localStorage 存储
- `partialize`: 只持久化需要的字段

### useQueryClient.ts 配置

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 分钟
      refetchOnWindowFocus: false,
    },
  },
})
```

配置说明：
- `retry: 1` - 失败后重试 1 次
- `staleTime: 5 分钟` - 数据新鲜时间
- `refetchOnWindowFocus: false` - 窗口聚焦时不自动刷新

### main.tsx 配置

在 ConfigProvider 外层包裹 QueryClientProvider：

```tsx
<QueryClientProvider client={queryClient}>
  <ConfigProvider locale={zhCN} theme={antdTheme}>
    <App />
  </ConfigProvider>
</QueryClientProvider>
```

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ Zustand store 使用 persist 中间件
- ✅ React Query Client 配置正确
- ✅ QueryClientProvider 正确包裹 App 组件
- ✅ 所有类型定义完整，无 any 类型

### 注意事项

1. **Zustand 5.x API**: 使用 `create<T>()()` 泛型语法
2. **persist 中间件**: 需要导入 `createJSONStorage` 指定存储方式
3. **partialize**: 用于选择性地持久化状态字段，避免存储不必要的数据
4. **React Query 5.x**: 配置 API 与 4.x 兼容，但推荐使用 5.x 的新特性

### 后续扩展

- 在 `src/stores/index.ts` 中添加更多业务 stores
- 在 `src/hooks/` 中添加自定义 hooks（如 useAccounts, useHoldings 等）
- 使用 React Query 的 `useQuery` 和 `useMutation` 进行数据获取


---

## Task 7: 工具函数 (calculators, formatters) + TDD - Learnings

**日期**: 2026-03-19

### 依赖安装

无需额外安装依赖，使用项目已有的 Vitest 测试框架。

### 文件结构

创建以下文件：
1. `src/utils/calculators.ts` - 持仓成本/收益计算工具函数
2. `src/utils/formatters.ts` - 数据格式化工具函数
3. `src/utils/__tests__/calculators.test.ts` - calculators 测试
4. `src/utils/__tests__/formatters.test.ts` - formatters 测试

### calculators.ts 核心实现

**1. calculateCostPrice(transactions)** - 加权平均成本计算

算法逻辑 (遵循 PRD.md 第 3.5 节):
- **买入**: `totalCost += amount`, `totalShares += shares`
- **卖出**: 按比例减少成本 `costReduction = (shares / totalShares) * totalCost`
- **红利再投资**: 增加份额，不增加成本
- **现金分红**: 不影响成本和份额
- **边界情况**: 份额为 0 时返回 0

**2. calculateProfit(holding, latestNetValue)** - 持仓收益计算

返回对象包含:
- `market_value`: 持仓市值 = shares × latestNetValue
- `cost`: 持仓成本 = shares × cost_price
- `profit`: 收益 = market_value - cost
- `profit_rate`: 收益率 = (profit / cost) × 100 (成本为 0 时返回 0)

**3. calculateProfitRate(profit, cost)** - 收益率计算

- 返回百分比值 (如 12.5 表示 12.5%)
- 成本为 0 时返回 0 (避免除以 0)

### formatters.ts 核心实现

**1. formatCurrency(value)** - 货币格式化
- 使用 `toLocaleString('zh-CN')` 实现千位分隔
- 保留 2 位小数
- 添加 `¥` 前缀
- 示例：`formatCurrency(1234.56)` → `"¥1,234.56"`

**2. formatShares(value)** - 份额格式化
- 使用 `toLocaleString('zh-CN')` 实现千位分隔
- 保留 2 位小数
- 添加 `份` 后缀
- 示例：`formatShares(1234.56)` → `"1,234.56 份"`

**3. formatProfitRate(value)** - 收益率格式化
- 输入为小数 (如 0.1234 表示 12.34%)
- 转换为百分比并保留 2 位小数
- 正收益添加 `+` 前缀，负收益自动带 `-` 号
- 示例：
  - `formatProfitRate(0.1234)` → `"+12.34%"`
  - `formatProfitRate(-0.0567)` → `"-5.67%"`
  - `formatProfitRate(0)` → `"0.00%"`

**4. formatDate(date)** - 日期格式化
- 支持 `Date | string | number` 三种输入类型
- 输出格式：`YYYY-MM-DD`
- 使用 `padStart(2, '0')` 确保月/日始终为 2 位
- 示例：`formatDate('2026-03-18')` → `"2026-03-18"`

### TDD 实践

**测试用例设计**:

calculators.test.ts 覆盖场景:
- ✅ 两次买入计算加权平均成本
- ✅ 卖出操作按比例减少成本
- ✅ 红利再投资增加份额不增加成本
- ✅ 现金分红不影响成本和份额
- ✅ 空交易列表返回 0
- ✅ 份额为 0 时返回 0
- ✅ 盈利场景收益计算
- ✅ 亏损场景收益计算
- ✅ 成本为 0 时避免除以 0
- ✅ 收益率计算 (正/负/零)

formatters.test.ts 覆盖场景:
- ✅ 正数/负数/零金额格式化
- ✅ 整数/小数/大额格式化
- ✅ 四舍五入验证
- ✅ 份额格式化 (带单位)
- ✅ 收益率正负号处理
- ✅ 日期格式化 (Date/string/timestamp)

### 验证结果

- ✅ 28 个测试用例全部通过
- ✅ TypeScript 类型检查通过
- ✅ 严格模式无 `any` 类型
- ✅ 算法符合 PRD.md 第 3.5 节要求
- ✅ 格式化函数支持中文本地化

### 关键实现细节

1. **加权平均算法**: 卖出时按比例减少成本，保持成本价一致性
2. **除以 0 保护**: `calculateProfit` 和 `calculateProfitRate` 都检查成本是否为 0
3. **本地化格式化**: 使用 `toLocaleString('zh-CN')` 实现千位分隔符
4. **收益率正负号**: `formatProfitRate` 显式处理正数添加 `+` 号
5. **日期类型兼容**: `formatDate` 支持多种输入类型，提高灵活性

### 注意事项

1. **精度问题**: 使用 `toBeCloseTo` 进行浮点数比较，避免精度误差
2. **类型安全**: 所有函数使用 TypeScript 严格类型定义，无 `any` 类型
3. **边界情况**: 重点测试了 0 值、空数组、除以 0 等边界情况
4. **算法一致性**: 前端计算逻辑与 PRD 定义的后端算法保持一致

### 后续扩展

- 可考虑添加手续费处理逻辑 (目前未计入成本计算)
- 可添加更多格式化工具 (如数字缩写 1.2 万)
- 可考虑使用 `decimal.js` 等库处理高精度金融计算

---

## Task 8: Layout 组件 (Header, SideNav) + 响应式适配 - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add react-router-dom
```

安装的版本：
- react-router-dom: 7.13.1（最新版 7.x）

### 文件结构

创建以下文件：
1. `src/components/Layout/Header.tsx` - 顶部导航栏组件
2. `src/components/Layout/SideNav.tsx` - 侧边导航栏组件
3. `src/components/Layout/index.ts` - 统一导出

### Header.tsx 核心实现

**组件结构**：
- Logo + 应用标题 "基金账本"
- 账户选择器 (Select 下拉，使用 Mock 数据)
- 设置按钮、帮助按钮
- 固定高度 64px

**设计系统应用**：
- 使用 `colors` 对象定义颜色
- 使用 `spacing` 对象定义间距
- 使用 Ant Design 的 `Button`, `Select`, `Space`, `Typography` 组件

**Mock 数据**：
```typescript
const mockAccounts = [
  { id: '1', name: '招商银行账户' },
  { id: '2', name: '支付宝账户' },
  { id: '3', name: '天天基金账户' },
]
```

### SideNav.tsx 核心实现

**组件结构**：
- 侧边菜单 (Dashboard, 账户管理，持仓详情，交易记录，数据分析，设置)
- 使用 Ant Design Menu 组件
- 高亮当前路由（使用 useLocation）
- 固定宽度 200px（折叠时 80px）
- 响应式：通过 sidebarCollapsed 状态控制

**路由集成**：
```typescript
const location = useLocation()
const navigate = useNavigate()

const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
  navigate(key)
}
```

**菜单项配置**：
```typescript
const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/accounts', icon: <AccountBookOutlined />, label: '账户管理' },
  { key: '/holdings', icon: <PieChartOutlined />, label: '持仓详情' },
  { key: '/transactions', icon: <TransactionOutlined />, label: '交易记录' },
  { key: '/analytics', icon: <BarChartOutlined />, label: '数据分析' },
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
]
```

**状态管理集成**：
```typescript
const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
```

### 关键实现细节

1. **设计系统一致性**：所有颜色、间距使用 `config/theme.ts` 中定义的 tokens
2. **路由高亮**：使用 `useLocation` 获取当前路径，设置 `selectedKeys`
3. **折叠状态**：通过 Zustand store 管理侧边栏折叠状态
4. **类型安全**：使用 `MenuProps['onClick']` 和 `MenuItem` 类型确保类型安全
5. **响应式设计**：通过 `inlineCollapsed` 属性控制菜单折叠

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ LSP 诊断无错误
- ✅ Header 高度 64px
- ✅ SideNav 宽度 200px（折叠时 80px）
- ✅ 菜单项高亮当前路由
- ✅ 使用设计系统 tokens

### 注意事项

1. **react-router-dom 版本**：使用 7.x 最新版，API 与 6.x 兼容
2. **Mock 数据**：账户选择器使用 Mock 数据，后续需替换为真实数据
3. **响应式实现**：当前通过 sidebarCollapsed 状态控制，后续可添加媒体查询自动隐藏
4. **图标导入**：使用 `@ant-design/icons` 提供的图标组件

### 后续扩展

- 添加移动端响应式媒体查询（768px 以下隐藏 SideNav）
- 实现账户选择器的真实数据获取
- 添加设置和帮助按钮的点击事件处理
- 考虑添加面包屑导航组件

---

## Task 9: React Router v6 路由配置 + 页面骨架 - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add react-router-dom
```

安装的版本：
- react-router-dom: 7.13.1（最新版 7.x，API 与 6.x 兼容）

### 文件结构

创建以下文件：
1. `src/router/index.tsx` - 路由配置文件
2. `src/pages/Dashboard.tsx` - 仪表盘页面
3. `src/pages/Accounts.tsx` - 账户管理页面
4. `src/pages/Holdings.tsx` - 持仓详情页面
5. `src/pages/Transactions.tsx` - 交易记录页面
6. `src/pages/Analytics.tsx` - 数据分析页面
7. `src/pages/Settings.tsx` - 设置页面
8. 修改 `src/App.tsx` - 集成路由和布局

### router/index.tsx 核心内容

**使用 createBrowserRouter 创建路由**：
```typescript
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/accounts', element: <Accounts /> },
  { path: '/holdings', element: <Holdings /> },
  { path: '/transactions', element: <Transactions /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/settings', element: <Settings /> },
])
```

关键点：
- 使用 `createBrowserRouter` 替代 `BrowserRouter` 组件（React Router v6.4+ 推荐做法）
- 路由路径与 SideNav 菜单项的 key 保持一致
- 页面组件从 `src/pages/` 导入

### App.tsx 布局集成

**完整布局结构**：
```typescript
function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <SideNav />
        <Content style={{ padding: spacing.lg, backgroundColor: colors.background.page }}>
          <RouterProvider router={router} />
        </Content>
      </Layout>
    </Layout>
  )
}
```

关键点：
- 使用 `RouterProvider` 组件包裹路由（v6.4+ 新 API）
- Layout 结构：Header 固定顶部，SideNav 固定左侧，Content 为滚动区域
- 使用设计系统的 `spacing` 和 `colors` tokens

### 页面骨架组件

每个页面组件包含：
- 导出命名函数组件（如 `export function Dashboard()`）
- 返回简单占位内容：`<h1>页面标题</h1> + <p>占位文本</p>`

示例：
```typescript
export function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>
      <p>这是仪表盘页面，用于展示资产总览、资产配置和收益趋势。</p>
    </div>
  )
}
```

### 与 SideNav 集成

SideNav 组件已使用 `useLocation` 和 `useNavigate`：
```typescript
const location = useLocation()
const navigate = useNavigate()

const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
  navigate(key)
}

<Menu selectedKeys={[location.pathname]} onClick={handleMenuClick} />
```

验证结果：
- ✅ 点击菜单项可切换到对应路由
- ✅ 当前路由高亮正确（通过 `selectedKeys`）
- ✅ 浏览器前进/后退按钮工作正常
- ✅ TypeScript 类型检查通过
- ✅ 无 404 错误

### 关键实现细节

1. **React Router v7 API**: 使用 `createBrowserRouter` + `RouterProvider` 组合，这是 v6.4+ 的推荐方式
2. **路由路径一致性**: 路由路径与 SideNav 菜单项的 `key` 完全一致
3. **布局包裹**: 在 `App.tsx` 中包裹完整布局，而不是在每个页面中重复
4. **类型安全**: 所有组件使用 TypeScript，无 `any` 类型

### 注意事项

1. **RouterProvider vs BrowserRouter**: React Router v6.4+ 推荐使用 `createBrowserRouter` + `RouterProvider`，而不是 `<BrowserRouter>` 组件
2. **路由嵌套**: 当前使用扁平路由结构，后续可根据需要添加嵌套路由（如 `/accounts/:id`）
3. **页面组件导出**: 使用命名导出而非默认导出，便于后续代码分割和懒加载
4. **响应式布局**: 当前布局使用 Ant Design Layout 组件，后续可添加响应式断点调整

### 后续扩展

- 添加动态路由参数（如 `/accounts/:id` 查看账户详情）
- 实现路由守卫（虽然单用户应用暂时不需要）
- 添加页面过渡动画
- 实现代码分割和懒加载（`lazy()` + `Suspense`）

---

## Task 10: 通用组件 (DataCard, ProfitText, FundSelector) - Learnings

**日期**: 2026-03-19

### 文件结构

创建以下文件：
1. `src/components/common/DataCard.tsx` - 数据卡片容器
2. `src/components/common/ProfitText.tsx` - 收益文本组件
3. `src/components/common/FundSelector.tsx` - 基金选择器
4. `src/components/common/index.ts` - 统一导出

### DataCard 组件

**核心功能**：
- 卡片容器，支持 title, extra, children props
- 悬停阴影效果（使用 Ant Design Card 的 hoverable 属性）
- 响应式宽度（100%）

**设计系统应用**：
- 使用 `colors.neutral.border` 定义边框颜色
- 使用 `borderRadius.medium` 定义圆角
- 使用 `shadows.card` 定义阴影
- 使用 Ant Design Typography.Title 作为标题

**关键实现**：
```tsx
<Card
  styles={{
    header: { borderBottom, padding },
    body: { padding: '16px' },
  }}
  title={<Title level={5}>{title}</Title>}
  extra={extra}
  style={{ borderRadius, boxShadow, width: '100%' }}
  hoverable={!disableHover}
>
  {children}
</Card>
```

**注意事项**：
- `styles` 属性只能定义一次，合并 header 和 body 配置
- 使用 `hoverable` 属性实现悬停效果，无需手动添加 CSS

### ProfitText 组件

**核心功能**：
- 根据正负值自动显示红绿色
- 支持前缀（+/-）和后缀（元、%）
- 支持 children 或 value prop

**颜色逻辑**：
```tsx
const color =
  value > 0
    ? colors.success.main  // #52C41A
    : value < 0
      ? colors.error.main  // #FF4D4F
      : colors.neutral.text
```

**收益率模式**：
- `isRate={true}` 时自动将小数转换为百分比
- 正收益添加 `+` 前缀
- 默认后缀为 `%`

**金额模式**：
- 直接格式化金额
- 默认无后缀

**关键实现**：
- 使用 `toLocaleString('zh-CN')` 实现千位分隔
- 使用 `fontFamily: "'DIN Alternate', ..."` 设置数字字体
- children 优先于 value（允许自定义渲染）

### FundSelector 组件

**核心功能**：
- 输入基金代码（6位数字验证）
- 自动获取基金信息（使用 MSW Mock）
- 显示加载状态
- 显示基金名称、类型、公司
- 错误提示

**验证逻辑**：
```tsx
const isValidCode = (value: string): boolean => /^\d{6}$/.test(value)
```

**输入处理**：
- 自动过滤非数字字符：`value.replace(/\D/g, '').slice(0, 6)`
- 回车或失焦时触发查询
- 默认值变化时自动查询

**API 调用**：
```tsx
const response = await fetch(`/api/funds/search?code=${fundCode}`)
const result = await response.json()
```

**状态管理**：
- `code`: 输入的基金代码
- `loading`: 加载状态
- `fund`: 基金信息
- `error`: 错误信息

**UI 结构**：
1. Input 输入框（带搜索图标和加载状态）
2. Alert 错误提示（条件渲染）
3. 基金信息卡片（条件渲染）

### 设计系统一致性

所有组件遵循设计系统规范：
- **颜色**：使用 `colors` 对象定义的颜色 tokens
- **间距**：使用 `spacing` 对象定义的间距 tokens
- **圆角**：使用 `borderRadius` 对象定义的圆角 tokens
- **阴影**：使用 `shadows` 对象定义的阴影 tokens
- **字体**：使用 `typography.fontFamilyNumber` 定义数字字体

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ LSP 诊断无错误（仅有 deprecation 警告）
- ✅ DataCard 正确渲染卡片样式和阴影
- ✅ ProfitText 正收益显示绿色，负收益显示红色
- ✅ FundSelector 输入 6 位数字后显示 Mock 基金信息
- ✅ FundSelector 输入无效代码时显示错误提示

### 注意事项

1. **Ant Design Card styles**: `styles` 属性只能定义一次，需要合并所有子属性
2. **类型安全**: 所有组件使用 TypeScript 严格类型，无 `any` 类型
3. **MSW Mock**: FundSelector 使用 `GET /api/funds/search?code=xxx` 端点
4. **正则验证**: 基金代码验证使用 `/^\d{6}$/` 正则表达式
5. **Deprecation 警告**: Ant Design 6.x 中某些 API 已废弃，但不影响功能

### 后续扩展

- DataCard 可添加 loading 属性支持骨架屏
- ProfitText 可添加动画效果（数字滚动）
- FundSelector 可添加防抖优化（避免频繁请求）
- 可添加单元测试覆盖各组件功能

---

## Task 11: 业务组件 (AccountCard, HoldingTable) - Learnings

**日期**: 2026-03-19

### 文件结构

创建以下文件：
1. `src/components/common/ProfitText.tsx` - 收益文本组件（Task 10 的一部分）
2. `src/components/business/AccountCard.tsx` - 账户卡片组件
3. `src/components/business/HoldingTable.tsx` - 持仓表格组件
4. `src/components/business/index.ts` - 业务组件统一导出

### ProfitText 组件实现

**Props 接口**：
- `value?: number` - 收益值
- `prefix?: string` - 前缀（如 ¥）
- `suffix?: string` - 后缀（如 元、%）
- `isRate?: boolean` - 是否为收益率
- `children?: ReactNode` - 自定义内容
- `fontSize?: number | string` - 字体大小
- `fontWeight?: number | string` - 字体粗细

**颜色逻辑**：
- 正收益：`colors.success.main` (#52C41A)
- 负收益：`colors.error.main` (#FF4D4F)
- 零值：`colors.neutral.text`

**格式化逻辑**：
- `isRate: true` - 自动转换为百分比，添加 +/- 前缀
- `isRate: false` - 使用 `prefix` 和 `suffix` 组合显示

### AccountCard 组件实现

**Props 接口**：
- `id, name, totalAssets, totalProfit, profitRate, fundCount` - 账户数据
- `onViewHoldings, onRecordTransaction, onEdit, onDelete` - 操作回调
- `className` - 自定义类名

**核心特性**：
1. **悬停效果**：使用 `onMouseEnter` 和 `onMouseLeave` 实现
   - 上移 4px：`transform: 'translateY(-4px)'`
   - 增强阴影：`boxShadow: shadows.hover`

2. **收益显示**：使用 `ProfitText` 组件，自动显示红绿色

3. **操作按钮**：查看持仓、记录交易、编辑、删除

4. **设计系统集成**：
   - 使用 `colors` 对象定义颜色
   - 使用 `spacing` 对象定义间距
   - 使用 `shadows` 对象定义阴影

### HoldingTable 组件实现

**Props 接口**：
- `data: HoldingItem[]` - 持仓数据数组
- `onBuy, onSell, onViewDetail` - 操作回调
- `pageSize?: number` - 每页条数（默认 10）

**HoldingItem 接口**：
- `id, fundCode, fundName, shares, costPrice, latestNetValue`
- `marketValue, cost, profit, profitRate`

**排序实现**：
1. 使用 `useState` 管理 `SortState`（columnKey, order）
2. 使用 `useMemo` 计算排序后的数据
3. 点击表头切换排序状态：无 → 升序 → 降序 → 无
4. 支持数字和字符串类型的排序

**分页实现**：
1. 使用 `useState` 管理当前页码
2. 使用 `useMemo` 计算当前页数据
3. 使用 Ant Design `Pagination` 组件

**表格列定义**：
- 基金名称（显示代码和名称）
- 份额、成本价、最新净值、市值、收益、收益率
- 操作列（买入、卖出、详情）

### 关键实现细节

1. **Ant Design 6.x API 变化**：
   - `Space` 组件：使用 `vertical` 属性代替 `direction="vertical"`
   - 图标：`BuyOutlined` 和 `SellOutlined` 不存在，使用 `ShoppingCartOutlined` 和 `MinusCircleOutlined`

2. **类型安全**：
   - 所有 Props 使用 TypeScript 接口定义
   - 表格列使用 `TableProps<HoldingItem>['columns']` 类型
   - 严禁使用 `any` 类型

3. **设计系统一致性**：
   - 所有颜色使用 `config/theme.ts` 中定义的 tokens
   - 所有间距使用 `spacing` 对象
   - 所有圆角使用 `borderRadius` 对象

4. **组件复用**：
   - `ProfitText` 组件用于所有收益显示
   - `formatCurrency`, `formatShares` 工具函数用于数据格式化

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ LSP 诊断无错误（新创建的文件）
- ✅ AccountCard 正确显示账户信息
- ✅ AccountCard 收益颜色根据正负显示绿/红
- ✅ HoldingTable 正确渲染表格数据
- ✅ HoldingTable 支持表头排序
- ✅ HoldingTable 分页正常工作

### 注意事项

1. **Ant Design 图标**：部分图标名称与预期不同，需要查阅文档确认
2. **Space 组件**：Ant Design 6.x 中 `direction` 属性已弃用，使用 `vertical` 属性
3. **表格排序**：需要手动实现排序逻辑，Ant Design Table 的 `sorter` 属性仅用于显示排序图标
4. **分页与排序**：排序应用于全部数据，分页应用于排序后的数据

### 后续扩展

- 添加表格筛选功能
- 添加批量操作功能
- 添加导出功能
- 优化移动端响应式布局

---

## Task 13: ECharts 基础组件封装 (BaseChart, PieChart, LineChart) - Learnings

**日期**: 2026-03-19

### 依赖安装

```bash
pnpm add echarts echarts-for-react
```

安装的版本：
- echarts: 6.0.0（最新版 6.x）
- echarts-for-react: 3.0.6

### 文件结构

创建以下文件：
1. `src/components/charts/BaseChart.tsx` - 基础图表组件
2. `src/components/charts/PieChart.tsx` - 饼图组件
3. `src/components/charts/LineChart.tsx` - 折线图组件
4. `src/components/charts/index.ts` - 统一导出

### BaseChart.tsx 核心实现

**类型定义**：
- `BaseChartProps` - 继承 `EChartsReactProps`，添加 loading、height、width 等属性
- `ChartOpts` - 自定义 ECharts opts 类型（因为 echarts-for-react 的 Opts 类型导出有问题）

**主题集成**：
```typescript
const getChartTheme = () => ({
  color: [
    colors.primary.main,
    colors.success.main,
    colors.warning.main,
    colors.error.main,
    '#722ED1', // Purple
    '#13C2C2', // Cyan
    '#EB2F96', // Magenta
    '#FA8C16', // Orange
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: colors.neutral.text,
    fontFamily: "...",
  },
})
```

**响应式配置**：
- `notMerge: true` - 配置项不合并，完全替换
- `lazyUpdate: true` - 延迟更新，提升性能
- `renderer: 'canvas'` - 使用 Canvas 渲染器（性能更好）

### PieChart.tsx 核心实现

**数据转换**：
```typescript
const pieData = data.map((item) => ({
  name: String(item[nameKey]),
  value: Number(item[dataKey]),
}))
```

**百分比计算**：
```typescript
const total = pieData.reduce((sum, item) => sum + item.value, 0)
const percent = total > 0 ? ((params.value as number) / total) * 100 : 0
```

**环形图配置**：
```typescript
radius: ['40%', '70%'], // 内半径 40%，外半径 70%
center: ['50%', '55%'], // 中心位置
```

**formatter 类型处理**：
```typescript
formatter: (params) => {
  if (Array.isArray(params)) return '' // 饼图 trigger: 'item' 时 params 不是数组
  // ...
}
```

### LineChart.tsx 核心实现

**系列配置**：
```typescript
interface LineChartSeries {
  dataKey: string    // 数据字段名
  name: string       // 系列名称
  smooth?: boolean   // 是否平滑曲线
  areaStyle?: boolean // 是否显示面积图
}
```

**tooltip formatter 类型处理**：
```typescript
formatter: (params) => {
  if (!Array.isArray(params)) return '' // 折线图 trigger: 'axis' 时 params 是数组
  const [first] = params
  const axisValue = (first as { axisValue?: string }).axisValue ?? ''
  // ...
}
```

**颜色映射**：
```typescript
const chartColors = [
  colors.primary.main,
  colors.success.main,
  colors.warning.main,
  colors.error.main,
]
itemStyle: {
  color: chartColors[index % chartColors.length],
}
```

### 关键实现细节

1. **类型安全**：
   - 使用 `EChartsReactProps` 而非 `ReactEChartsProps`（echarts-for-react 3.x 的正确类型名）
   - 自定义 `ChartOpts` 类型避免导入问题
   - formatter 中使用类型断言和数组检查

2. **Spin 组件**：
   - `tip` 属性已弃用，使用 `spinning` 属性代替

3. **响应式**：
   - ECharts 自动监听窗口大小变化并调整图表
   - `notMerge: true` 确保配置更新时完全替换

4. **主题一致性**：
   - 使用 `colors` 对象中的设计 tokens
   - 颜色顺序：primary → success → warning → error

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ BaseChart 正确渲染 ECharts
- ✅ PieChart 显示饼图和百分比
- ✅ LineChart 显示折线图和 tooltip
- ✅ 图表主题色与 Ant Design 一致

### 注意事项

1. **echarts-for-react 类型**：使用 `EChartsReactProps` 而非 `ReactEChartsProps`
2. **formatter 类型**：ECharts 的 formatter 参数类型复杂，需要运行时检查 `Array.isArray`
3. **Spin tip 弃用**：Ant Design 6.x 中 `Spin tip` 已弃用，使用 `spinning` 属性
4. **Opts 类型导入**：echarts-for-react 的 `Opts` 类型导出有问题，建议自定义类型

### 后续扩展

- 可添加更多图表类型（柱状图、散点图等）
- 可添加图表导出功能（PNG、PDF）
- 可添加图表交互事件（点击、悬停等）
- 可考虑使用 ECharts 的 dataset API 简化数据转换

---

## Task 12: 业务组件 (TransactionForm, NetValueRefresh) - Learnings

**日期**: 2026-03-19

### 文件结构

创建以下文件：
1. `src/components/business/TransactionForm.tsx` - 交易记录表单组件
2. `src/components/business/NetValueRefresh.tsx` - 净值刷新组件
3. 更新 `src/components/business/index.ts` - 添加导出

### TransactionForm.tsx 核心实现

**组件结构**：
- 交易类型选择 (买入/卖出/分红) - Radio.Group
- 账户选择 - Select
- 基金代码输入 - FundSelector 组件
- 交易日期 - DatePicker
- 份额、金额、手续费 - InputNumber
- 备注 - TextArea
- 提交按钮 (loading 状态)

**表单验证规则**：
- 必填字段验证
- 基金代码 6 位数字验证
- 金额/份额 > 0 验证
- 日期不能超过今天

**关键实现细节**：
1. **Form 实例管理**: 支持外部传入 form 实例，便于父组件控制
2. **异步提交处理**: onSubmit 支持 async/await，自动管理 loading 状态
3. **基金选择集成**: 使用 FundSelector 组件，自动填充基金代码
4. **日期禁用**: 使用 dayjs 进行日期比较，禁用未来日期

### NetValueRefresh.tsx 核心实现

**组件结构**：
- 显示当前净值（大字体）
- 显示净值日期
- 刷新按钮（loading 状态）
- 更新时间 tooltip

**关键实现细节**：
1. **净值格式化**: 使用 toFixed(4) 保留 4 位小数
2. **Flex 布局**: 使用 Ant Design Flex 组件代替 Space direction="vertical"
3. **Tooltip 提示**: 显示更新时间
4. **异步刷新**: onRefresh 支持 async/await

### Ant Design 6.x API 变化

**已弃用的属性**：
1. `Select.Option` → 使用 `options` 属性
   ```tsx
   // 旧写法
   <Select>
     <Select.Option value="1">选项1</Select.Option>
   </Select>
   
   // 新写法
   <Select options={[{ label: '选项1', value: '1' }]} />
   ```

2. `InputNumber` 的 `addonBefore/addonAfter` → 使用 `prefix/suffix`
   ```tsx
   // 旧写法
   <InputNumber addonBefore="¥" addonAfter="份" />
   
   // 新写法
   <InputNumber prefix="¥" suffix="份" />
   ```

3. `Space direction="vertical"` → 使用 `Flex vertical`
   ```tsx
   // 旧写法
   <Space direction="vertical" size={8}>
   
   // 新写法
   <Flex vertical gap={8}>
   ```

### 依赖安装

```bash
pnpm add dayjs
```

安装的版本：
- dayjs: 1.11.20

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ LSP 诊断无错误
- ✅ TransactionForm 所有字段正确渲染
- ✅ 表单验证工作正常
- ✅ NetValueRefresh 显示净值和刷新按钮
- ✅ 使用设计系统 tokens

### 注意事项

1. **DatePicker 日期比较**: 使用 dayjs 进行日期比较，不能直接与 Date 对象比较
2. **未使用的导入**: 及时删除未使用的导入，避免 TypeScript 错误
3. **Ant Design 6.x 迁移**: 注意已弃用的 API，使用新的替代方案
4. **表单实例**: 支持外部传入 form 实例，提高组件灵活性

### 后续扩展

- 可添加表单重置功能
- 可添加表单数据预填充
- 可添加更复杂的验证规则（如份额精度）
- 可添加交易类型相关的动态字段显示

---

## Task 16: Holdings 页面 — 持仓详情 + 净值走势图表 - Learnings

**日期**: 2026-03-20

### 文件结构

创建以下文件：
1. `src/mocks/data/holdings.ts` - Holdings 页面 Mock 数据
2. 更新 `src/pages/Holdings.tsx` - 完整实现 Holdings 页面

### Mock 数据设计

**数据类型定义**：
- `FundDetail` - 基金详情（包含基金信息、持仓数据、收益数据）
- `NetValueTrendItem` - 净值走势数据项（需要添加索引签名以兼容 LineChart）

**Mock 数据工厂函数**：
- `createHoldings(accountId?)` - 生成持仓列表，支持账户筛选
- `createFundDetail(fundCode)` - 生成基金详情
- `createNetValueTrend(days)` - 生成净值走势数据
- `getNetValueTrendByDays(days)` - 获取指定天数的净值走势

### Holdings 页面核心实现

**组件结构**：
1. **页面标题 + 账户筛选器** - Flex 布局，Select 组件
2. **持仓列表 + 基金详情** - Row/Col 布局（16:8 比例）
3. **净值走势图表** - 全宽展示

**关键功能**：
1. **账户筛选**：
   - 使用 `useSearchParams` 读取 URL 参数 `?accountId=xxx`
   - 使用 `useNavigate` 更新 URL 参数
   - Mock 数据支持账户筛选

2. **持仓列表**：
   - 使用 `HoldingTable` 组件
   - 支持买入/卖出/查看详情操作
   - 跳转到交易记录页面并预填充参数

3. **基金详情**：
   - 使用 `Descriptions` 组件展示基金信息
   - 显示基金基本信息、持仓数据、收益数据
   - 提供买入/卖出快捷按钮

4. **净值走势图表**：
   - 使用 `LineChart` 组件
   - 支持时间范围切换（30/90/180 天）
   - 使用 `Segmented` 组件切换时间范围

### 关键实现细节

1. **URL 参数处理**：
   ```tsx
   const [searchParams] = useSearchParams()
   const accountId = searchParams.get('accountId') ?? undefined
   
   const handleAccountChange = (value: string) => {
     if (value) {
       navigate(`/holdings?accountId=${value}`)
     } else {
       navigate('/holdings')
     }
   }
   ```

2. **路由跳转预填充参数**：
   ```tsx
   const handleBuy = (id: string) => {
     const holding = holdings.find((h) => h.id === id)
     if (holding) {
       navigate(`/transactions?fundCode=${holding.fundCode}&type=buy`)
     }
   }
   ```

3. **空状态处理**：
   - 使用 `Empty` 组件显示无持仓提示
   - 提供快捷操作按钮

4. **类型安全**：
   - `NetValueTrendItem` 需要添加索引签名 `[key: string]: string | number` 以兼容 `LineChartDataItem`
   - 所有接口使用 TypeScript 严格类型定义

### Lint 错误修复

修复了之前任务遗留的 lint 错误：
1. **未使用的 catch 变量** - 删除未使用的 `error` 和 `err` 变量
2. **useMemo 依赖项警告** - 使用 `useCallback` 包装函数，并添加到依赖项数组

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（无错误、无警告）
- ✅ 开发服务器正常运行
- ✅ 代码遵循已建立的模式
- ✅ 使用设计系统 tokens

### 注意事项

1. **索引签名**: `LineChartDataItem` 要求索引签名，自定义数据接口需要添加 `[key: string]: string | number`
2. **URL 参数**: 使用 `useSearchParams` 和 `useNavigate` 处理 URL 参数
3. **路由跳转**: 可以在 URL 中传递参数，实现页面间数据传递
4. **空状态**: 使用 `Empty` 组件提供友好的空状态提示
5. **useCallback**: 当函数在 useMemo 中使用时，需要使用 useCallback 包装并添加到依赖项数组

### 后续扩展

- 可添加持仓导出功能
- 可添加批量操作功能
- 可添加基金对比功能
- 可添加净值预警功能

---

## Task 17: Transactions 页面 — 交易记录 + 筛选 + 分页 + 表单 - Learnings

**日期**: 2026-03-20

### 文件结构

更新以下文件：
1. `src/pages/Transactions.tsx` - 完整实现 Transactions 页面

### Transactions 页面核心实现

**组件结构**：
1. **页面标题 + 新建交易按钮** - Flex 布局
2. **筛选区域** - DataCard 包裹，Row/Col 布局
   - 账户筛选（Select）
   - 基金筛选（Select，支持搜索）
   - 交易类型筛选（Select）
   - 日期范围筛选（RangePicker）
   - 重置按钮
3. **交易记录表格** - DataCard + Table
4. **新建交易 Modal** - Modal + TransactionForm

**关键功能**：
1. **URL 参数处理**：
   - 使用 `useSearchParams` 读取 `accountId`, `fundCode`, `type` 参数
   - 使用 `setSearchParams` 更新 URL 参数
   - 初始状态从 URL 参数读取

2. **筛选逻辑**：
   - 使用 `useMemo` 计算筛选后的交易记录
   - 支持账户、基金、类型、日期范围四种筛选
   - 筛选条件变化时自动重新计算

3. **表格实现**：
   - 使用 Ant Design Table 组件
   - 支持日期排序（默认降序）
   - 支持分页（每页 10 条，可调整）
   - 显示交易日期、账户、基金、类型、份额、金额、手续费、净值、备注

4. **新建交易**：
   - 使用 `TransactionForm` 组件
   - Modal 弹窗展示表单
   - 支持从筛选条件预填充表单（accountId, fundCode, type）

### 关键实现细节

1. **交易类型标签**：
   ```tsx
   const transactionTypeMap: Record<TransactionType, { label: string; color: string }> = {
     buy: { label: '买入', color: 'green' },
     sell: { label: '卖出', color: 'red' },
     dividend: { label: '分红', color: 'blue' },
   }
   ```

2. **日期范围筛选**：
   ```tsx
   if (dateRange) {
     const [start, end] = dateRange
     transactions = transactions.filter((t) => {
       const transactionDate = dayjs(t.date)
       return transactionDate.isAfter(start.subtract(1, 'day')) && 
              transactionDate.isBefore(end.add(1, 'day'))
     })
   }
   ```

3. **表格列定义**：
   - 使用 `TableProps<TransactionItem>['columns']` 类型
   - 基金列使用自定义渲染（显示代码和名称）
   - 金额、份额、手续费使用格式化函数

4. **Modal 集成**：
   - `destroyOnClose` 确保每次打开都是新表单
   - `initialValues` 从筛选条件预填充
   - `onCancel` 关闭 Modal

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（无错误、无警告）
- ✅ 开发服务器正常运行
- ✅ 代码遵循已建立的模式
- ✅ 使用设计系统 tokens
- ✅ 无不必要的注释

### 注意事项

1. **URL 参数**: 使用 `useSearchParams` 处理 URL 参数，支持页面间跳转预填充
2. **筛选重置**: 重置时需要清空所有筛选状态和 URL 参数
3. **表格排序**: 使用 `defaultSortOrder` 设置默认排序
4. **Modal 销毁**: 使用 `destroyOnClose` 确保表单状态重置
5. **类型安全**: 所有接口使用 TypeScript 严格类型定义

### 后续扩展

- 可添加交易记录编辑功能
- 可添加交易记录删除功能
- 可添加交易记录导出功能
- 可添加批量操作功能

---

## Task 18: Analytics 页面 — 收益曲线 + 资产配置 + 收益排名 - Learnings

**日期**: 2026-03-20

### 文件结构

更新以下文件：
1. `src/pages/Analytics.tsx` - 完整实现 Analytics 页面

### Analytics 页面核心实现

**组件结构**：
1. **页面标题** - Flex 布局
2. **关键指标卡片** - Row/Col 布局（3 列）
   - 总资产、总收益、总收益率
3. **图表区** - Row/Col 布局（16:8 比例）
   - 收益曲线（LineChart）+ 时间范围切换（Segmented）
   - 资产配置（PieChart）
4. **基金收益排名** - 全宽展示
   - Table 组件，支持排序

**关键功能**：
1. **收益曲线图表**：
   - 使用 `LineChart` 组件
   - 支持时间范围切换（30/90/180 天）
   - 使用 `Segmented` 组件切换时间范围
   - 显示累计收益和累计成本两条曲线

2. **资产配置图表**：
   - 使用 `PieChart` 组件
   - 显示按基金类型的资产分布
   - 显示百分比标签和图例

3. **基金收益排名表格**：
   - 使用 Ant Design Table 组件
   - 显示排名、基金名称、持有收益、收益率、持有天数
   - 支持表头排序（默认按收益率降序）
   - 排名前三名使用金银铜色高亮

### 关键实现细节

1. **排名颜色高亮**：
   ```tsx
   color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : colors.neutral.text
   ```

2. **表格列定义**：
   - 使用 `TableProps<FundRankingItem>['columns']` 类型
   - 基金名称列使用自定义渲染（显示名称和代码）
   - 收益和收益率使用 `ProfitText` 组件

3. **避免渲染期间调用不纯函数**：
   - 不要在 `useMemo` 中使用 `Math.random()`
   - 使用确定性值代替随机值

4. **设计系统一致性**：
   - 所有颜色使用 `config/theme.ts` 中定义的 tokens
   - 所有间距使用 `spacing` 对象
   - 所有格式化使用 `formatters` 工具函数

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（无错误、无警告）
- ✅ 开发服务器正常运行
- ✅ 代码遵循已建立的模式
- ✅ 使用设计系统 tokens
- ✅ 无不必要的注释

### 注意事项

1. **渲染纯度**: 不要在渲染期间调用 `Math.random()` 等不纯函数，会导致 lint 错误
2. **未使用变量**: 及时删除未使用的变量，避免 lint 错误
3. **表格排序**: 使用 `defaultSortOrder` 设置默认排序
4. **类型安全**: 所有接口使用 TypeScript 严格类型定义

### 后续扩展

- 可添加收益归因分析
- 可添加基金对比功能
- 可添加收益预测功能
- 可添加导出报告功能

---

## Task 19: Settings 页面 — 数据管理 + Tushare 配置 + 显示设置 - Learnings

**日期**: 2026-03-20

### 文件结构

更新以下文件：
1. `src/pages/Settings.tsx` - 完整实现 Settings 页面

### Settings 页面核心实现

**组件结构**：
1. **Tushare API 配置** - DataCard + Form
   - API Token 密码输入框
   - Token 状态显示（已配置/未配置）
   - 保存配置按钮
   - 测试连接按钮（带 loading 状态）

2. **数据显示设置** - DataCard + Form
   - 默认账户选择（Select）
   - 每页显示条数（InputNumber）
   - 收益率显示方式（Switch）
   - 金额精度（Select）

3. **数据管理** - DataCard + Buttons
   - 导出数据按钮（带确认对话框）
   - 导入数据按钮（带确认对话框）
   - 清空数据按钮（带危险确认对话框）

4. **关于信息** - Card + Descriptions
   - 应用名称、版本号
   - 技术栈信息（前端框架、UI 库、图表库等）

### 关键实现细节

1. **表单管理**：
   - 使用 `Form.useForm()` 创建表单实例
   - Tushare 配置和显示设置分别使用独立表单
   - 使用 `validateFields()` 进行表单验证

2. **状态管理**：
   - `isTesting` - 测试连接 loading 状态
   - `isTokenConfigured` - Token 配置状态
   - `isImportModalOpen`, `isExportModalOpen`, `isClearModalOpen` - Modal 开关状态

3. **Mock 逻辑**：
   - 使用 `setTimeout` 模拟异步操作
   - 所有操作返回成功/失败消息提示
   - Token 验证逻辑：长度 > 10 视为有效

4. **设计系统一致性**：
   - 使用 `colors` 对象定义状态颜色（成功绿色、未配置灰色）
   - 使用 `spacing` 对象定义间距
   - 使用 `DataCard` 组件保持卡片样式一致

5. **Modal 确认对话框**：
   - 导出：简单确认
   - 导入：警告覆盖现有数据
   - 清空：危险警告，使用 `danger` 按钮

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（无错误、无警告）
- ✅ 开发服务器正常运行
- ✅ 代码遵循已建立的模式
- ✅ 使用设计系统 tokens
- ✅ 无 `any` 类型或 `@ts-ignore`

### 注意事项

1. **未使用变量**: 删除未使用的 `TextArea` 导入和 catch 块中的 `error` 变量
2. **表单验证**: 使用 `validateFields()` 进行验证，不直接使用 values
3. **类型安全**: 所有接口使用 TypeScript 严格类型定义
4. **Mock 数据**: 账户选择器使用 Mock 数据，后续需替换为真实数据

### 后续扩展

- 可添加真实的 Tushare API 调用
- 可添加真实的文件导入导出功能
- 可添加更多显示设置选项
- 可添加主题切换功能


---

## Task 20: Zustand Stores (accountStore, holdingStore, transactionStore) - Learnings

**日期**: 2026-03-20

### 文件结构

创建以下文件：
1. `src/types/index.ts` - 类型定义统一导出
2. `src/stores/accountStore.ts` - 账户状态管理 Store
3. `src/stores/holdingStore.ts` - 持仓状态管理 Store
4. `src/stores/transactionStore.ts` - 交易记录状态管理 Store
5. 更新 `src/stores/index.ts` - 统一导出

### 类型定义设计

**核心接口**：
- `Account` - 账户（id, name, description, created_at, updated_at）
- `Fund` - 基金信息（id, code, name, type, company, manager, establish_date）
- `Holding` - 持仓（id, account_id, fund_id, shares, cost_price, fund?）
- `Transaction` - 交易记录（id, account_id, fund_id, type, date, shares?, amount?, fee, net_value?, notes?）
- `TransactionType` - 交易类型联合类型（'buy' | 'sell' | 'dividend'）

**基础接口**：
- `StoreState` - Store 状态基础接口（loading, error）
- `StoreActions` - Store 动作基础接口（clearError）
- `ApiResponse<T>` - API 响应基础结构

### Store 实现模式

**Zustand 5.x 语法**：
```typescript
export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      // 状态和动作
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accounts: state.accounts }),
    },
  ),
)
```

**关键点**：
1. 使用 `create<T>()()` 泛型语法
2. 使用 `persist` 中间件持久化到 localStorage
3. 使用 `partialize` 选择性持久化状态字段
4. 使用 `set` 更新状态，`get` 获取当前状态

### accountStore 核心功能

**状态**：
- `accounts: Account[]` - 账户列表
- `loading: boolean` - 加载状态
- `error: string | null` - 错误信息

**动作**：
- `fetchAccounts()` - 获取账户列表（调用 `/api/accounts`）
- `createAccount(accountData)` - 创建账户（本地生成 ID）
- `updateAccount(id, accountData)` - 更新账户
- `deleteAccount(id)` - 删除账户
- `setAccounts(accounts)` - 直接设置账户列表
- `clearError()` - 清除错误信息

### holdingStore 核心功能

**状态**：
- `holdings: Holding[]` - 持仓列表
- `loading: boolean` - 加载状态
- `error: string | null` - 错误信息

**动作**：
- `fetchHoldings(accountId?)` - 获取持仓列表（支持账户筛选）
- `addHolding(holdingData)` - 添加持仓
- `updateHolding(id, holdingData)` - 更新持仓
- `deleteHolding(id)` - 删除持仓
- `setHoldings(holdings)` - 直接设置持仓列表
- `getHoldingsByAccount(accountId)` - 按账户筛选持仓
- `clearError()` - 清除错误信息

### transactionStore 核心功能

**状态**：
- `transactions: Transaction[]` - 交易记录列表
- `loading: boolean` - 加载状态
- `error: string | null` - 错误信息

**动作**：
- `fetchTransactions(filters?)` - 获取交易记录（支持账户、基金、类型筛选）
- `addTransaction(transactionData)` - 添加交易记录
- `updateTransaction(id, transactionData)` - 更新交易记录
- `deleteTransaction(id)` - 删除交易记录
- `setTransactions(transactions)` - 直接设置交易记录列表
- `getTransactionsByAccount(accountId)` - 按账户筛选
- `getTransactionsByFund(fundId)` - 按基金筛选
- `getTransactionsByType(type)` - 按类型筛选
- `clearError()` - 清除错误信息

### 关键实现细节

1. **类型安全**：
   - 所有状态和动作使用 TypeScript 严格类型定义
   - 使用 `Omit<T, K>` 工具类型排除自动生成的字段
   - 无 `any` 类型或 `@ts-ignore`

2. **错误处理**：
   - 所有异步操作使用 try-catch
   - 错误信息存储在 `error` 状态中
   - 提供 `clearError()` 方法清除错误

3. **持久化策略**：
   - 只持久化数据数组（accounts, holdings, transactions）
   - 不持久化 loading 和 error 状态
   - 使用 `partialize` 选择性持久化

4. **筛选功能**：
   - holdingStore 提供 `getHoldingsByAccount()` 方法
   - transactionStore 提供三种筛选方法（账户、基金、类型）
   - `fetchTransactions()` 支持 `TransactionFilters` 参数

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（无错误、无警告）
- ✅ 所有 Store 使用 persist 中间件
- ✅ 类型定义完整，无 `any` 类型
- ✅ 遵循 Task 6 的 Zustand 配置模式

### 注意事项

1. **Zustand 5.x API**: 使用 `create<T>()()` 泛型语法，而非 `create<T>((set, get) => ...)`
2. **persist 中间件**: 需要导入 `createJSONStorage` 指定存储方式
3. **partialize**: 用于选择性地持久化状态字段，避免存储不必要的数据
4. **get 函数**: 在需要访问当前状态时使用 `get()`，如筛选方法

### 后续扩展

- 在页面组件中集成这些 Stores（Task 21-22）
- 添加 React Query 进行数据缓存和同步
- 添加乐观更新逻辑
- 添加数据验证逻辑

---

## Task 21: React Query hooks (useAccounts, useHoldings, useTransactions) - Learnings

**日期**: 2026-03-20

### 文件结构

创建以下文件：
1. `src/services/api.ts` - API 客户端配置和 queryKeys 定义
2. `src/services/accountApi.ts` - 账户 API 调用
3. `src/services/holdingApi.ts` - 持仓 API 调用
4. `src/services/transactionApi.ts` - 交易记录 API 调用
5. `src/hooks/useAccounts.ts` - 账户 React Query hooks
6. `src/hooks/useHoldings.ts` - 持仓 React Query hooks
7. `src/hooks/useTransactions.ts` - 交易记录 React Query hooks
8. `src/hooks/index.ts` - 统一导出

### API 服务层设计

**api.ts 核心实现**：
- `request<T>()` - 通用请求函数，处理响应和错误
- `api.get/post/put/delete` - RESTful API 方法封装
- `queryKeys` - React Query 缓存键工厂函数

**queryKeys 设计模式**：
```typescript
export const queryKeys = {
  accounts: ['accounts'] as const,
  account: (id: number) => ['accounts', id] as const,
  holdings: (accountId?: number) =>
    accountId ? (['holdings', accountId] as const) : (['holdings'] as const),
  // ...
}
```

关键点：
- 使用 `as const` 确保类型推断为只读元组
- 支持带参数的查询键（如按账户筛选持仓）
- 缓存键层级清晰，便于失效管理

### React Query Hooks 设计

**Query hooks 模式**：
```typescript
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountApi.list,
    select: (response) => response.data,  // 从 ApiResponse 中提取 data
  })
}
```

**Mutation hooks 模式**：
```typescript
export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => accountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
    },
  })
}
```

**关键实现细节**：
1. **select 提取数据**: 使用 `select` 从 `ApiResponse<T>` 中提取 `data`，简化组件使用
2. **enabled 条件查询**: `useAccount(id)` 使用 `enabled: id > 0` 避免无效请求
3. **缓存失效策略**: mutation 成功后 invalidate 相关查询键
4. **关联数据失效**: 交易记录变更时同时失效持仓缓存（因为持仓依赖交易计算）

### 类型安全

所有 API 和 hooks 使用 TypeScript 严格类型：
- API 函数返回 `Promise<ApiResponse<T>>`
- Mutation 参数使用 `Omit<T, 'id' | 'created_at'>` 排除自动生成字段
- Query 键使用 `as const` 确保类型推断

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（无错误、无警告）
- ✅ 所有 hooks 正确定义 query 和 mutation
- ✅ API 服务层调用 Mock 数据
- ✅ 类型定义完整，无 `any` 类型

### 注意事项

1. **select vs data**: 使用 `select` 提取数据后，hook 返回的是 `T` 而非 `ApiResponse<T>`
2. **缓存失效范围**: mutation 成功后需 invalidate 所有相关查询键
3. **关联数据**: 交易记录变更会影响持仓计算，需同时失效持仓缓存
4. **enabled 条件**: 避免在 id 无效时发起请求

### 后续扩展

- 可添加乐观更新（optimistic updates）
- 可添加错误重试策略
- 可添加请求取消逻辑
- 可添加分页和无限滚动支持


---

## Task 21: React Query hooks (useAccounts, useHoldings, useTransactions) - Learnings

**日期**: 2026-03-20

### 文件结构

创建以下文件：
1. `src/services/api.ts` - API 客户端配置和 queryKeys 定义
2. `src/services/accountApi.ts` - 账户 API 调用
3. `src/services/holdingApi.ts` - 持仓 API 调用
4. `src/services/transactionApi.ts` - 交易记录 API 调用
5. `src/hooks/useAccounts.ts` - 账户 React Query hooks
6. `src/hooks/useHoldings.ts` - 持仓 React Query hooks
7. `src/hooks/useTransactions.ts` - 交易记录 React Query hooks
8. `src/hooks/index.ts` - 统一导出

### api.ts 核心实现

**API 客户端封装**：
```typescript
async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, { ... })
  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}
```

**Query Keys 定义**：
```typescript
export const queryKeys = {
  accounts: ['accounts'] as const,
  account: (id: number) => ['accounts', id] as const,
  holdings: (accountId?: number) => accountId ? ['holdings', accountId] as const : ['holdings'] as const,
  transactions: (filters?: TransactionFilters) => filters ? ['transactions', filters] as const : ['transactions'] as const,
}
```

关键点：
- 使用 `as const` 确保类型推断为只读元组
- 支持参数化的 query key（如 `holdings(accountId)`）
- 筛选参数作为 query key 的一部分，确保筛选条件变化时重新请求

### React Query Hooks 模式

**Query Hook**：
```typescript
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountApi.list,
    select: (response) => response.data,  // 从 ApiResponse 中提取 data
  })
}
```

**Mutation Hook**：
```typescript
export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => accountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
    },
  })
}
```

**带参数的 Query Hook**：
```typescript
export function useHoldings(accountId?: number) {
  return useQuery({
    queryKey: queryKeys.holdings(accountId),
    queryFn: () => holdingApi.list(accountId),
    select: (response) => response.data,
  })
}
```

**带 enabled 条件的 Query Hook**：
```typescript
export function useAccount(id: number) {
  return useQuery({
    queryKey: queryKeys.account(id),
    queryFn: () => accountApi.get(id),
    select: (response) => response.data,
    enabled: id > 0,  // 仅在 id 有效时请求
  })
}
```

### 关键实现细节

1. **select 提取数据**：使用 `select: (response) => response.data` 从 `ApiResponse<T>` 中提取实际数据

2. **缓存失效策略**：
   - 创建操作：失效列表查询
   - 更新操作：失效列表和详情查询
   - 删除操作：失效列表查询

3. **关联数据失效**：
   - 交易记录变更时，同时失效持仓缓存（因为持仓依赖交易计算）
   - 按账户筛选的持仓，创建时同时失效全局和账户筛选的缓存

4. **类型安全**：
   - 所有 API 函数使用泛型 `<T>` 指定返回类型
   - Mutation 参数使用 `Omit<T, 'id' | 'created_at'>` 排除自动生成字段
   - 严禁使用 `any` 类型

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ LSP 诊断无错误
- ✅ 所有 hooks 正确定义 query 和 mutation
- ✅ API 服务层调用 Mock 数据
- ✅ 类型定义完整，无 `any` 类型

### 注意事项

1. **queryKey 类型**：使用 `as const` 确保类型推断为只读元组，避免类型错误
2. **select 函数**：用于从 API 响应中提取数据，简化组件使用
3. **enabled 条件**：用于条件查询，避免无效请求
4. **invalidateQueries**：mutation 成功后失效相关缓存，触发重新请求
5. **关联数据**：交易记录变更会影响持仓计算，需要同时失效持仓缓存

### 后续扩展

- 可添加乐观更新（optimistic updates）
- 可添加错误处理和重试逻辑
- 可添加分页和无限滚动支持
- 可添加请求取消和去重


### 与 Zustand Stores 的关系

React Query hooks 与 Zustand stores 的职责分工：
- **React Query hooks**：服务端状态管理（数据获取、缓存、同步）
- **Zustand stores**：客户端状态管理（UI 状态、临时数据）

后续 Task 22 将使用 React Query hooks 替代页面组件中的本地状态。


---

## Task 23: MSW Mock handlers 完善 - Learnings

**日期**: 2026-03-20

### 实现内容

完善 MSW Mock handlers，覆盖所有 PRD 端点的 CRUD 操作和错误场景。

### 账户 handlers

**POST /api/accounts** - 创建账户
- 验证：name 必填且非空
- 自动生成：id、created_at、updated_at
- 返回状态码：201

**PUT /api/accounts/:id** - 更新账户
- 404：账户不存在
- 验证：name 非空（如果提供）
- 自动更新：updated_at

**DELETE /api/accounts/:id** - 删除账户
- 404：账户不存在
- 从 mock 数组中移除

### 持仓 handlers

**POST /api/holdings** - 添加持仓
- 验证：account_id、fund_id 必填
- 验证：shares > 0、cost_price > 0
- 唯一性检查：同一账户不能持有同一基金多次
- 返回状态码：201

**PUT /api/holdings/:id** - 更新持仓
- 404：持仓不存在
- 验证：shares > 0、cost_price > 0（如果提供）
- 自动更新：updated_at

**DELETE /api/holdings/:id** - 删除持仓
- 404：持仓不存在
- 从 mock 数组中移除

### 交易 handlers

**POST /api/transactions** - 添加交易记录
- 验证：account_id、fund_id 必填
- 验证：type 必须为 'buy'、'sell' 或 'dividend'
- 验证：date 必填
- 验证：shares > 0、amount > 0（分红除外）
- 验证：fee >= 0
- 自动计算：net_value = amount / shares（如果未提供）
- 分红特殊处理：shares 和 amount 为 undefined
- 返回状态码：201

**PUT /api/transactions/:id** - 更新交易记录
- 404：交易记录不存在
- 验证：type 合法性
- 验证：shares > 0、amount > 0（分红除外）
- 验证：fee >= 0
- 自动更新：created_at（MSW 中用作 updated_at 替代）

**DELETE /api/transactions/:id** - 删除交易记录
- 404：交易记录不存在
- 从 mock 数组中移除

### 错误场景处理

**400 Bad Request**
- 必填字段缺失
- 字段值验证失败（如负数、空字符串）
- 业务规则违反（如重复持仓）

**404 Not Found**
- 资源不存在（账户、持仓、交易记录）

### 关键实现细节

1. **类型安全**：所有 handlers 使用 TypeScript 严格类型，从 handlers.ts 内部的接口定义
2. **数据验证**：每个 POST/PUT handler 都包含完整的字段验证逻辑
3. **状态码**：创建操作返回 201，查询/更新/删除返回 200
4. **Mock 数据管理**：使用数组的 push/splice 方法模拟数据库操作
5. **ID 生成**：使用 `Math.max(...items.map(i => i.id), 0) + 1` 生成自增 ID

### 验证结果

- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过
- ✅ 所有 CRUD handlers 完整
- ✅ 错误场景处理完善
- ✅ 无 `any` 类型或 `@ts-ignore`

### 注意事项

1. **API 端点注释**：使用 `// HTTP_METHOD /api/path - 描述` 格式的注释标识每个 handler，这是必要的文档
2. **Transaction 类型**：分红交易的 shares 和 amount 为 undefined，需要特殊处理
3. **Mock 数据持久化**：Mock 数据存储在内存数组中，刷新页面会重置
4. **扩展性**：后续可添加更复杂的业务逻辑（如交易后自动更新持仓）

