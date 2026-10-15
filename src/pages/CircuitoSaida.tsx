// Um circuito de saída do gol (/goleiro/saida/:circuito), em 3 partes:
//  1. Monte: o desenho só com os cones e a distância de cada um, e a lista do material;
//  2. Passo a passo: o desenho mostra só a seta do passo (o goleiro desliza), o tipo de movimento,
//     o que fazer e o gesto técnico desenhado. "Ver andando" passa os passos sozinho;
//  3. Repita: quantas vezes e "Fiz o circuito" (XP e moedas).
// Em cima, o vídeo de exemplo do treino (e, para o adulto, pôr ou trocar o link). Serve para os
// circuitos do app, da família e da turma; o editor usa a mesma tela para "Ver como a criança vê".
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { PainelRecompensa } from '../components/ui/PainelRecompensa'
import { VideoReal } from '../components/video/VideoReal'
import { estiloDoMovimento, metros, NOME_NIVEL, type Circuito, type Cone, type CorCone } from '../features/saidaGol/circuitos'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import { gestoProntoPorId } from '../features/saidaGol/gestos'
import { QuadraCones } from '../features/saidaGol/QuadraCones'
import { useGestos } from '../features/saidaGol/useGestos'
import { useCircuitos } from '../features/saidaGol/fontesCircuitos'
import { VideoDoCircuito } from '../features/saidaGol/VideoDoCircuito'
import { entregarRecompensa, type ResultadoRecompensa } from '../stores/progressStore'

const COR_CONE: Record<CorCone, { nome: string; fundo: string }> = {
  laranja: { nome: 'laranja', fundo: '#fb923c' },
  amarelo: { nome: 'amarelo', fundo: '#facc15' },
  azul: { nome: 'azul', fundo: '#60a5fa' },
  vermelho: { nome: 'vermelho', fundo: '#f87171' },
}

const XP_CIRCUITO = 15
const MOEDAS_CIRCUITO = 2
/** Tempo de cada passo no "Ver andando" */
const MS_POR_PASSO = 2400

/** Onde fica o cone, em palavras: "3,5 m à frente do gol · 2,5 m à esquerda" */
function ondeFica(c: Cone): string {
  const frente = `${metros(c.y)} m à frente da linha do gol`
  if (Math.abs(c.x) < 0.3) return `${frente}, no meio`
  return `${frente} · ${metros(c.x)} m à ${c.x < 0 ? 'esquerda' : 'direita'}`
}

function Titulo({ numero, children }: { numero: number; children: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-extrabold">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-600 text-lg font-black text-white">{numero}</span>
      {children}
    </h2>
  )
}

export function CircuitoSaida() {
  const id = useParams().circuito
  const circuito = useCircuitos().find((c) => c.id === id)
  if (!circuito) return <Navigate to="/goleiro/saida" replace />
  return <TelaCircuito key={circuito.id} circuito={circuito} />
}

