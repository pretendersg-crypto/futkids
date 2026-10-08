// Aba "Reação" (/reacao): drills de reação para goleiro (cores, setas e números na tela, ideia
// do app SwitchedOn) e o histórico. Os drills ficam em dois blocos: 🎮 na tela (toque) e 🏃 com o
// corpo (celular no chão); ?tipo=corpo mostra o do corpo primeiro. Criar/mudar drills passa pelo
// portão dos pais.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Modal } from '../components/ui/Modal'
import { BlocoTipo } from '../components/ui/TipoAtividade'
import { PortaoDosPais } from '../components/ui/PortaoDosPais'
import { DRILLS_PRONTOS, minutosDoDrill, novoDrill, type Drill } from '../features/reacao/drills'
import { EditorDrill } from '../features/reacao/EditorDrill'
import { formatarMs } from '../features/reacao/finalizar'
import { Historico } from '../features/reacao/Historico'
import { useReacaoStore, type SessaoReacao } from '../stores/reacaoStore'
import { pontuarTreinador } from '../stores/treinadorStore'

type Aba = 'drills' | 'historico'

export function Reacao() {
  const [params, setParams] = useSearchParams()
  const aba: Aba = params.get('aba') === 'historico' ? 'historico' : 'drills'
  const { drills: criados, sessoes, salvarDrill, removerDrill } = useReacaoStore()
  const [liberado, setLiberado] = useState(false)
  /** Drill aberto no editor (novo, cópia de um pronto ou um criado) */
  const [editando, setEditando] = useState<{ drill: Drill; criado: boolean } | null>(null)
  /** Ação esperando o portão dos pais */
  const [pedido, setPedido] = useState<(() => void) | null>(null)

  /** Ações de adulto: pede a conta uma vez por visita à tela */
  function comAdulto(acao: () => void) {
    if (liberado) acao()
    else setPedido(() => acao)
  }

  if (editando) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold">{editando.criado ? `✏️ ${editando.drill.nome}` : '➕ Novo drill'}</h1>
        <EditorDrill
          inicial={editando.drill}
          aoSalvar={(d) => {
            salvarDrill(d)
            if (!editando.criado) pontuarTreinador('criarDrill', d.id, `Criou o drill "${d.nome}"`)
            setEditando(null)
          }}
          aoCancelar={() => setEditando(null)}
          aoApagar={
            editando.criado
              ? () => {
                  removerDrill(editando.drill.id)
                  setEditando(null)
                }
              : undefined
          }
        />
      </section>
    )
  }

  /** Último resultado de cada drill, para mostrar no cartão (findLast não existe em celulares antigos) */
  const ultimo = (id: string) => [...sessoes].reverse().find((s) => s.drillId === id)

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-center text-3xl font-extrabold">🚦 Treino de Reação</h1>

      <div role="tablist" aria-label="Partes do treino de reação" className="grid grid-cols-2 gap-2 rounded-3xl bg-white p-1 shadow">
        {(
          [
            ['drills', '⚡ Drills'],
            ['historico', '📈 Histórico'],
          ] as const
        ).map(([id, nome]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setParams(id === 'historico' ? { aba: id } : {}, { replace: true })}
            className={`min-h-12 rounded-3xl text-lg font-extrabold ${aba === id ? 'bg-teal-500 text-white' : ''}`}
          >
            {nome}
          </button>
        ))}
      </div>

      {aba === 'historico' ? (
        <Historico />
      ) : (
        <>
          <p className="text-center text-lg">Cores, setas e números aparecem na tela: reaja rápido como um goleiro!</p>

          {(params.get('tipo') === 'corpo' ? (['auto', 'toque'] as const) : (['toque', 'auto'] as const)).map((modo) => {
            const criadosDoModo = criados.filter((d) => d.modo === modo)
            return (
              <BlocoTipo
                key={modo}
                tipo={modo === 'auto' ? 'corpo' : 'tela'}
                titulo={modo === 'auto' ? 'Reação com o corpo' : 'Reação na tela'}
                explicacao={
                  modo === 'auto'
                    ? 'Apoie o celular no chão: os sinais aparecem e você reage com o corpo (cones, quedas, passos).'
                    : 'Segure o celular e toque na resposta certa o mais rápido que puder.'
                }
              >
                <ListaDrills titulo="Drills" drills={DRILLS_PRONTOS.filter((d) => d.modo === modo)} ultimo={ultimo} />
                {criadosDoModo.length > 0 && (
                  <ListaDrills
                    titulo="⭐ Criados pelo treinador"
                    drills={criadosDoModo}
                    ultimo={ultimo}
                    aoEditar={(d) => comAdulto(() => setEditando({ drill: d, criado: true }))}
                  />
                )}
              </BlocoTipo>
            )
          })}

          <section className="flex flex-col gap-2 rounded-3xl border-4 border-dashed border-teal-400 bg-teal-50 p-3">
            <h2 className="text-xl font-extrabold">👨‍👩‍👧 Para pais e treinador</h2>
            <button
              type="button"
              onClick={() => comAdulto(() => setEditando({ drill: novoDrill(), criado: false }))}
              className="min-h-14 rounded-2xl bg-teal-600 text-lg font-extrabold text-white"
            >
              ➕ Criar drill
            </button>
            <p className="text-sm">Ou copie um drill pronto e mude o que quiser:</p>
            <div className="flex flex-wrap gap-2">
              {DRILLS_PRONTOS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    comAdulto(() =>
                      setEditando({ drill: { ...novoDrill(), ...d, id: novoDrill().id, nome: `${d.nome} (meu)`.slice(0, 30) }, criado: false }),
                    )
                  }
                  className="min-h-11 rounded-full border-2 border-teal-300 bg-white px-3 text-sm font-bold"
                >
                  📋 {d.emoji} {d.nome}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <Modal aberto={pedido !== null} aoFechar={() => setPedido(null)} titulo="Área dos pais">
        {pedido && (
          <PortaoDosPais
            aoLiberar={() => {
              setLiberado(true)
              pedido()
              setPedido(null)
            }}
          />
        )}
      </Modal>
    </section>
  )
}

interface ListaProps {
  titulo: string
  drills: Drill[]
  ultimo: (id: string) => SessaoReacao | undefined
  aoEditar?: (d: Drill) => void
}

function ListaDrills({ titulo, drills, ultimo, aoEditar }: ListaProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      <ul className="flex flex-col gap-3">
        {drills.map((d) => {
          const u = ultimo(d.id)
          return (
            <li key={d.id} className="flex items-stretch gap-2">
              <Link to={`/reacao/${d.id}`} className="flex min-h-22 flex-1 items-center gap-4 rounded-3xl border-4 border-teal-500 bg-teal-50 p-3 shadow-md">
                <span aria-hidden className="text-5xl">
                  {d.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xl font-extrabold">{d.nome}</span>
                  <span className="text-base">{d.descricao}</span>
                  <span className="text-sm font-bold">
                    ⏱️ {minutosDoDrill(d)} min ·{' '}
                    {u ? `última vez: ${new Date(u.quando).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}${u.mediaMs ? ` (${formatarMs(u.mediaMs)})` : ''}` : '✨ nunca feito'}
                  </span>
                </span>
                <span aria-hidden className="text-3xl">
                  ▶️
                </span>
              </Link>
              {aoEditar && (
                <button type="button" aria-label={`Editar ${d.nome}`} onClick={() => aoEditar(d)} className="grid w-14 place-items-center rounded-3xl border-4 border-teal-200 bg-white text-2xl">
                  ✏️
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
