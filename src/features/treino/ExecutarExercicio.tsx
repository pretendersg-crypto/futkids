// Exercício em andamento. Por tempo: timer circular. Por repetições: o app conta sozinho no
// ritmo do bonequinho (com bip), assim a criança não precisa tocar na tela enquanto se exercita.
import { useEffect, useState } from 'react'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { TimerCircular } from '../../components/ui/TimerCircular'
import type { Exercicio } from '../../data/catalogo'
import { useTimer } from '../../hooks/useTimer'
import { useWakeLock } from '../../hooks/useWakeLock'
import { sons } from '../../utils/som'
import { BonecoAnimado } from './BonecoAnimado'

interface Props {
  exercicio: Exercicio
  aoConcluir: () => void
  aoPular: () => void
}

export function ExecutarExercicio({ exercicio, aoConcluir, aoPular }: Props) {
  const [pausado, setPausado] = useState(false)
  const porTempo = exercicio.tipo === 'tempo'
  const duracaoMs = porTempo ? exercicio.meta * 1000 : exercicio.meta * exercicio.ritmoMs

  const { decorridoMs, restanteMs } = useTimer(duracaoMs, !pausado, () => {
    sons.concluido()
    aoConcluir()
  })
  useWakeLock(!pausado)

  const repeticoes = Math.min(exercicio.meta, Math.floor(decorridoMs / exercicio.ritmoMs))
  const segundosRestantes = Math.ceil(restanteMs / 1000)

  // Bip a cada repetição; no exercício por tempo, bip nos 3 últimos segundos
  useEffect(() => {
    if (!porTempo && repeticoes > 0 && repeticoes < exercicio.meta) sons.repeticao()
  }, [porTempo, repeticoes, exercicio.meta])
  useEffect(() => {
    if (porTempo && segundosRestantes > 0 && segundosRestantes <= 3) sons.contagem()
  }, [porTempo, segundosRestantes])

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-3xl font-extrabold">
        <span aria-hidden>{exercicio.emoji} </span>
        {exercicio.nome}
      </h2>

      <BonecoAnimado animacao={exercicio.animacao} ritmoMs={exercicio.ritmoMs} tamanho={150} pausado={pausado} />

      {porTempo ? (
        <TimerCircular restanteMs={restanteMs} totalMs={duracaoMs} tamanho={170} />
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-2xl font-bold" aria-live="polite">
            <span key={repeticoes} className="pop inline-block text-7xl font-black text-fogo">
              {repeticoes}
            </span>{' '}
            / {exercicio.meta}
          </p>
          <ProgressBar valor={repeticoes} maximo={exercicio.meta} rotulo="Repetições feitas" cor="bg-fogo" />
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          className="min-h-16 rounded-3xl border-4 border-orange-300 bg-white text-xl font-extrabold"
        >
          {pausado ? 'Continuar ▶️' : 'Pausar ⏸️'}
        </button>
        <button type="button" onClick={aoPular} className="min-h-16 rounded-3xl bg-white text-xl font-bold shadow">
          Pular ⏭️
        </button>
      </div>
    </div>
  )
}
