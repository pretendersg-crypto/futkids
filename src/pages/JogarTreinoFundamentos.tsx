// Fazer um treino de fundamentos (/goleiro/treino/:treino): a lista dos gestos, depois um por um
// (desenho grande, como fazer, recado do treinador, vídeo real e quantas vezes ou o cronômetro) e,
// no fim, a recompensa. Conta como treino de goleiro (marca o dia na agenda). Como num curso, cada
// passo tem a barra Anterior / Lista / Concluída / Próximo; concluir também marca o gesto na trilha.
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Mascote } from '../components/mascote/Mascote'
import { PainelRecompensa } from '../components/ui/PainelRecompensa'
import { BarraAula } from '../components/ui/BarraAula'
import { ProgressBar } from '../components/ui/ProgressBar'
import { VideoReal } from '../components/video/VideoReal'
import { DesenhoGesto } from '../features/saidaGol/DesenhoGesto'
import type { Gesto } from '../features/saidaGol/gestos'
import { useGestos } from '../features/saidaGol/useGestos'
import { useTimer } from '../hooks/useTimer'
import { useWakeLock } from '../hooks/useWakeLock'
import { useGestosConcluidosStore } from '../stores/gestosConcluidosStore'
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
  /** Posições (na lista do treino) marcadas como concluídas */
  const [concluidos, setConcluidos] = useState<number[]>([])
  const [fim, setFim] = useState<(ResultadoRecompensa & { xp: number }) | null>(null)
  useWakeLock(indice !== null && !fim)
  const feitos = concluidos.length

  function alternarConcluido(i: number) {
    if (concluidos.includes(i)) return setConcluidos(concluidos.filter((c) => c !== i))
    setConcluidos([...concluidos, i])
    useGestosConcluidosStore.getState().marcar(itens[i].gesto)
    sons.concluido()
  }

  function terminar() {
    sons.concluido()
    const xp = Math.max(XP_POR_GESTO, feitos * XP_POR_GESTO)
    setFim({ ...entregarRecompensa(xp, feitos > 0 ? MOEDAS : 0, 'goleiro'), xp })
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
        {feitos > 0 && (
          <div className="flex flex-col gap-1">
            <p className="font-extrabold">
              ✅ {feitos} de {itens.length} concluídos
            </p>
            <ProgressBar valor={feitos} maximo={itens.length} rotulo="Fundamentos concluídos" cor="bg-green-500" />
          </div>
        )}
        <ol className="flex flex-col gap-2">
          {itens.map((it, i) => {
            const feito = concluidos.includes(i)
            return (
              <li key={it.gesto}>
                <button
                  type="button"
                  onClick={() => {
                    destravarSom()
                    setIndice(i)
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border-4 p-2 text-left shadow-sm ${feito ? 'border-green-400 bg-green-50' : 'border-transparent bg-white'}`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full font-black text-white ${feito ? 'bg-green-500' : 'bg-sky-600'}`}>{feito ? '✓' : i + 1}</span>
                  <span className="shrink-0 rounded-xl bg-green-50">
                    <DesenhoGesto desenho={it.g.desenho} nome={it.g.nome} tamanho={52} />
                  </span>
                  <span className="flex flex-1 flex-col leading-tight">
                    <span className="text-lg font-extrabold">{it.g.nome}</span>
                    <span className="text-sm font-bold">{feito ? '✅ Concluída' : descrever(it)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        {feitos === 0 && <p className="rounded-2xl bg-orange-50 p-3 text-base">🔥 Faça o aquecimento antes!</p>}
        <button
          type="button"
          disabled={itens.length === 0}
          onClick={() => {
            destravarSom()
            // Continua do primeiro que falta
            const falta = itens.findIndex((_, i) => !concluidos.includes(i))
            setIndice(falta === -1 ? 0 : falta)
          }}
          className="min-h-18 rounded-3xl bg-sol text-2xl font-extrabold shadow-lg disabled:opacity-40"
        >
          {feitos === 0 ? 'Começar 🧤' : 'Continuar 🧤'}
        </button>
        {feitos > 0 && (
          <button type="button" onClick={terminar} className="min-h-14 rounded-3xl border-4 border-green-400 bg-white text-xl font-extrabold">
            Terminar o treino 🏁
          </button>
        )}
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
          <ProgressBar valor={feitos} maximo={itens.length} rotulo="Fundamentos concluídos no treino" cor="bg-green-500" />
        </div>
      </header>
      <PassoGesto
        key={`${indice}-${atual.gesto}`}
        item={atual}
        gesto={atual.g}
        concluida={concluidos.includes(indice)}
        aoConcluir={() => alternarConcluido(indice)}
        aoAnterior={indice > 0 ? () => setIndice(indice - 1) : undefined}
        aoLista={() => setIndice(null)}
        aoProximo={indice < itens.length - 1 ? () => setIndice(indice + 1) : terminar}
        ultimo={indice === itens.length - 1}
      />
    </section>
  )
}

interface PropsPasso {
  item: ItemTreinoFundamentos
  gesto: Gesto
  concluida: boolean
  aoConcluir: () => void
  aoAnterior?: () => void
  aoLista: () => void
  aoProximo: () => void
  ultimo: boolean
}

function PassoGesto({ item, gesto, concluida, aoConcluir, aoAnterior, aoLista, aoProximo, ultimo }: PropsPasso) {
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
      {porTempo && !concluida && !acabou && (
        <button
          type="button"
          disabled={rodando}
          onClick={() => setRodando(true)}
          className="min-h-16 w-full rounded-3xl bg-sky-600 text-xl font-extrabold text-white shadow-lg disabled:bg-sky-400"
        >
          {rodando ? 'Aguenta firme… 💪' : `▶️ Começar ${item.quantidade} s`}
        </button>
      )}
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

      {/* Por tempo: só dá para marcar depois do cronômetro (desmarcar pode sempre) */}
      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] w-full">
        <BarraAula
          aoAnterior={aoAnterior}
          aoLista={aoLista}
          concluida={concluida}
          podeConcluir={concluida || !porTempo || acabou}
          aoConcluir={aoConcluir}
          aoProximo={aoProximo}
          rotuloProximo={ultimo ? { emoji: '🏁', texto: 'Terminar' } : undefined}
        />
      </div>
    </div>
  )
}
