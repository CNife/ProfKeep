import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import App from './App.tsx'
import { antdTheme } from './config/theme'
import { queryClient } from './hooks/useQueryClient'

/**
 * 开发环境启用 MSW Mock Service Worker
 * 用于拦截和 Mock API 请求，便于前端独立开发
 */
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

// 启动应用并初始化 MSW
enableMockWorker().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN} theme={antdTheme}>
          <App />
        </ConfigProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
})
