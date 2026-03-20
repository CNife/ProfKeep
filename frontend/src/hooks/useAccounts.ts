import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountApi } from '../services/accountApi'
import { queryKeys } from '../services/api'
import type { Account } from '../types'

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: accountApi.list,
    select: (response) => response.data,
  })
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: queryKeys.account(id),
    queryFn: () => accountApi.get(id),
    select: (response) => response.data,
    enabled: id > 0,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Account, 'id' | 'created_at' | 'updated_at'>) =>
      accountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Account> }) =>
      accountApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.account(id) })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => accountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
    },
  })
}