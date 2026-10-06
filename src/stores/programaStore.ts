// Qual programa de treino a agenda segue e o que os pais mudaram. Só no aparelho (localStorage).
//  - "goleiros": o calendário de pré-temporada de goleiros (61 dias, data/calendarioGoleiros.ts),
//    a partir de uma data de início escolhida pelos pais, repetindo ao terminar (se quiserem)
//  - "infantil": o plano de 4 semanas do app (data/agenda.json)
// Por cima do programa, os pais podem trocar o treino de qualquer data (alteracoes) e os links
// dos vídeos de cada treino (videos).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DiaPrograma } from '../data/calendarioGoleiros'
import { diaDaSemana, hojeISO, somarDias } from '../utils/data'

export type IdPrograma = 'goleiros' | 'infantil'

export interface ConfigPrograma {
  ativo: IdPrograma
  /** Dia 1 do calendário de goleiros (AAAA-MM-DD) */
  inicio: string
  /** Ao terminar os 61 dias, começa de novo */
  repetir: boolean
  /** Data (AAAA-MM-DD) → dia escolhido pelos pais, no lugar do que o programa diz */
  alteracoes: Record<string, DiaPrograma>
  /** Treino → link de vídeo escolhido pelos pais, no lugar do original */
  videos: Record<string, string>
}

interface ProgramaState extends ConfigPrograma {
  configurar: (parte: Partial<Pick<ConfigPrograma, 'ativo' | 'inicio' | 'repetir'>>) => void
  alterarDia: (dia: string, novo: DiaPrograma | null) => void
  alterarVideo: (treino: string, url: string | null) => void
}

/** Domingo da semana atual: o calendário de goleiros começa num domingo */
const domingoDestaSemana = () => somarDias(hojeISO(), -diaDaSemana(hojeISO()))

export const useProgramaStore = create<ProgramaState>()(
  persist(
    (set) => ({
      ativo: 'goleiros',
      inicio: domingoDestaSemana(),
      repetir: true,
      alteracoes: {},
      videos: {},
      configurar: (parte) => set(parte),
      // null = volta ao que o programa diz
      alterarDia: (dia, novo) =>
        set((s) => {
          const alteracoes = { ...s.alteracoes }
          if (novo) alteracoes[dia] = novo
          else delete alteracoes[dia]
          return { alteracoes }
        }),
      alterarVideo: (treino, url) =>
        set((s) => {
          const videos = { ...s.videos }
          if (url) videos[treino] = url
          else delete videos[treino]
          return { videos }
        }),
    }),
    {
      name: 'futkids-programa',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ativo: s.ativo, inicio: s.inicio, repetir: s.repetir, alteracoes: s.alteracoes, videos: s.videos }),
    },
  ),
)
