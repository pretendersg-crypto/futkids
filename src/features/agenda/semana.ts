// Plano semanal, dias da semana e missões, calculados a partir do progresso salvo.
import planoJson from '../../data/agenda.json'
import { diaDaSemana, hojeISO, somarDias } from '../../utils/data'

export interface TreinoSugerido {
  /** Tipo registrado ao terminar (aquecimento, goleiro, rali) */
  atividade: string
  titulo: string
  emoji: string
  rota: string
}

export interface PlanoDoDia {
  dia: number
  descanso?: boolean
  mensagem?: string
  treinos: TreinoSugerido[]
}

const PLANO = planoJson.dias as PlanoDoDia[]

export const LETRAS_DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** Missão semanal: treinar em pelo menos tantos dias diferentes na semana */
export const META_SEMANAL = 4
export const PREMIO_MISSAO_DIA = { xp: 15, moedas: 3 }
export const PREMIO_MISSAO_SEMANA = { xp: 40, moedas: 10 }

export function planoDoDia(iso: string): PlanoDoDia {
  return PLANO.find((p) => p.dia === diaDaSemana(iso)) ?? { dia: diaDaSemana(iso), treinos: [] }
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
  const semana = diasDaSemana(hoje)
  return semana.filter((d) => diasTreinados.includes(d)).length
}
