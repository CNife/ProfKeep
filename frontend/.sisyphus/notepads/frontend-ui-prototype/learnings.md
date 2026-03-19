## Task 3: 路径别名 + ESLint + Prettier 配置

### 成功经验

#### 1. Vite 路径别名配置
在 `vite.config.ts` 中配置路径别名需要导入 `path` 模块：

```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      // ... 其他别名
    },
  },
})
```

#### 2. TypeScript paths 映射
在 `tsconfig.app.json` 中配置 paths 需要同时设置 `baseUrl`：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

#### 3. Prettier 配置
使用 `.prettierrc` 文件配置，与项目代码规范保持一致：
- `semi: false` - 不使用分号
- `singleQuote: true` - 单引号
- `printWidth: 100` - 行宽 100 字符（与 ruff 一致）

#### 4. package.json scripts
```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

### 验证结果
- ✅ `pnpm run lint` 执行成功
- ✅ `pnpm run format` 执行成功
- ✅ `pnpm run typecheck` 执行成功，路径别名解析正常
