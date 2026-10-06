// Preferências do aparelho (só no localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ConfigState {
  somAtivo: boolean
  alternarSom: () => void
  /** A faixa "Instale o FutKids" da Home foi fechada ("Agora não"); o botão do Perfil continua */
  faixaInstalarFechada: boolean
  fecharFaixaInstalar: () => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      somAtivo: true,
      alternarSom: () => set((s) => ({ somAtivo: !s.somAtivo })),
      faixaInstalarFechada: false,
      fecharFaixaInstalar: () => set({ faixaInstalarFechada: true }),
    }),
    {
      name: 'futkids-config',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ somAtivo: s.somAtivo, faixaInstalarFechada: s.faixaInstalarFechada }),
    },
  ),
)
