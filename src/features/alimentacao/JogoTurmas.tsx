// Jogo "Qual é a turma?": aparece um alimento e a criança toca na turma dele
// (energia, construtores, protetores ou de vez em quando). 10 rodadas, com explicação a cada erro.
import { useState } from 'react'
import { ALIMENTOS, TURMAS, turmaPorId, type Alimento, type IdTurma } from '../../data/alimentacao'
import { destravarSom, sons } from '../../utils/som'
import { FimJogoComida } from './FimJogoComida'
import { finalizarJogoComida, type ResultadoJogoComida } from './premio'

const RODADAS = 10

function sortearAlimentos(): Alimento[] {
  // Embaralha e pega 10 sem repetir, garantindo pelo menos um de cada turma
  const embaralhados = [...ALIMENTOS].sort(() => Math.random() - 0.5)
  const umDeCada = TURMAS.map((t) => embaralhados.find((a) => a.turma === t.id)!)
  const resto = embaralhados.filter((a) => !umDeCada.includes(a)).slice(0, RODADAS - umDeCada.length)
  return [...umDeCada, ...resto].sort(() => Math.random() - 0.5)
}

export function JogoTurmas() {
  const [partida, setPartida] = useState(0)
  return <Partida key={partida} aoJogarDeNovo={() => setPartida((p) => p + 1)} />
}

function Partida({ aoJogarDeNovo }: { aoJogarDeNovo: () => void }) {
  const [alimentos] = useState(sortearAlimentos)
  const [indice, setIndice] = useState(0)
  const [escolha, setEscolha] = useState<IdTurma | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [resultado, setResultado] = useState<ResultadoJogoComida | null>(null)

  if (resultado) return <FimJogoComida resultado={resultado} aoJogarDeNovo={aoJogarDeNovo} />

  const alimento = alimentos[indice]
  const certa = turmaPorId(alimento.turma)
  const respondeu = escolha !== null
  const acertou = escolha === alimento.turma

  function escolher(id: IdTurma) {
    if (respondeu) return
    destravarSom()
    setEscolha(id)
    if (id === alimento.turma) {
      setAcertos((a) => a + 1)
      sons.defesa()
    } else sons.gol()
  }

  function proximo() {
    if (indice + 1 >= RODADAS) {
      setResultado(finalizarJogoComida('turmas', acertos, RODADAS, 'turmas-perfeito'))
      return
    }
    setIndice((i) => i + 1)
    setEscolha(null)
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-lg font-bold">
        {indice + 1} de {RODADAS} · ✅ {acertos}
      </p>
      <h1 className="text-2xl font-extrabold">Qual é a turma?</h1>
      <div key={alimento.id} className="pop flex flex-col items-center rounded-3xl border-4 border-rose-200 bg-white px-10 py-4 shadow">
        <span aria-hidden className="text-8xl leading-none">
          {alimento.emoji}
        </span>
        <span className="text-2xl font-extrabold">{alimento.nome}</span>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {TURMAS.map((t) => {
          const eACerta = respondeu && t.id === alimento.turma
          const eAErrada = respondeu && t.id === escolha && !acertou
          return (
            <button
              key={t.id}
              type="button"
              disabled={respondeu}
              onClick={() => escolher(t.id)}
              className={`relative flex min-h-24 flex-col items-center justify-center rounded-3xl border-4 p-2 text-lg leading-tight font-extrabold ${t.cor} ${
                respondeu && !eACerta && !eAErrada ? 'opacity-50' : ''
              } ${eACerta ? 'ring-4 ring-green-700' : ''}`}
            >
              <span aria-hidden className="text-3xl">
                {t.emoji}
              </span>
              {t.nome}
              {eACerta && <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-green-700 text-sm text-white">✓</span>}
              {eAErrada && <span className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-red-600 text-sm text-white">✗</span>}
            </button>
          )
        })}
      </div>

      {respondeu && (
        <div className="flex w-full flex-col gap-3" role="status">
          <p className={`rounded-2xl p-3 text-lg font-bold ${acertou ? 'bg-green-100' : 'bg-white'}`}>
            {acertou ? 'Isso! 👏 ' : `${alimento.nome} é da turma ${certa.emoji} ${certa.nome}. `}
            {certa.funcao}.
          </p>
          <button type="button" onClick={proximo} className="min-h-14 rounded-2xl bg-sol text-xl font-extrabold shadow">
            {indice + 1 >= RODADAS ? 'Ver resultado 🏁' : 'Próximo ➡️'}
          </button>
        </div>
      )}
    </div>
  )
}
