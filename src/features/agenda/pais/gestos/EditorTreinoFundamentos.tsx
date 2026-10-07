// Montar um treino de fundamentos do goleiro (área dos pais): nome, ícone, e os gestos escolhidos
// no catálogo, cada um com quantas vezes ou quantos segundos (e um recado opcional), na ordem do
// treino. Depois ele pode entrar em qualquer dia da agenda. Só grava em "Salvar treino".
import { useState } from 'react'
import { CampoNumero } from '../../../../components/ui/CampoNumero'
import { Modal } from '../../../../components/ui/Modal'
import { ICONES_TREINO, idDeFundamentos } from '../../../../data/calendarioGoleiros'
import { useProgramaStore } from '../../../../stores/programaStore'
import { useTreinosFundamentosStore, type ItemTreinoFundamentos, type TreinoFundamentos } from '../../../../stores/treinosFundamentosStore'
import { CATEGORIAS_GESTO } from '../../../saidaGol/gestos'
import { DesenhoGesto } from '../../../saidaGol/DesenhoGesto'
import { useGestos } from '../../../saidaGol/useGestos'

interface Props {
  /** Treino a mudar; null = treino novo */
  id: string | null
  aoVoltar: () => void
}

const CAMPO = 'min-h-12 rounded-xl border-2 border-violet-200 px-3 text-base font-normal'

