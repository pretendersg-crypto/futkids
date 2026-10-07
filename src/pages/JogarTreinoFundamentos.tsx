// Fazer um treino de fundamentos (/goleiro/treino/:treino): a lista dos gestos, depois um por um
// (desenho grande, como fazer, recado do treinador, vídeo real e quantas vezes ou o cronômetro) e,
// no fim, a recompensa. Conta como treino de goleiro (marca o dia na agenda).
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Mascote } from '../components/mascote/Mascote'
import { PainelRecompensa } from '../components/ui/PainelRecompensa'
import { ProgressBar } from '../components/ui/ProgressBar'
import { VideoReal } from '../components/video/VideoReal'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import type { Gesto } from '../features/saidaGol/gestos'
import { useGestos } from '../features/saidaGol/useGestos'
import { useTimer } from '../hooks/useTimer'
import { useWakeLock } from '../hooks/useWakeLock'
import { entregarRecompensa, type ResultadoRecompensa } from '../stores/progressStore'
import { useTreinosFundamentosStore, type ItemTreinoFundamentos, type TreinoFundamentos } from '../stores/treinosFundamentosStore'
import { destravarSom, sons } from '../utils/som'

/** XP por fundamento feito e moedas no fim */
const XP_POR_GESTO = 5
const MOEDAS = 2

const descrever = (it: ItemTreinoFundamentos) => (it.tipo === 'segundos' ? `${it.quantidade} segundos` : `${it.quantidade} vezes`)

export function JogarTreinoFundamentos() {
  const { treino: id } = useParams()
  const treino = useTreinosFundamentosStore((s) => s.treinos.find((t) => t.id === id))
  if (!treino) return <Navigate to="/goleiro" replace />
  return <Treino key={treino.id} treino={treino} />
}

