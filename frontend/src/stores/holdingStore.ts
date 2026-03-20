import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Holding, StoreState, StoreActions } from '../types'

interface HoldingState extends StoreState {
  holdings: Holding[]
}

interface HoldingActions extends StoreActions {
  fetchHoldings: (accountId?: number) => Promise<void>
  addHolding: (holding: Omit<Holding, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateHolding: (id: number, holding: Partial<Holding>) => Promise<void>
  deleteHolding: (id: number) => Promise<void>
  setHoldings: (holdings: Holding[]) => void
  getHoldingsByAccount: (accountId: number) => Holding[]
}

type HoldingStore = HoldingState & HoldingActions

export const useHoldingStore = create<HoldingStore>()(
  persist(
    (set, get) => ({
      holdings: [],
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      setHoldings: (holdings) => set({ holdings }),

      getHoldingsByAccount: (accountId) => {
        return get().holdings.filter((h) => h.account_id === accountId)
      },

      fetchHoldings: async (accountId) => {
        set({ loading: true, error: null })
        try {
          const url = accountId ? `/api/holdings?account=${accountId}` : '/api/holdings'
          const response = await fetch(url)
          const result = await response.json()
          if (result.success) {
            set({ holdings: result.data, loading: false })
          } else {
            set({ error: result.error ?? '获取持仓列表失败', loading: false })
          }
        } catch {
          set({ error: '网络错误，请稍后重试', loading: false })
        }
      },

      addHolding: async (holdingData) => {
        set({ loading: true, error: null })
        try {
          const now = new Date().toISOString()
          const newHolding: Holding = {
            ...holdingData,
            id: Date.now(),
            created_at: now,
            updated_at: now,
          }
          set((state) => ({
            holdings: [...state.holdings, newHolding],
            loading: false,
          }))
        } catch {
          set({ error: '添加持仓失败', loading: false })
        }
      },

      updateHolding: async (id, holdingData) => {
        set({ loading: true, error: null })
        try {
          set((state) => ({
            holdings: state.holdings.map((holding) =>
              holding.id === id
                ? { ...holding, ...holdingData, updated_at: new Date().toISOString() }
                : holding,
            ),
            loading: false,
          }))
        } catch {
          set({ error: '更新持仓失败', loading: false })
        }
      },

      deleteHolding: async (id) => {
        set({ loading: true, error: null })
        try {
          set((state) => ({
            holdings: state.holdings.filter((holding) => holding.id !== id),
            loading: false,
          }))
        } catch {
          set({ error: '删除持仓失败', loading: false })
        }
      },
    }),
    {
      name: 'holding-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ holdings: state.holdings }),
    },
  ),
)