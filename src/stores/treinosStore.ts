// Treinos do "Treinar" mudados pelos pais (área dos pais), só no aparelho (localStorage):
//  - exercicios: a lista de exercícios de uma série, no lugar da que vem em data/exercicios.json
//  - seriesExtras: treinos novos criados pelos pais (com os próprios exercícios)
// Os GIFs próprios ficam no IndexedDB (utils/midiaLocal.ts); aqui só guardamos o id deles.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Exercicio } from '../data/catalogo'

export interface SerieExtra {
  modulo: string
  titulo: string
  emoji: string
  descricao: string
}

interface TreinosState {
  /** módulo → exercícios editados (substitui a lista original da série) */
  exercicios: Record<string, Exercicio[]>
  seriesExtras: SerieExtra[]
  /** Salva os exercícios de uma série (original ou nova); `extra` cria/atualiza um treino novo */
  salvarSerie: (modulo: string, exercicios: Exercicio[], extra?: SerieExtra) => void
  /** Série original volta aos exercícios de fábrica */
  restaurarSerie: (modulo: string) => void
  /** Apaga um treino criado pelos pais */
  removerSerieExtra: (modulo: string) => void
}

export const useTreinosStore = create<TreinosState>()(
  persist(
    (set) => ({
      exercicios: {},
      seriesExtras: [],
      salvarSerie: (modulo, exercicios, extra) =>
        set((s) => ({
          exercicios: { ...s.exercicios, [modulo]: exercicios },
          seriesExtras: extra
            ? s.seriesExtras.some((x) => x.modulo === modulo)
              ? s.seriesExtras.map((x) => (x.modulo === modulo ? extra : x))
              : [...s.seriesExtras, extra]
            : s.seriesExtras,
        })),
      restaurarSerie: (modulo) =>
        set((s) => {
          const exercicios = { ...s.exercicios }
          delete exercicios[modulo]
          return { exercicios }
        }),
      removerSerieExtra: (modulo) =>
        set((s) => {
          const exercicios = { ...s.exercicios }
          delete exercicios[modulo]
          return { exercicios, seriesExtras: s.seriesExtras.filter((x) => x.modulo !== modulo) }
        }),
    }),
    {
      name: 'futkids-treinos',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ exercicios: s.exercicios, seriesExtras: s.seriesExtras }),
    },
  ),
)
