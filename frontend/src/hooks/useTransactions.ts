import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionApi } from '../services/transactionApi'
import { queryKeys } from '../services/api'
import type { Transaction, TransactionType } from '../types'

interface TransactionFilters {
  accountId?: number
  fundId?: number
  type?: TransactionType
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => transactionApi.list(filters),
    select: (response) => response.data,
  })
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => transactionApi.get(id),
    select: (response) => response.data,
    enabled: id > 0,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'created_at'>) =>
      transactionApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() })
      if (data.account_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions({ accountId: data.account_id }),
        })
      }
      if (data.fund_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions({ fundId: data.fund_id }),
        })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings() })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) =>
      transactionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings() })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transactionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() })
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings() })
    },
  })
}