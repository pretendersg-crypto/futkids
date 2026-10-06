// Fim de um drill: guarda no histórico, dá a recompensa e vê se bateu o recorde de reação.
import { entregarRecompensa, type ResultadoRecompensa } from '../../stores/progressStore'
import { useReacaoStore, type SessaoReacao } from '../../stores/reacaoStore'
import type { Drill } from './drills'

/** O que aconteceu durante o drill (contado pela tela ExecutarDrill) */
export interface Placar {
  serie: number
  /** Sinais mostrados na série atual */
  rep: number
  sinais: number
  acertos: number
  erros: number
  perdidos: number
  /** Tempos de reação dos acertos (ms) */
  tempos: number[]
}

export const PLACAR_ZERO: Placar = { serie: 1, rep: 0, sinais: 0, acertos: 0, erros: 0, perdidos: 0, tempos: [] }

export interface ResultadoDrill extends ResultadoRecompensa {
  sessao: SessaoReacao
  xp: number
  moedas: number
  /** Melhor média anterior deste drill (modo toque) */
  recordeAnteriorMs?: number
  novoRecorde: boolean
}

/** Precisa acertar pelo menos isto para a média valer como recorde (senão vale tocar sem olhar) */
const ACERTO_MINIMO_RECORDE = 0.7

const media = (l: number[]) => Math.round(l.reduce((a, b) => a + b, 0) / l.length)

/** Chamar UMA vez, no fim (ou quando parar no meio). Devolve null se nenhum sinal apareceu. */
export function finalizarDrill(drill: Drill, placar: Placar, completo: boolean, duracaoS: number): ResultadoDrill | null {
  if (placar.sinais === 0) return null
  const loja = useReacaoStore.getState()
  const toque = drill.modo === 'toque'

  const sessao: SessaoReacao = {
    id: `s-${Date.now().toString(36)}`,
    quando: new Date().toISOString(),
    drillId: drill.id,
    nome: drill.nome,
    emoji: drill.emoji,
    modo: drill.modo,
    sinais: placar.sinais,
    // Série pela metade não conta como feita
    seriesFeitas: completo ? drill.series : placar.serie - 1 + (placar.rep >= drill.repeticoes ? 1 : 0),
    seriesTotal: drill.series,
    duracaoS: Math.round(duracaoS),
    completo,
    ...(toque && {
      acertos: placar.acertos,
      erros: placar.erros,
      perdidos: placar.perdidos,
      ...(placar.tempos.length > 0 && { mediaMs: media(placar.tempos), melhorMs: Math.min(...placar.tempos) }),
    }),
  }

  // Recorde = menor média de reação com boa pontaria, entre as vezes anteriores deste drill
  const valeRecorde = (s: SessaoReacao) => s.mediaMs !== undefined && (s.acertos ?? 0) / s.sinais >= ACERTO_MINIMO_RECORDE
  const anteriores = loja.sessoes.filter((s) => s.drillId === drill.id && valeRecorde(s)).map((s) => s.mediaMs!)
  const recordeAnteriorMs = anteriores.length ? Math.min(...anteriores) : undefined
  const novoRecorde = valeRecorde(sessao) && recordeAnteriorMs !== undefined && sessao.mediaMs! < recordeAnteriorMs

  loja.registrarSessao(sessao)

  // Recompensa pelo esforço: 1 XP por sinal (+10 se foi até o fim), teto de 50.
  // Conta como treino do dia (agenda, figurinhas) quando fez pelo menos metade.
  const total = drill.series * drill.repeticoes
  const fezMetade = placar.sinais >= total / 2
  const xp = Math.min(50, placar.sinais + (completo ? 10 : 0))
  const moedas = completo ? 2 : fezMetade ? 1 : 0
  const recompensa = entregarRecompensa(xp, moedas, fezMetade ? 'reacao' : undefined)

  return { sessao, xp, moedas, recordeAnteriorMs, novoRecorde, ...recompensa }
}

/** 523 → "0,52 s" */
export function formatarMs(ms: number): string {
  return `${(ms / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s`
}

/** 95 → "1 min 35 s" */
export function formatarDuracao(s: number): string {
  const min = Math.floor(s / 60)
  return min > 0 ? `${min} min ${s % 60} s` : `${s} s`
}
