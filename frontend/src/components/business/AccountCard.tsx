/**
 * AccountCard - 账户卡片组件
 *
 * 展示账户信息，包括名称、总资产、收益、收益率、基金数量等。
 */

import { Card, Button, Space, Typography } from 'antd'
import {
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { colors, shadows, borderRadius, spacing } from '../../config/theme'
import { ProfitText } from '../common/ProfitText'
import { formatCurrency } from '../../utils/formatters'

const { Title, Text } = Typography

export interface AccountCardProps {
  /** 账户ID */
  id: string
  /** 账户名称 */
  name: string
  /** 总资产 */
  totalAssets: number
  /** 总收益 */
  totalProfit: number
  /** 收益率 (小数，如 0.1234 表示 12.34%) */
  profitRate: number
  /** 基金数量 */
  fundCount: number
  /** 查看持仓回调 */
  onViewHoldings?: (id: string) => void
  /** 记录交易回调 */
  onRecordTransaction?: (id: string) => void
  /** 编辑回调 */
  onEdit?: (id: string) => void
  /** 删除回调 */
  onDelete?: (id: string) => void
  /** 自定义类名 */
  className?: string
}

export function AccountCard({
  id,
  name,
  totalAssets,
  totalProfit,
  profitRate,
  fundCount,
  onViewHoldings,
  onRecordTransaction,
  onEdit,
  onDelete,
  className,
}: AccountCardProps) {
  const cardStyle: React.CSSProperties = {
    borderRadius: borderRadius.medium,
    boxShadow: shadows.card,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  const handleViewHoldings = () => {
    onViewHoldings?.(id)
  }

  const handleRecordTransaction = () => {
    onRecordTransaction?.(id)
  }

  const handleEdit = () => {
    onEdit?.(id)
  }

  const handleDelete = () => {
    onDelete?.(id)
  }

  return (
    <Card
      className={className}
      style={cardStyle}
      styles={{
        body: { padding: spacing.md },
      }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = shadows.hover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = shadows.card
      }}
    >
      <Space vertical style={{ width: '100%' }} size={spacing.sm}>
        <Title
          level={5}
          style={{
            margin: 0,
            color: colors.neutral.title,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Title>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            总资产
          </Text>
          <div style={{ fontSize: 24, fontWeight: 600, color: colors.neutral.title }}>
            {formatCurrency(totalAssets)}
          </div>
        </div>

        <Space size={spacing.lg}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              总收益
            </Text>
            <div>
              <ProfitText value={totalProfit} prefix="¥" fontSize={16} fontWeight={600} />
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              收益率
            </Text>
            <div>
              <ProfitText value={profitRate} isRate fontSize={16} fontWeight={600} />
            </div>
          </div>
        </Space>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            持有基金
          </Text>
          <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: 500 }}>
            {fundCount} 只
          </Text>
        </div>

        <Space style={{ marginTop: spacing.sm }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={handleViewHoldings}
          >
            查看持仓
          </Button>
          <Button size="small" icon={<PlusOutlined />} onClick={handleRecordTransaction}>
            记录交易
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={handleDelete}>
            删除
          </Button>
        </Space>
      </Space>
    </Card>
  )
}

export default AccountCard