import { api } from './api'
import type { Account, ApiResponse } from '../types'

export const accountApi = {
  list: () => api.get<Account[]>('/accounts'),

  get: (id: number) => api.get<Account>(`/accounts/${id}`),

  create: (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Account>('/accounts', data),

  update: (id: number, data: Partial<Account>) =>
    api.put<Account>(`/accounts/${id}`, data),

  delete: (id: number) => api.delete<void>(`/accounts/${id}`),
}

export type AccountListResponse = ApiResponse<Account[]>
export type AccountResponse = ApiResponse<Account>