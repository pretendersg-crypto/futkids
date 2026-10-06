// Fim dos jogos de alimentação: conta para as figurinhas sempre, e dá XP/moedas uma vez por dia
// por jogo (dá para jogar de novo à vontade, para aprender). Não conta como dia de treino.
import { useAlimentacaoStore } from '../../stores/alimentacaoStore'
import { entregarRecompensa, useProgressStore, type ResultadoRecompensa } from '../../stores/progressStore'

export interface ResultadoJogoComida {
  acertos: number
  total: number
  xp: number
  moedas: number
  /** false = hoje este jogo já tinha dado prêmio */
  premiado: boolean
  recompensa: ResultadoRecompensa | null
}

/** `contadorPerfeito`: contador somado quando acerta tudo (base de figurinha) */
export function finalizarJogoComida(jogo: string, acertos: number, total: number, contadorPerfeito: string): ResultadoJogoComida {
  const perfeito = acertos === total
  const progresso = useProgressStore.getState()
  progresso.somarContador('alimentacao', 1)
  if (perfeito) progresso.somarContador(contadorPerfeito, 1)

  const xp = acertos * 2 + (perfeito ? 10 : 0)
  const moedas = Math.floor(acertos / 3) + (perfeito ? 2 : 0)
  const premiado = useAlimentacaoStore.getState().pegarPremioDoDia(jogo)
  return { acertos, total, xp, moedas, premiado, recompensa: premiado ? entregarRecompensa(xp, moedas) : null }
}
