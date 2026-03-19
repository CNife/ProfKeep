/**
 * FundSelector - 基金选择器组件
 *
 * 输入基金代码（6位数字），自动获取并显示基金信息。
 *
 * @example
 * ```tsx
 * <FundSelector
 *   onSelect={(fund) => console.log('选中基金:', fund)}
 *   placeholder="请输入基金代码"
 * />
 * ```
 */

import { useState, useEffect } from 'react'
import { Input, Spin, Typography, Space, Alert } from 'antd'
import { SearchOutlined, FundOutlined } from '@ant-design/icons'
import type { InputProps } from 'antd'
import { colors, spacing } from '../../config/theme'

const { Text } = Typography

/** 基金信息接口 */
export interface FundInfo {
  id: number
  code: string
  name: string
  type: string
  company: string
  manager: string
  establish_date: string
}

export interface FundSelectorProps {
  /** 选中基金时的回调 */
  onSelect?: (fund: FundInfo) => void
  /** 输入框占位符 */
  placeholder?: string
  /** 自定义类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 默认基金代码 */
  defaultValue?: string
  /** 输入框尺寸 */
  size?: InputProps['size']
}

/**
 * FundSelector 组件
 *
 * 特性：
 * - 6位数字验证
 * - 自动获取基金信息（使用 MSW Mock）
 * - 显示加载状态
 * - 显示基金名称、类型、公司
 * - 错误提示
 */
export function FundSelector({
  onSelect,
  placeholder = '请输入6位基金代码',
  className,
  disabled = false,
  defaultValue,
  size = 'middle',
}: FundSelectorProps) {
  const [code, setCode] = useState(defaultValue ?? '')
  const [loading, setLoading] = useState(false)
  const [fund, setFund] = useState<FundInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isValidCode = (value: string): boolean => /^\d{6}$/.test(value)

  const fetchFundInfo = async (fundCode: string) => {
    if (!isValidCode(fundCode)) {
      setError('请输入正确的6位基金代码')
      setFund(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/funds/search?code=${fundCode}`)
      const result = await response.json()

      if (result.success && result.data) {
        setFund(result.data)
        setError(null)
        onSelect?.(result.data)
      } else {
        setError(result.error ?? '未找到该基金')
        setFund(null)
      }
    } catch (err) {
      setError('获取基金信息失败，请稍后重试')
      setFund(null)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setFund(null)
    setError(null)
  }

  const handleSearch = () => {
    if (code.length === 6) {
      fetchFundInfo(code)
    }
  }

  useEffect(() => {
    if (defaultValue && isValidCode(defaultValue)) {
      fetchFundInfo(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  return (
    <div className={className}>
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined style={{ color: colors.neutral.secondary }} />}
        suffix={
          loading ? <Spin size="small" /> : <FundOutlined style={{ color: colors.neutral.secondary }} />
        }
        value={code}
        onChange={handleInputChange}
        onPressEnter={handleSearch}
        onBlur={handleSearch}
        disabled={disabled}
        size={size}
        maxLength={6}
        status={error ? 'error' : undefined}
        style={{ width: '100%' }}
      />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: spacing.sm, fontSize: '12px' }}
        />
      )}

      {fund && !error && (
        <div
          style={{
            marginTop: spacing.sm,
            padding: spacing.sm,
            backgroundColor: colors.background.hover,
            borderRadius: '4px',
            border: `1px solid ${colors.neutral.border}`,
          }}
        >
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong style={{ color: colors.neutral.title }}>
              {fund.name}
            </Text>
            <Space size={8}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                类型: {fund.type}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                公司: {fund.company}
              </Text>
            </Space>
          </Space>
        </div>
      )}
    </div>
  )
}

export default FundSelector