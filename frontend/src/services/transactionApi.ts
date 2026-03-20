import { api } from './api'
import type { Transaction, TransactionType, ApiResponse } from '../types'

interface TransactionFilters {
  accountId?: number
  fundId?: number
  type?: TransactionType
}

export const transactionApi = {
  list: (filters?: TransactionFilters) => {
    const params = new URLSearchParams()
    if (filters?.accountId) params.set('account', String(filters.accountId))
    if (filters?.fundId) params.set('fund', String(filters.fundId))
    if (filters?.type) params.set('type', filters.type)

    const queryString = params.toString()
    return api.get<Transaction[]>(`/transactions${queryString ? `?${queryString}` : ''}`)
  },

  get: (id: number) => api.get<Transaction>(`/transactions/${id}`),

  create: (data: Omit<Transaction, 'id' | 'created_at'>) =>
    api.post<Transaction>('/transactions', data),

  update: (id: number, data: Partial<Transaction>) =>
    api.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: number) => api.delete<void>(`/transactions/${id}`),
}

export type TransactionListResponse = ApiResponse<Transaction[]>
export type TransactionResponse = ApiResponse<Transaction>