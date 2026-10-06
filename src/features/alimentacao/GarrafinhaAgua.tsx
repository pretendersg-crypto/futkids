// Garrafinha do treino: a criança marca quando bebeu água antes, no intervalo e depois do treino.
// Completou os 3? Ganha prêmio (uma vez por dia) e conta para a figurinha "Hidratado".
import { useState } from 'react'
import { Mascote } from '../../components/mascote/Mascote'
import { MOMENTOS_AGUA } from '../../data/alimentacao'
import { useAlimentacaoStore } from '../../stores/alimentacaoStore'
import { entregarRecompensa, useProgressStore } from '../../stores/progressStore'
import { hojeISO } from '../../utils/data'
import { destravarSom, sons } from '../../utils/som'

const PREMIO = { xp: 10, moedas: 2 }
/** Lista vazia FIXA: o seletor do store não pode devolver um [] novo a cada leitura (o React entra em loop) */
const NENHUM: never[] = []

export function GarrafinhaAgua() {
  const marcados = useAlimentacaoStore((s) => s.agua[hojeISO()] ?? NENHUM)
  const [ganhou, setGanhou] = useState(false)
  const cheia = marcados.length / MOMENTOS_AGUA.length

  function marcar(id: (typeof MOMENTOS_AGUA)[number]['id']) {
    destravarSom()
    const completou = useAlimentacaoStore.getState().marcarAgua(id)
    sons.toque(marcados.length + 1)
    if (completou) {
      useProgressStore.getState().somarContador('agua-dias', 1)
      entregarRecompensa(PREMIO.xp, PREMIO.moedas)
      sons.vitoria()
      setGanhou(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-extrabold">💧 Garrafinha do treino</h1>
      <Mascote
        humor={cheia === 1 ? 'comemorando' : 'feliz'}
        fala={cheia === 1 ? 'Garrafinha completa! Corpo hidratado! 💧' : 'Beba água antes, no intervalo e depois do treino!'}
        tamanho={72}
      />

      {/* Garrafa que enche conforme a criança marca */}
      <svg viewBox="0 0 80 140" className="h-44" role="img" aria-label={`Garrafinha ${Math.round(cheia * 100)}% cheia`}>
        <defs>
          <clipPath id="garrafa">
            <path d="M28 10 H52 V24 Q66 32 66 48 V128 Q66 136 58 136 H22 Q14 136 14 128 V48 Q14 32 28 24 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#garrafa)">
          <rect x="0" y="0" width="80" height="140" fill="#E0F2FE" />
          <rect x="0" y={136 - 112 * cheia} width="80" height={112 * cheia} fill="#38BDF8" className="transition-all duration-500" />
        </g>
        <path d="M28 10 H52 V24 Q66 32 66 48 V128 Q66 136 58 136 H22 Q14 136 14 128 V48 Q14 32 28 24 Z" fill="none" stroke="#0369A1" strokeWidth="4" />
        <rect x="26" y="2" width="28" height="10" rx="3" fill="#0369A1" />
      </svg>

      <ul className="grid w-full grid-cols-3 gap-2">
        {MOMENTOS_AGUA.map((m) => {
          const feito = marcados.includes(m.id)
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-pressed={feito}
                onClick={() => marcar(m.id)}
                className={`flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border-4 p-1 text-sm leading-tight font-bold ${
                  feito ? 'border-sky-600 bg-sky-100' : 'border-sky-200 bg-white'
                }`}
              >
                <span aria-hidden className="text-3xl">
                  {feito ? '✅' : m.emoji}
                </span>
                {m.nome}
              </button>
            </li>
          )
        })}
      </ul>
      {ganhou && (
        <p role="status" className="pop rounded-3xl border-4 border-yellow-400 bg-yellow-100 px-6 py-3 text-xl font-extrabold">
          ⭐ +{PREMIO.xp} XP 🪙 +{PREMIO.moedas}
        </p>
      )}
      <p className="text-sm">A garrafinha esvazia sozinha amanhã. Toque de novo para desmarcar.</p>
    </div>
  )
}