function Treino({ treino }: { treino: TreinoFundamentos }) {
  const gestos = useGestos()
  // Gesto apagado depois de entrar no treino: fica de fora
  const itens = treino.itens.flatMap((it) => {
    const gesto = gestos.find((g) => g.id === it.gesto)
    return gesto ? [{ ...it, g: gesto }] : []
  })
  const [indice, setIndice] = useState<number | null>(null)
  const [feitos, setFeitos] = useState(0)
  const [fim, setFim] = useState<(ResultadoRecompensa & { xp: number }) | null>(null)
  useWakeLock(indice !== null && !fim)

  function proximo(fez: boolean) {
    const total = feitos + (fez ? 1 : 0)
    setFeitos(total)
    if (indice! < itens.length - 1) return setIndice(indice! + 1)
    sons.concluido()
    const xp = Math.max(XP_POR_GESTO, total * XP_POR_GESTO)
    setFim({ ...entregarRecompensa(xp, total > 0 ? MOEDAS : 0, 'goleiro'), xp })
  }

  if (fim) {
    return (
      <div className="flex flex-col items-center gap-4 pt-4 text-center">
        <Mascote humor="comemorando" fala="Treino de goleiro feito! 🧤" tamanho={80} />
        <h1 className="text-3xl font-extrabold">
          {treino.emoji} {treino.nome}
        </h1>
        <p className="text-xl font-bold">
          {feitos} de {itens.length} fundamentos feitos
        </p>
        <PainelRecompensa xp={fim.xp} moedas={feitos > 0 ? MOEDAS : 0} resultadoXP={fim.resultadoXP} bonusSequencia={fim.bonusSequencia} />
        <Link to="/goleiro" className="grid min-h-16 w-full place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
          Goleiro 🧤
        </Link>
      </div>
    )
  }

  if (indice === null) {
    return (
      <section className="flex flex-col gap-4">
        <header className="flex items-center gap-3">
          <Link to="/goleiro" aria-label="Voltar ao goleiro" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
            ⬅️
          </Link>
          <h1 className="flex-1 text-2xl font-extrabold">
            <span aria-hidden>{treino.emoji} </span>
            {treino.nome}
          </h1>
        </header>
        {treino.descricao && <p className="text-lg">{treino.descricao}</p>}
        <ol className="flex flex-col gap-2">
          {itens.map((it, i) => (
            <li key={it.gesto} className="flex items-center gap-3 rounded-2xl bg-white p-2 shadow-sm">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-600 font-black text-white">{i + 1}</span>
              <span className="shrink-0 rounded-xl bg-green-50">
                <DesenhoGesto desenho={it.g.desenho} nome={it.g.nome} tamanho={52} />
              </span>
              <span className="flex flex-1 flex-col leading-tight">
                <span className="text-lg font-extrabold">{it.g.nome}</span>
                <span className="text-sm font-bold">{descrever(it)}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="rounded-2xl bg-orange-50 p-3 text-base">🔥 Faça o aquecimento antes!</p>
        <button
          type="button"
          disabled={itens.length === 0}
          onClick={() => {
            destravarSom()
            setIndice(0)
          }}
          className="min-h-18 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg disabled:opacity-40"
        >
          Começar 🧤
        </button>
      </section>
    )
  }

  const atual = itens[indice]
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to="/goleiro" aria-label="Sair do treino" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ✖️
        </Link>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-base font-extrabold">
            {treino.emoji} Fundamento {indice + 1} de {itens.length}
          </p>
          <ProgressBar valor={indice} maximo={itens.length} rotulo="Progresso do treino" />
        </div>
      </header>
      <PassoGesto key={`${indice}-${atual.gesto}`} item={atual} gesto={atual.g} aoTerminar={proximo} ultimo={indice === itens.length - 1} />
    </section>
  )
}

function PassoGesto({ item, gesto, aoTerminar, ultimo }: { item: ItemTreinoFundamentos; gesto: Gesto; aoTerminar: (fez: boolean) => void; ultimo: boolean }) {
  const [rodando, setRodando] = useState(false)
  const [acabou, setAcabou] = useState(false)
  const porTempo = item.tipo === 'segundos'
  const { restanteMs } = useTimer(item.quantidade * 1000, porTempo && rodando, () => {
    sons.concluido()
    setAcabou(true)
  })

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-3xl font-extrabold">{gesto.nome}</h2>
      <div className="rounded-3xl bg-green-50 p-2">
        <DesenhoGesto desenho={gesto.desenho} nome={gesto.nome} tamanho={190} />
      </div>
      <p className="rounded-full bg-sky-100 px-5 py-1 text-2xl font-black">{porTempo ? `⏱️ ${Math.ceil(restanteMs / 1000)} s` : `🔁 ${item.quantidade} vezes`}</p>
      {item.observacao && <p className="w-full rounded-2xl bg-yellow-100 p-3 text-lg font-bold">📣 {item.observacao}</p>}
      <ol className="flex w-full flex-col gap-1 text-left text-base">
        {gesto.comoFazer.map((t, i) => (
          <li key={t} className="flex items-start gap-2 rounded-xl bg-white p-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 text-xs font-black text-white">{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      {gesto.atencao && <p className="w-full rounded-xl bg-amber-50 p-2 text-left text-sm">⚠️ {gesto.atencao}</p>}
      <VideoReal titulo={gesto.nome} video={gesto.video} videoLocal={gesto.videoLocal} />

      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] grid w-full grid-cols-3 gap-2 bg-campo-claro/95 py-2">
        <button type="button" onClick={() => aoTerminar(false)} className="min-h-16 rounded-3xl border-4 border-slate-200 bg-white text-base font-bold">
          Pular ⏭️
        </button>
        {porTempo && !rodando && !acabou ? (
          <button type="button" onClick={() => setRodando(true)} className="col-span-2 min-h-16 rounded-3xl bg-sky-600 text-xl font-extrabold text-white shadow-lg">
            ▶️ Começar {item.quantidade} s
          </button>
        ) : (
          <button
            type="button"
            disabled={porTempo && !acabou}
            onClick={() => aoTerminar(true)}
            className="col-span-2 min-h-16 rounded-3xl bg-sol text-xl font-extrabold shadow-lg disabled:opacity-50"
          >
            {porTempo && !acabou ? 'Aguenta firme… 💪' : ultimo ? 'Fiz! Terminar 🏁' : 'Fiz! Próximo ✅'}
          </button>
        )}
      </div>
    </div>
  )
}
