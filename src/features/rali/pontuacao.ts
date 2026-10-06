// Pontuação do Rali: combo (acertos seguidos) vira multiplicador, e o fim da partida
// entrega XP, moedas, recorde e conta o treino.
import { useProgressStore, type ResultadoXP } from '../../stores/progressStore'

/** A cada 5 acertos seguidos o multiplicador sobe: x1, x2, x3... até x5 */
export function multiplicador(combo: number): number {
  return Math.min(5, 1 + Math.floor(combo / 5))
}

export interface ResultadoRali {
  pontos: number
  xp: number
  moedas: number
  resultadoXP: ResultadoXP
  recordeAnterior: number | undefined
  novoRecorde: boolean
}

interface Opcoes {
  /** Embaixadinhas feitas na partida (somam para a figurinha "Rei da embaixadinha") */
  embaixadinhas?: number
}

/** Dá a recompensa e registra o treino. Chamar UMA vez, no evento de fim da partida. */
export function finalizarRali(jogo: string, pontos: number, { embaixadinhas = 0 }: Opcoes = {}): ResultadoRali {
  // Quem jogou até o fim ganha pelo menos 5 XP (o esforço conta); teto de 50 por partida
  const xp = Math.max(5, Math.min(50, Math.round(pontos / 2)))
  const moedas = Math.floor(pontos / 10)

  const progresso = useProgressStore.getState()
  const chave = `rali:${jogo}`
  const recordeAnterior = progresso.recordes[chave]
  const novoRecorde = progresso.registrarRecorde(chave, pontos)
  const resultadoXP = progresso.ganharXP(xp)
  progresso.ganharMoedas(moedas)
  if (embaixadinhas > 0) progresso.somarContador('embaixadinhas', embaixadinhas)
  progresso.registrarAtividade('rali')

  return { pontos, xp, moedas, resultadoXP, recordeAnterior, novoRecorde }
}
