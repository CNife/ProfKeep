/**
 * Header 组件
 * 顶部导航栏，包含 Logo、账户选择器、设置和帮助按钮
 * 基于 UI_DESIGN.md 5.1.1 节设计
 */

import { Button, Select, Space, Typography } from 'antd'
import { FundOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { colors, spacing } from '../../config/theme'

const { Title } = Typography

/**
 * Mock 账户数据
 * TODO: 后续替换为真实数据
 */
const mockAccounts = [
  { id: '1', name: '招商银行账户' },
  { id: '2', name: '支付宝账户' },
  { id: '3', name: '天天基金账户' },
]

/**
 * Header 组件属性
 */
interface HeaderProps {
  /** 当前选中的账户 ID */
  currentAccountId?: string
  /** 账户切换回调 */
  onAccountChange?: (accountId: string) => void
}

/**
 * Header 组件
 * 固定高度 64px，包含 Logo、账户选择器和操作按钮
 */
export function Header({ currentAccountId = '1', onAccountChange }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        padding: `0 ${spacing.lg}px`,
        backgroundColor: colors.neutral.white,
        borderBottom: `1px solid ${colors.neutral.border}`,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Logo 和标题 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <FundOutlined style={{ fontSize: 24, color: colors.primary.main }} />
        <Title level={4} style={{ margin: 0, color: colors.neutral.title }}>
          基金账本
        </Title>
      </div>

      {/* 账户选择器和操作按钮 */}
      <Space size={spacing.md}>
        <Select
          value={currentAccountId}
          onChange={onAccountChange}
          style={{ width: 200 }}
          placeholder="选择账户"
          options={mockAccounts.map((account) => ({
            value: account.id,
            label: account.name,
          }))}
        />
        <Button type="text" icon={<SettingOutlined />} title="设置" />
        <Button type="text" icon={<QuestionCircleOutlined />} title="帮助" />
      </Space>
    </header>
  )
}

export default Header