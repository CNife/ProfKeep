import { QueryClient } from '@tanstack/react-query'

/**
 * 创建并配置 React Query Client
 * 默认配置：
 * - retry: 1 - 失败后重试 1 次
 * - staleTime: 5 分钟 - 数据在 5 分钟内视为新鲜
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 分钟
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
    },
  },
})
