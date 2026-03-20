/**
 * 类型定义统一导出
 * 所有业务数据类型从这里导出
 */

/** 账户 */
export interface Account {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

/** 基金信息 */
export interface Fund {
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
export interface Holding {
  id: number
  account_id: number
  fund_id: number
  shares: number
  cost_price: number
  created_at: string
  updated_at: string
  fund?: Fund
}

/** 交易类型 */
export type TransactionType = 'buy' | 'sell' | 'dividend'

/** 交易记录 */
export interface Transaction {
  id: number
  account_id: number
  fund_id: number
  type: TransactionType
  date: string
  shares?: number
  amount?: number
  fee: number
  net_value?: number
  notes?: string
  created_at: string
}

/** API 响应基础结构 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  total?: number
  error?: string
}

/** Store 状态基础接口 */
export interface StoreState {
  loading: boolean
  error: string | null
}

/** Store 动作基础接口 */
export interface StoreActions {
  clearError: () => void
}