# 前端页面空白问题调试记录

**日期**: 2026-03-20
**状态**: 未解决

## 问题描述

启动前端开发服务器后，页面加载但 `<div id="root">` 为空，React 应用未渲染。

## 环境信息

- Vite: 8.0.1
- React: 19.2.4
- MSW: 2.12.13
- 浏览器: Chromium (via agent-browser)

## 已确认正常

| 检查项 | 结果 |
|--------|------|
| Vite 服务器 | ✅ 正常运行 (端口 5173) |
| MSW Service Worker | ✅ 已注册并激活 |
| TypeScript 编译 | ✅ 通过 (`pnpm typecheck`) |
| 组件代码 | ✅ 无运行时错误 |
| vite.config.ts | ✅ 配置正确 |
| 依赖安装 | ✅ 完整 |

## 已修复的问题

1. **MSW Service Worker 文件缺失**
   - 执行 `npx msw init public/ --save` 初始化

2. **App.tsx 中的导入错误**
   - `colors.spacing.lg` → `spacing.lg`
   - `spacing` 需要独立导入

## 关键发现

### 手动渲染成功

在浏览器控制台手动执行以下代码，页面**正常渲染**：

```javascript
const React = (await import('/node_modules/.vite/deps/react.js')).default;
const ReactDOM = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
const { RouterProvider } = await import('/node_modules/.vite/deps/react-router-dom.js');
const { router } = await import('/src/router/index.tsx');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(RouterProvider, { router }));

// 结果: Root children: 1, innerHTML: <div class="ant-flex...
```

**结论**: 组件、路由、React 都没问题。

## 问题定位

### 怀疑点: main.tsx 的初始化流程

```typescript
// 当前代码
enableMockWorker()
  .then(() => {
    createRoot(...).render(...)
  })
  .catch((error) => {
    console.error('[App] Error during initialization:', error)
  })
```

`enableMockWorker()` 返回的 Promise 可能：
1. 没有 resolve
2. `worker.start()` 在首次页面加载时卡住
3. 存在竞态条件

### 可能的原因

1. **MSW worker.start() 在某些情况下不返回**
   - MSW 2.x 版本的已知问题？
   - 需要查看 MSW 文档和 GitHub issues

2. **Service Worker 注册时机问题**
   - Service Worker 可能在首次加载时需要额外时间
   - 需要检查 `worker.start()` 的返回值

3. **Vite HMR 与 MSW 的冲突**
   - 热更新可能导致模块重新加载
   - MSW worker 可能被重复启动

## 下一步调查方向

1. 查看 MSW 官方文档关于 `worker.start()` 的行为
2. 查看 MSW GitHub issues 中是否有类似问题
3. 尝试修改初始化顺序：先渲染 React，再启动 MSW
4. 检查是否有浏览器兼容性问题

## 相关文件

- `/home/cnife/code/ProfKeep/frontend/src/main.tsx` - 应用入口
- `/home/cnife/code/ProfKeep/frontend/src/mocks/browser.ts` - MSW 配置
- `/home/cnife/code/ProfKeep/frontend/src/mocks/handlers.ts` - MSW handlers
- `/home/cnife/code/ProfKeep/frontend/src/App.tsx` - 根组件
- `/home/cnife/code/ProfKeep/frontend/src/router/index.tsx` - 路由配置

## 测试命令

```bash
# 启动开发服务器
cd frontend && pnpm dev

# 检查 TypeScript
pnpm typecheck

# 构建检查
pnpm build

# 使用 agent-browser 测试
agent-browser open http://localhost:5173
agent-browser snapshot -i
```

## 相关错误日志

```
# Vite 日志 (有时出现)
The file does not exist at "/home/cnife/code/ProfKeep/frontend/node_modules/.vite/deps/react/index.js"
which is in the optimize deps directory.
```

这个错误可能是 Vite 缓存问题，但清除缓存后问题依然存在。