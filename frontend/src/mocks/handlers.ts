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

  // POST /api/accounts - 创建账户
  http.post('/api/accounts', async ({ request }) => {
    const body = await request.json()
    const { name, description } = body as { name?: string; description?: string }

    if (!name || name.trim() === '') {
      return HttpResponse.json(
        { success: false, error: '账户名称不能为空' },
        { status: 400 },
      )
    }

    const newAccount = createAccount({
      id: Math.max(...mockAccounts.map((a) => a.id), 0) + 1,
      name: name.trim(),
      description: description?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    mockAccounts.push(newAccount)

    return HttpResponse.json(
      {
        success: true,
        data: newAccount,
      },
      { status: 201 },
    )
  }),

  // PUT /api/accounts/:id - 更新账户
  http.put('/api/accounts/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const account = mockAccounts.find((a) => a.id === id)

    if (!account) {
      return HttpResponse.json(
        { success: false, error: '账户不存在' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const { name, description } = body as { name?: string; description?: string }

    if (name !== undefined && name.trim() === '') {
      return HttpResponse.json(
        { success: false, error: '账户名称不能为空' },
        { status: 400 },
      )
    }

    account.name = name?.trim() ?? account.name
    account.description = description?.trim() ?? account.description
    account.updated_at = new Date().toISOString()

    return HttpResponse.json({
      success: true,
      data: account,
    })
  }),

  // DELETE /api/accounts/:id - 删除账户
  http.delete('/api/accounts/:id', ({ params }) => {
    const id = Number(params.id)
    const index = mockAccounts.findIndex((a) => a.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: '账户不存在' },
        { status: 404 },
      )
    }

    mockAccounts.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: '账户已删除',
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

  // POST /api/holdings - 添加持仓
  http.post('/api/holdings', async ({ request }) => {
    const body = await request.json()
    const { account_id, fund_id, shares, cost_price } = body as {
      account_id?: number
      fund_id?: number
      shares?: number
      cost_price?: number
    }

    if (!account_id || !fund_id) {
      return HttpResponse.json(
        { success: false, error: '账户 ID 和基金 ID 为必填项' },
        { status: 400 },
      )
    }

    if (!shares || shares <= 0) {
      return HttpResponse.json(
        { success: false, error: '份额必须大于 0' },
        { status: 400 },
      )
    }

    if (!cost_price || cost_price <= 0) {
      return HttpResponse.json(
        { success: false, error: '成本价必须大于 0' },
        { status: 400 },
      )
    }

    const existingHolding = mockHoldings.find(
      (h) => h.account_id === account_id && h.fund_id === fund_id,
    )

    if (existingHolding) {
      return HttpResponse.json(
        { success: false, error: '该账户已持有此基金' },
        { status: 400 },
      )
    }

    const newHolding = createHolding({
      id: Math.max(...mockHoldings.map((h) => h.id), 0) + 1,
      account_id,
      fund_id,
      shares,
      cost_price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    mockHoldings.push(newHolding)

    return HttpResponse.json(
      {
        success: true,
        data: newHolding,
      },
      { status: 201 },
    )
  }),

  // PUT /api/holdings/:id - 更新持仓
  http.put('/api/holdings/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const holding = mockHoldings.find((h) => h.id === id)

    if (!holding) {
      return HttpResponse.json(
        { success: false, error: '持仓不存在' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const { shares, cost_price } = body as {
      shares?: number
      cost_price?: number
    }

    if (shares !== undefined && shares <= 0) {
      return HttpResponse.json(
        { success: false, error: '份额必须大于 0' },
        { status: 400 },
      )
    }

    if (cost_price !== undefined && cost_price <= 0) {
      return HttpResponse.json(
        { success: false, error: '成本价必须大于 0' },
        { status: 400 },
      )
    }

    holding.shares = shares ?? holding.shares
    holding.cost_price = cost_price ?? holding.cost_price
    holding.updated_at = new Date().toISOString()

    return HttpResponse.json({
      success: true,
      data: holding,
    })
  }),

  // DELETE /api/holdings/:id - 删除持仓
  http.delete('/api/holdings/:id', ({ params }) => {
    const id = Number(params.id)
    const index = mockHoldings.findIndex((h) => h.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: '持仓不存在' },
        { status: 404 },
      )
    }

    mockHoldings.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: '持仓已删除',
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

  // POST /api/transactions - 添加交易记录
  http.post('/api/transactions', async ({ request }) => {
    const body = await request.json()
    const {
      account_id,
      fund_id,
      type,
      date,
      shares,
      amount,
      fee = 0,
      net_value,
      notes,
    } = body as {
      account_id?: number
      fund_id?: number
      type?: Transaction['type']
      date?: string
      shares?: number
      amount?: number
      fee?: number
      net_value?: number
      notes?: string
    }

    if (!account_id || !fund_id) {
      return HttpResponse.json(
        { success: false, error: '账户 ID 和基金 ID 为必填项' },
        { status: 400 },
      )
    }

    if (!type || !['buy', 'sell', 'dividend'].includes(type)) {
      return HttpResponse.json(
        { success: false, error: '交易类型必须为 buy、sell 或 dividend' },
        { status: 400 },
      )
    }

    if (!date) {
      return HttpResponse.json(
        { success: false, error: '交易日期为必填项' },
        { status: 400 },
      )
    }

    if (type !== 'dividend' && (!shares || shares <= 0)) {
      return HttpResponse.json(
        { success: false, error: '份额必须大于 0' },
        { status: 400 },
      )
    }

    if (type !== 'dividend' && (!amount || amount <= 0)) {
      return HttpResponse.json(
        { success: false, error: '金额必须大于 0' },
        { status: 400 },
      )
    }

    if (fee < 0) {
      return HttpResponse.json(
        { success: false, error: '手续费不能为负数' },
        { status: 400 },
      )
    }

    const newTransaction = createTransaction({
      id: Math.max(...mockTransactions.map((t) => t.id), 0) + 1,
      account_id,
      fund_id,
      type,
      date,
      shares: type === 'dividend' ? undefined : shares,
      amount: type === 'dividend' ? undefined : amount,
      fee,
      net_value: net_value ?? (amount && shares ? amount / shares : undefined),
      notes: notes?.trim(),
      created_at: new Date().toISOString(),
    })

    mockTransactions.push(newTransaction)

    return HttpResponse.json(
      {
        success: true,
        data: newTransaction,
      },
      { status: 201 },
    )
  }),

  // PUT /api/transactions/:id - 更新交易记录
  http.put('/api/transactions/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const transaction = mockTransactions.find((t) => t.id === id)

    if (!transaction) {
      return HttpResponse.json(
        { success: false, error: '交易记录不存在' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const {
      type,
      date,
      shares,
      amount,
      fee,
      net_value,
      notes,
    } = body as {
      type?: Transaction['type']
      date?: string
      shares?: number
      amount?: number
      fee?: number
      net_value?: number
      notes?: string
    }

    if (type !== undefined && !['buy', 'sell', 'dividend'].includes(type)) {
      return HttpResponse.json(
        { success: false, error: '交易类型必须为 buy、sell 或 dividend' },
        { status: 400 },
      )
    }

    if (type !== 'dividend' && shares !== undefined && shares <= 0) {
      return HttpResponse.json(
        { success: false, error: '份额必须大于 0' },
        { status: 400 },
      )
    }

    if (type !== 'dividend' && amount !== undefined && amount <= 0) {
      return HttpResponse.json(
        { success: false, error: '金额必须大于 0' },
        { status: 400 },
      )
    }

    if (fee !== undefined && fee < 0) {
      return HttpResponse.json(
        { success: false, error: '手续费不能为负数' },
        { status: 400 },
      )
    }

    transaction.type = type ?? transaction.type
    transaction.date = date ?? transaction.date
    transaction.shares = type === 'dividend' ? undefined : (shares ?? transaction.shares)
    transaction.amount = type === 'dividend' ? undefined : (amount ?? transaction.amount)
    transaction.fee = fee ?? transaction.fee
    transaction.net_value =
      net_value ??
      (amount && shares ? amount / shares : transaction.net_value)
    transaction.notes = notes?.trim() ?? transaction.notes
    transaction.created_at = new Date().toISOString()

    return HttpResponse.json({
      success: true,
      data: transaction,
    })
  }),

  // DELETE /api/transactions/:id - 删除交易记录
  http.delete('/api/transactions/:id', ({ params }) => {
    const id = Number(params.id)
    const index = mockTransactions.findIndex((t) => t.id === id)

    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: '交易记录不存在' },
        { status: 404 },
      )
    }

    mockTransactions.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: '交易记录已删除',
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
