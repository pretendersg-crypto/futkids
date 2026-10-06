// Fim de um desafio do Rali: pontos, números da partida, recorde e recompensa.
import { Link } from 'react-router'
import type { ResultadoRali } from './pontuacao'

interface Props {
  resultado: ResultadoRali
  /** Linhas extras, ex.: "🔥 Maior combo: 12" */
  detalhes: string[]
  aoJogarDeNovo: () => void
}

export function FimRali({ resultado, detalhes, aoJogarDeNovo }: Props) {
  const { pontos, xp, moedas, resultadoXP, recordeAnterior, novoRecorde } = resultado
  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <span aria-hidden className="pop text-7xl">
        {novoRecorde ? '🏆' : '⚽'}
      </span>
      <h1 className="text-3xl font-extrabold">{pontos} pontos!</h1>
      <ul className="flex flex-col gap-1 text-lg">
        {detalhes.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      {novoRecorde ? (
        <p className="pop rounded-3xl bg-campo px-5 py-2 text-xl font-extrabold text-white">🏅 Novo recorde!</p>
      ) : (
        recordeAnterior !== undefined && <p className="text-lg">Seu recorde: {recordeAnterior} pontos. Bora bater! 🔥</p>
      )}

      <p className="flex gap-4 rounded-3xl border-4 border-yellow-400 bg-yellow-100 px-6 py-3 text-2xl font-extrabold">
        <span>⭐ +{xp} XP</span>
        <span>🪙 +{moedas}</span>
      </p>
      {resultadoXP.subiuDeNivel && (
        <p className="pop rounded-3xl bg-campo px-6 py-3 text-2xl font-extrabold text-white">🎉 Subiu para o nível {resultadoXP.nivel}!</p>
      )}

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
