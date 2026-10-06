// Regras de recompensa do aquecimento e textos de meta.
import type { Exercicio } from '../../data/catalogo'

/** Bônus por completar a série inteira, sem pular nenhum exercício */
export const BONUS_SERIE_COMPLETA = { xp: 20, moedas: 3 }

export interface Recompensa {
  xp: number
  moedas: number
  completa: boolean
}

/** XP de cada exercício feito + 1 moeda por exercício + bônus se fez todos */
export function calcularRecompensa(serie: Exercicio[], feitos: string[]): Recompensa {
  const completa = serie.length > 0 && serie.every((e) => feitos.includes(e.id))
  const xpExercicios = serie.filter((e) => feitos.includes(e.id)).reduce((soma, e) => soma + e.xp, 0)
  return {
    xp: xpExercicios + (completa ? BONUS_SERIE_COMPLETA.xp : 0),
    moedas: feitos.length + (completa ? BONUS_SERIE_COMPLETA.moedas : 0),
    completa,
  }
}

export function descreverMeta(exercicio: Exercicio): string {
  return exercicio.tipo === 'tempo' ? `⏱️ ${exercicio.meta} segundos` : `🔁 ${exercicio.meta} vezes`
}

/** Duração aproximada da série em minutos (para mostrar na tela inicial) */
export function minutosDaSerie(serie: Exercicio[]): number {
  const ms = serie.reduce((soma, e) => soma + (e.tipo === 'tempo' ? e.meta * 1000 : e.meta * e.ritmoMs), 0)
  return Math.max(1, Math.round(ms / 60000))
}
