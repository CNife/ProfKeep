# AI Agent 工作指导 - 前端开发

## 项目结构

```
frontend/
├── src/
│   ├── components/     # 可复用组件
│   ├── pages/          # 页面组件
│   ├── services/       # API服务
│   ├── stores/         # 状态管理 (Zustand)
│   ├── hooks/          # 自定义Hooks
│   ├── types/          # TypeScript类型定义
│   └── App.tsx         # 应用入口
├── package.json
└── vite.config.ts
```

## 开发规范

### TypeScript规范
- **严格模式**: strict mode
- **禁止**: `any`, `@ts-ignore`, `@ts-expect-error`
- **类型定义**: 使用 `interface` 定义对象类型

### React组件规范
- **函数组件**: 使用函数组件 + TypeScript
- **命名**: 组件文件PascalCase，样式文件同名
- **结构**: 导入 → 类型定义 → 组件定义 → 导出

### Ant Design规范
- **按需引入**: `import { Button } from 'antd'`
- **主题定制**: 使用 `ConfigProvider`
- **表单**: 使用 `Form` 组件 + 验证规则

### ECharts规范
- 使用 `useRef` 获取DOM节点
- 响应式处理: 监听 `resize` 事件
- 销毁实例: 在 `useEffect` cleanup中

### 状态管理
- 使用 Zustand 进行全局状态管理
- 使用 React Context 进行局部状态管理

## 常用命令

```bash
# 开发环境
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

---

详细开发规范请参考项目根目录 `AGENTS.md` 和 `docs/UI_DESIGN.md`。