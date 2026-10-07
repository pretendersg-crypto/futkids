// Futsal Tático: rating (Elo), sequência de acertos e histórico dos puzzles. Só no aparelho.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { novoRating, RATING_INICIAL } from '../features/tatica/rating'
import type { Puzzle } from '../features/tatica/tipos'

export interface TentativaTatica {
  puzzle: string
  quando: string
  /** Resolveu sem errar e sem revelar */
  acertou: boolean
  usouDica: boolean
  revelou: boolean
  erros: number
  tempoS: number
  /** Rating depois desta tentativa e quanto mudou */
  rating: number
  delta: number
}

export interface DesempenhoPuzzle {
  tentativas: number
  acertos: number
  /** Última vez: acertou? */
  ultimoAcerto: boolean
}

/** Mais que isso, as tentativas mais antigas saem do histórico (o localStorage é pequeno) */
const MAXIMO_HISTORICO = 300

interface TaticaState {
  rating: number
  melhorRating: number
  /** Puzzles seguidos resolvidos sem errar */
  sequencia: number
  melhorSequencia: number
  porPuzzle: Record<string, DesempenhoPuzzle>
  historico: TentativaTatica[]
  /** Guarda o resultado de um puzzle e devolve a tentativa (com a mudança do rating) */
  registrar: (puzzle: Puzzle, r: { acertou: boolean; usouDica: boolean; revelou: boolean; erros: number; tempoS: number }) => TentativaTatica
  zerar: () => void
}

const INICIAL = { rating: RATING_INICIAL, melhorRating: RATING_INICIAL, sequencia: 0, melhorSequencia: 0, porPuzzle: {}, historico: [] }

export const useTaticaStore = create<TaticaState>()(
  persist(
    (set, get) => ({
      ...INICIAL,
      registrar: (puzzle, r) => {
        const s = get()
        const rating = novoRating(s.rating, puzzle.rating, r.acertou, r.usouDica)
        const tentativa: TentativaTatica = { puzzle: puzzle.id, quando: new Date().toISOString(), ...r, rating, delta: rating - s.rating }
        const anterior = s.porPuzzle[puzzle.id] ?? { tentativas: 0, acertos: 0, ultimoAcerto: false }
        const sequencia = r.acertou ? s.sequencia + 1 : 0
        set({
          rating,
          melhorRating: Math.max(s.melhorRating, rating),
          sequencia,
          melhorSequencia: Math.max(s.melhorSequencia, sequencia),
          porPuzzle: {
            ...s.porPuzzle,
            [puzzle.id]: { tentativas: anterior.tentativas + 1, acertos: anterior.acertos + (r.acertou ? 1 : 0), ultimoAcerto: r.acertou },
          },
          historico: [...s.historico, tentativa].slice(-MAXIMO_HISTORICO),
        })
        return tentativa
      },
      zerar: () => set(INICIAL),
    }),
    {
      name: 'futkids-tatica',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        rating: s.rating,
        melhorRating: s.melhorRating,
        sequencia: s.sequencia,
        melhorSequencia: s.melhorSequencia,
        porPuzzle: s.porPuzzle,
        historico: s.historico,
      }),
    },
  ),
)
