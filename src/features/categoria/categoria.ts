// Categoria do jogador e de cada treino/vídeo, com as trocas feitas pelos pais.
import { treinoPorId, type TreinoCalendario } from '../../data/calendarioGoleiros'
import { categoriaPorId, categoriaPorNivel, posicaoCategoria, type Categoria, type CategoriaId } from '../../data/categorias'
import { useProgramaStore } from '../../stores/programaStore'
import { usePaisStore } from '../../stores/paisStore'
import { useProgressStore } from '../../stores/progressStore'
import { useTreinosFundamentosStore } from '../../stores/treinosFundamentosStore'
import { useTreinosStore } from '../../stores/treinosStore'
import { hojeISO } from '../../utils/data'
import { nivelPorXP } from '../../utils/nivel'
import { planoDoDia, type TreinoSugerido } from '../agenda/semana'
import { todasAsSeries, type SerieTreino } from '../treino/series'

export interface InfoCategoria {
  /** Categoria que vale agora (a dos pais, se escolheram; senão a do XP) */
  atual: Categoria
  /** Categoria que o XP dá */
  pelaXP: Categoria
  /** true = os pais escolheram a categoria na mão */
  fixa: boolean
  nivel: number
}

export function useCategoria(): InfoCategoria {
  const xp = useProgressStore((s) => s.xp)
  const fixa = usePaisStore((s) => s.categoriaFixa)
  const nivel = nivelPorXP(xp).nivel
  const pelaXP = categoriaPorNivel(nivel)
  return { atual: fixa ? categoriaPorId(fixa) : pelaXP, pelaXP, fixa: !!fixa, nivel }
}

/** Treinos que nunca trancam: o aquecimento (vem antes de tudo) e os fundamentos do goleiro */
export const SERIES_SEMPRE_LIBERADAS = ['aquecimento', 'goleiro']

/** Categoria de um treino do "Treinar" */
export function categoriaDaSerie(serie: Pick<SerieTreino, 'modulo' | 'categoria'>, trocas: Record<string, CategoriaId>): CategoriaId {
  if (SERIES_SEMPRE_LIBERADAS.includes(serie.modulo)) return 'baby'
  return trocas[serie.modulo] ?? serie.categoria
}

/** Categoria de um vídeo do calendário ou adicionado pelos pais */
export function categoriaDoVideo(treino: Pick<TreinoCalendario, 'id' | 'categoria'>, trocas: Record<string, CategoriaId>): CategoriaId {
  return trocas[treino.id] ?? treino.categoria ?? 'baby'
}

/** O que está na agenda de hoje: liberado mesmo acima da categoria (foi o adulto que colocou) */
export function useAgendaDeHoje(): { rotas: Set<string>; ids: Set<string> } {
  const programa = useProgramaStore()
  // Assina os treinos dos pais: o plano do dia usa os nomes deles
  useTreinosStore((s) => s.seriesExtras)
  useTreinosFundamentosStore((s) => s.treinos)
  const treinos = planoDoDia(hojeISO(), programa).treinos
  return { rotas: new Set(treinos.flatMap((t) => (t.rota ? [t.rota] : []))), ids: new Set(treinos.map((t) => t.id)) }
}

/** Categoria de um item da agenda: a maior entre a do vídeo e a do treino do app que ele abre */
export function categoriaDoItemDaAgenda(t: Pick<TreinoSugerido, 'id' | 'rota'>): CategoriaId {
  const programa = useProgramaStore.getState()
  const treinos = useTreinosStore.getState()
  const candidatas: CategoriaId[] = []
  const doCalendario = treinoPorId(t.id, programa.extras, treinos.seriesExtras, useTreinosFundamentosStore.getState().treinos)
  if (doCalendario?.videoUrl) candidatas.push(categoriaDoVideo(doCalendario, programa.categorias))
  const serie = todasAsSeries(treinos.seriesExtras).find((s) => s.rota === t.rota)
  if (serie) candidatas.push(categoriaDaSerie(serie, treinos.categorias))
  return candidatas.reduce<CategoriaId>((maior, c) => (posicaoCategoria(c) > posicaoCategoria(maior) ? c : maior), 'baby')
}
