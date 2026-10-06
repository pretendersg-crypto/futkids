// Plano de treinos (ciclo de 4 semanas), dias da semana e missões, calculados a partir do progresso salvo.
import planoJson from '../../data/agenda.json'
import { diaDaSemana, hojeISO, somarDias } from '../../utils/data'
import { SERIES } from '../treino/series'

export interface TreinoSugerido {
  /** Tipo registrado ao terminar (aquecimento, goleiro, rali, velocidade...) */
  atividade: string
  titulo: string
  emoji: string
  rota: string
}

export interface PlanoDoDia {
  dia: number
  descanso: boolean
  treinos: TreinoSugerido[]
}

interface DiaNoJson {
  dia: number
  descanso?: boolean
  treinos?: string[]
}

/** Nomes curtos usados em data/agenda.json → treino de verdade (série, jogo ou desafio) */
const TREINOS: Record<string, TreinoSugerido> = {
  ...Object.fromEntries(SERIES.map((s) => [s.modulo, { atividade: s.modulo, titulo: s.titulo, emoji: s.emoji, rota: s.rota }])),
  goleiro: { atividade: 'goleiro', titulo: 'Treino de goleiro', emoji: '🧤', rota: '/goleiro' },
  fundamentos: { atividade: 'goleiro', titulo: 'Fundamentos do goleiro', emoji: '📚', rota: '/goleiro/fundamentos' },
  rali: { atividade: 'rali', titulo: 'Rali de gestos', emoji: '⚽', rota: '/rali' },
  embaixadinhas: { atividade: 'rali', titulo: 'Embaixadinhas de verdade', emoji: '⚽', rota: '/rali/contador' },
}

const SEMANAS = (planoJson.semanas as { dias: DiaNoJson[] }[]).map((s) => s.dias)

export const LETRAS_DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** Missões semanais: treinar em pelo menos tantos dias, e alongar em pelo menos tantos dias */
export const META_SEMANAL = 4
export const META_ALONGAMENTO = 3
export const PREMIO_MISSAO_DIA = { xp: 15, moedas: 3 }
export const PREMIO_MISSAO_SEMANA = { xp: 40, moedas: 10 }
export const PREMIO_MISSAO_ALONGAMENTO = { xp: 25, moedas: 5 }

/** Um domingo de referência: a partir dele as semanas do plano contam 1, 2, 3, 4, 1, 2... */
const DOMINGO_REFERENCIA = '2026-01-04'

/** Em qual semana do ciclo (0 a 3) cai a data */
export function semanaDoPlano(iso: string): number {
  const [a, m, d] = iso.split('-').map(Number)
  const [ra, rm, rd] = DOMINGO_REFERENCIA.split('-').map(Number)
  const dias = Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ra, rm - 1, rd)) / 86_400_000)
  return (((Math.floor(dias / 7) % SEMANAS.length) + SEMANAS.length) % SEMANAS.length)
}

/** O plano do dia. Regra do calendário: o aquecimento vem SEMPRE antes de qualquer treino. */
export function planoDoDia(iso: string): PlanoDoDia {
  const dia = diaDaSemana(iso)
  const doJson = SEMANAS[semanaDoPlano(iso)].find((p) => p.dia === dia)
  if (!doJson || doJson.descanso) return { dia, descanso: true, treinos: [] }
  const treinos = (doJson.treinos ?? []).map((t) => TREINOS[t]).filter(Boolean)
  return { dia, descanso: false, treinos: [TREINOS.aquecimento, ...treinos] }
}

/** Os 7 dias (AAAA-MM-DD) da semana de `iso`, de domingo a sábado */
export function diasDaSemana(iso = hojeISO()): string[] {
  const domingo = somarDias(iso, -diaDaSemana(iso))
  return Array.from({ length: 7 }, (_, i) => somarDias(domingo, i))
}

/** Treinos sugeridos para o dia, cada um com "feito" conforme o que a criança já fez */
export function treinosDoDia(iso: string, atividadesPorDia: Record<string, string[]>) {
  const feitas = atividadesPorDia[iso] ?? []
  return planoDoDia(iso).treinos.map((t) => ({ ...t, feito: feitas.includes(t.atividade) }))
}

/** Quantos treinos sugeridos de hoje ainda faltam (o sininho da Home mostra esse número) */
export function treinosPendentesHoje(atividadesPorDia: Record<string, string[]>, hoje = hojeISO()): number {
  return treinosDoDia(hoje, atividadesPorDia).filter((t) => !t.feito).length
}

export function diasTreinadosNaSemana(diasTreinados: string[], hoje = hojeISO()): number {
  return diasDaSemana(hoje).filter((d) => diasTreinados.includes(d)).length
}

/** Em quantos dias desta semana a criança fez a série de alongamento */
export function diasDeAlongamentoNaSemana(atividadesPorDia: Record<string, string[]>, hoje = hojeISO()): number {
  return diasDaSemana(hoje).filter((d) => (atividadesPorDia[d] ?? []).includes('alongamento')).length
}
