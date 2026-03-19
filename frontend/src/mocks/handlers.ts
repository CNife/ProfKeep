import { http, HttpResponse } from 'msw'

// ==================== 数据类型定义 ====================

/** 账户 */
interface Account {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

/** 基金信息 */
interface Fund {
  id: number
  code: string
  name: string
  type: string
  company: string
  manager: string
  establish_date: string
  created_at: string
  updated_at: string
}

/** 持仓 */
interface Holding {
  id: number
  account_id: number
  fund_id: number
  shares: number
  cost_price: number
  created_at: string
  updated_at: string
  fund?: Fund
}

/** 交易记录 */
interface Transaction {
  id: number
  account_id: number
  fund_id: number
  type: 'buy' | 'sell' | 'dividend'
  date: string
  shares?: number
  amount?: number
  fee: number
  net_value?: number
  notes?: string
  created_at: string
}

// ==================== Mock 数据工厂函数 ====================

/** 生成账户 Mock 数据 */
function createAccount(overrides?: Partial<Account>): Account {
  return {
    id: 1,
    name: '支付宝账户',
    description: '主要投资账户',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-19T00:00:00Z',
    ...overrides,
  }
}

/** 生成基金 Mock 数据 */
function createFund(overrides?: Partial<Fund>): Fund {
  return {
    id: 1,
    code: '000001',
    name: '华夏成长混合',
    type: '混合型',
    company: '华夏基金',
    manager: '张三',
    establish_date: '2020-01-01',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-19T00:00:00Z',
    ...overrides,
  }
}

/** 生成持仓 Mock 数据 */
function createHolding(overrides?: Partial<Holding>): Holding {
  return {
    id: 1,
    account_id: 1,
    fund_id: 1,
    shares: 1000.5,
    cost_price: 1.5,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-19T00:00:00Z',
    ...overrides,
  }
}

/** 生成交易记录 Mock 数据 */
function createTransaction(overrides?: Partial<Transaction>): Transaction {
  return {
    id: 1,
    account_id: 1,
    fund_id: 1,
    type: 'buy',
    date: '2026-03-01',
    shares: 500,
    amount: 750.0,
    fee: 1.5,
    net_value: 1.5,
    notes: '首次买入',
    created_at: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

// ==================== Mock 数据 ====================

const mockAccounts: Account[] = [
  createAccount({ id: 1, name: '支付宝账户', description: '主要投资账户' }),
  createAccount({ id: 2, name: '天天基金账户', description: '辅助投资账户' }),
  createAccount({ id: 3, name: '银行理财账户', description: '保守型投资' }),
]

const mockFunds: Fund[] = [
  createFund({ id: 1, code: '000001', name: '华夏成长混合', type: '混合型' }),
  createFund({ id: 2, code: '000002', name: '易方达蓝筹精选', type: '股票型' }),
  createFund({ id: 3, code: '000003', name: '南方宝元债券', type: '债券型' }),
  createFund({ id: 4, code: '000004', name: '嘉实沪深 300ETF 联接', type: '指数型' }),
]

const mockHoldings: Holding[] = [
  createHolding({ id: 1, account_id: 1, fund_id: 1, shares: 1000.5, cost_price: 1.5 }),
  createHolding({ id: 2, account_id: 1, fund_id: 2, shares: 500.25, cost_price: 2.3 }),
  createHolding({ id: 3, account_id: 2, fund_id: 3, shares: 2000.0, cost_price: 1.1 }),
]

const mockTransactions: Transaction[] = [
  createTransaction({
    id: 1,
    account_id: 1,
    fund_id: 1,
    type: 'buy',
    date: '2026-03-01',
    shares: 500,
    amount: 750.0,
    fee: 1.5,
    net_value: 1.5,
    notes: '首次买入',
  }),
  createTransaction({
    id: 2,
    account_id: 1,
    fund_id: 1,
    type: 'buy',
    date: '2026-03-10',
    shares: 500.5,
    amount: 751.0,
    fee: 1.5,
    net_value: 1.501,
    notes: '追加投资',
  }),
  createTransaction({
    id: 3,
    account_id: 1,
    fund_id: 2,
    type: 'buy',
    date: '2026-03-05',
    shares: 500.25,
    amount: 1150.58,
    fee: 2.3,
    net_value: 2.3,
    notes: '建仓蓝筹',
  }),
  createTransaction({
    id: 4,
    account_id: 2,
    fund_id: 3,
    type: 'buy',
    date: '2026-02-20',
    shares: 2000.0,
    amount: 2200.0,
    fee: 2.2,
    net_value: 1.1,
    notes: '配置债券',
  }),
]

// ==================== API Handlers ====================

export const handlers = [
  // GET /api/accounts - 获取账户列表
  http.get('/api/accounts', () => {
    return HttpResponse.json({
      success: true,
      data: mockAccounts,
      total: mockAccounts.length,
    })
  }),

  // GET /api/accounts/:id - 获取账户详情
  http.get('/api/accounts/:id', ({ params }) => {
    const id = Number(params.id)
    const account = mockAccounts.find((a) => a.id === id)

    if (!account) {
      return HttpResponse.json(
        { success: false, error: '账户不存在' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: account,
    })
  }),

  // GET /api/funds - 获取基金列表
  http.get('/api/funds', () => {
    return HttpResponse.json({
      success: true,
      data: mockFunds,
      total: mockFunds.length,
    })
  }),

  // GET /api/funds/:id - 获取基金详情
  http.get('/api/funds/:id', ({ params }) => {
    const id = Number(params.id)
    const fund = mockFunds.find((f) => f.id === id)

    if (!fund) {
      return HttpResponse.json(
        { success: false, error: '基金不存在' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: fund,
    })
  }),

  // GET /api/funds/search - 按代码搜索基金
  http.get('/api/funds/search', ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return HttpResponse.json(
        { success: false, error: '请提供基金代码' },
        { status: 400 },
      )
    }

    const fund = mockFunds.find((f) => f.code === code)

    if (!fund) {
      return HttpResponse.json(
        { success: false, error: '未找到该基金' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: fund,
    })
  }),

  // GET /api/holdings - 获取持仓列表
  http.get('/api/holdings', ({ request }) => {
    const url = new URL(request.url)
    const accountId = url.searchParams.get('account')

    let holdings = mockHoldings

    if (accountId) {
      holdings = holdings.filter((h) => h.account_id === Number(accountId))
    }

    // 关联基金信息
    const holdingsWithFund = holdings.map((holding) => ({
      ...holding,
      fund: mockFunds.find((f) => f.id === holding.fund_id),
    }))

    return HttpResponse.json({
      success: true,
      data: holdingsWithFund,
      total: holdings.length,
    })
  }),

  // GET /api/holdings/:id - 获取持仓详情
  http.get('/api/holdings/:id', ({ params }) => {
    const id = Number(params.id)
    const holding = mockHoldings.find((h) => h.id === id)

    if (!holding) {
      return HttpResponse.json(
        { success: false, error: '持仓不存在' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        ...holding,
        fund: mockFunds.find((f) => f.id === holding.fund_id),
      },
    })
  }),

  // GET /api/transactions - 获取交易记录
  http.get('/api/transactions', ({ request }) => {
    const url = new URL(request.url)
    const accountId = url.searchParams.get('account')
    const fundId = url.searchParams.get('fund')
    const type = url.searchParams.get('type') as Transaction['type'] | null

    let transactions = mockTransactions

    if (accountId) {
      transactions = transactions.filter(
        (t) => t.account_id === Number(accountId),
      )
    }

    if (fundId) {
      transactions = transactions.filter(
        (t) => t.fund_id === Number(fundId),
      )
    }

    if (type) {
      transactions = transactions.filter((t) => t.type === type)
    }

    return HttpResponse.json({
      success: true,
      data: transactions,
      total: transactions.length,
    })
  }),

  // GET /api/transactions/:id - 获取交易记录详情
  http.get('/api/transactions/:id', ({ params }) => {
    const id = Number(params.id)
    const transaction = mockTransactions.find((t) => t.id === id)

    if (!transaction) {
      return HttpResponse.json(
        { success: false, error: '交易记录不存在' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: transaction,
    })
  }),
]

// ==================== 导出 Mock 数据工厂 ====================

export {
  createAccount,
  createFund,
  createHolding,
  createTransaction,
  mockAccounts,
  mockFunds,
  mockHoldings,
  mockTransactions,
}