/** A tela de um circuito. teste = visualização do editor (sem botão de voltar nem recompensa) */
export function TelaCircuito({ circuito, teste = false }: { circuito: Circuito; teste?: boolean }) {
  const [passo, setPasso] = useState(0)
  const [andando, setAndando] = useState(false)
  const [maisGesto, setMaisGesto] = useState(false)
  const [recompensa, setRecompensa] = useState<ResultadoRecompensa | null>(null)
  const total = circuito.passos.length
  const atual = circuito.passos[passo]
  const movimento = estiloDoMovimento(atual.movimento)
  // Gestos com as mudanças dos pais (desenho, textos e vídeos); o do app se não achar
  const gestos = useGestos()
  const gestoPorId = (id: string) => gestos.find((g) => g.id === id) ?? gestoProntoPorId(id)!
  const gesto = gestoPorId(atual.gesto)
  const cone = (id: string) => circuito.cones.find((c) => c.id === id)!

  // "Ver andando": avança sozinho e para no último passo
  useEffect(() => {
    if (!andando) return
    const t = window.setTimeout(() => {
      if (passo >= total - 1) setAndando(false)
      else setPasso((p) => p + 1)
    }, MS_POR_PASSO)
    return () => window.clearTimeout(t)
  }, [andando, passo, total])

  function irPara(i: number) {
    setAndando(false)
    setMaisGesto(false)
    setPasso(i)
  }

  // Cones na ordem em que aparecem no circuito (o do começo primeiro)
  const ordem = [...new Set(circuito.passos.flatMap((p) => [p.de, ...(p.para ? [p.para] : [])]))]
  const cones = [...circuito.cones].sort((a, b) => ordem.indexOf(a.id) - ordem.indexOf(b.id))

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        {!teste && (
          <Link to="/goleiro/saida" aria-label="Voltar aos circuitos" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
            ⬅️
          </Link>
        )}
        <h1 className="flex-1 text-2xl leading-tight font-extrabold">
          <span aria-hidden>{circuito.emoji} </span>
          {circuito.nome}
        </h1>
      </header>
      <div className="flex flex-col gap-2">
        <p className="flex flex-wrap gap-2 text-sm font-extrabold">
          <span className="rounded-full bg-white px-3 py-1 shadow">{NOME_NIVEL[circuito.nivel]}</span>
          <span className="rounded-full bg-white px-3 py-1 shadow">🔺 {circuito.cones.length} cones</span>
          <span className="rounded-full bg-white px-3 py-1 shadow">👣 {total} passos</span>
          <span className="rounded-full bg-white px-3 py-1 shadow">🔁 {circuito.repeticoes}</span>
          {circuito.origem && <span className="rounded-full bg-sky-100 px-3 py-1 shadow">{circuito.origem}</span>}
        </p>
        <p className="rounded-2xl bg-sky-50 p-3 text-base">
          🎯 <b>Para que serve:</b> {circuito.objetivo}
        </p>
        <VideoDoCircuito circuito={circuito} comEdicao={!teste} />
      </div>

      {/* 1. Montar */}
      <details open className="group flex flex-col gap-3 rounded-3xl border-4 border-amber-300 bg-white p-3">
        <summary className="cursor-pointer list-none">
          <Titulo numero={1}>Monte o circuito</Titulo>
          <span className="mt-1 block text-sm text-slate-600">Um adulto ajuda. O gol fica embaixo do desenho; a esquerda do desenho é a esquerda do goleiro.</span>
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <QuadraCones circuito={circuito} modo="montagem" />
          <ul className="flex flex-col gap-2">
            {cones.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-amber-50 p-2">
                <span className="relative grid size-10 shrink-0 place-items-center">
                  <svg viewBox="0 0 20 20" className="size-10" aria-hidden>
                    <path d="M10 1 L2 18 L18 18 Z" fill={COR_CONE[c.cor].fundo} stroke="#1f2937" strokeWidth={1} strokeLinejoin="round" />
                  </svg>
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-xs font-black shadow">{c.id}</span>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-extrabold">
                    Cone {c.id} ({COR_CONE[c.cor].nome}){c.papel ? `: ${c.papel}` : ''}
                  </span>
                  <span className="text-sm">{ondeFica(c)}</span>
                  {c.id === circuito.passos[0].de && <span className="mt-0.5 self-start rounded-full bg-orange-500 px-2 text-xs font-extrabold text-white">🧤 o goleiro começa aqui</span>}
                </span>
              </li>
            ))}
            {circuito.bola && (
              <li className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2">
                <span aria-hidden className="grid size-10 shrink-0 place-items-center text-3xl">
                  ⚽
                </span>
                <span className="text-sm font-bold">{circuito.bola.texto}</span>
              </li>
            )}
          </ul>
          <p className="text-xs text-slate-600">📏 1 metro ≈ 1 passo grande de adulto. Para os menores, encurte as distâncias.</p>
          {circuito.seguranca && <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-900">🦺 {circuito.seguranca}</p>}
        </div>
      </details>

      {/* 2. Passo a passo */}
      <div className="flex flex-col gap-3 rounded-3xl border-4 border-sky-400 bg-white p-3">
        <Titulo numero={2}>Faça passo a passo</Titulo>

        {/* Bolinhas dos passos */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Passos">
          {circuito.passos.map((p, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === passo}
              aria-label={`Passo ${i + 1}: ${p.texto}`}
              onClick={() => irPara(i)}
              className={`grid size-9 place-items-center rounded-full border-2 text-sm font-black ${
                i === passo ? 'scale-110 border-sky-700 bg-sky-600 text-white' : i < passo ? 'border-green-400 bg-green-100' : 'border-sky-200 bg-white'
              }`}
            >
              {i < passo ? '✓' : i + 1}
            </button>
          ))}
        </div>

        <QuadraCones circuito={circuito} modo="passo" passo={passo} />

        <div className="flex flex-col gap-2" aria-live="polite">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-3 py-1 text-sm font-extrabold text-white" style={{ background: movimento.cor }}>
              {movimento.emoji} {movimento.nome}
            </span>
            <span className="text-sm font-bold text-slate-600">
              {atual.movimento === 'parado' ? `no cone ${atual.de}` : atual.movimento === 'bola' ? `do cone ${atual.de} até o ${atual.para}` : `do cone ${atual.de} até o cone ${atual.para}`}
            </span>
          </p>
          <p className="text-2xl leading-snug font-extrabold">
            <span className="text-sky-700">{passo + 1}. </span>
            {atual.texto}
          </p>
          <p className="text-sm text-slate-600">{movimento.dica}</p>
        </div>

        {/* Gesto técnico do passo */}
        <div className="flex flex-col gap-2 rounded-2xl bg-green-50 p-2">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-2xl bg-white p-1">
              <DesenhoGesto key={atual.gesto} desenho={gesto.desenho} nome={gesto.nome} tamanho={110} gesto={gesto.id} />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-xs font-bold tracking-wide text-green-800 uppercase">Gesto técnico</p>
              <p className="text-lg leading-tight font-extrabold">{gesto.nome}</p>
              <p className="text-sm">{gesto.resumo}</p>
              <button type="button" onClick={() => setMaisGesto((m) => !m)} className="self-start text-sm font-bold text-green-800 underline">
                {maisGesto ? 'Esconder' : 'Como fazer ▾'}
              </button>
            </div>
          </div>
          {maisGesto && (
            <div className="flex flex-col gap-2">
              <ol className="flex flex-col gap-1 text-base">
                {gesto.comoFazer.map((t, i) => (
                  <li key={t} className="flex gap-2">
                    <b className="text-green-800">{i + 1}.</b> {t}
                  </li>
                ))}
              </ol>
              {gesto.atencao && <p className="rounded-xl bg-amber-50 p-2 text-sm">⚠️ {gesto.atencao}</p>}
              <VideoReal titulo={gesto.nome} video={gesto.video} videoLocal={gesto.videoLocal} />
              <Link to={`/fundamentos/${gesto.id}?tipo=goleiro`} className="self-start text-sm font-bold text-green-800 underline">
                Abrir o gesto completo 📖
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={passo === 0} onClick={() => irPara(passo - 1)} className="min-h-14 rounded-2xl border-4 border-sky-200 bg-white text-lg font-extrabold disabled:opacity-40">
            ◀️ Anterior
          </button>
          <button type="button" disabled={passo === total - 1} onClick={() => irPara(passo + 1)} className="min-h-14 rounded-2xl bg-sol text-lg font-extrabold shadow disabled:opacity-40">
            Próximo ▶️
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!andando && passo === total - 1) setPasso(0)
            setMaisGesto(false)
            setAndando((a) => !a)
          }}
          className="min-h-12 rounded-2xl border-4 border-sky-300 bg-sky-50 font-extrabold"
        >
          {andando ? '⏸️ Parar' : '🎬 Ver o circuito andando'}
        </button>

        <details className="rounded-2xl bg-slate-50 p-2 text-sm">
          <summary className="cursor-pointer font-bold">📋 Todos os passos numa lista</summary>
          <ol className="mt-2 flex flex-col gap-1">
            {circuito.passos.map((p, i) => {
              const e = estiloDoMovimento(p.movimento)
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => irPara(i)}
                    className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left ${i === passo ? 'bg-sky-100 font-extrabold' : 'bg-white'}`}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full text-xs font-black text-white" style={{ background: e.cor }}>
                      {i + 1}
                    </span>
                    <span aria-hidden>{e.emoji}</span>
                    <span className="flex-1">{p.texto}</span>
                    <span className="shrink-0 text-xs font-bold text-sky-800">{gestoPorId(p.gesto).nome}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="mt-2 text-xs text-slate-600">
            Começa no cone {cone(circuito.passos[0].de).id} e termina no cone {circuito.passos[total - 1].para ?? circuito.passos[total - 1].de}.
          </p>
        </details>
      </div>

      {/* 3. Repetir */}
      <div className="flex flex-col gap-3 rounded-3xl border-4 border-green-400 bg-white p-3">
        <Titulo numero={3}>Repita e marque</Titulo>
        <p className="text-lg font-bold">🔁 {circuito.repeticoes}</p>
        {teste ? (
          <p className="text-sm font-bold text-slate-600">🧪 Visualização: aqui a criança marca que fez.</p>
        ) : recompensa ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-2xl font-extrabold">🎉 Circuito feito!</p>
            <PainelRecompensa xp={XP_CIRCUITO} moedas={MOEDAS_CIRCUITO} resultadoXP={recompensa.resultadoXP} bonusSequencia={recompensa.bonusSequencia} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRecompensa(entregarRecompensa(XP_CIRCUITO, MOEDAS_CIRCUITO, 'goleiro'))}
            className="min-h-16 rounded-3xl bg-green-500 text-xl font-extrabold text-white shadow"
          >
            ✅ Fiz o circuito
          </button>
        )}
      </div>
    </section>
  )
}
