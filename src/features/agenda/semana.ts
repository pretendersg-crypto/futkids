// O que treinar em cada dia e as missões, a partir do programa escolhido pelos pais
// (calendário de goleiros ou plano infantil), das alterações feitas por eles e do progresso salvo.
import planoInfantilJson from '../../data/agenda.json'
import { PROGRAMA_GOLEIROS, treinoPorId, type DiaPrograma } from '../../data/calendarioGoleiros'
import { useProgramaStore, type ConfigPrograma } from '../../stores/programaStore'
import { diaDaSemana, formatarData, hojeISO, somarDias } from '../../utils/data'

export interface TreinoSugerido {
  /** Id do treino (data/calendarioGoleiros.ts) */
  id: string
  /** Tipo registrado quando a criança faz o treino */
  atividade: string
  titulo: string
  emoji: string
  /** Versão animada no app */
  rota?: string
  /** Vídeo do treinador (já com a troca feita pelos pais, se houver) */
  video?: string
  detalhe?: string
}

export interface PlanoDoDia {
  /** Dia da semana (0 = domingo) */
  dia: number
  descanso: boolean
  treinos: TreinoSugerido[]
  /** Os pais trocaram o treino desta data */
  alterado: boolean
}

interface DiaNoJson {
  dia: number
  descanso?: boolean
  treinos?: string[]
}

const SEMANAS_INFANTIL = (planoInfantilJson.semanas as { dias: DiaNoJson[] }[]).map((s) => s.dias)

export const LETRAS_DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** Missões semanais: treinar em pelo menos tantos dias, e alongar em pelo menos tantos dias */
export const META_SEMANAL = 4
export const META_ALONGAMENTO = 3
export const PREMIO_MISSAO_DIA = { xp: 15, moedas: 3 }
export const PREMIO_MISSAO_SEMANA = { xp: 40, moedas: 10 }
export const PREMIO_MISSAO_ALONGAMENTO = { xp: 25, moedas: 5 }

/** Um domingo de referência: a partir dele as semanas do plano infantil contam 1, 2, 3, 4, 1, 2... */
const DOMINGO_REFERENCIA = '2026-01-04'

/** Dias entre duas datas AAAA-MM-DD (b - a) */
function diasEntre(a: string, b: string): number {
  const [aa, am, ad] = a.split('-').map(Number)
  const [ba, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(ba, bm - 1, bd) - Date.UTC(aa, am - 1, ad)) / 86_400_000)
}

/** Em qual semana do plano infantil (0 a 3) cai a data */
export function semanaDoPlano(iso: string): number {
  const n = SEMANAS_INFANTIL.length
  return ((Math.floor(diasEntre(DOMINGO_REFERENCIA, iso) / 7) % n) + n) % n
}

/** Posição da data no calendário de goleiros (0 a 60), ou null se ainda não começou / já acabou */
export function posicaoNoCalendario(iso: string, cfg: ConfigPrograma): number | null {
  const n = PROGRAMA_GOLEIROS.length
  const dias = diasEntre(cfg.inicio, iso)
  if (dias < 0) return null
  if (dias >= n && !cfg.repetir) return null
  return dias % n
}

/** O dia segundo o programa ativo, sem as alterações dos pais */
export function diaDoProgramaOriginal(iso: string, cfg: ConfigPrograma): DiaPrograma {
  if (cfg.ativo === 'goleiros') {
    const pos = posicaoNoCalendario(iso, cfg)
    return pos === null ? { itens: [] } : PROGRAMA_GOLEIROS[pos]
  }
  const doJson = SEMANAS_INFANTIL[semanaDoPlano(iso)].find((p) => p.dia === diaDaSemana(iso))
  return { itens: doJson?.descanso ? [] : (doJson?.treinos ?? []).map((treino) => ({ treino })) }
}

