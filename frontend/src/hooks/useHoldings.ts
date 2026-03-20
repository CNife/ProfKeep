import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { holdingApi } from '../services/holdingApi'
import { queryKeys } from '../services/api'
import type { Holding } from '../types'

export function useHoldings(accountId?: number) {
  return useQuery({
    queryKey: queryKeys.holdings(accountId),
    queryFn: () => holdingApi.list(accountId),
    select: (response) => response.data,
  })
}

export function useHolding(id: number) {
  return useQuery({
    queryKey: queryKeys.holding(id),
    queryFn: () => holdingApi.get(id),
    select: (response) => response.data,
    enabled: id > 0,
  })
}

export function useCreateHolding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Holding, 'id' | 'created_at' | 'updated_at'>) =>
      holdingApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings() })
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings(data.account_id) })
    },
  })
}

export function useUpdateHolding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Holding> }) =>
      holdingApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings() })
      queryClient.invalidateQueries({ queryKey: queryKeys.holding(id) })
    },
  })
}

export function useDeleteHolding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => holdingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings() })
    },
  })
}