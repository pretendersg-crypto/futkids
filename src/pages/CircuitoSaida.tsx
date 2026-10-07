// Um circuito de saída do gol (/goleiro/saida/:circuito): o desenho com os cones, o material, e o
// passo a passo — cada passo destaca a seta na quadra e mostra o gesto técnico desenhado.
// "Ver andando" passa os passos sozinho (o goleiro desliza pelos cones). No fim, "Fiz o circuito".
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { PainelRecompensa } from '../components/ui/PainelRecompensa'
import { circuitoPorId, ESTILO_MOVIMENTO, NOME_NIVEL, type Circuito } from '../features/saidaGol/circuitos'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { GESTOS } from '../features/saidaGol/gestos'
import { QuadraCones } from '../features/saidaGol/QuadraCones'
import { entregarRecompensa, type ResultadoRecompensa } from '../stores/progressStore'

/** Nome da cor do cone no singular e no plural */
const NOME_COR: Record<string, [string, string]> = {
  laranja: ['laranja', 'laranjas'],
  amarelo: ['amarelo', 'amarelos'],
  azul: ['azul', 'azuis'],
  vermelho: ['vermelho', 'vermelhos'],
}

const XP_CIRCUITO = 15
const MOEDAS_CIRCUITO = 2
/** Tempo de cada passo no "Ver andando" */
const MS_POR_PASSO = 2200

export function CircuitoSaida() {
  const circuito = circuitoPorId(useParams().circuito)
  if (!circuito) return <Navigate to="/goleiro/saida" replace />
  return <TelaCircuito key={circuito.id} circuito={circuito} />
}

function TelaCircuito({ circuito }: { circuito: Circuito }) {
  const [passo, setPasso] = useState(0)
  const [andando, setAndando] = useState(false)
  const [recompensa, setRecompensa] = useState<ResultadoRecompensa | null>(null)
  const total = circuito.passos.length
  const atual = circuito.passos[passo]
  const gesto = GESTOS[atual.gesto]

  // "Ver andando": avança sozinho e para no último passo
  useEffect(() => {
    if (!andando) return
    const t = window.setTimeout(() => {
      if (passo >= total - 1) setAndando(false)
      else setPasso((p) => p + 1)
    }, MS_POR_PASSO)
    return () => window.clearTimeout(t)
  }, [andando, passo, total])

  const materiais = circuito.cones.filter((c) => c.papel)
  const qtdPorCor = circuito.cones.reduce<Record<string, number>>((m, c) => ({ ...m, [c.cor]: (m[c.cor] ?? 0) + 1 }), {})

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link to="/goleiro/saida" aria-label="Voltar aos circuitos" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ⬅️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">
          <span aria-hidden>{circuito.emoji} </span>
          {circuito.nome}
        </h1>
      </header>

      <p className="text-base">
        <b>{NOME_NIVEL[circuito.nivel]}</b> · {circuito.objetivo}
      </p>

      {/* Material */}
      <div className="flex flex-col gap-1 rounded-2xl bg-sky-50 p-3 text-sm">
        <p className="font-extrabold">🧰 Material e montagem</p>
        <p>
          Cones:{' '}
          {Object.entries(qtdPorCor)
            .map(([cor, n]) => `${n} ${NOME_COR[cor][n > 1 ? 1 : 0]}`)
            .join(', ')}
          {circuito.bola ? ' · 1 bola' : ''} · 🔁 {circuito.repeticoes}
        </p>
        {materiais.map((c) => (
          <p key={c.id}>
            <b>Cone {c.id}</b>: {c.papel}
          </p>
        ))}
        {circuito.bola && <p>⚽ {circuito.bola.texto}</p>}
        <p className="text-xs">Distâncias no desenho: a área vai até 6 m do gol. Para os menores, encurte as distâncias.</p>
      </div>

      <QuadraCones circuito={circuito} passo={passo} />
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
        {Object.entries(ESTILO_MOVIMENTO).map(([m, e]) => (
          <li key={m} className="flex items-center gap-1">
            <svg width="22" height="6" aria-hidden>
              <line x1="1" y1="3" x2="21" y2="3" stroke={e.cor} strokeWidth="2.5" strokeDasharray={e.traco} />
            </svg>
            {e.nome}
          </li>
        ))}
      </ul>

      {/* Passo atual com o gesto desenhado */}
      <div className="flex flex-col gap-2 rounded-3xl border-4 border-sky-400 bg-white p-3" aria-live="polite">
        <p className="text-sm font-extrabold text-sky-800">
          Passo {passo + 1} de {total}
        </p>
        <p className="text-xl leading-snug font-extrabold">{atual.texto}</p>
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl bg-green-50 p-1">
            <DesenhoGesto key={atual.gesto} gesto={atual.gesto} tamanho={130} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold tracking-wide text-sky-800 uppercase">Gesto técnico</p>
            <p className="text-lg leading-tight font-extrabold">{gesto.nome}</p>
            <ul className="flex flex-col gap-0.5 text-sm">
              {gesto.comoFazer.slice(0, 3).map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="rounded-xl bg-amber-50 p-2 text-sm">⚠️ {gesto.atencao}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={passo === 0}
            onClick={() => {
              setAndando(false)
              setPasso((p) => p - 1)
            }}
            className="min-h-14 rounded-2xl border-4 border-sky-200 bg-white text-lg font-extrabold disabled:opacity-40"
          >
            ◀️ Anterior
          </button>
          <button
            type="button"
            disabled={passo === total - 1}
            onClick={() => {
              setAndando(false)
              setPasso((p) => p + 1)
            }}
            className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow disabled:opacity-40"
          >
            Próximo ▶️
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!andando && passo === total - 1) setPasso(0)
            setAndando((a) => !a)
          }}
          className="min-h-12 rounded-2xl border-4 border-sky-300 bg-sky-50 font-extrabold"
        >
          {andando ? '⏸️ Parar' : '🎬 Ver o circuito andando'}
        </button>
      </div>

      {/* Todos os passos */}
      <ol className="flex flex-col gap-1">
        {circuito.passos.map((p, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => {
                setAndando(false)
                setPasso(i)
              }}
              aria-current={i === passo ? 'step' : undefined}
              className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm ${i === passo ? 'bg-sky-100 font-extrabold' : 'bg-white'}`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 text-xs font-black text-white">{i + 1}</span>
              <span className="flex-1">{p.texto}</span>
              <span className="shrink-0 text-xs font-bold text-sky-800">{GESTOS[p.gesto].nome}</span>
            </button>
          </li>
        ))}
      </ol>

      {circuito.seguranca && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-900">🦺 {circuito.seguranca}</p>}

      {recompensa ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-2xl font-extrabold">🎉 Circuito feito!</p>
          <PainelRecompensa xp={XP_CIRCUITO} moedas={MOEDAS_CIRCUITO} resultadoXP={recompensa.resultadoXP} bonusSequencia={recompensa.bonusSequencia} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRecompensa(entregarRecompensa(XP_CIRCUITO, MOEDAS_CIRCUITO, 'goleiro'))}
          className="min-h-16 rounded-3xl border-4 border-green-500 bg-green-100 text-xl font-extrabold"
        >
          ✅ Fiz o circuito ({circuito.repeticoes.split('·')[0].trim()})
        </button>
      )}
    </section>
  )
}