/** Texto curto de onde a data está no programa, ex.: "Calendário de goleiros: dia 12 de 61" */
export function descreverPosicao(iso: string, cfg: ConfigPrograma): string {
  if (cfg.ativo === 'infantil') return `Plano infantil: semana ${semanaDoPlano(iso) + 1} de 4`
  const pos = posicaoNoCalendario(iso, cfg)
  if (pos !== null) return `Calendário de goleiros: dia ${pos + 1} de ${PROGRAMA_GOLEIROS.length}`
  return diasEntre(cfg.inicio, iso) < 0 ? `Calendário de goleiros: começa em ${formatarData(cfg.inicio)}` : 'Calendário de goleiros: terminou'
}

/**
 * O plano do dia: o programa ativo, ou a troca feita pelos pais para aquela data.
 * Regra do calendário: o aquecimento vem SEMPRE antes de qualquer treino (entra sozinho).
 */
export function planoDoDia(iso: string, cfg: ConfigPrograma = useProgramaStore.getState()): PlanoDoDia {
  const alteracao = cfg.alteracoes[iso]
  const dia = alteracao ?? diaDoProgramaOriginal(iso, cfg)
  const treinos = dia.itens.flatMap((item): TreinoSugerido[] => {
    const t = treinoPorId(item.treino)
    if (!t) return []
    return [
      {
        id: t.id,
        atividade: t.atividade,
        titulo: t.nome,
        emoji: t.emoji,
        rota: t.rota,
        detalhe: t.detalhe,
        video: item.video ?? cfg.videos[t.id] ?? t.videoUrl,
      },
    ]
  })
  if (treinos.length === 0) return { dia: diaDaSemana(iso), descanso: true, treinos: [], alterado: !!alteracao }
  const aquecimento = treinoPorId('aquecimento')!
  const comAquecimento = treinos.some((t) => t.id === 'aquecimento')
    ? treinos
    : [
        {
          id: aquecimento.id,
          atividade: aquecimento.atividade,
          titulo: aquecimento.nome,
          emoji: aquecimento.emoji,
          rota: aquecimento.rota,
          detalhe: aquecimento.detalhe,
          video: cfg.videos.aquecimento ?? aquecimento.videoUrl,
        },
        ...treinos,
      ]
  return { dia: diaDaSemana(iso), descanso: false, treinos: comAquecimento, alterado: !!alteracao }
}

/** Os 7 dias (AAAA-MM-DD) da semana de `iso`, de domingo a sábado */
export function diasDaSemana(iso = hojeISO()): string[] {
  const domingo = somarDias(iso, -diaDaSemana(iso))
  return Array.from({ length: 7 }, (_, i) => somarDias(domingo, i))
}

/** Treinos sugeridos para o dia, cada um com "feito" conforme o que a criança já fez */
export function treinosDoDia(iso: string, atividadesPorDia: Record<string, string[]>, cfg?: ConfigPrograma) {
  const feitas = atividadesPorDia[iso] ?? []
  return planoDoDia(iso, cfg).treinos.map((t) => ({ ...t, feito: feitas.includes(t.atividade) }))
}

/** Quantos treinos sugeridos de hoje ainda faltam (o sininho da Home mostra esse número) */
export function treinosPendentesHoje(atividadesPorDia: Record<string, string[]>, cfg?: ConfigPrograma, hoje = hojeISO()): number {
  return treinosDoDia(hoje, atividadesPorDia, cfg).filter((t) => !t.feito).length
}

export function diasTreinadosNaSemana(diasTreinados: string[], hoje = hojeISO()): number {
  return diasDaSemana(hoje).filter((d) => diasTreinados.includes(d)).length
}

/** Em quantos dias desta semana a criança fez a série de alongamento */
export function diasDeAlongamentoNaSemana(atividadesPorDia: Record<string, string[]>, hoje = hojeISO()): number {
  return diasDaSemana(hoje).filter((d) => (atividadesPorDia[d] ?? []).includes('alongamento')).length
}
