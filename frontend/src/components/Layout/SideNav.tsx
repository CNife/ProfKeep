/**
 * SideNav 组件
 * 侧边导航栏，包含主要功能菜单
 * 基于 UI_DESIGN.md 5.1.2 节设计
 */

import { Menu } from 'antd'
import {
  DashboardOutlined,
  AccountBookOutlined,
  PieChartOutlined,
  TransactionOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { colors } from '../../config/theme'
import { useUIStore } from '../../stores/uiStore'

import type { MenuProps } from 'antd'

type MenuItem = Required<MenuProps>['items'][number]

/**
 * 菜单项配置
 */
const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/accounts',
    icon: <AccountBookOutlined />,
    label: '账户管理',
  },
  {
    key: '/holdings',
    icon: <PieChartOutlined />,
    label: '持仓详情',
  },
  {
    key: '/transactions',
    icon: <TransactionOutlined />,
    label: '交易记录',
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: '数据分析',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
]

/**
 * SideNav 组件
 * 固定宽度 200px，响应式隐藏（768px 以下）
 */
export function SideNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 80 : 200,
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: colors.neutral.white,
        borderRight: `1px solid ${colors.neutral.border}`,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          height: '100%',
          borderRight: 0,
        }}
        inlineCollapsed={sidebarCollapsed}
      />
    </aside>
  )
}

export default SideNav