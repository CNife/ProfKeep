/**
 * 路由配置文件
 * 定义应用的所有路由路径和页面组件映射
 */

import { createBrowserRouter } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard'
import { Accounts } from '../pages/Accounts'
import { Holdings } from '../pages/Holdings'
import { Transactions } from '../pages/Transactions'
import { Analytics } from '../pages/Analytics'
import { Settings } from '../pages/Settings'

/**
 * 路由配置
 * 使用 createBrowserRouter 创建路由实例
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/accounts',
    element: <Accounts />,
  },
  {
    path: '/holdings',
    element: <Holdings />,
  },
  {
    path: '/transactions',
    element: <Transactions />,
  },
  {
    path: '/analytics',
    element: <Analytics />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
])
