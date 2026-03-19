/**
 * 交易记录类型
 */
export interface Transaction {
  type: 'buy' | 'sell' | 'dividend'
  shares: number
  amount: number
  dividendType?: 'reinvest' | 'cash'
}

/**
 * 持仓信息类型
 */
export interface Holding {
  shares: number
  cost_price: number
}

/**
 * 收益计算结果类型
 */
export interface ProfitResult {
  market_value: number
  cost: number
  profit: number
  profit_rate: number
}

/**
 * 计算持仓成本价 (加权平均法)
 *
 * 算法说明:
 * - 买入：增加总成本和总份额
 * - 卖出：按比例减少成本和份额
 * - 红利再投资：增加份额，不增加成本
 * - 现金分红：不影响成本和份额
 *
 * @param transactions - 交易记录数组
 * @returns 持仓成本价 (元/份)
 */
export function calculateCostPrice(transactions: Transaction[]): number {
  let totalCost = 0
  let totalShares = 0

  for (const tx of transactions) {
    if (tx.type === 'buy') {
      totalCost += tx.amount
      totalShares += tx.shares
    } else if (tx.type === 'sell') {
      // 卖出按比例减少成本
      if (totalShares > 0) {
        const costReduction = (tx.shares / totalShares) * totalCost
        totalCost -= costReduction
        totalShares -= tx.shares
      }
    } else if (tx.type === 'dividend') {
      if (tx.dividendType === 'reinvest' && tx.shares > 0) {
        // 红利再投资：增加份额，不增加成本
        totalShares += tx.shares
      }
      // 现金分红不影响成本和份额
    }
  }

  if (totalShares === 0) {
    return 0
  }

  return totalCost / totalShares
}

/**
 * 计算持仓收益
 *
 * @param holding - 持仓信息 (份额和成本价)
 * @param latestNetValue - 最新净值
 * @returns 收益计算结果 (市值、成本、收益、收益率)
 */
export function calculateProfit(holding: Holding, latestNetValue: number): ProfitResult {
  const market_value = holding.shares * latestNetValue
  const cost = holding.shares * holding.cost_price
  const profit = market_value - cost
  const profit_rate = cost > 0 ? (profit / cost) * 100 : 0

  return {
    market_value,
    cost,
    profit,
    profit_rate,
  }
}

/**
 * 计算收益率
 *
 * @param profit - 收益金额
 * @param cost - 成本金额
 * @returns 收益率 (百分比值，如 12.5 表示 12.5%)
 */
export function calculateProfitRate(profit: number, cost: number): number {
  if (cost === 0) {
    return 0
  }

  return (profit / cost) * 100
}
