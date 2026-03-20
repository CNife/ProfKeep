/**
 * Dashboard 页面 Mock 数据
 * 包含资产总览、资产配置、收益趋势、持仓列表数据
 */

import type { HoldingItem } from '@/components/business/HoldingTable'

/**
 * 资产总览数据
 */
export interface AssetOverview {
  /** 总资产 */
  totalAssets: number
  /** 总收益 */
  totalProfit: number
  /** 总收益率 (小数) */
  totalProfitRate: number
  /** 持仓基金数 */
  fundCount: number
}

/**
 * 资产配置数据项
 */
export interface AssetAllocationItem {
  /** 基金类型 */
  type: string
  /** 资产金额 */
  value: number
}

/**
 * 收益趋势数据项
 */
export interface ProfitTrendItem {
  /** 日期 */
  date: string
  /** 累计收益 */
  profit: number
  /** 累计成本 */
  cost: number
}

/**
 * 生成资产总览 Mock 数据
 */
export function createAssetOverview(): AssetOverview {
  return {
    totalAssets: 156789.45,
    totalProfit: 12345.67,
    totalProfitRate: 0.0855,
    fundCount: 12,
  }
}

/**
 * 生成资产配置 Mock 数据
 */
export function createAssetAllocation(): AssetAllocationItem[] {
  return [
    { type: '股票型', value: 65000 },
    { type: '混合型', value: 45000 },
    { type: '债券型', value: 28000 },
    { type: '货币型', value: 15000 },
    { type: '指数型', value: 3789.45 },
  ]
}

/**
 * 生成收益趋势 Mock 数据 (近 180 天)
 */
export function createProfitTrend(days: number = 180): ProfitTrendItem[] {
  const data: ProfitTrendItem[] = []
  const today = new Date()
  let cumulativeProfit = 0
  let cumulativeCost = 144443.78 // 初始成本

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // 模拟每日收益波动 (-500 ~ +800)
    const dailyProfit = Math.random() * 1300 - 500
    cumulativeProfit += dailyProfit

    // 模拟定投增加成本 (每月 15 号)
    if (date.getDate() === 15) {
      cumulativeCost += 2000
    }

    data.push({
      date: date.toISOString().split('T')[0],
      profit: Math.round(cumulativeProfit * 100) / 100,
      cost: Math.round(cumulativeCost * 100) / 100,
    })
  }

  return data
}

/**
 * 生成持仓列表 Mock 数据 (前 10 大持仓)
 */
export function createHoldings(): HoldingItem[] {
  const funds = [
    { code: '110022', name: '易方达消费行业股票', type: '股票型' },
    { code: '000751', name: '嘉实新兴产业股票', type: '股票型' },
    { code: '163406', name: '兴全合润混合', type: '混合型' },
    { code: '000979', name: '景顺长城沪港深精选股票', type: '股票型' },
    { code: '519778', name: '交银定期支付双息平衡混合', type: '混合型' },
    { code: '000191', name: '富国天惠成长混合A', type: '混合型' },
    { code: '050027', name: '博时信用债券A/B', type: '债券型' },
    { code: '110018', name: '易方达增强回报债券A', type: '债券型' },
    { code: '000198', name: '天弘余额宝货币', type: '货币型' },
    { code: '511010', name: '国泰上证5年期国债ETF', type: '债券型' },
  ]

  return funds.map((fund, index) => {
    const shares = Math.round((Math.random() * 5000 + 1000) * 100) / 100
    const costPrice = Math.round((Math.random() * 2 + 0.5) * 10000) / 10000
    const latestNetValue = Math.round((costPrice * (1 + Math.random() * 0.3 - 0.1)) * 10000) / 10000
    const marketValue = Math.round(shares * latestNetValue * 100) / 100
    const cost = Math.round(shares * costPrice * 100) / 100
    const profit = Math.round((marketValue - cost) * 100) / 100
    const profitRate = cost > 0 ? Math.round((profit / cost) * 10000) / 10000 : 0

    return {
      id: `holding-${index + 1}`,
      fundCode: fund.code,
      fundName: fund.name,
      shares,
      costPrice,
      latestNetValue,
      marketValue,
      cost,
      profit,
      profitRate,
    }
  })
}

/**
 * 获取指定天数的收益趋势数据
 */
export function getProfitTrendByDays(days: number): ProfitTrendItem[] {
  const allData = createProfitTrend(180)
  return allData.slice(-days)
}