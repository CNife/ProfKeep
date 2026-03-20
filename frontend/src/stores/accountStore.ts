import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Account, StoreState, StoreActions } from '../types'

interface AccountState extends StoreState {
  accounts: Account[]
}

interface AccountActions extends StoreActions {
  fetchAccounts: () => Promise<void>
  createAccount: (account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAccount: (id: number, account: Partial<Account>) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
  setAccounts: (accounts: Account[]) => void
}

type AccountStore = AccountState & AccountActions

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      accounts: [],
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      setAccounts: (accounts) => set({ accounts }),

      fetchAccounts: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch('/api/accounts')
          const result = await response.json()
          if (result.success) {
            set({ accounts: result.data, loading: false })
          } else {
            set({ error: result.error ?? '获取账户列表失败', loading: false })
          }
        } catch {
          set({ error: '网络错误，请稍后重试', loading: false })
        }
      },

      createAccount: async (accountData) => {
        set({ loading: true, error: null })
        try {
          const now = new Date().toISOString()
          const newAccount: Account = {
            ...accountData,
            id: Date.now(),
            created_at: now,
            updated_at: now,
          }
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            loading: false,
          }))
        } catch {
          set({ error: '创建账户失败', loading: false })
        }
      },

      updateAccount: async (id, accountData) => {
        set({ loading: true, error: null })
        try {
          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === id
                ? { ...account, ...accountData, updated_at: new Date().toISOString() }
                : account,
            ),
            loading: false,
          }))
        } catch {
          set({ error: '更新账户失败', loading: false })
        }
      },

      deleteAccount: async (id) => {
        set({ loading: true, error: null })
        try {
          set((state) => ({
            accounts: state.accounts.filter((account) => account.id !== id),
            loading: false,
          }))
        } catch {
          set({ error: '删除账户失败', loading: false })
        }
      },
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accounts: state.accounts }),
    },
  ),
)