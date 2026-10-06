// As séries de treino (vindas da ideia de um calendário de pré-temporada de goleiros, adaptado
// para crianças a partir de 6 anos): aquecimento sempre antes, velocidade, "rápido e devagar"
// (o intervalado), força com o peso do corpo, prevenção de lesões e alongamento.
// Cada série usa os exercícios do módulo de mesmo nome em data/exercicios.json (ou a lista editada
// pelos pais na área dos pais, que fica em stores/treinosStore.ts).
import { useMemo } from 'react'
import { exerciciosDoModulo, type Exercicio } from '../../data/catalogo'
import type { CategoriaId } from '../../data/categorias'
import { useTreinosStore, type SerieExtra } from '../../stores/treinosStore'

export interface SerieTreino {
  /** Módulo dos exercícios e também o tipo de atividade registrado ao terminar */
  modulo: string
  titulo: string
  emoji: string
  descricao: string
  /** Endereço da série */
  rota: string
  /** Classes de cor do cartão */
  cor: string
  /** Categoria em que o treino é liberado (os pais podem mudar; ver categoriaDaSerie) */
  categoria: CategoriaId
}

export const SERIES: SerieTreino[] = [
  {
    modulo: 'aquecimento',
    titulo: 'Aquecimento',
    emoji: '🔥',
    descricao: 'Sempre antes de treinar!',
    rota: '/treinos/aquecimento',
    categoria: 'baby',
    cor: 'border-orange-400 bg-orange-100',
  },
  {
    modulo: 'velocidade',
    titulo: 'Velocidade',
    emoji: '⚡',
    descricao: 'Piques e passos rápidos de goleiro',
    rota: '/treinos/velocidade',
    categoria: 'novato',
    cor: 'border-yellow-400 bg-yellow-100',
  },
  {
    modulo: 'ritmo',
    titulo: 'Rápido e devagar',
    emoji: '🐇',
    descricao: 'Corre com tudo, depois descansa',
    rota: '/treinos/ritmo',
    categoria: 'iniciante',
    cor: 'border-red-300 bg-red-50',
  },
  {
    modulo: 'forca',
    titulo: 'Força do craque',
    emoji: '💪',
    descricao: 'Força com o peso do próprio corpo',
    rota: '/treinos/forca',
    categoria: 'iniciante',
    cor: 'border-sky-400 bg-sky-100',
  },
  {
    modulo: 'prevencao',
    titulo: 'Prevenção',
    emoji: '🛡️',
    descricao: 'Equilíbrio e corpo firme para não se machucar',
    rota: '/treinos/prevencao',
    categoria: 'novato',
    cor: 'border-emerald-400 bg-emerald-100',
  },
  {
    modulo: 'alongamento',
    titulo: 'Alongamento',
    emoji: '🧘',
    descricao: 'Pelo menos 3 vezes na semana',
    rota: '/treinos/alongamento',
    categoria: 'baby',
    cor: 'border-violet-400 bg-violet-100',
  },
]

/** Cor dos treinos criados pelos pais */
export const COR_SERIE_EXTRA = 'border-pink-400 bg-pink-50'

/** Séries do app + treinos criados pelos pais (área dos pais) */
export function todasAsSeries(extras: SerieExtra[]): SerieTreino[] {
  return [...SERIES, ...extras.map((e) => ({ ...e, rota: `/treinos/${e.modulo}`, cor: COR_SERIE_EXTRA, categoria: e.categoria ?? 'baby' }))]
}

export function seriePorModulo(modulo: string | undefined, extras: SerieExtra[] = []): SerieTreino | undefined {
  return todasAsSeries(extras).find((s) => s.modulo === modulo)
}

/** Exercícios de uma série: a lista editada pelos pais, ou a original de data/exercicios.json */
export function useExerciciosDaSerie(modulo: string): Exercicio[] {
  const editados = useTreinosStore((s) => s.exercicios[modulo])
  return useMemo(() => editados ?? exerciciosDoModulo(modulo), [editados, modulo])
}
