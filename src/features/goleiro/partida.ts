// Fim de uma partida de goleiro: estrelas, recompensa, recorde e contagem do treino.
import { useProgressStore, type ResultadoXP } from '../../stores/progressStore'
import { chaveRecorde, type JogoGoleiroId, type NivelGoleiro } from './niveis'

export interface ResultadoPartida {
  defesas: number
  total: number
  estrelas: number
  xp: number
  moedas: number
  resultadoXP: ResultadoXP
  /** Recorde antes desta partida (undefined = primeira vez jogando) */
  recordeAnterior: number | undefined
  novoRecorde: boolean
}

/** 3 estrelas com 90% de defesas, 2 com 70%, 1 com 50% */
export function calcularEstrelas(defesas: number, total: number): number {
  const taxa = total > 0 ? defesas / total : 0
  return taxa >= 0.9 ? 3 : taxa >= 0.7 ? 2 : taxa >= 0.5 ? 1 : 0
}

/** Dá a recompensa e registra o treino. Chamar UMA vez, no evento de fim da partida. */
export function finalizarPartida(jogo: JogoGoleiroId, nivel: NivelGoleiro, defesas: number, total: number): ResultadoPartida {
  const estrelas = calcularEstrelas(defesas, total)
  const xp = defesas * nivel.xpPorDefesa + (estrelas === 3 ? 10 : 0)
  const moedas = Math.floor(defesas / 2) + estrelas

  const progresso = useProgressStore.getState()
  const chave = chaveRecorde(jogo, nivel.id)
  const recordeAnterior = progresso.recordes[chave]
  const novoRecorde = progresso.registrarRecorde(chave, defesas)
  const resultadoXP = progresso.ganharXP(xp)
  progresso.ganharMoedas(moedas)
  // Toda partida terminada conta como treino de goleiro (o esforço vale, mesmo com poucas defesas)
  progresso.registrarAtividade('goleiro')

  return { defesas, total, estrelas, xp, moedas, resultadoXP, recordeAnterior, novoRecorde }
}
