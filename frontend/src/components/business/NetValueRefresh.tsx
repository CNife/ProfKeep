/**
 * NetValueRefresh - 净值刷新组件
 *
 * 显示当前净值，支持手动刷新。
 *
 * @example
 * ```tsx
 * <NetValueRefresh
 *   value={1.2345}
 *   updatedAt="2026-03-19 15:00:00"
 *   onRefresh={() => console.log('刷新净值')}
 * />
 * ```
 */

import { Button, Typography, Tooltip, message, Flex } from 'antd'
import { SyncOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { colors, spacing } from '../../config/theme'

const { Text, Title } = Typography

export interface NetValueRefreshProps {
  /** 当前净值 */
  value?: number
  /** 更新时间 */
  updatedAt?: string
  /** 刷新回调 */
  onRefresh?: () => void | Promise<void>
  /** 是否禁用刷新 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 净值日期 */
  date?: string
}

/**
 * NetValueRefresh 组件
 *
 * 特性：
 * - 显示当前净值（大字体）
 * - 显示净值日期
 * - 刷新按钮（loading 状态）
 * - 更新时间 tooltip
 */
export function NetValueRefresh({
  value,
  updatedAt,
  onRefresh,
  disabled = false,
  className,
  date,
}: NetValueRefreshProps) {
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return

    setLoading(true)
    try {
      await onRefresh()
      message.success('净值已更新')
    } catch (error) {
      message.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const formatNetValue = (val: number): string => {
    return val.toFixed(4)
  }

  return (
    <div
      className={className}
      style={{
        padding: spacing.md,
        background: colors.background.card,
        borderRadius: 8,
        border: `1px solid ${colors.neutral.border}`,
      }}
    >
      <Flex vertical gap={spacing.sm} style={{ width: '100%' }}>
        {/* 标题行 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            最新净值
          </Text>
          {updatedAt && (
            <Tooltip title={`更新时间: ${updatedAt}`}>
              <InfoCircleOutlined style={{ color: colors.neutral.secondary, cursor: 'pointer' }} />
            </Tooltip>
          )}
        </div>

        {/* 净值显示 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.xs }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: colors.neutral.title,
              fontFamily: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {value !== undefined ? formatNetValue(value) : '--'}
          </Title>
          {date && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({date})
            </Text>
          )}
        </div>

        {/* 刷新按钮 */}
        <Button
          type="primary"
          icon={<SyncOutlined spin={loading} />}
          onClick={handleRefresh}
          loading={loading}
          disabled={disabled}
          style={{ width: '100%' }}
        >
          {loading ? '刷新中...' : '刷新净值'}
        </Button>
      </Flex>
    </div>
  )
}

export default NetValueRefresh