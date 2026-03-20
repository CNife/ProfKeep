/**
 * Holdings 页面 Mock 数据
 * 包含持仓列表、净值走势、基金详情数据
 */

import type { HoldingItem } from '@/components/business/HoldingTable'

/**
 * 基金详情数据
 */
export interface FundDetail {
  /** 基金ID */
  id: string
  /** 基金代码 */
  code: string
  /** 基金名称 */
  name: string
  /** 基金类型 */
  type: string
  /** 基金公司 */
  company: string
  /** 基金经理 */
  manager: string
  /** 成立日期 */
  establishDate: string
  /** 当前净值 */
  netValue: number
  /** 日涨跌 (小数) */
  dayChange: number
  /** 持仓份额 */
  shares: number
  /** 成本价 */
  costPrice: number
  /** 持仓市值 */
  marketValue: number
  /** 持仓成本 */
  cost: number
  /** 收益 */
  profit: number
  /** 收益率 (小数) */
  profitRate: number
}

/**
 * 净值走势数据项
 */
export interface NetValueTrendItem {
  /** 日期 */
  date: string
  /** 净值 */
  netValue: number
  [key: string]: string | number
}

/**
 * 基金基础信息
 */
const funds = [
  { code: '110022', name: '易方达消费行业股票', type: '股票型', company: '易方达基金', manager: '萧楠' },
  { code: '000751', name: '嘉实新兴产业股票', type: '股票型', company: '嘉实基金', manager: '归凯' },
  { code: '163406', name: '兴全合润混合', type: '混合型', company: '兴全基金', manager: '谢治宇' },
  { code: '000979', name: '景顺长城沪港深精选股票', type: '股票型', company: '景顺长城基金', manager: '刘彦春' },
  { code: '519778', name: '交银定期支付双息平衡混合', type: '混合型', company: '交银施罗德基金', manager: '杨浩' },
  { code: '000191', name: '富国天惠成长混合A', type: '混合型', company: '富国基金', manager: '朱少醒' },
  { code: '050027', name: '博时信用债券A/B', type: '债券型', company: '博时基金', manager: '过钧' },
  { code: '110018', name: '易方达增强回报债券A', type: '债券型', company: '易方达基金', manager: '王晓晨' },
]

/**
 * 生成持仓列表 Mock 数据
 * @param accountId 账户ID (可选，用于筛选)
 */
export function createHoldings(accountId?: string): HoldingItem[] {
  // 如果指定了账户ID，只返回该账户的持仓
  const accountFilter = accountId ? parseInt(accountId, 10) : null

  const holdings: HoldingItem[] = funds.map((fund, index) => {
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

  // 如果指定了账户ID，返回部分持仓（模拟账户筛选）
  if (accountFilter !== null) {
    // 根据账户ID返回不同数量的持仓
    const count = accountFilter % 3 === 0 ? 3 : accountFilter % 3 === 1 ? 5 : 2
    return holdings.slice(0, count)
  }

  return holdings
}

/**
 * 生成基金详情 Mock 数据
 * @param fundCode 基金代码
 */
export function createFundDetail(fundCode: string): FundDetail | null {
  const fund = funds.find((f) => f.code === fundCode)
  if (!fund) return null

  const shares = Math.round((Math.random() * 5000 + 1000) * 100) / 100
  const costPrice = Math.round((Math.random() * 2 + 0.5) * 10000) / 10000
  const netValue = Math.round((costPrice * (1 + Math.random() * 0.3 - 0.1)) * 10000) / 10000
  const dayChange = Math.round((Math.random() * 0.06 - 0.03) * 10000) / 10000
  const marketValue = Math.round(shares * netValue * 100) / 100
  const cost = Math.round(shares * costPrice * 100) / 100
  const profit = Math.round((marketValue - cost) * 100) / 100
  const profitRate = cost > 0 ? Math.round((profit / cost) * 10000) / 10000 : 0

  return {
    id: fundCode,
    code: fund.code,
    name: fund.name,
    type: fund.type,
    company: fund.company,
    manager: fund.manager,
    establishDate: '2015-06-15',
    netValue,
    dayChange,
    shares,
    costPrice,
    marketValue,
    cost,
    profit,
    profitRate,
  }
}

/**
 * 生成净值走势 Mock 数据
 * @param days 天数
 */
export function createNetValueTrend(days: number = 90): NetValueTrendItem[] {
  const data: NetValueTrendItem[] = []
  const today = new Date()
  let netValue = 1.5 + Math.random() * 0.5 // 初始净值

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // 模拟净值波动 (-2% ~ +2%)
    const change = (Math.random() * 0.04 - 0.02)
    netValue = Math.round(netValue * (1 + change) * 10000) / 10000

    data.push({
      date: date.toISOString().split('T')[0],
      netValue,
    })
  }

  return data
}

/**
 * 获取指定天数的净值走势数据
 */
export function getNetValueTrendByDays(days: number): NetValueTrendItem[] {
  const allData = createNetValueTrend(180)
  return allData.slice(-days)
}