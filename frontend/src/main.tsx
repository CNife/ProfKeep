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
    try {
      console.log('[MSW] Starting to import worker...')
      const { worker } = await import('./mocks/browser')
      console.log('[MSW] Worker imported, starting...')
      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: false,
      })
      console.log('[MSW] Mock Service Worker enabled for development')
    } catch (error) {
      console.error('[MSW] Failed to start worker:', error)
    }
  }
}

// 启动应用并初始化 MSW
console.log('[App] Starting application...')
enableMockWorker()
  .then(() => {
    console.log('[App] MSW enabled, rendering React...')
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider locale={zhCN} theme={antdTheme}>
            <App />
          </ConfigProvider>
        </QueryClientProvider>
      </StrictMode>,
    )
    console.log('[App] React rendered')
  })
  .catch((error) => {
    console.error('[App] Error during initialization:', error)
  })
