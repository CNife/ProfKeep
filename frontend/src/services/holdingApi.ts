import { api } from './api'
import type { Holding, ApiResponse } from '../types'

export const holdingApi = {
  list: (accountId?: number) => {
    const params = accountId ? `?account=${accountId}` : ''
    return api.get<Holding[]>(`/holdings${params}`)
  },

  get: (id: number) => api.get<Holding>(`/holdings/${id}`),

  create: (data: Omit<Holding, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Holding>('/holdings', data),

  update: (id: number, data: Partial<Holding>) =>
    api.put<Holding>(`/holdings/${id}`, data),

  delete: (id: number) => api.delete<void>(`/holdings/${id}`),
}

export type HoldingListResponse = ApiResponse<Holding[]>
export type HoldingResponse = ApiResponse<Holding>