// Regras de cobrança, sem rede e sem Firebase (testáveis pelo `npm test` do app):
// referência do pagamento, preço de cada plano, o direito (plano + validade) depois de cada evento do
// Mercado Pago, a expiração e a conferência da assinatura (x-signature) do aviso do Mercado Pago.
import planos from './planos.json' with { type: 'json' }

export type Alvo = 'escolinha' | 'familia'
export type Periodo = 'mensal' | 'anual'
/** assinatura = cartão com renovação automática todo mês; avulso = paga o período de uma vez (Pix, cartão, boleto) */
export type Forma = 'assinatura' | 'avulso'

export interface Limites {
  treinadores?: number
  turmas?: number
  atletas?: number
  /** Espaço para os vídeos do treinador */
  videosMB?: number
}

interface PlanoDoCatalogo {
  nome: string
  limites: Limites
  precos: { mensal: number; anual: number } | null
  recursos: string[]
  disponivel?: boolean
}

const CATALOGO = planos as unknown as Record<Alvo, Record<string, PlanoDoCatalogo>>

export function planoDoCatalogo(alvo: Alvo, plano: string): PlanoDoCatalogo | undefined {
  return CATALOGO[alvo]?.[plano]
}

export function limitesDe(alvo: Alvo, plano: string): Limites {
  return planoDoCatalogo(alvo, plano)?.limites ?? planoDoCatalogo(alvo, 'gratis')!.limites
}

/** Preço em reais (null = plano grátis, inexistente ou ainda não disponível) */
export function precoDe(alvo: Alvo, plano: string, periodo: Periodo): number | null {
  const p = planoDoCatalogo(alvo, plano)
  if (!p || p.disponivel === false || !p.precos) return null
  return p.precos[periodo]
}

// ---------- referência do pagamento (vai e volta pelo Mercado Pago) ----------

export interface Referencia {
  alvo: Alvo
  id: string
  plano: string
  periodo: Periodo
  forma: Forma
}

export const montarReferencia = (r: Referencia) => [r.alvo, r.id, r.plano, r.periodo, r.forma].join('|')

export function lerReferencia(texto: string | null | undefined): Referencia | null {
  const partes = (texto ?? '').split('|')
  if (partes.length !== 5) return null
  const [alvo, id, plano, periodo, forma] = partes
  if (alvo !== 'escolinha' && alvo !== 'familia') return null
  if (periodo !== 'mensal' && periodo !== 'anual') return null
  if (forma !== 'assinatura' && forma !== 'avulso') return null
  if (!/^[A-Za-z0-9]{6,40}$/.test(id) || !planoDoCatalogo(alvo, plano)) return null
  return { alvo, id, plano, periodo, forma }
}

// ---------- direito: qual plano vale e até quando ----------

export interface Direito {
  plano: string
  limites: Limites
  /** ms; null = grátis (não vence) */
  validoAte: number | null
  renovacaoAutomatica: boolean
  /** id da assinatura no Mercado Pago (para cancelar) */
  assinatura?: string | null
}

const DIA = 24 * 60 * 60 * 1000
/** Folga depois do vencimento (o cartão pode demorar a passar) */
export const FOLGA_MS = 3 * DIA

export const direitoGratis = (alvo: Alvo): Direito => ({ plano: 'gratis', limites: limitesDe(alvo, 'gratis'), validoAte: null, renovacaoAutomatica: false, assinatura: null })

export type EventoPagamento =
  /** pagamento avulso aprovado (Pix, cartão ou boleto): soma o período */
  | { tipo: 'avulso-aprovado'; ref: Referencia; valor: number; em: number }
  /** assinatura autorizada/cobrada: vale até a próxima cobrança (+ folga) */
  | { tipo: 'assinatura-ativa'; ref: Referencia; assinatura: string; proximaCobranca: number }
  /** assinatura cancelada/pausada: não renova, mas vale até o fim do período pago */
  | { tipo: 'assinatura-parada'; ref: Referencia; assinatura: string }

/** Novo direito depois de um evento. null = evento recusado (valor errado, plano inexistente...) */
export function aplicarEvento(atual: Direito, ev: EventoPagamento): Direito | null {
  const { alvo, plano, periodo } = ev.ref
  const preco = precoDe(alvo, plano, periodo)
  if (preco === null) return null
  if (ev.tipo === 'avulso-aprovado') {
    // Centavos de diferença passam; menos que o preço, não
    if (ev.valor + 0.01 < preco) return null
    const duracao = periodo === 'anual' ? 365 * DIA : 31 * DIA
    // Mesmo plano ainda valendo: soma ao fim do período (renovar antes não perde dias)
    const base = atual.plano === plano && atual.validoAte && atual.validoAte > ev.em ? atual.validoAte : ev.em
    return { plano, limites: limitesDe(alvo, plano), validoAte: base + duracao, renovacaoAutomatica: false, assinatura: atual.assinatura ?? null }
  }
  if (ev.tipo === 'assinatura-ativa') {
    return { plano, limites: limitesDe(alvo, plano), validoAte: ev.proximaCobranca + FOLGA_MS, renovacaoAutomatica: true, assinatura: ev.assinatura }
  }
  // parada: continua até o que já foi pago
  if (atual.assinatura !== ev.assinatura) return atual
  return { ...atual, renovacaoAutomatica: false }
}

/** O direito já venceu? (volta ao grátis) */
export const venceu = (d: Direito, agora: number) => d.validoAte !== null && d.validoAte < agora

// ---------- vídeos do treinador (Cloud Storage) ----------

/**
 * De um arquivo de vídeo no Storage, a escolinha e o documento do vídeo no Firestore:
 *  escolinhas/{e}/turmas/{t}/videos/{v}/{arquivo}                  → escolinhas/{e}/turmas/{t}/videos/{v}
 *  escolinhas/{e}/turmas/{t}/individuais/{a}/videos/{v}/{arquivo}  → escolinhas/{e}/turmas/{t}/individuais/{a}/videos/{v}
 */
export function videoDoArquivo(caminho: string): { escolinha: string; documento: string } | null {
  const m = /^(escolinhas\/([A-Za-z0-9]+)\/turmas\/[A-Za-z0-9]+(?:\/individuais\/[A-Za-z0-9]+)?\/videos\/[A-Za-z0-9]+)\/[^/]+$/.exec(caminho)
  return m ? { escolinha: m[2], documento: m[1] } : null
}

/** O vídeo novo cabe no espaço do plano? */
export const cabeNoEspaco = (usadoBytes: number, novoBytes: number, limiteMB: number) => usadoBytes + novoBytes <= limiteMB * 1024 * 1024

// ---------- conferência do aviso do Mercado Pago ----------

/** Texto que o Mercado Pago assina no cabeçalho x-signature (ts=..., v1=...) */
export function manifestoDaAssinatura(dataId: string, requestId: string, ts: string): string {
  // Ids alfanuméricos vão em minúsculas (regra do Mercado Pago)
  const id = /^[A-Za-z0-9]+$/.test(dataId) ? dataId.toLowerCase() : dataId
  return `id:${id};request-id:${requestId};ts:${ts};`
}

export function lerCabecalhoAssinatura(cabecalho: string | undefined): { ts: string; v1: string } | null {
  const partes = Object.fromEntries((cabecalho ?? '').split(',').map((p) => p.trim().split('=') as [string, string]))
  return partes.ts && partes.v1 ? { ts: partes.ts, v1: partes.v1 } : null
}
