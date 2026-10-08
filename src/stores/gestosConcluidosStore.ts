// Fundamentos do goleiro marcados como "Concluída" (na trilha dos gestos ou num treino de
// fundamentos), com o dia em que a criança marcou. Só no aparelho.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { hojeISO } from '../utils/data'

interface GestosConcluidosState {
  /** id do gesto → dia (AAAA-MM-DD) em que foi concluído */
  concluidos: Record<string, string>
  marcar: (id: string) => void
  desmarcar: (id: string) => void
  alternar: (id: string) => void
}

export const useGestosConcluidosStore = create<GestosConcluidosState>()(
  persist(
    (set, get) => ({
      concluidos: {},
      marcar: (id) => {
        if (get().concluidos[id]) return
        set((s) => ({ concluidos: { ...s.concluidos, [id]: hojeISO() } }))
      },
      desmarcar: (id) =>
        set((s) => {
          const resto = { ...s.concluidos }
          delete resto[id]
          return { concluidos: resto }
        }),
      alternar: (id) => (get().concluidos[id] ? get().desmarcar(id) : get().marcar(id)),
    }),
    {
      name: 'futkids-gestos-concluidos',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
