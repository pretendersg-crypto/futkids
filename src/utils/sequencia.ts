// Sequências de dias seguidos de treino (streak), a partir das datas AAAA-MM-DD.
import { hojeISO } from './data'

/** Dia anterior a uma data AAAA-MM-DD (conta em UTC para não sofrer com horário de verão) */
export function diaAnterior(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia) - 86_400_000).toISOString().slice(0, 10)
}

/** Maior sequência de dias seguidos em toda a história */
export function melhorSequencia(dias: string[]): number {
  const ordenados = [...new Set(dias)].sort()
  let melhor = 0
  let atual = 0
  ordenados.forEach((dia, i) => {
    atual = i > 0 && diaAnterior(dia) === ordenados[i - 1] ? atual + 1 : 1
    melhor = Math.max(melhor, atual)
  })
  return melhor
}

/** Sequência que ainda está valendo: termina hoje ou ontem (se ainda não treinou hoje) */
export function sequenciaAtual(dias: string[], hoje = hojeISO()): number {
  const conjunto = new Set(dias)
  let dia = conjunto.has(hoje) ? hoje : diaAnterior(hoje)
  let total = 0
  while (conjunto.has(dia)) {
    total++
    dia = diaAnterior(dia)
  }
  return total
}
