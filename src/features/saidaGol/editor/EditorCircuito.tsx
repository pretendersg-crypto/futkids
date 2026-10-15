// Editor de circuito com cones (pais e treinador), em 3 abas:
//  🔺 Cones: arraste os cones (e a bola do adulto) no desenho; ponha, tire, troque letra, cor e para que serve;
//  👣 Passos: de qual cone sai, como se mexe, para qual vai, o gesto técnico e o texto (sugerido sozinho);
//  📝 Nome e vídeo: nome, ícone, nível, para que serve, repetições, segurança e o link do vídeo de exemplo.
// "Ver como a criança vê" abre a tela do circuito; "Salvar" só com tudo conferido.
import { useState, type ReactNode } from 'react'
import { TelaCircuito } from '../../../pages/CircuitoSaida'
import { linkDeVideo } from '../../../utils/link'
import {
  conferirCircuito,
  GESTO_DO_MOVIMENTO,
  LIMITES_CONE,
  metros,
  NOME_NIVEL,
  NOMES_MOVIMENTO,
  textoPadrao,
  type Circuito,
  type Cone,
  type CorCone,
  type Movimento,
  type PassoCircuito,
} from '../circuitos'
import { categoriaGestoPorId, type Gesto } from '../gestos'
import { QuadraCones } from '../QuadraCones'

interface Props {
  inicial: Circuito
  /** Para onde vai (ex.: "⚽ Sub-9"), só para mostrar */
  destino: string
  /** Gestos que dá para usar (na turma, só os do app) */
  gestos: Gesto[]
  aoSalvar: (c: Circuito) => Promise<void> | void
  aoCancelar: () => void
}

const CAMPO = 'min-h-10 w-full rounded-xl border-2 border-sky-200 bg-white px-2 text-base'
const ROTULO = 'flex flex-col gap-1 text-sm font-bold'
const CORES: { id: CorCone; nome: string; emoji: string }[] = [
  { id: 'laranja', nome: 'Laranja', emoji: '🟠' },
  { id: 'amarelo', nome: 'Amarelo', emoji: '🟡' },
  { id: 'azul', nome: 'Azul', emoji: '🔵' },
  { id: 'vermelho', nome: 'Vermelho', emoji: '🔴' },
]
const ICONES = ['🔶', '⬆️', '✌️', '🌈', '🤲', '✝️', '🙌', '🏆', '⚡', '🧤', '🎯', '🔁', '↔️', '⭐']
const MOVIMENTOS: Movimento[] = ['parado', 'saida', 'recuo', 'lateral', 'bola']
const LETRAS = 'ABCDEFHIJKLMNOPQRSTUVWXYZ'.split('')

function Aba({ ativa, aoTocar, children }: { ativa: boolean; aoTocar: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={aoTocar}
      className={`rounded-full border-2 px-3 py-1.5 text-sm font-extrabold ${ativa ? 'border-sky-600 bg-sky-600 text-white' : 'border-sky-200 bg-white'}`}
    >
      {children}
    </button>
  )
}

/** Antes de salvar: textos vazios ganham o sugerido, espaços sobrando saem */
function acabar(c: Circuito): Circuito {
  const limpo = (s?: string) => (s?.trim() ? s.trim() : undefined)
  return JSON.parse(
    JSON.stringify({
      ...c,
      nome: c.nome.trim(),
      objetivo: c.objetivo.trim(),
      repeticoes: c.repeticoes.trim() || '4 vezes · 30 s de descanso',
      seguranca: limpo(c.seguranca),
      video: limpo(c.video),
      cones: c.cones.map((k) => ({ ...k, id: k.id.trim().toUpperCase(), papel: limpo(k.papel) })),
      passos: c.passos.map((p) => ({ ...p, para: p.movimento === 'parado' ? undefined : p.para, texto: p.texto.trim() || textoPadrao(p) })),
    }),
  ) as Circuito
}

