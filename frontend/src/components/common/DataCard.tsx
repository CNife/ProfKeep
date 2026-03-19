/**
 * DataCard - 通用数据卡片组件
 *
 * 用于展示数据区块的卡片容器，支持标题、额外操作区域和悬停阴影效果。
 *
 * @example
 * ```tsx
 * <DataCard title="持仓概览" extra={<Button>查看详情</Button>}>
 *   <div>卡片内容</div>
 * </DataCard>
 * ```
 */

import { Card, Typography } from 'antd'
import type { ReactNode } from 'react'
import { colors, shadows, borderRadius } from '../../config/theme'

const { Title } = Typography

export interface DataCardProps {
  /** 卡片标题 */
  title: string
  /** 额外操作区域（右上角） */
  extra?: ReactNode
  /** 卡片内容 */
  children: ReactNode
  /** 自定义类名 */
  className?: string
  /** 是否禁用悬停效果 */
  disableHover?: boolean
}

/**
 * DataCard 组件
 *
 * 特性：
 * - 使用设计系统定义的圆角和阴影
 * - 悬停时显示增强阴影效果
 * - 响应式宽度（100%）
 */
export function DataCard({
  title,
  extra,
  children,
  className,
  disableHover = false,
}: DataCardProps) {
  return (
    <Card
      className={className}
      styles={{
        header: {
          borderBottom: `1px solid ${colors.neutral.border}`,
          padding: '12px 16px',
        },
        body: {
          padding: '16px',
        },
      }}
      title={
        <Title
          level={5}
          style={{
            margin: 0,
            color: colors.neutral.title,
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          {title}
        </Title>
      }
      extra={extra}
      style={{
        borderRadius: borderRadius.medium,
        boxShadow: shadows.card,
        transition: 'box-shadow 0.3s ease',
        width: '100%',
      }}
      hoverable={!disableHover}
    >
      {children}
    </Card>
  )
}

export default DataCard