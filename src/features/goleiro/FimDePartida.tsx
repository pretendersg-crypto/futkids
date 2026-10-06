// Tela de fim da partida: estrelas, defesas, recompensa e comparação com o próprio recorde.
import { Link } from 'react-router'
import type { ResultadoPartida } from './partida'

interface Props {
  resultado: ResultadoPartida
  aoJogarDeNovo: () => void
  voltarPara: string
  /** "defendeu" (padrão) ou "acertou" (jogo de posição) */
  verbo?: string
}

export function FimDePartida({ resultado, aoJogarDeNovo, voltarPara, verbo = 'defendeu' }: Props) {
  const { defesas, total, estrelas, xp, moedas, resultadoXP, recordeAnterior, novoRecorde } = resultado
  const titulo = estrelas === 3 ? 'Paredão! 🧱' : estrelas === 2 ? 'Muito bem! 👏' : estrelas === 1 ? 'Boa! 💪' : 'Treino é assim mesmo! 💪'

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <p className="pop text-6xl tracking-widest" aria-label={`${estrelas} de 3 estrelas`}>
        {[1, 2, 3].map((n) => (
          <span key={n} aria-hidden className={n <= estrelas ? '' : 'opacity-25 grayscale'}>
            ⭐
          </span>
        ))}
      </p>
      <h1 className="text-3xl font-extrabold">{titulo}</h1>
      <p className="text-xl">
        Você {verbo} <b>{defesas}</b> de {total}.
      </p>

      {novoRecorde ? (
        <p className="pop rounded-3xl bg-campo px-5 py-2 text-xl font-extrabold text-white">🏅 Novo recorde!</p>
      ) : (
        recordeAnterior !== undefined && <p className="text-lg">Seu recorde: {recordeAnterior} de {total}. Bora bater! 🔥</p>
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
          className="min-h-16 rounded-3xl border-4 border-sky-300 bg-white text-xl font-extrabold"
        >
          De novo 🔁
        </button>
        <Link to={voltarPara} className="grid min-h-16 place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
          Goleiro 🧤
        </Link>
      </div>
    </div>
  )
}
