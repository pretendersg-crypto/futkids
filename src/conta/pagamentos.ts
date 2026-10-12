// Assinar um plano: o servidor cria o pagamento no Mercado Pago e devolve o link; o app leva a pessoa
// para lá. O plano só muda quando o Mercado Pago confirma o pagamento para o servidor.
import type { AlvoPlano, Forma, Periodo } from './planos'

export async function irParaPagamento(pedido: { alvo: AlvoPlano; id: string; plano: string; periodo: Periodo; forma: Forma }) {
  const n = await import('./nuvem')
  const criar = n.funcaoDoServidor<typeof pedido, { link: string }>('criarPagamento')
  const { data } = await criar(pedido)
  location.href = data.link
}

export async function cancelarRenovacao(alvo: AlvoPlano, id: string) {
  const n = await import('./nuvem')
  await n.funcaoDoServidor<{ alvo: AlvoPlano; id: string }, { ok: boolean }>('cancelarAssinatura')({ alvo, id })
}
