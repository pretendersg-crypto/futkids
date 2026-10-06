// Fim de um desafio do Rali: mascote, pontos, números da partida, recorde e recompensa.
import { useState } from 'react'
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { PainelRecompensa } from '../../components/ui/PainelRecompensa'
import { FALAS_FIM, sortearFala } from '../../data/mascote'
import type { ResultadoRali } from './pontuacao'

interface Props {
  resultado: ResultadoRali
  /** Linhas extras, ex.: "🔥 Maior combo: 12" */
  detalhes: string[]
  aoJogarDeNovo: () => void
}

export function FimRali({ resultado, detalhes, aoJogarDeNovo }: Props) {
  const { pontos, xp, moedas, recordeAnterior, novoRecorde } = resultado
  // Sorteada uma vez (não troca a cada renderização)
  const [fala] = useState(() => sortearFala(novoRecorde ? FALAS_FIM.otimo : pontos >= 10 ? FALAS_FIM.bom : FALAS_FIM.esforco))

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <Mascote humor={novoRecorde ? 'comemorando' : 'torcendo'} fala={fala} tamanho={80} />
      <h1 className="text-3xl font-extrabold">{pontos} pontos!</h1>
      <ul className="flex flex-col gap-1 text-lg">
        {detalhes.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      {novoRecorde ? (
        <p className="pop rounded-3xl bg-green-700 px-5 py-2 text-xl font-extrabold text-white">🏅 Novo recorde!</p>
      ) : (
        recordeAnterior !== undefined && <p className="text-lg">Seu recorde: {recordeAnterior} pontos. Bora bater! 🔥</p>
      )}

      <PainelRecompensa xp={xp} moedas={moedas} resultadoXP={resultado.resultadoXP} bonusSequencia={resultado.bonusSequencia} />

      <div className="grid w-full grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={aoJogarDeNovo}
          className="min-h-16 rounded-3xl border-4 border-lime-400 bg-white text-xl font-extrabold"
        >
          De novo 🔁
        </button>
        <Link to="/rali" className="grid min-h-16 place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
          Rali ⚽
        </Link>
      </div>
    </div>
  )
}
