import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, TransactionType, StoreState, StoreActions } from '../types'

interface TransactionState extends StoreState {
  transactions: Transaction[]
}

interface TransactionActions extends StoreActions {
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>
  updateTransaction: (id: number, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  setTransactions: (transactions: Transaction[]) => void
  getTransactionsByAccount: (accountId: number) => Transaction[]
  getTransactionsByFund: (fundId: number) => Transaction[]
  getTransactionsByType: (type: TransactionType) => Transaction[]
}

interface TransactionFilters {
  accountId?: number
  fundId?: number
  type?: TransactionType
}

type TransactionStore = TransactionState & TransactionActions

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      setTransactions: (transactions) => set({ transactions }),

      getTransactionsByAccount: (accountId) => {
        return get().transactions.filter((t) => t.account_id === accountId)
      },

      getTransactionsByFund: (fundId) => {
        return get().transactions.filter((t) => t.fund_id === fundId)
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type)
      },

      fetchTransactions: async (filters) => {
        set({ loading: true, error: null })
        try {
          const params = new URLSearchParams()
          if (filters?.accountId) params.set('account', String(filters.accountId))
          if (filters?.fundId) params.set('fund', String(filters.fundId))
          if (filters?.type) params.set('type', filters.type)

          const url = params.toString() ? `/api/transactions?${params}` : '/api/transactions'
          const response = await fetch(url)
          const result = await response.json()
          if (result.success) {
            set({ transactions: result.data, loading: false })
          } else {
            set({ error: result.error ?? '获取交易记录失败', loading: false })
          }
        } catch {
          set({ error: '网络错误，请稍后重试', loading: false })
        }
      },

      addTransaction: async (transactionData) => {
        set({ loading: true, error: null })
        try {
          const newTransaction: Transaction = {
            ...transactionData,
            id: Date.now(),
          }
          set((state) => ({
            transactions: [...state.transactions, newTransaction],
            loading: false,
          }))
        } catch {
          set({ error: '添加交易记录失败', loading: false })
        }
      },

      updateTransaction: async (id, transactionData) => {
        set({ loading: true, error: null })
        try {
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id ? { ...transaction, ...transactionData } : transaction,
            ),
            loading: false,
          }))
        } catch {
          set({ error: '更新交易记录失败', loading: false })
        }
      },

      deleteTransaction: async (id) => {
        set({ loading: true, error: null })
        try {
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
            loading: false,
          }))
        } catch {
          set({ error: '删除交易记录失败', loading: false })
        }
      },
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ transactions: state.transactions }),
    },
  ),
)