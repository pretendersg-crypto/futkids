// Missões que renovam sozinhas: a do dia (fazer os treinos sugeridos de hoje) e a da semana
// (treinar em META_SEMANAL dias diferentes). O prêmio é pego com um toque, uma vez só.
import { useState } from 'react'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAgendaStore } from '../../stores/agendaStore'
import { useProgressStore } from '../../stores/progressStore'
import { hojeISO } from '../../utils/data'
import {
  diasDaSemana,
  diasDeAlongamentoNaSemana,
  diasTreinadosNaSemana,
  META_ALONGAMENTO,
  META_SEMANAL,
  PREMIO_MISSAO_ALONGAMENTO,
  PREMIO_MISSAO_DIA,
  PREMIO_MISSAO_SEMANA,
  treinosDoDia,
} from './semana'

interface Missao {
  chave: string
  emoji: string
  titulo: string
  feito: number
  meta: number
  premio: { xp: number; moedas: number }
}

export function Missoes() {
  const atividadesPorDia = useProgressStore((s) => s.atividadesPorDia)
  const diasTreinados = useProgressStore((s) => s.diasTreinados)
  const resgatadas = useAgendaStore((s) => s.missoesResgatadas)
  const [ganhou, setGanhou] = useState<string | null>(null)

  const hoje = hojeISO()
  const treinos = treinosDoDia(hoje, atividadesPorDia)
  const missoes: Missao[] = [
    ...(treinos.length
      ? [{ chave: `dia:${hoje}`, emoji: '☀️', titulo: 'Missão do dia: os treinos de hoje', feito: treinos.filter((t) => t.feito).length, meta: treinos.length, premio: PREMIO_MISSAO_DIA }]
      : []),
    {
      chave: `semana:${diasDaSemana(hoje)[0]}`,
      emoji: '📆',
      titulo: `Missão da semana: treinar ${META_SEMANAL} dias`,
      feito: Math.min(META_SEMANAL, diasTreinadosNaSemana(diasTreinados, hoje)),
      meta: META_SEMANAL,
      premio: PREMIO_MISSAO_SEMANA,
    },
    {
      chave: `alongamento:${diasDaSemana(hoje)[0]}`,
      emoji: '🧘',
      titulo: `Missão da semana: alongar ${META_ALONGAMENTO} vezes`,
      feito: Math.min(META_ALONGAMENTO, diasDeAlongamentoNaSemana(atividadesPorDia, hoje)),
      meta: META_ALONGAMENTO,
      premio: PREMIO_MISSAO_ALONGAMENTO,
    },
  ]

  function resgatar(m: Missao) {
    if (!useAgendaStore.getState().resgatarMissao(m.chave)) return
    const progresso = useProgressStore.getState()
    progresso.ganharXP(m.premio.xp)
    progresso.ganharMoedas(m.premio.moedas)
    setGanhou(m.chave)
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold">🎯 Missões</h2>
      {missoes.map((m) => {
        const completa = m.feito >= m.meta
        const pega = resgatadas.includes(m.chave)
        return (
          <div key={m.chave} className="flex flex-col gap-2 rounded-2xl border-4 border-violet-200 bg-white p-3">
            <p className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden className="text-2xl">
                {m.emoji}
              </span>
              <span className="flex-1">{m.titulo}</span>
              <span className="text-base">
                {m.feito}/{m.meta}
              </span>
            </p>
            <ProgressBar valor={m.feito} maximo={m.meta} rotulo={m.titulo} cor="bg-violet-500" />
            {pega ? (
              <p className="text-center font-bold">{ganhou === m.chave ? `🎉 +${m.premio.xp} XP e 🪙 +${m.premio.moedas}!` : '✅ Prêmio pego'}</p>
            ) : (
              <button
                type="button"
                disabled={!completa}
                onClick={() => resgatar(m)}
                className="min-h-12 rounded-2xl bg-sol text-lg font-extrabold shadow disabled:bg-violet-50 disabled:font-bold disabled:shadow-none"
              >
                {completa ? `Pegar prêmio 🎁 (+${m.premio.xp} XP)` : `Prêmio: ⭐ ${m.premio.xp} XP e 🪙 ${m.premio.moedas}`}
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
