// Futsal Tático: puzzles e pranchetas criados pelos pais (valem para todos os filhos e aparelhos da
// família; a sincronia leva para a nuvem). Os do treinador ficam na turma (conta/nuvemTatica.ts).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Prancheta, Puzzle } from '../features/tatica/tipos'

interface TaticaCriadaState {
  puzzles: Puzzle[]
  pranchetas: Prancheta[]
  salvarPuzzle: (p: Puzzle) => void
  apagarPuzzle: (id: string) => void
  salvarPrancheta: (p: Prancheta) => void
  apagarPrancheta: (id: string) => void
}

const trocarOuIncluir = <T extends { id: string }>(lista: T[], item: T) => (lista.some((x) => x.id === item.id) ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item])

export const useTaticaCriadaStore = create<TaticaCriadaState>()(
  persist(
    (set) => ({
      puzzles: [],
      pranchetas: [],
      salvarPuzzle: (p) => set((s) => ({ puzzles: trocarOuIncluir(s.puzzles, p) })),
      apagarPuzzle: (id) => set((s) => ({ puzzles: s.puzzles.filter((x) => x.id !== id) })),
      salvarPrancheta: (p) => set((s) => ({ pranchetas: trocarOuIncluir(s.pranchetas, p) })),
      apagarPrancheta: (id) => set((s) => ({ pranchetas: s.pranchetas.filter((x) => x.id !== id) })),
    }),
    {
      name: 'futkids-tatica-criada',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ puzzles: s.puzzles, pranchetas: s.pranchetas }),
    },
  ),
)
