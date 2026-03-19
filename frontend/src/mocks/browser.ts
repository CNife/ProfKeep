import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW Service Worker 配置
 * 用于在开发环境中拦截和 Mock API 请求
 */
export const worker = setupWorker(...handlers)
