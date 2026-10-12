// Plano das turmas (escolinha) de cada atleta, guardado neste aparelho para a agenda funcionar sem
// internet. Quem preenche é a sincronia (nuvemEscolinha.ouvirTurmas); a agenda só lê.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ItemDia } from '../data/calendarioGoleiros'

export interface PlanoDaTurma {
  turma: string
  nome: string
  escolinha: string
  /** AAAA-MM-DD → treinos do dia */
  dias: Record<string, ItemDia[]>
}

interface TurmasState {
  porAtleta: Record<string, PlanoDaTurma[]>
  definir: (atleta: string, planos: PlanoDaTurma[]) => void
  esquecer: () => void
}

export const useTurmasStore = create<TurmasState>()(
  persist(
    (set) => ({
      porAtleta: {},
      definir: (atleta, planos) => set((s) => ({ porAtleta: { ...s.porAtleta, [atleta]: planos } })),
      esquecer: () => set({ porAtleta: {} }),
    }),
    { name: 'futkids-turmas', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)

const VAZIO: PlanoDaTurma[] = []

/** Planos de turma do atleta (vazio sem conta/escolinha) */
export function planosDoAtleta(atleta: string | null): PlanoDaTurma[] {
  return (atleta && useTurmasStore.getState().porAtleta[atleta]) || VAZIO
}
