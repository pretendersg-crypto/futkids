// Fundamentos e gestos do goleiro mudados ou criados pelos pais/treinador (área dos pais), só no
// aparelho (localStorage). Imagens e vídeos gravados ficam no IndexedDB (utils/midiaLocal.ts):
// aqui só os ids deles.
//  - editados: gesto que já vem no app, com as mudanças dos pais (no lugar do original)
//  - criados: gestos novos
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { GESTOS_PRONTOS, type Gesto } from '../features/saidaGol/gestos'

interface GestosState {
  editados: Record<string, Gesto>
  criados: Gesto[]
  /** Salva um gesto (do app ou criado) */
  salvarGesto: (gesto: Gesto) => void
  /** Gesto do app volta ao original */
  restaurarGesto: (id: string) => void
  /** Apaga um gesto criado */
  removerGesto: (id: string) => void
}

export const ehGestoPronto = (id: string) => GESTOS_PRONTOS.some((g) => g.id === id)

export const useGestosStore = create<GestosState>()(
  persist(
    (set) => ({
      editados: {},
      criados: [],
      salvarGesto: (gesto) =>
        set((s) =>
          ehGestoPronto(gesto.id)
            ? { editados: { ...s.editados, [gesto.id]: gesto } }
            : { criados: s.criados.some((g) => g.id === gesto.id) ? s.criados.map((g) => (g.id === gesto.id ? gesto : g)) : [...s.criados, gesto] },
        ),
      restaurarGesto: (id) =>
        set((s) => {
          const editados = { ...s.editados }
          delete editados[id]
          return { editados }
        }),
      removerGesto: (id) => set((s) => ({ criados: s.criados.filter((g) => g.id !== id) })),
    }),
    {
      name: 'futkids-gestos',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ editados: s.editados, criados: s.criados }),
    },
  ),
)

/** Todos os gestos: os do app (com as mudanças dos pais) e os criados */
export function todosOsGestos(s: Pick<GestosState, 'editados' | 'criados'>): Gesto[] {
  return [...GESTOS_PRONTOS.map((g) => s.editados[g.id] ?? g), ...s.criados]
}
