// Saída do gol com cones: circuitos criados pelos pais e o vídeo de exemplo que eles põem em
// qualquer circuito (do app, da família ou da turma). Vale para toda a família (a sincronia leva
// para a nuvem). Os circuitos do treinador para a turma ficam na nuvem da escolinha (nuvemTatica).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Circuito } from '../features/saidaGol/circuitos'

interface CircuitosState {
  criados: Circuito[]
  /** Id do circuito → link do vídeo de exemplo (troca o do circuito) */
  videos: Record<string, string>
  salvarCircuito: (c: Circuito) => void
  apagarCircuito: (id: string) => void
  /** null = tira o vídeo posto pela família */
  definirVideo: (id: string, url: string | null) => void
}

export const useCircuitosStore = create<CircuitosState>()(
  persist(
    (set) => ({
      criados: [],
      videos: {},
      salvarCircuito: (c) => set((s) => ({ criados: s.criados.some((x) => x.id === c.id) ? s.criados.map((x) => (x.id === c.id ? c : x)) : [...s.criados, c] })),
      apagarCircuito: (id) => set((s) => ({ criados: s.criados.filter((x) => x.id !== id) })),
      definirVideo: (id, url) =>
        set((s) => {
          const videos = { ...s.videos }
          if (url) videos[id] = url
          else delete videos[id]
          return { videos }
        }),
    }),
    {
      name: 'futkids-circuitos',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ criados: s.criados, videos: s.videos }),
    },
  ),
)
