// Quiz "Verdade ou mentira?" sobre comida, água e sono: 8 perguntas sorteadas, com explicação.
import { useState } from 'react'
import { Mascote } from '../../components/mascote/Mascote'
import { QUIZ, type PerguntaQuiz } from '../../data/alimentacao'
import { destravarSom, sons } from '../../utils/som'
import { FimJogoComida } from './FimJogoComida'
import { finalizarJogoComida, type ResultadoJogoComida } from './premio'

const PERGUNTAS = 8

export function QuizComida() {
  const [partida, setPartida] = useState(0)
  return <Partida key={partida} aoJogarDeNovo={() => setPartida((p) => p + 1)} />
}

function Partida({ aoJogarDeNovo }: { aoJogarDeNovo: () => void }) {
  const [perguntas] = useState<PerguntaQuiz[]>(() => [...QUIZ].sort(() => Math.random() - 0.5).slice(0, PERGUNTAS))
  const [indice, setIndice] = useState(0)
  const [resposta, setResposta] = useState<boolean | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [resultado, setResultado] = useState<ResultadoJogoComida | null>(null)

  if (resultado) return <FimJogoComida resultado={resultado} aoJogarDeNovo={aoJogarDeNovo} />

  const p = perguntas[indice]
  const respondeu = resposta !== null
  const acertou = resposta === p.verdade

  function responder(verdade: boolean) {
    if (respondeu) return
    destravarSom()
    setResposta(verdade)
    if (verdade === p.verdade) {
      setAcertos((a) => a + 1)
      sons.defesa()
    } else sons.gol()
  }

  function proxima() {
    if (indice + 1 >= PERGUNTAS) {
      setResultado(finalizarJogoComida('quiz', acertos, PERGUNTAS, 'quiz-comida-perfeito'))
      return
    }
    setIndice((i) => i + 1)
    setResposta(null)
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <p className="text-lg font-bold">
        Pergunta {indice + 1} de {PERGUNTAS} · ✅ {acertos}
      </p>
      <Mascote humor={respondeu ? (acertou ? 'comemorando' : 'pensando') : 'pensando'} fala={`Verdade ou mentira? ${p.pergunta}`} balao="baixo" tamanho={80} />

      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => {
          const escolhida = resposta === v
          return (
            <button
              key={String(v)}
              type="button"
              disabled={respondeu}
              onClick={() => responder(v)}
              className={`flex min-h-24 flex-col items-center justify-center rounded-3xl border-4 text-2xl font-extrabold ${
                v ? 'border-green-500 bg-green-100' : 'border-red-400 bg-red-50'
              } ${respondeu && !escolhida ? 'opacity-50' : ''} ${escolhida ? 'ring-4 ring-campo-escuro' : ''}`}
            >
              <span aria-hidden className="text-4xl">
                {v ? '👍' : '👎'}
              </span>
              {v ? 'Verdade' : 'Mentira'}
            </button>
          )
        })}
      </div>

      {respondeu && (
        <div className="flex flex-col gap-3" role="status">
          <p className={`rounded-2xl p-3 text-lg font-bold ${acertou ? 'bg-green-100' : 'bg-white'}`}>
            {acertou ? '✅ Acertou! ' : '❌ Quase! '}
            {p.explicacao}
          </p>
          <button type="button" onClick={proxima} className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow">
            {indice + 1 >= PERGUNTAS ? 'Ver resultado 🏁' : 'Próxima ➡️'}
          </button>
        </div>
      )}
    </div>
  )
}
