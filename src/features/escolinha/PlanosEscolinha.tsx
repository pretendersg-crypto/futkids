// Planos da escolinha: o plano atual (validade, renovação, atletas usados) e os planos pagos, com
// assinatura mensal no cartão ou pagamento avulso (Pix, cartão ou boleto) pelo Mercado Pago.
// Só o dono da escolinha paga. O plano muda quando o servidor recebe a confirmação do Mercado Pago.
import { useSearchParams } from 'react-router'
import { cancelarRenovacao, irParaPagamento } from '../../conta/pagamentos'
import { economiaAnual, planosDe, reais, type Forma, type Periodo } from '../../conta/planos'
import type { DadosEscolinha } from '../../conta/nuvemEscolinha'
import { BOTAO, useAcao } from '../conta/acao'
import { Cartao, MensagemErro } from '../conta/comum'

interface Props {
  uid: string
  escolinha: DadosEscolinha
  aoVoltar: () => void
  aoAtualizar: () => void
}

const data = (ms: number) => new Date(ms).toLocaleDateString('pt-BR')

export function PlanosEscolinha({ uid, escolinha, aoVoltar, aoAtualizar }: Props) {
  const [params] = useSearchParams()
  const voltouDoPagamento = params.get('pagamento') === 'voltou'
  const dono = escolinha.donos.includes(uid)
  const planos = planosDe('escolinha')
  const atual = planos.find((p) => p.id === escolinha.plano) ?? planos[0]
  const { ocupado, erro, rodar } = useAcao()

  const pagar = (plano: string, periodo: Periodo, forma: Forma) => rodar(() => irParaPagamento({ alvo: 'escolinha', id: escolinha.id, plano, periodo, forma }))

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button type="button" onClick={aoVoltar} aria-label="Voltar à escolinha" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </button>
        <h2 className="flex-1 text-2xl font-extrabold">⭐ Planos</h2>
      </header>

      {voltouDoPagamento && (
        <p role="status" className="rounded-2xl border-4 border-green-300 bg-green-50 p-3 text-base">
          Você voltou do Mercado Pago. O plano muda assim que o pagamento for confirmado: <b>Pix e cartão em poucos minutos</b>, boleto em até 2 dias
          úteis.{' '}
          <button type="button" onClick={aoAtualizar} className="font-bold underline">
            Atualizar
          </button>
        </p>
      )}

      <Cartao titulo={`Plano atual: ${atual.nome}`}>
        <p>
          {escolinha.atletas ?? '–'} de {escolinha.limites.atletas} atletas · {escolinha.limites.turmas} turma(s) · {escolinha.limites.treinadores} treinador(es)
        </p>
        {escolinha.validoAte && (
          <p>
            Vale até <b>{data(escolinha.validoAte)}</b>
            {escolinha.renovacaoAutomatica ? ' · renova sozinho no cartão' : ' · sem renovação automática'}
          </p>
        )}
        {escolinha.renovacaoAutomatica && dono && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              rodar(async () => {
                await cancelarRenovacao('escolinha', escolinha.id)
                aoAtualizar()
              })
            }
            className={`${BOTAO} self-start bg-white text-red-700`}
          >
            Cancelar a renovação (vale até o fim do período pago)
          </button>
        )}
      </Cartao>

      {!dono && <p className="rounded-2xl bg-white p-3">Só o dono da escolinha pode assinar ou mudar o plano.</p>}

      {planos
        .filter((p) => p.precos && p.disponivel)
        .map((p) => (
          <Cartao key={p.id} titulo={`${p.nome}${p.id === escolinha.plano ? ' (o seu)' : ''}`}>
            <ul className="flex list-disc flex-col pl-5">
              {p.recursos.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="text-lg font-extrabold">
              {reais(p.precos!.mensal)}/mês ou {reais(p.precos!.anual)}/ano
              {economiaAnual(p) > 0 && <span className="text-sm font-bold text-green-700"> (economia de {reais(economiaAnual(p))} no anual)</span>}
            </p>
            {dono && (
              <div className="flex flex-col gap-2">
                <button type="button" disabled={ocupado} onClick={() => pagar(p.id, 'mensal', 'assinatura')} className={`${BOTAO} bg-sol`}>
                  💳 Assinar mensal no cartão ({reais(p.precos!.mensal)}/mês)
                </button>
                <button type="button" disabled={ocupado} onClick={() => pagar(p.id, 'anual', 'avulso')} className={`${BOTAO} bg-white`}>
                  📅 Pagar 1 ano: Pix, boleto ou cartão em até 12x ({reais(p.precos!.anual)})
                </button>
                <button type="button" disabled={ocupado} onClick={() => pagar(p.id, 'mensal', 'avulso')} className={`${BOTAO} bg-white`}>
                  ⚡ Pagar só 1 mês no Pix ou boleto ({reais(p.precos!.mensal)})
                </button>
              </div>
            )}
          </Cartao>
        ))}

      <MensagemErro erro={erro} />
      <p className="text-sm">
        O pagamento é feito no Mercado Pago (o FutKids não vê os dados do cartão). Trocar de plano começa um período novo. Arrependeu? Até 7 dias depois
        de pagar, devolvemos o valor (Código de Defesa do Consumidor, art. 49).
      </p>
    </section>
  )
}
