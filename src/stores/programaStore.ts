// Qual programa de treino a agenda segue e o que os pais mudaram. Só no aparelho (localStorage).
//  - "goleiros": o calendário de pré-temporada de goleiros (61 dias, data/calendarioGoleiros.ts),
//    a partir de uma data de início escolhida pelos pais, repetindo ao terminar (se quiserem)
//  - "infantil": o plano de 4 semanas do app (data/agenda.json)
// Por cima do programa, os pais podem trocar o treino de qualquer data (alteracoes) e os links
// dos vídeos de cada treino (videos), adicionar vídeos novos com tipo e ícone (extras) e mudar a
// categoria em que cada vídeo do calendário é liberado (categorias).
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DiaPrograma, TreinoExtra } from '../data/calendarioGoleiros'
import type { CategoriaId } from '../data/categorias'
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
  /** Vídeos de treino adicionados pelos pais (com tipo, ícone e link do YouTube) */
  extras: TreinoExtra[]
  /** Treino do calendário → categoria do vídeo escolhida pelos pais (no lugar da original) */
  categorias: Record<string, CategoriaId>
}

interface ProgramaState extends ConfigPrograma {
  configurar: (parte: Partial<Pick<ConfigPrograma, 'ativo' | 'inicio' | 'repetir'>>) => void
  alterarDia: (dia: string, novo: DiaPrograma | null) => void
  alterarVideo: (treino: string, url: string | null) => void
  /** null = volta à categoria original */
  mudarCategoriaVideo: (treino: string, categoria: CategoriaId | null) => void
  adicionarExtra: (extra: Omit<TreinoExtra, 'id'>) => void
  alterarExtra: (id: string, parte: Partial<Omit<TreinoExtra, 'id'>>) => void
  /** Remove o vídeo e tira ele dos dias em que os pais tinham colocado */
  removerExtra: (id: string) => void
  /** Tira um treino dos dias em que os pais tinham colocado (ex.: treino de fundamentos apagado) */
  tirarDosDias: (treino: string) => void
}

/** As trocas dos pais sem um treino. Dia que só tinha ele volta ao que o programa diz (não vira descanso sem querer). */
function semOTreino(alteracoes: Record<string, DiaPrograma>, treino: string): Record<string, DiaPrograma> {
  const resultado: Record<string, DiaPrograma> = {}
  for (const [dia, d] of Object.entries(alteracoes)) {
    const itens = d.itens.filter((i) => i.treino !== treino)
    if (itens.length > 0 || d.itens.length === 0) resultado[dia] = { itens }
  }
  return resultado
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
      extras: [],
      categorias: {},
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
      mudarCategoriaVideo: (treino, categoria) =>
        set((s) => {
          const categorias = { ...s.categorias }
          if (categoria) categorias[treino] = categoria
          else delete categorias[treino]
          return { categorias }
        }),
      adicionarExtra: (extra) =>
        set((s) => ({ extras: [...s.extras, { ...extra, id: `extra-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` }] })),
      alterarExtra: (id, parte) => set((s) => ({ extras: s.extras.map((e) => (e.id === id ? { ...e, ...parte } : e)) })),
      removerExtra: (id) => set((s) => ({ extras: s.extras.filter((e) => e.id !== id), alteracoes: semOTreino(s.alteracoes, id) })),
      tirarDosDias: (treino) => set((s) => ({ alteracoes: semOTreino(s.alteracoes, treino) })),
    }),
    {
      name: 'futkids-programa',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ativo: s.ativo, inicio: s.inicio, repetir: s.repetir, alteracoes: s.alteracoes, videos: s.videos, extras: s.extras, categorias: s.categorias }),
    },
  ),
)