export function EditorCircuito({ inicial, destino, gestos, aoSalvar, aoCancelar }: Props) {
  const [c, setC] = useState<Circuito>(inicial)
  const [aba, setAba] = useState<'cones' | 'passos' | 'dados'>('cones')
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [passoAberto, setPassoAberto] = useState(0)
  const [vendo, setVendo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  const mudar = (parte: Partial<Circuito>) => setC((x) => ({ ...x, ...parte }))

  const pronto = acabar(c)
  const problemas = [...conferirCircuito(pronto, gestos.map((g) => g.id)), ...(pronto.video && !linkDeVideo(pronto.video) ? ['o link do vídeo não é do YouTube nem da Hotmart'] : [])]
  const coneSel = c.cones.find((k) => k.id === selecionado)

  // ---------- cones ----------
  function moverCone(id: string, x: number, y: number) {
    if (id === 'bola' && c.bola) return mudar({ bola: { ...c.bola, x, y } })
    mudar({ cones: c.cones.map((k) => (k.id === id ? { ...k, x, y } : k)) })
  }
  function incluirCone(cor: CorCone) {
    const id = LETRAS.find((l) => !c.cones.some((k) => k.id === l)) ?? `${c.cones.length + 1}`
    // Cada cone novo nasce num lugar diferente, para não ficar um em cima do outro
    const novo: Cone = { id, x: ((c.cones.length % 5) - 2) * 1.5, y: 4 + (c.cones.length % 2), cor }
    mudar({ cones: [...c.cones, novo] })
    setSelecionado(id)
  }
  function mudarCone(id: string, parte: Partial<Cone>) {
    // Trocar a letra troca também nos passos
    const nova = parte.id
    mudar({
      cones: c.cones.map((k) => (k.id === id ? { ...k, ...parte } : k)),
      passos: nova ? c.passos.map((p) => ({ ...p, de: p.de === id ? nova : p.de, para: p.para === id ? nova : p.para })) : c.passos,
    })
    if (nova) setSelecionado(nova)
  }

  // ---------- passos ----------
  const mudarPasso = (i: number, parte: Partial<PassoCircuito>) => mudar({ passos: c.passos.map((p, k) => (k === i ? { ...p, ...parte } : p)) })
  function incluirPasso() {
    const ultimo = c.passos[c.passos.length - 1]
    const de = ultimo ? (ultimo.movimento === 'parado' || ultimo.movimento === 'bola' ? ultimo.de : (ultimo.para ?? ultimo.de)) : (c.cones[0]?.id ?? '')
    const para = c.cones.find((k) => k.id !== de)?.id
    const novo: PassoCircuito = { de, para, movimento: 'saida', gesto: GESTO_DO_MOVIMENTO.saida, texto: '' }
    mudar({ passos: [...c.passos, novo] })
    setPassoAberto(c.passos.length)
  }
  function moverPasso(i: number, para: number) {
    if (para < 0 || para >= c.passos.length) return
    const lista = [...c.passos]
    const [p] = lista.splice(i, 1)
    lista.splice(para, 0, p)
    mudar({ passos: lista })
    setPassoAberto(para)
  }

  async function salvar() {
    if (problemas.length) return
    setSalvando(true)
    setErroSalvar('')
    try {
      await aoSalvar(pronto)
    } catch (e) {
      setErroSalvar(e instanceof Error ? e.message : 'Não deu para salvar. Confira a internet e tente de novo.')
      setSalvando(false)
    }
  }

  const gestosPorCategoria = [...new Set(gestos.map((g) => g.categoria))].map((cat) => ({ cat: categoriaGestoPorId(cat), lista: gestos.filter((g) => g.categoria === cat) }))

  let quadra: ReactNode
  let painel: ReactNode
  if (aba === 'cones') {
    quadra = <QuadraCones circuito={c} modo="montagem" edicao={{ selecionado, aoSelecionar: setSelecionado, aoMover: moverCone }} />
    painel = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-600">Arraste os cones no desenho. O gol fica embaixo; a esquerda do desenho é a esquerda do goleiro.</p>
        <div className="flex flex-wrap gap-1.5">
          {CORES.map((cor) => (
            <button key={cor.id} type="button" disabled={c.cones.length >= 10} onClick={() => incluirCone(cor.id)} className="rounded-xl border-2 border-sky-200 bg-white px-2 py-1 text-sm font-bold disabled:opacity-40">
              + {cor.emoji} cone {cor.nome.toLowerCase()}
            </button>
          ))}
          {!c.bola && (
            <button type="button" onClick={() => mudar({ bola: { x: 0, y: 8, texto: 'Um adulto rola a bola.' } })} className="rounded-xl border-2 border-sky-200 bg-white px-2 py-1 text-sm font-bold">
              + ⚽ bola do adulto
            </button>
          )}
        </div>

        {selecionado === 'bola' && c.bola ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-2">
            <p className="font-extrabold">⚽ Bola do adulto</p>
            <label className={ROTULO}>
              O que o adulto faz com a bola
              <input value={c.bola.texto} maxLength={140} onChange={(e) => mudar({ bola: { ...c.bola!, texto: e.target.value } })} className={CAMPO} />
            </label>
            <button
              type="button"
              onClick={() => {
                mudar({ bola: undefined })
                setSelecionado(null)
              }}
              className="self-start text-sm font-bold text-red-700 underline"
            >
              🗑️ Tirar a bola
            </button>
          </div>
        ) : coneSel ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-amber-50 p-2">
            <p className="font-extrabold">
              Cone {coneSel.id}: {metros(coneSel.y)} m à frente do gol{Math.abs(coneSel.x) >= 0.3 ? ` · ${metros(coneSel.x)} m à ${coneSel.x < 0 ? 'esquerda' : 'direita'}` : ', no meio'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className={ROTULO}>
                Letra
                <input
                  value={coneSel.id}
                  maxLength={2}
                  onChange={(e) => {
                    const nova = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    if (nova && !c.cones.some((k) => k.id === nova)) mudarCone(coneSel.id, { id: nova })
                  }}
                  className={CAMPO}
                />
              </label>
              <label className={ROTULO}>
                Cor
                <select value={coneSel.cor} onChange={(e) => mudarCone(coneSel.id, { cor: e.target.value as CorCone })} className={CAMPO}>
                  {CORES.map((cor) => (
                    <option key={cor.id} value={cor.id}>
                      {cor.emoji} {cor.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className={ROTULO}>
                Metros à frente do gol
                <input
                  type="number"
                  step={0.5}
                  min={LIMITES_CONE.yMin}
                  max={LIMITES_CONE.yMax}
                  value={coneSel.y}
                  onChange={(e) => mudarCone(coneSel.id, { y: Math.min(LIMITES_CONE.yMax, Math.max(LIMITES_CONE.yMin, Number(e.target.value) || 0)) })}
                  className={CAMPO}
                />
              </label>
              <label className={ROTULO}>
                Para o lado (− esquerda, + direita)
                <input
                  type="number"
                  step={0.5}
                  min={-LIMITES_CONE.x}
                  max={LIMITES_CONE.x}
                  value={coneSel.x}
                  onChange={(e) => mudarCone(coneSel.id, { x: Math.min(LIMITES_CONE.x, Math.max(-LIMITES_CONE.x, Number(e.target.value) || 0)) })}
                  className={CAMPO}
                />
              </label>
            </div>
            <label className={ROTULO}>
              Para que serve (opcional)
              <input value={coneSel.papel ?? ''} maxLength={60} onChange={(e) => mudarCone(coneSel.id, { papel: e.target.value })} placeholder="Ex.: meio do gol (começo)" className={CAMPO} />
            </label>
            <button
              type="button"
              onClick={() => {
                mudar({ cones: c.cones.filter((k) => k.id !== coneSel.id) })
                setSelecionado(null)
              }}
              className="self-start text-sm font-bold text-red-700 underline"
            >
              🗑️ Tirar o cone {coneSel.id}
            </button>
          </div>
        ) : (
          <p className="rounded-2xl bg-sky-50 p-2 text-sm">Toque num cone para mudar a letra, a cor, a distância ou para que serve.</p>
        )}
      </div>
    )
  } else if (aba === 'passos') {
    quadra = <QuadraCones circuito={c} modo="passo" passo={Math.min(passoAberto, Math.max(0, c.passos.length - 1))} />
    painel = (
      <div className="flex flex-col gap-2">
        {c.passos.map((p, i) => {
          const aberto = passoAberto === i
          return (
            <div key={i} className={`flex flex-col gap-2 rounded-2xl border-2 p-2 ${aberto ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}>
              <button type="button" onClick={() => setPassoAberto(i)} className="flex items-center gap-2 text-left font-bold">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sky-600 text-sm font-black text-white">{i + 1}</span>
                <span className="flex-1">{p.texto || textoPadrao(p)}</span>
                <span className="text-xs">{aberto ? '▲' : '✏️'}</span>
              </button>
              {aberto && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={ROTULO}>
                      Sai do cone
                      <select value={p.de} onChange={(e) => mudarPasso(i, { de: e.target.value })} className={CAMPO}>
                        {c.cones.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={ROTULO}>
                      Como
                      <select
                        value={p.movimento}
                        onChange={(e) => {
                          const movimento = e.target.value as Movimento
                          // O gesto sugerido acompanha o movimento (se ainda era o sugerido)
                          const gesto = p.gesto === GESTO_DO_MOVIMENTO[p.movimento] ? GESTO_DO_MOVIMENTO[movimento] : p.gesto
                          mudarPasso(i, { movimento, gesto, para: movimento === 'parado' ? undefined : (p.para ?? c.cones.find((k) => k.id !== p.de)?.id) })
                        }}
                        className={CAMPO}
                      >
                        {MOVIMENTOS.map((m) => (
                          <option key={m} value={m}>
                            {NOMES_MOVIMENTO[m]}
                          </option>
                        ))}
                      </select>
                    </label>
                    {p.movimento !== 'parado' && (
                      <label className={ROTULO}>
                        {p.movimento === 'bola' ? 'A bola vai até o cone' : 'Até o cone'}
                        <select value={p.para ?? ''} onChange={(e) => mudarPasso(i, { para: e.target.value })} className={CAMPO}>
                          {c.cones
                            .filter((k) => k.id !== p.de)
                            .map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.id}
                              </option>
                            ))}
                        </select>
                      </label>
                    )}
                    <label className={ROTULO}>
                      Gesto técnico
                      <select value={p.gesto} onChange={(e) => mudarPasso(i, { gesto: e.target.value })} className={CAMPO}>
                        {gestosPorCategoria.map(({ cat, lista }) => (
                          <optgroup key={cat.id} label={`${cat.emoji} ${cat.nome}`}>
                            {lista.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.nome}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className={ROTULO}>
                    O que fazer (texto para a criança)
                    <input value={p.texto} maxLength={160} onChange={(e) => mudarPasso(i, { texto: e.target.value })} placeholder={textoPadrao(p)} className={CAMPO} />
                  </label>
                  <div className="flex flex-wrap gap-3 text-sm font-bold">
                    <button type="button" disabled={i === 0} onClick={() => moverPasso(i, i - 1)} className="underline disabled:opacity-40">
                      ⬆️ subir
                    </button>
                    <button type="button" disabled={i === c.passos.length - 1} onClick={() => moverPasso(i, i + 1)} className="underline disabled:opacity-40">
                      ⬇️ descer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        mudar({ passos: c.passos.filter((_, k) => k !== i) })
                        setPassoAberto(Math.max(0, i - 1))
                      }}
                      className="text-red-700 underline"
                    >
                      🗑️ tirar
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
        {c.passos.length < 15 && (
          <button type="button" disabled={c.cones.length === 0} onClick={incluirPasso} className="min-h-11 rounded-2xl border-2 border-dashed border-sky-400 font-extrabold disabled:opacity-40">
            + Passo
          </button>
        )}
      </div>
    )
  } else {
    quadra = <QuadraCones circuito={c} modo="percurso" />
    painel = (
      <div className="flex flex-col gap-3">
        <label className={ROTULO}>
          Nome do circuito
          <input value={c.nome} maxLength={40} onChange={(e) => mudar({ nome: e.target.value })} placeholder="Ex.: Saída e cruz pela direita" className={CAMPO} />
        </label>
        <fieldset>
          <legend className="mb-1 text-sm font-bold">Ícone</legend>
          <div className="flex flex-wrap gap-1">
            {ICONES.map((i) => (
              <button key={i} type="button" aria-pressed={c.emoji === i} onClick={() => mudar({ emoji: i })} className={`grid size-10 place-items-center rounded-xl border-2 text-xl ${c.emoji === i ? 'border-sky-600 bg-sky-100' : 'border-transparent bg-sky-50'}`}>
                {i}
              </button>
            ))}
          </div>
        </fieldset>
        <label className={ROTULO}>
          Nível
          <select value={c.nivel} onChange={(e) => mudar({ nivel: e.target.value as Circuito['nivel'] })} className={CAMPO}>
            {(Object.keys(NOME_NIVEL) as Circuito['nivel'][]).map((n) => (
              <option key={n} value={n}>
                {NOME_NIVEL[n]}
              </option>
            ))}
          </select>
        </label>
        <label className={ROTULO}>
          Para que serve
          <textarea value={c.objetivo} maxLength={200} rows={2} onChange={(e) => mudar({ objetivo: e.target.value })} placeholder="Ex.: Sair rápido e fechar o chute do atacante." className={CAMPO} />
        </label>
        <label className={ROTULO}>
          Quantas vezes e descanso
          <input value={c.repeticoes} maxLength={60} onChange={(e) => mudar({ repeticoes: e.target.value })} placeholder="4 vezes · 30 s de descanso" className={CAMPO} />
        </label>
        <label className={ROTULO}>
          🦺 Cuidado / segurança (opcional)
          <input value={c.seguranca ?? ''} maxLength={160} onChange={(e) => mudar({ seguranca: e.target.value })} placeholder="Ex.: Quedas só na grama ou no colchonete." className={CAMPO} />
        </label>
        <label className={ROTULO}>
          🎬 Vídeo de exemplo do treino (opcional: link do YouTube ou da Hotmart)
          <input type="url" value={c.video ?? ''} onChange={(e) => mudar({ video: e.target.value })} placeholder="https://youtu.be/..." className={CAMPO} />
        </label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-xl font-extrabold">✏️ Circuito {c.nome ? `· ${c.nome}` : ''}</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold">Para: {destino}</span>
      </div>
      <div className="flex flex-wrap gap-1.5" role="tablist">
        <Aba ativa={aba === 'cones'} aoTocar={() => setAba('cones')}>
          🔺 Cones ({c.cones.length})
        </Aba>
        <Aba ativa={aba === 'passos'} aoTocar={() => setAba('passos')}>
          👣 Passos ({c.passos.length})
        </Aba>
        <Aba ativa={aba === 'dados'} aoTocar={() => setAba('dados')}>
          📝 Nome e vídeo
        </Aba>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-3 lg:self-start">{quadra}</div>
        <div>{painel}</div>
      </div>

      {problemas.length > 0 ? (
        <div className="rounded-2xl bg-amber-50 p-3 text-sm">
          <p className="font-extrabold">Falta arrumar para salvar:</p>
          <ul className="list-disc pl-5">
            {problemas.slice(0, 6).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-2xl bg-green-50 p-2 text-sm font-bold">✅ Tudo conferido.</p>
      )}
      {erroSalvar && <p className="font-bold text-red-700">❌ {erroSalvar}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={problemas.length > 0} onClick={() => setVendo(true)} className="min-h-12 flex-1 rounded-2xl border-4 border-sky-300 bg-white px-4 font-extrabold disabled:opacity-40">
          👀 Ver como a criança vê
        </button>
        <button type="button" disabled={problemas.length > 0 || salvando} onClick={salvar} className="min-h-12 flex-1 rounded-2xl bg-sol px-4 font-extrabold shadow disabled:opacity-40">
          {salvando ? 'Salvando…' : '💾 Salvar'}
        </button>
        <button type="button" onClick={aoCancelar} className="min-h-12 rounded-2xl border-2 border-slate-300 bg-white px-4 font-bold">
          Voltar sem salvar
        </button>
      </div>

      {vendo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3">
          <div className="mx-auto flex max-w-xl flex-col gap-2 rounded-3xl bg-campo-claro p-3 shadow-xl">
            <button type="button" onClick={() => setVendo(false)} className="self-end rounded-full bg-white px-3 py-1 font-bold shadow">
              ✖️ Fechar
            </button>
            <TelaCircuito circuito={pronto} teste />
          </div>
        </div>
      )}
    </div>
  )
}
