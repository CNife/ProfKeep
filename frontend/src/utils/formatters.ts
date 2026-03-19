/**
 * 格式化货币金额 (人民币)
 *
 * @param value - 金额数值
 * @returns 格式化后的字符串 (如：¥1,234.56)
 */
export function formatCurrency(value: number): string {
  const formatted = value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `¥${formatted}`
}

/**
 * 格式化基金份额
 *
 * @param value - 份额数值
 * @returns 格式化后的字符串 (如：1,234.56 份)
 */
export function formatShares(value: number): string {
  const formatted = value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} 份`
}

/**
 * 格式化收益率 (百分比)
 *
 * @param value - 收益率小数值 (如 0.1234 表示 12.34%)
 * @returns 格式化后的字符串 (如：+12.34%, -5.67%, 0.00%)
 */
export function formatProfitRate(value: number): string {
  const percentage = value * 100
  const formatted = percentage.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  if (value > 0) {
    return `+${formatted}%`
  } else if (value < 0) {
    return `${formatted}%`
  } else {
    return `${formatted}%`
  }
}

/**
 * 格式化日期
 *
 * @param date - 日期 (Date 对象、字符串或时间戳)
 * @returns 格式化后的字符串 (如：2026-03-18)
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
