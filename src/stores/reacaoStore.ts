// Treino de reação: drills criados pelos pais/treinador e o histórico de cada vez que um drill
// foi feito. Tudo só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Drill, ModoDrill } from '../features/reacao/drills'

export interface SessaoReacao {
  id: string
  /** Data e hora do fim (ISO) */
  quando: string
  drillId: string
  /** Nome e ícone no momento do treino (o drill pode ser mudado ou apagado depois) */
  nome: string
  emoji: string
  modo: ModoDrill
  /** Sinais mostrados */
  sinais: number
  seriesFeitas: number
  seriesTotal: number
  duracaoS: number
  /** false = parou antes do fim */
  completo: boolean
  /** Só no modo toque */
  acertos?: number
  erros?: number
  /** Sinais que passaram sem resposta */
  perdidos?: number
  /** Tempo de reação dos acertos, em milissegundos */
  mediaMs?: number
  melhorMs?: number
}

/** Mais que isso, as sessões mais antigas saem (o localStorage é pequeno) */
const MAXIMO_SESSOES = 500

interface ReacaoState {
  drills: Drill[]
  sessoes: SessaoReacao[]
  salvarDrill: (drill: Drill) => void
  removerDrill: (id: string) => void
  registrarSessao: (sessao: SessaoReacao) => void
  removerSessao: (id: string) => void
  limparHistorico: () => void
}

export const useReacaoStore = create<ReacaoState>()(
  persist(
    (set) => ({
      drills: [],
      sessoes: [],
      salvarDrill: (drill) =>
        set((s) => ({
          drills: s.drills.some((d) => d.id === drill.id) ? s.drills.map((d) => (d.id === drill.id ? drill : d)) : [...s.drills, drill],
        })),
      removerDrill: (id) => set((s) => ({ drills: s.drills.filter((d) => d.id !== id) })),
      registrarSessao: (sessao) => set((s) => ({ sessoes: [...s.sessoes, sessao].slice(-MAXIMO_SESSOES) })),
      removerSessao: (id) => set((s) => ({ sessoes: s.sessoes.filter((x) => x.id !== id) })),
      limparHistorico: () => set({ sessoes: [] }),
    }),
    {
      name: 'futkids-reacao',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ drills: s.drills, sessoes: s.sessoes }),
    },
  ),
)
