// Tela de fim dos jogos de alimentação.
import { useState } from 'react'
import { Link } from 'react-router'
import { Mascote } from '../../components/mascote/Mascote'
import { PainelRecompensa } from '../../components/ui/PainelRecompensa'
import { FALAS_FIM, sortearFala } from '../../data/mascote'
import type { ResultadoJogoComida } from './premio'

interface Props {
  resultado: ResultadoJogoComida
  aoJogarDeNovo: () => void
}

export function FimJogoComida({ resultado, aoJogarDeNovo }: Props) {
  const { acertos, total, xp, moedas, recompensa } = resultado
  const perfeito = acertos === total
  const [fala] = useState(() => sortearFala(perfeito ? FALAS_FIM.otimo : acertos >= total / 2 ? FALAS_FIM.bom : FALAS_FIM.esforco))

  return (
    <div className="flex flex-col items-center gap-4 pt-4 text-center">
      <Mascote humor={perfeito ? 'comemorando' : 'torcendo'} fala={fala} tamanho={80} />
      <h1 className="text-3xl font-extrabold">
        {acertos} de {total} certos!
      </h1>
      {recompensa ? (
        <PainelRecompensa xp={xp} moedas={moedas} {...recompensa} />
      ) : (
        <p className="rounded-2xl bg-white p-3 text-lg font-bold">O prêmio deste jogo já saiu hoje. Volte amanhã! Pode jogar de novo para treinar 😉</p>
      )}
      <div className="grid w-full grid-cols-2 gap-3 pt-2">
        <button type="button" onClick={aoJogarDeNovo} className="min-h-16 rounded-3xl border-4 border-rose-300 bg-white text-xl font-extrabold">
          De novo 🔁
        </button>
        <Link to="/alimentacao" className="grid min-h-16 place-items-center rounded-3xl bg-sol text-xl font-extrabold shadow-lg">
          Comida 🍎
        </Link>
      </div>
    </div>
  )
}
