// Preferências do aparelho (só no localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ConfigState {
  somAtivo: boolean
  alternarSom: () => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      somAtivo: true,
      alternarSom: () => set((s) => ({ somAtivo: !s.somAtivo })),
    }),
    {
      name: 'futkids-config',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ somAtivo: s.somAtivo }),
    },
  ),
)
