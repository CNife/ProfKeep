import { describe, it, expect } from 'vitest'
import { formatCurrency, formatShares, formatProfitRate, formatDate } from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('应该正确格式化正数金额', () => {
      expect(formatCurrency(1234.56)).toBe('¥1,234.56')
    })

    it('应该正确格式化整数金额', () => {
      expect(formatCurrency(1000)).toBe('¥1,000.00')
    })

    it('应该正确格式化小额金额', () => {
      expect(formatCurrency(0.5)).toBe('¥0.50')
    })

    it('应该正确格式化零', () => {
      expect(formatCurrency(0)).toBe('¥0.00')
    })

    it('应该正确格式化负数金额', () => {
      expect(formatCurrency(-1234.56)).toBe('¥-1,234.56')
    })

    it('应该正确格式化大额金额', () => {
      expect(formatCurrency(1234567.89)).toBe('¥1,234,567.89')
    })

    it('应该保留两位小数 (四舍五入)', () => {
      expect(formatCurrency(1234.567)).toBe('¥1,234.57')
    })
  })

  describe('formatShares', () => {
    it('应该正确格式化份额 (带单位)', () => {
      expect(formatShares(1234.56)).toBe('1,234.56 份')
    })

    it('应该正确格式化整数份额', () => {
      expect(formatShares(1000)).toBe('1,000.00 份')
    })

    it('应该正确格式化零份额', () => {
      expect(formatShares(0)).toBe('0.00 份')
    })

    it('应该正确格式化大额份额', () => {
      expect(formatShares(1234567.89)).toBe('1,234,567.89 份')
    })

    it('应该保留两位小数 (四舍五入)', () => {
      expect(formatShares(1234.567)).toBe('1,234.57 份')
    })
  })

  describe('formatProfitRate', () => {
    it('应该正确格式化正收益率 (带 + 号)', () => {
      expect(formatProfitRate(0.1234)).toBe('+12.34%')
    })

    it('应该正确格式化负收益率 (带 - 号)', () => {
      expect(formatProfitRate(-0.0567)).toBe('-5.67%')
    })

    it('应该正确格式化零收益率', () => {
      expect(formatProfitRate(0)).toBe('0.00%')
    })

    it('应该正确格式化小数值收益率', () => {
      expect(formatProfitRate(0.001)).toBe('+0.10%')
    })

    it('应该正确格式化大额收益率', () => {
      expect(formatProfitRate(1.2345)).toBe('+123.45%')
    })

    it('应该保留两位小数 (四舍五入)', () => {
      expect(formatProfitRate(0.12349)).toBe('+12.35%')
    })
  })

  describe('formatDate', () => {
    it('应该正确格式化 Date 对象', () => {
      const date = new Date('2026-03-18')
      expect(formatDate(date)).toBe('2026-03-18')
    })

    it('应该正确格式化日期字符串', () => {
      expect(formatDate('2026-03-18')).toBe('2026-03-18')
    })

    it('应该正确格式化时间戳', () => {
      const timestamp = new Date('2026-03-18').getTime()
      expect(formatDate(timestamp)).toBe('2026-03-18')
    })

    it('应该处理月初日期', () => {
      expect(formatDate('2026-01-05')).toBe('2026-01-05')
    })

    it('应该处理年末日期', () => {
      expect(formatDate('2025-12-31')).toBe('2025-12-31')
    })
  })
})
