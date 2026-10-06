// Uma partida de minijogo de goleiro (/goleiro/:jogo/:nivel): tela de início → jogo → resultado.
import { useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { FimDePartida } from '../features/goleiro/FimDePartida'
import { JogoDefesa } from '../features/goleiro/JogoDefesa'
import { JogoPosicionamento } from '../features/goleiro/JogoPosicionamento'
import { JogoReflexo } from '../features/goleiro/JogoReflexo'
import { chaveRecorde, jogoPorId, nivelLiberado, nivelPorId, type NivelGoleiro } from '../features/goleiro/niveis'
import { finalizarPartida, type ResultadoPartida } from '../features/goleiro/partida'
import { useProgressStore } from '../stores/progressStore'
import { nivelPorXP } from '../utils/nivel'
import { destravarSom } from '../utils/som'

const COMPONENTES = { defesa: JogoDefesa, reflexo: JogoReflexo, posicionamento: JogoPosicionamento }

export function JogoGoleiro() {
  const params = useParams()
  const jogo = jogoPorId(params.jogo)
  const nivel = nivelPorId(params.nivel)
  const xp = useProgressStore((s) => s.xp)
  const recordes = useProgressStore((s) => s.recordes)

  // Endereço inválido ou nível ainda bloqueado: volta para o menu do goleiro
  if (!jogo || !nivel || !nivelLiberado(nivel, nivelPorXP(xp).nivel)) return <Navigate to="/goleiro" replace />

  return <Partida key={`${jogo.id}-${nivel.id}`} jogoId={jogo.id} nivel={nivel} recorde={recordes[chaveRecorde(jogo.id, nivel.id)]} />
}

function Partida({ jogoId, nivel, recorde }: { jogoId: keyof typeof COMPONENTES; nivel: NivelGoleiro; recorde: number | undefined }) {
  const jogo = jogoPorId(jogoId)!
  const [estado, setEstado] = useState<'inicio' | 'jogando' | 'fim'>('inicio')
  const [partida, setPartida] = useState(0)
  const [resultado, setResultado] = useState<ResultadoPartida | null>(null)
  const voltar = `/goleiro?nivel=${nivel.id}`

  const comecar = () => {
    destravarSom()
    setResultado(null)
    setPartida((p) => p + 1)
    setEstado('jogando')
  }

  // Estável (useCallback) para não reiniciar os timers do jogo a cada renderização
  const terminar = useCallback(
    (historico: boolean[]) => {
      setResultado(finalizarPartida(jogoId, nivel, historico.filter(Boolean).length, historico.length))
      setEstado('fim')
    },
    [jogoId, nivel],
  )

  if (estado === 'fim' && resultado) {
    return (
      <FimDePartida
        resultado={resultado}
        aoJogarDeNovo={comecar}
        voltarPara={voltar}
        verbo={jogoId === 'posicionamento' ? 'acertou' : 'defendeu'}
      />
    )
  }

  const Jogo = COMPONENTES[jogoId]

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center gap-3">
        <Link to={voltar} aria-label="Sair do jogo" className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow">
          ✖️
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold">
          <span aria-hidden>{jogo.emoji} </span>
          {jogo.nome}
        </h1>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold">
          <span aria-hidden>{nivel.emoji} </span>
          {nivel.nome}
        </span>
      </header>

      {estado === 'inicio' ? (
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          <span aria-hidden className="text-8xl">
            {jogo.emoji}
          </span>
          <ol className="flex w-full flex-col gap-2 text-left text-lg">
            {jogo.comoJogar.map((passo, i) => (
              <li key={passo} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-700 font-black text-white">
                  {i + 1}
                </span>
                {passo}
              </li>
            ))}
          </ol>
          <p className="text-lg">{recorde !== undefined ? `🏅 Seu recorde: ${recorde}/10` : '✨ Primeira vez! Boa sorte!'}</p>
          <button type="button" onClick={comecar} className="min-h-16 w-full rounded-3xl bg-sol text-2xl font-extrabold shadow-lg">
            Jogar! ▶️
          </button>
        </div>
      ) : (
        <Jogo key={partida} nivel={nivel} aoTerminar={terminar} />
      )}
    </div>
  )
}
