// Fim de um drill de reação: números da vez, recorde de reação (modo toque) e recompensa.
import { useState } from 'react'
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { PainelRecompensa } from '../../components/ui/PainelRecompensa'
import { FALAS_FIM, sortearFala } from '../../data/mascote'
import { formatarDuracao, formatarMs, type ResultadoDrill } from './finalizar'

interface Props {
  resultado: ResultadoDrill
  aoRepetir: () => void
}

export function FimDrill({ resultado, aoRepetir }: Props) {
  const { sessao, novoRecorde, recordeAnteriorMs } = resultado
  const acerto = sessao.acertos !== undefined ? Math.round((sessao.acertos / sessao.sinais) * 100) : undefined
  const [fala] = useState(() =>
    sortearFala(novoRecorde ? FALAS_FIM.otimo : sessao.completo && (acerto ?? 100) >= 70 ? FALAS_FIM.bom : FALAS_FIM.esforco),
  )

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <Mascote humor={novoRecorde || sessao.completo ? 'comemorando' : 'torcendo'} fala={fala} tamanho={80} />
      <h1 className="text-3xl font-extrabold">{sessao.completo ? 'Drill completo!' : 'Treino salvo!'}</h1>

      <ul className="grid w-full grid-cols-2 gap-2 text-lg">
        <Numero rotulo="Sinais" valor={String(sessao.sinais)} emoji="🚦" />
        <Numero rotulo="Séries" valor={`${sessao.seriesFeitas}/${sessao.seriesTotal}`} emoji="🔁" />
        <Numero rotulo="Tempo" valor={formatarDuracao(sessao.duracaoS)} emoji="⏱️" />
        {acerto !== undefined && <Numero rotulo="Acertos" valor={`${acerto}%`} emoji="🎯" />}
        {sessao.mediaMs !== undefined && <Numero rotulo="Reação média" valor={formatarMs(sessao.mediaMs)} emoji="⚡" />}
        {sessao.melhorMs !== undefined && <Numero rotulo="Mais rápida" valor={formatarMs(sessao.melhorMs)} emoji="🚀" />}
      </ul>

      {novoRecorde ? (
        <p className="pop rounded-3xl bg-green-700 px-5 py-2 text-xl font-extrabold text-white">🏅 Reação mais rápida até hoje!</p>
      ) : (
        recordeAnteriorMs !== undefined && <p className="text-lg">Seu recorde: {formatarMs(recordeAnteriorMs)} de média. Bora bater! 🔥</p>
      )}

      <PainelRecompensa xp={resultado.xp} moedas={resultado.moedas} resultadoXP={resultado.resultadoXP} bonusSequencia={resultado.bonusSequencia} />

      <div className="grid w-full grid-cols-2 gap-3 pt-2">
        <button type="button" onClick={aoRepetir} className="min-h-16 rounded-3xl border-4 border-teal-400 bg-white text-xl font-extrabold">
          De novo 🔁
        </button>
        <Link to="/reacao?aba=historico" className="grid min-h-16 place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
          Histórico 📈
        </Link>
      </div>
    </div>
  )
}

function Numero({ rotulo, valor, emoji }: { rotulo: string; valor: string; emoji: string }) {
  return (
    <li className="flex flex-col rounded-2xl border-4 border-teal-200 bg-white p-2">
      <span className="text-2xl font-black">
        <span aria-hidden>{emoji} </span>
        {valor}
      </span>
      <span className="text-sm font-bold">{rotulo}</span>
    </li>
  )
}
