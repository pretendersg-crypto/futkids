// Avaliação das regras das conquistas a partir do progresso salvo.
import type { Criterio } from '../../data/catalogo'
import { nivelPorXP } from '../../utils/nivel'
import { melhorSequencia } from '../../utils/sequencia'

/** O pedaço do progresso que as regras usam */
export interface DadosProgresso {
  xp: number
  contadores: Record<string, number>
  diasTreinados: string[]
}

/** Valor atual da criança naquela regra (ex.: 3 treinos de goleiro, nível 2) */
export function valorDoCriterio(criterio: Criterio, dados: DadosProgresso): number {
  switch (criterio.tipo) {
    case 'contador':
      return dados.contadores[criterio.chave] ?? 0
    case 'nivel':
      return nivelPorXP(dados.xp).nivel
    case 'sequencia':
      return melhorSequencia(dados.diasTreinados)
    case 'diasTreinados':
      return dados.diasTreinados.length
  }
}

export function criterioAtingido(criterio: Criterio, dados: DadosProgresso): boolean {
  return valorDoCriterio(criterio, dados) >= criterio.minimo
}
