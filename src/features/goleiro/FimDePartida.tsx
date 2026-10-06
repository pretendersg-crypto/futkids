// Tela de fim da partida: estrelas, mascote, defesas, recompensa e comparação com o próprio recorde.
import { useState } from 'react'
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { PainelRecompensa } from '../../components/ui/PainelRecompensa'
import { FALAS_FIM, sortearFala } from '../../data/mascote'
import type { ResultadoPartida } from './partida'

interface Props {
  resultado: ResultadoPartida
  aoJogarDeNovo: () => void
  voltarPara: string
  /** "defendeu" (padrão) ou "acertou" (jogo de posição) */
  verbo?: string
}

export function FimDePartida({ resultado, aoJogarDeNovo, voltarPara, verbo = 'defendeu' }: Props) {
  const { defesas, total, estrelas, xp, moedas, recordeAnterior, novoRecorde } = resultado
  // Sorteada uma vez (não troca a cada renderização)
  const [fala] = useState(() => sortearFala(estrelas === 3 || novoRecorde ? FALAS_FIM.otimo : estrelas >= 1 ? FALAS_FIM.bom : FALAS_FIM.esforco))

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <p className="pop text-6xl tracking-widest" aria-label={`${estrelas} de 3 estrelas`}>
        {[1, 2, 3].map((n) => (
          <span key={n} aria-hidden className={n <= estrelas ? '' : 'opacity-25 grayscale'}>
            ⭐
          </span>
        ))}
      </p>
      <Mascote humor={estrelas === 3 ? 'comemorando' : 'torcendo'} fala={fala} tamanho={80} />
      <p className="text-xl">
        Você {verbo} <b>{defesas}</b> de {total}.
      </p>

      {novoRecorde ? (
        <p className="pop rounded-3xl bg-green-700 px-5 py-2 text-xl font-extrabold text-white">🏅 Novo recorde!</p>
      ) : (
        recordeAnterior !== undefined && <p className="text-lg">Seu recorde: {recordeAnterior} de {total}. Bora bater! 🔥</p>
      )}

      <PainelRecompensa xp={xp} moedas={moedas} resultadoXP={resultado.resultadoXP} bonusSequencia={resultado.bonusSequencia} />

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
