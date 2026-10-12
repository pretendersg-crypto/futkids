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
  /** Plano individual do treinador para este atleta (não o da turma toda) */
  individual?: boolean
}

/** Vídeo do treinador que este atleta pode ver (da turma ou só dele) */
export interface VideoGuardado {
  id: string
  titulo: string
  tipo: 'tatico' | 'exercicio' | 'outro'
  caminho: string
  em: number
  /** null = turma toda */
  atleta: string | null
  turma: string
}

interface TurmasState {
  porAtleta: Record<string, PlanoDaTurma[]>
  videosPorAtleta: Record<string, VideoGuardado[]>
  definir: (atleta: string, planos: PlanoDaTurma[]) => void
  definirVideos: (atleta: string, videos: VideoGuardado[]) => void
  esquecer: () => void
}

export const useTurmasStore = create<TurmasState>()(
  persist(
    (set) => ({
      porAtleta: {},
      videosPorAtleta: {},
      definir: (atleta, planos) => set((s) => ({ porAtleta: { ...s.porAtleta, [atleta]: planos } })),
      definirVideos: (atleta, videos) =>
        set((s) => ({ videosPorAtleta: { ...s.videosPorAtleta, [atleta]: videos.map(({ id, titulo, tipo, caminho, em, atleta: a, turma }) => ({ id, titulo, tipo, caminho, em, atleta: a, turma })) } })),
      esquecer: () => set({ porAtleta: {}, videosPorAtleta: {} }),
    }),
    { name: 'futkids-turmas', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)

const VAZIO: PlanoDaTurma[] = []

/** Planos de turma do atleta (vazio sem conta/escolinha) */
export function planosDoAtleta(atleta: string | null): PlanoDaTurma[] {
  return (atleta && useTurmasStore.getState().porAtleta[atleta]) || VAZIO
}
