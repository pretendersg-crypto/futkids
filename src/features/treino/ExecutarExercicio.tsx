// Exercício em andamento.
//  - Por tempo: timer circular.
//  - Por repetições: o app conta sozinho no ritmo do bonequinho (com bip), assim a criança não
//    precisa tocar na tela enquanto se exercita.
//  - Intervalos ("rápido e devagar"): rodadas de parte rápida + parte devagar, com bip na troca e o
//    bonequinho acelerando/desacelerando junto. É a versão infantil do "30 s forte × 30 s fraco".
import { useEffect, useRef, useState } from 'react'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { TimerCircular } from '../../components/ui/TimerCircular'
import type { Exercicio } from '../../data/catalogo'
import { useTimer } from '../../hooks/useTimer'
import { useWakeLock } from '../../hooks/useWakeLock'
import { sons } from '../../utils/som'
import { BonecoAnimado } from './BonecoAnimado'
import { duracaoDoExercicio } from './recompensa'

interface Props {
  exercicio: Exercicio
  aoConcluir: () => void
  aoPular: () => void
}

/** Na parte devagar dos intervalos, o bonequinho anda bem mais devagar */
const FATOR_DEVAGAR = 2.4

export function ExecutarExercicio({ exercicio, aoConcluir, aoPular }: Props) {
  const [pausado, setPausado] = useState(false)
  const { tipo, meta, ritmoMs, intervalo } = exercicio
  const duracaoMs = duracaoDoExercicio(exercicio)

  const { decorridoMs, restanteMs } = useTimer(duracaoMs, !pausado, () => {
    sons.concluido()
    aoConcluir()
  })
  useWakeLock(!pausado)

  const repeticoes = Math.min(meta, Math.floor(decorridoMs / ritmoMs))
  const segundosRestantes = Math.ceil(restanteMs / 1000)

  // Intervalos: em que rodada e em que parte (rápida/devagar) estamos
  const ciclo = intervalo ? (intervalo.forteS + intervalo.fracoS) * 1000 : 1
  const rodada = Math.min(meta, Math.floor(decorridoMs / ciclo) + 1)
  const noCiclo = decorridoMs % ciclo
  const rapido = !intervalo || noCiclo < intervalo.forteS * 1000
  const fimDaParte = intervalo ? (rapido ? intervalo.forteS * 1000 : ciclo) : 0
  const restanteParte = intervalo ? Math.max(0, fimDaParte - noCiclo) : 0
  const totalParte = intervalo ? (rapido ? intervalo.forteS : intervalo.fracoS) * 1000 : 1

  // Bips: a cada repetição; nos 3 últimos segundos do exercício por tempo; e na troca rápido/devagar
  useEffect(() => {
    if (tipo === 'repeticoes' && repeticoes > 0 && repeticoes < meta) sons.repeticao()
  }, [tipo, repeticoes, meta])
  useEffect(() => {
    if (tipo === 'tempo' && segundosRestantes > 0 && segundosRestantes <= 3) sons.contagem()
  }, [tipo, segundosRestantes])
  // Só apita quando a parte muda de verdade. A primeira parte rápida já começou com o "Vai!" da
  // contagem, por isso o ref já nasce com ela (e o StrictMode, que roda o efeito 2x, não duplica).
  const ultimaParte = useRef('1-true')
  useEffect(() => {
    const parte = `${rodada}-${rapido}`
    if (tipo !== 'intervalos' || parte === ultimaParte.current) return
    ultimaParte.current = parte
    if (rapido) sons.largada()
    else sons.contagem()
  }, [tipo, rapido, rodada])

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-3xl font-extrabold">
        <span aria-hidden>{exercicio.emoji} </span>
        {exercicio.nome}
      </h2>

      {tipo === 'intervalos' && (
        <p
          key={`${rodada}-${rapido}`}
          aria-live="assertive"
          className={`pop rounded-3xl px-6 py-2 text-3xl font-black ${rapido ? 'bg-orange-700 text-white' : 'bg-sky-100'}`}
        >
          {rapido ? 'RÁPIDO! 🔥' : 'Devagar 🐢'}
        </p>
      )}

      <BonecoAnimado
        animacao={exercicio.animacao}
        ritmoMs={rapido ? ritmoMs : ritmoMs * FATOR_DEVAGAR}
        tamanho={tipo === 'intervalos' ? 120 : 150}
        pausado={pausado}
      />

      {tipo === 'repeticoes' && (
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-2xl font-bold" aria-live="polite">
            <span key={repeticoes} className="pop inline-block text-7xl font-black text-orange-600">
              {repeticoes}
            </span>{' '}
            / {meta}
          </p>
          <ProgressBar valor={repeticoes} maximo={meta} rotulo="Repetições feitas" cor="bg-fogo" />
        </div>
      )}
      {tipo === 'tempo' && <TimerCircular restanteMs={restanteMs} totalMs={duracaoMs} tamanho={170} />}
      {tipo === 'intervalos' && (
        <>
          <TimerCircular restanteMs={restanteParte} totalMs={totalParte} tamanho={150} />
          <p className="text-lg font-bold">
            Rodada {rodada} de {meta}
          </p>
        </>
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
