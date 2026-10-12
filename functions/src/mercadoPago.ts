// Cliente mínimo da API do Mercado Pago (só o que o FutKids usa), com fetch.
//  - Assinatura mensal no cartão: POST /preapproval  → link (init_point) para a pessoa pôr o cartão
//  - Pagamento avulso (Pix, cartão ou boleto): POST /checkout/preferences → link do Checkout Pro
//  - Consultas para conferir os avisos: GET /v1/payments/{id}, /preapproval/{id}, /authorized_payments/{id}
const API = 'https://api.mercadopago.com'

async function chamar<T>(token: string, metodo: 'GET' | 'POST' | 'PUT', caminho: string, corpo?: unknown, idempotencia?: string): Promise<T> {
  const r = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(idempotencia ? { 'X-Idempotency-Key': idempotencia } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  const texto = await r.text()
  if (!r.ok) throw new Error(`Mercado Pago ${metodo} ${caminho}: ${r.status} ${texto.slice(0, 300)}`)
  return JSON.parse(texto) as T
}

export interface NovaAssinatura {
  motivo: string
  referencia: string
  email: string
  valor: number
  voltarPara: string
}

/** Assinatura mensal no cartão (renova sozinha). Devolve o link para a pessoa autorizar */
export async function criarAssinatura(token: string, a: NovaAssinatura): Promise<{ id: string; link: string }> {
  const r = await chamar<{ id: string; init_point: string }>(token, 'POST', '/preapproval', {
    reason: a.motivo,
    external_reference: a.referencia,
    payer_email: a.email,
    back_url: a.voltarPara,
    status: 'pending',
    auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: a.valor, currency_id: 'BRL' },
  })
  return { id: r.id, link: r.init_point }
}

export interface NovoPagamento {
  titulo: string
  referencia: string
  email: string
  valor: number
  avisarEm: string
  voltarPara: string
  /** Parcelas no cartão (anual) */
  maxParcelas: number
}

/** Pagamento avulso pelo Checkout Pro (Pix, cartão, boleto). Devolve o link */
export async function criarPagamentoAvulso(token: string, p: NovoPagamento): Promise<{ id: string; link: string }> {
  const r = await chamar<{ id: string; init_point: string }>(
    token,
    'POST',
    '/checkout/preferences',
    {
      items: [{ id: p.referencia, title: p.titulo, quantity: 1, unit_price: p.valor, currency_id: 'BRL' }],
      external_reference: p.referencia,
      payer: { email: p.email },
      notification_url: p.avisarEm,
      back_urls: { success: p.voltarPara, pending: p.voltarPara, failure: p.voltarPara },
      auto_return: 'approved',
      payment_methods: { installments: p.maxParcelas },
      statement_descriptor: 'FUTKIDS',
    },
    p.referencia + ':' + Date.now(),
  )
  return { id: r.id, link: r.init_point }
}

export interface Pagamento {
  id: number
  status: string
  external_reference: string | null
  transaction_amount: number
  date_approved: string | null
}

export const lerPagamento = (token: string, id: string) => chamar<Pagamento>(token, 'GET', `/v1/payments/${encodeURIComponent(id)}`)

export interface Assinatura {
  id: string
  status: 'pending' | 'authorized' | 'paused' | 'cancelled'
  external_reference: string | null
  next_payment_date: string | null
}

export const lerAssinatura = (token: string, id: string) => chamar<Assinatura>(token, 'GET', `/preapproval/${encodeURIComponent(id)}`)

export interface CobrancaDaAssinatura {
  id: number
  preapproval_id: string
  status: string
}

export const lerCobrancaDaAssinatura = (token: string, id: string) => chamar<CobrancaDaAssinatura>(token, 'GET', `/authorized_payments/${encodeURIComponent(id)}`)

export const cancelarAssinatura = (token: string, id: string) => chamar<Assinatura>(token, 'PUT', `/preapproval/${encodeURIComponent(id)}`, { status: 'cancelled' })
