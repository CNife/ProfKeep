import { describe, it, expect } from 'vitest'
import { calculateCostPrice, calculateProfit, calculateProfitRate } from '../calculators'

describe('calculators', () => {
  describe('calculateCostPrice', () => {
    it('应该正确计算加权平均成本价 (两次买入)', () => {
      // 测试用例：两次买入 (500 份@1.20, 500 份@1.18)
      // 成本价 = (500*1.20 + 500*1.18) / 1000 = 1.19
      const transactions = [
        { type: 'buy' as const, shares: 500, amount: 600 }, // 500 份 @ 1.20
        { type: 'buy' as const, shares: 500, amount: 590 }, // 500 份 @ 1.18
      ]

      const result = calculateCostPrice(transactions)

      expect(result).toBeCloseTo(1.19, 4)
    })

    it('应该处理卖出操作 (按比例减少成本)', () => {
      // 先买入 1000 份 @ 1.20，成本 1200
      // 卖出 500 份，按比例减少成本：1200 * (500/1000) = 600
      // 剩余成本：1200 - 600 = 600，剩余份额：500
      // 成本价 = 600 / 500 = 1.20
      const transactions = [
        { type: 'buy' as const, shares: 1000, amount: 1200 },
        { type: 'sell' as const, shares: 500, amount: 600 },
      ]

      const result = calculateCostPrice(transactions)

      expect(result).toBeCloseTo(1.20, 4)
    })

    it('应该处理红利再投资 (增加份额，不增加成本)', () => {
      // 买入 1000 份 @ 1.20，成本 1200
      // 红利再投资 100 份，成本不变
      // 成本价 = 1200 / 1100 = 1.0909...
      const transactions = [
        { type: 'buy' as const, shares: 1000, amount: 1200 },
        { type: 'dividend' as const, shares: 100, amount: 0, dividendType: 'reinvest' as const },
      ]

      const result = calculateCostPrice(transactions)

      expect(result).toBeCloseTo(1.0909, 4)
    })

    it('应该处理现金分红 (不影响份额和成本)', () => {
      // 买入 1000 份 @ 1.20，成本 1200
      // 现金分红 100 元，不影响份额和成本
      // 成本价 = 1200 / 1000 = 1.20
      const transactions = [
        { type: 'buy' as const, shares: 1000, amount: 1200 },
        { type: 'dividend' as const, shares: 0, amount: 100, dividendType: 'cash' as const },
      ]

      const result = calculateCostPrice(transactions)

      expect(result).toBeCloseTo(1.20, 4)
    })

    it('空交易列表应该返回 0', () => {
      const transactions: Array<{
        type: 'buy' | 'sell' | 'dividend'
        shares: number
        amount: number
        dividendType?: 'reinvest' | 'cash'
      }> = []

      const result = calculateCostPrice(transactions)

      expect(result).toBe(0)
    })

    it('份额为 0 时应该返回 0', () => {
      // 买入后全部卖出
      const transactions = [
        { type: 'buy' as const, shares: 1000, amount: 1200 },
        { type: 'sell' as const, shares: 1000, amount: 1300 },
      ]

      const result = calculateCostPrice(transactions)

      expect(result).toBe(0)
    })
  })

  describe('calculateProfit', () => {
    it('应该正确计算持仓收益 (盈利场景)', () => {
      const holding = {
        shares: 1000,
        cost_price: 1.20,
      }
      const latestNetValue = 1.35

      const result = calculateProfit(holding, latestNetValue)

      expect(result.market_value).toBeCloseTo(1350, 2)
      expect(result.cost).toBeCloseTo(1200, 2)
      expect(result.profit).toBeCloseTo(150, 2)
      expect(result.profit_rate).toBeCloseTo(12.5, 2)
    })

    it('应该正确计算持仓收益 (亏损场景)', () => {
      const holding = {
        shares: 1000,
        cost_price: 1.20,
      }
      const latestNetValue = 1.10

      const result = calculateProfit(holding, latestNetValue)

      expect(result.market_value).toBeCloseTo(1100, 2)
      expect(result.cost).toBeCloseTo(1200, 2)
      expect(result.profit).toBeCloseTo(-100, 2)
      expect(result.profit_rate).toBeCloseTo(-8.33, 2)
    })

    it('应该处理成本为 0 的情况 (避免除以 0)', () => {
      const holding = {
        shares: 1000,
        cost_price: 0,
      }
      const latestNetValue = 1.20

      const result = calculateProfit(holding, latestNetValue)

      expect(result.market_value).toBeCloseTo(1200, 2)
      expect(result.cost).toBe(0)
      expect(result.profit).toBeCloseTo(1200, 2)
      expect(result.profit_rate).toBe(0)
    })
  })

  describe('calculateProfitRate', () => {
    it('应该正确计算收益率 (正收益)', () => {
      const result = calculateProfitRate(150, 1200)
      expect(result).toBeCloseTo(12.5, 2)
    })

    it('应该正确计算收益率 (负收益)', () => {
      const result = calculateProfitRate(-100, 1200)
      expect(result).toBeCloseTo(-8.33, 2)
    })

    it('应该处理成本为 0 的情况 (返回 0)', () => {
      const result = calculateProfitRate(100, 0)
      expect(result).toBe(0)
    })

    it('应该处理利润为 0 的情况 (返回 0)', () => {
      const result = calculateProfitRate(0, 1200)
      expect(result).toBe(0)
    })
  })
})