function treinoNovo(): TreinoFundamentos {
  return { id: `fund-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, nome: '', emoji: '🧤', descricao: '', itens: [] }
}

export function EditorTreinoFundamentos({ id, aoVoltar }: Props) {
  const loja = useTreinosFundamentosStore()
  const tirarDosDias = useProgramaStore((s) => s.tirarDosDias)
  const gestos = useGestos()
  const [t, setT] = useState<TreinoFundamentos>(() => // Cópia (JSON) para mexer à vontade antes de salvar; structuredClone não existe em celular antigo
    JSON.parse(JSON.stringify((id && loja.treinos.find((x) => x.id === id)) || treinoNovo())) as TreinoFundamentos)
  const [escolhendo, setEscolhendo] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmarApagar, setConfirmarApagar] = useState(false)
  const mudar = (parte: Partial<TreinoFundamentos>) => setT((x) => ({ ...x, ...parte }))
  const mudarItem = (i: number, parte: Partial<ItemTreinoFundamentos>) => mudar({ itens: t.itens.map((it, k) => (k === i ? { ...it, ...parte } : it)) })
  const gestoPorId = (g: string) => gestos.find((x) => x.id === g)

  function alternar(gesto: string) {
    setErro('')
    mudar({ itens: t.itens.some((i) => i.gesto === gesto) ? t.itens.filter((i) => i.gesto !== gesto) : [...t.itens, { gesto, tipo: 'vezes', quantidade: 10 }] })
  }

  function mover(i: number, passo: number) {
    const j = i + passo
    if (j < 0 || j >= t.itens.length) return
    const itens = [...t.itens]
    ;[itens[i], itens[j]] = [itens[j], itens[i]]
    mudar({ itens })
  }

  function salvar() {
    if (!t.nome.trim()) return setErro('Dê um nome ao treino.')
    if (t.itens.length === 0) return setErro('Escolha pelo menos um fundamento.')
    loja.salvarTreino({
      ...t,
      nome: t.nome.trim(),
      descricao: t.descricao.trim(),
      itens: t.itens.map((i) => ({ gesto: i.gesto, tipo: i.tipo, quantidade: i.quantidade, ...(i.observacao?.trim() ? { observacao: i.observacao.trim() } : {}) })),
    })
    aoVoltar()
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={aoVoltar} className="min-h-12 self-start rounded-2xl bg-white px-4 text-lg font-bold shadow">
        ⬅️ Voltar sem salvar
      </button>
      <h2 className="text-2xl font-extrabold">{id ? `✏️ ${t.nome || 'Treino de fundamentos'}` : '➕ Novo treino de fundamentos'}</h2>

      <label className="flex flex-col gap-1 text-base font-bold">
        Nome do treino
        <input type="text" value={t.nome} maxLength={30} placeholder="Ex.: Fundamentos de terça" onChange={(e) => mudar({ nome: e.target.value })} className={CAMPO} />
      </label>
      <label className="flex flex-col gap-1 text-base font-bold">
        Descrição curta (opcional)
        <input type="text" value={t.descricao} maxLength={60} onChange={(e) => mudar({ descricao: e.target.value })} className={CAMPO} />
      </label>
      <fieldset>
        <legend className="mb-1 text-base font-bold">Ícone</legend>
        <div className="grid grid-cols-8 gap-1">
          {ICONES_TREINO.map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={t.emoji === i}
              aria-label={`Ícone ${i}`}
              onClick={() => mudar({ emoji: i })}
              className={`grid aspect-square place-items-center rounded-xl border-4 text-xl ${t.emoji === i ? 'border-violet-600 bg-violet-100' : 'border-transparent bg-violet-50'}`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-extrabold">Fundamentos ({t.itens.length})</h3>
        {t.itens.length === 0 && <p className="rounded-2xl bg-violet-50 p-3 text-base">Toque em "Escolher fundamentos" e marque os gestos do treino.</p>}
        <ol className="flex flex-col gap-2">
          {t.itens.map((it, i) => {
            const g = gestoPorId(it.gesto)
            return (
              <li key={it.gesto} className="flex flex-col gap-2 rounded-2xl border-4 border-violet-100 bg-white p-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-xl bg-green-50">{g && <DesenhoGesto desenho={g.desenho} nome={g.nome} tamanho={44} />}</span>
                  <span className="flex-1 leading-tight font-bold">
                    {i + 1}. {g?.nome ?? '(gesto apagado)'}
                  </span>
                  <button type="button" aria-label={`Subir ${g?.nome}`} disabled={i === 0} onClick={() => mover(i, -1)} className="grid size-10 place-items-center rounded-lg bg-violet-50 disabled:opacity-30">
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label={`Descer ${g?.nome}`}
                    disabled={i === t.itens.length - 1}
                    onClick={() => mover(i, 1)}
                    className="grid size-10 place-items-center rounded-lg bg-violet-50 disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <button type="button" aria-label={`Tirar ${g?.nome}`} onClick={() => alternar(it.gesto)} className="grid size-10 place-items-center rounded-lg bg-red-50">
                    ✖️
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CampoNumero
                    valor={it.quantidade}
                    min={it.tipo === 'segundos' ? 5 : 1}
                    max={it.tipo === 'segundos' ? 300 : 100}
                    passo={it.tipo === 'segundos' ? 5 : 1}
                    aoMudar={(quantidade) => mudarItem(i, { quantidade })}
                    rotulo={it.tipo}
                  />
                  <div className="grid grid-cols-2 gap-1">
                    {(
                      [
                        ['vezes', '🔁 vezes'],
                        ['segundos', '⏱️ segundos'],
                      ] as const
                    ).map(([tipo, nome]) => (
                      <button
                        key={tipo}
                        type="button"
                        aria-pressed={it.tipo === tipo}
                        onClick={() => mudarItem(i, { tipo, quantidade: tipo === 'segundos' ? Math.max(5, Math.round(it.quantidade / 5) * 5 || 30) : it.quantidade })}
                        className={`min-h-11 rounded-xl border-4 px-2 text-sm font-bold ${it.tipo === tipo ? 'border-violet-600 bg-violet-100' : 'border-violet-100 bg-white'}`}
                      >
                        {nome}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={it.observacao ?? ''}
                  maxLength={80}
                  aria-label={`Recado para ${g?.nome}`}
                  placeholder="Recado (opcional), ex.: 4 de cada lado"
                  onChange={(e) => mudarItem(i, { observacao: e.target.value })}
                  className="min-h-11 rounded-xl border-2 border-violet-100 px-2 text-sm"
                />
              </li>
            )
          })}
        </ol>
        <button
          type="button"
          onClick={() => setEscolhendo(true)}
          className="min-h-14 rounded-2xl border-4 border-dashed border-violet-400 bg-violet-50 text-lg font-extrabold"
        >
          ☑️ Escolher fundamentos
        </button>
      </section>

      {erro && (
        <p role="alert" className="font-bold text-red-700">
          ❌ {erro}
        </p>
      )}
      <button type="button" onClick={salvar} className="min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
        Salvar treino ✅
      </button>
      <p className="text-sm">📅 Para colocar num dia: toque no dia do calendário e em "Incluir treino".</p>
      {id && (
        <button
          type="button"
          onClick={() => {
            if (!confirmarApagar) return setConfirmarApagar(true)
            loja.removerTreino(t.id)
            tirarDosDias(idDeFundamentos(t.id))
            aoVoltar()
          }}
          className="min-h-12 rounded-2xl border-4 border-red-200 bg-white font-bold text-red-800"
        >
          {confirmarApagar ? 'Confirmar: apagar (sai também dos dias da agenda)' : '🗑️ Apagar este treino'}
        </button>
      )}

      {/* Escolher os gestos: marca e desmarca no catálogo, por categoria */}
      <Modal aberto={escolhendo} aoFechar={() => setEscolhendo(false)} titulo="☑️ Fundamentos">
        <p className="-mt-2 text-sm">Marque os gestos do treino. A ordem é a que você marcar (dá para mudar depois).</p>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          {CATEGORIAS_GESTO.map((cat) => {
            const daCategoria = gestos.filter((g) => g.categoria === cat.id)
            if (daCategoria.length === 0) return null
            return (
              <div key={cat.id} className="flex flex-col gap-1">
                <p className="font-extrabold">
                  {cat.emoji} {cat.nome}
                </p>
                {daCategoria.map((g) => {
                  const marcado = t.itens.some((i) => i.gesto === g.id)
                  return (
                    <label key={g.id} className={`flex min-h-12 items-center gap-2 rounded-xl border-2 p-1 ${marcado ? 'border-violet-500 bg-violet-50' : 'border-violet-100'}`}>
                      <input type="checkbox" checked={marcado} onChange={() => alternar(g.id)} className="size-6 shrink-0 accent-violet-600" />
                      <span className="shrink-0 rounded-lg bg-green-50">
                        <DesenhoGesto desenho={g.desenho} nome={g.nome} tamanho={36} />
                      </span>
                      <span className="text-sm leading-tight font-bold">{g.nome}</span>
                    </label>
                  )
                })}
              </div>
            )
          })}
        </div>
        <button type="button" onClick={() => setEscolhendo(false)} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow">
          Pronto ({t.itens.length}) ✅
        </button>
      </Modal>
    </div>
  )
}
