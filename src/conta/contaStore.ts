// Conta da família NESTE aparelho: quem entrou (só o id e o e-mail do responsável, que vêm do Google),
// os filhos da conta (apelidos) e qual filho usa este aparelho agora. Fica só no aparelho.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Filho {
  id: string
  apelido: string
}

export type EstadoSincronia = 'parada' | 'sincronizando' | 'em-dia' | 'sem-internet' | 'erro'

interface ContaState {
  uid: string | null
  email: string | null
  filhos: Filho[]
  /** Filho cujos dados estão ativos neste aparelho (null = ainda não escolheu) */
  filhoAtivo: string | null
  /** Última sincronia completa (ms) */
  sincronizadoEm: number | null
  estado: EstadoSincronia
  erro: string | null
  entrou: (uid: string, email: string | null) => void
  definirFilhos: (filhos: Filho[]) => void
  definirFilhoAtivo: (id: string | null) => void
  definirEstado: (estado: EstadoSincronia, erro?: string | null) => void
  marcarSincronizado: () => void
  limpar: () => void
}

export const useContaStore = create<ContaState>()(
  persist(
    (set) => ({
      uid: null,
      email: null,
      filhos: [],
      filhoAtivo: null,
      sincronizadoEm: null,
      estado: 'parada',
      erro: null,
      entrou: (uid, email) => set({ uid, email }),
      definirFilhos: (filhos) => set({ filhos }),
      definirFilhoAtivo: (filhoAtivo) => set({ filhoAtivo }),
      definirEstado: (estado, erro = null) => set({ estado, erro }),
      marcarSincronizado: () => set({ sincronizadoEm: Date.now(), estado: 'em-dia', erro: null }),
      limpar: () => set({ uid: null, email: null, filhos: [], filhoAtivo: null, sincronizadoEm: null, estado: 'parada', erro: null }),
    }),
    {
      name: 'futkids-conta',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ uid: s.uid, email: s.email, filhos: s.filhos, filhoAtivo: s.filhoAtivo, sincronizadoEm: s.sincronizadoEm }),
    },
  ),
)

/** Apelido do filho ativo neste aparelho (ou null) */
export function apelidoDoFilhoAtivo(): string | null {
  const { filhos, filhoAtivo } = useContaStore.getState()
  return filhos.find((f) => f.id === filhoAtivo)?.apelido ?? null
}
