// O que a criança já fez no módulo de alimentação: lições vistas e a garrafinha de água do dia.
// Só no aparelho (localStorage).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { MomentoAgua } from '../data/alimentacao'
import { hojeISO, somarDias } from '../utils/data'

interface AlimentacaoState {
  licoesVistas: string[]
  /** Dia (AAAA-MM-DD) → momentos em que bebeu água (antes, durante, depois) */
  agua: Record<string, MomentoAgua[]>
  /** Dias em que a garrafinha completa já deu prêmio (uma vez por dia, mesmo desmarcando e marcando) */
  aguaPremiada: string[]
  /** Jogo → último dia (AAAA-MM-DD) em que deu prêmio: cada jogo premia uma vez por dia */
  premios: Record<string, string>
  verLicao: (id: string) => void
  /** Marca o prêmio de hoje do jogo; devolve false se hoje ele já tinha dado prêmio */
  pegarPremioDoDia: (jogo: string) => boolean
  /** Marca/desmarca um momento de hoje; devolve true quando completou os 3 pela 1ª vez hoje */
  marcarAgua: (momento: MomentoAgua) => boolean
}

export const useAlimentacaoStore = create<AlimentacaoState>()(
  persist(
    (set, get) => ({
      licoesVistas: [],
      agua: {},
      aguaPremiada: [],
      premios: {},
      pegarPremioDoDia: (jogo) => {
        const hoje = hojeISO()
        if (get().premios[jogo] === hoje) return false
        set((s) => ({ premios: { ...s.premios, [jogo]: hoje } }))
        return true
      },
      verLicao: (id) => set((s) => (s.licoesVistas.includes(id) ? s : { licoesVistas: [...s.licoesVistas, id] })),
      marcarAgua: (momento) => {
        const hoje = hojeISO()
        const doDia = get().agua[hoje] ?? []
        const novo = doDia.includes(momento) ? doDia.filter((m) => m !== momento) : [...doDia, momento]
        // Guarda só as últimas semanas
        const limite = somarDias(hoje, -30)
        const agua = Object.fromEntries(Object.entries({ ...get().agua, [hoje]: novo }).filter(([dia]) => dia > limite))
        const completouAgora = novo.length === 3 && !get().aguaPremiada.includes(hoje)
        set({ agua, aguaPremiada: completouAgora ? [...get().aguaPremiada, hoje].slice(-60) : get().aguaPremiada })
        return completouAgora
      },
    }),
    {
      name: 'futkids-alimentacao',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ licoesVistas: s.licoesVistas, agua: s.agua, aguaPremiada: s.aguaPremiada, premios: s.premios }),
    },
  ),
)
