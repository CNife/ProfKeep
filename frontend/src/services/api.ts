import type { ApiResponse } from '../types'

const API_BASE_URL = '/api'

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    return {
      success: false,
      data: null as T,
      error: data.error ?? `HTTP Error: ${response.status}`,
    }
  }

  return data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: 'DELETE',
    }),
}

export const queryKeys = {
  accounts: ['accounts'] as const,
  account: (id: number) => ['accounts', id] as const,
  holdings: (accountId?: number) =>
    accountId ? (['holdings', accountId] as const) : (['holdings'] as const),
  holding: (id: number) => ['holdings', id] as const,
  transactions: (filters?: TransactionFilters) =>
    filters ? (['transactions', filters] as const) : (['transactions'] as const),
  transaction: (id: number) => ['transactions', id] as const,
  funds: ['funds'] as const,
  fund: (id: number) => ['funds', id] as const,
  fundSearch: (code: string) => ['funds', 'search', code] as const,
}

interface TransactionFilters {
  accountId?: number
  fundId?: number
  type?: string
}