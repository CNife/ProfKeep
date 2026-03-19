/**
 * ProfitText - 收益文本组件
 *
 * 根据正负值自动显示红绿色，支持前缀和后缀。
 *
 * @example
 * ```tsx
 * // 使用 value prop
 * <ProfitText value={1234.56} suffix="元" />
 * <ProfitText value={0.125} suffix="%" isRate />
 *
 * // 使用 children
 * <ProfitText>¥1,234.56</ProfitText>
 * ```
 */

import { Typography } from 'antd'
import type { ReactNode } from 'react'
import { colors } from '../../config/theme'

const { Text } = Typography

export interface ProfitTextProps {
  /** 收益值（正数显示绿色，负数显示红色） */
  value?: number
  /** 前缀文本（如：¥） */
  prefix?: string
  /** 后缀文本（如：元、%） */
  suffix?: string
  /** 是否为收益率（自动添加 +/- 前缀） */
  isRate?: boolean
  /** 子元素（优先于 value） */
  children?: ReactNode
  /** 自定义类名 */
  className?: string
  /** 字体大小 */
  fontSize?: number | string
  /** 字体粗细 */
  fontWeight?: number | string
}

/**
 * ProfitText 组件
 *
 * 特性：
 * - 正收益显示绿色 (#52C41A)
 * - 负收益显示红色 (#FF4D4F)
 * - 零值显示中性色
 * - 支持自动添加 +/- 前缀（收益率模式）
 */
export function ProfitText({
  value,
  prefix,
  suffix,
  isRate = false,
  children,
  className,
  fontSize,
  fontWeight,
}: ProfitTextProps) {
  if (children !== undefined) {
    return (
      <Text className={className} style={{ fontSize, fontWeight }}>
        {children}
      </Text>
    )
  }

  if (value === undefined) {
    return null
  }

  const color =
    value > 0
      ? colors.success.main
      : value < 0
        ? colors.error.main
        : colors.neutral.text

  let displayText = ''

  if (isRate) {
    const percentage = value * 100
    const formatted = percentage.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    displayText = value > 0 ? `+${formatted}` : formatted
    displayText += suffix ?? '%'
  } else {
    const formatted = value.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    displayText = (prefix ?? '') + (value > 0 ? '+' : '') + formatted + (suffix ?? '')
  }

  return (
    <Text
      className={className}
      style={{
        color,
        fontSize,
        fontWeight,
        fontFamily: "'DIN Alternate', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {displayText}
    </Text>
  )
}

export default ProfitText