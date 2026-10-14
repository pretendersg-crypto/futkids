// Editor: pôr e tirar jogadores, mudar o número e dar a bola. A quadra (arrastar) fica fora,
// em quem usa este controle.
import { azul, verm } from '../puzzles/ajuda'
import type { Jogador, Time } from '../tipos'
import { idDeJogador, nomeDoJogador, proximoNumero } from './novos'

interface Props {
  jogadores: Jogador[]
  bola: string | null
  selecionado: string | null
  aoMudar: (jogadores: Jogador[], bola: string | null) => void
  aoSelecionar: (id: string | null) => void
  /** Sem bola é permitido (prancheta) */
  semBola?: boolean
}

/** No máximo 5 de cada lado (4 na linha + goleiro), como no futsal */
const MAX_POR_TIME = 5
const BOTAO = 'min-h-10 rounded-xl border-2 px-2 text-sm font-bold disabled:opacity-40'

export function ControlesJogadores({ jogadores, bola, selecionado, aoMudar, aoSelecionar, semBola }: Props) {
  const quem = jogadores.find((j) => j.id === selecionado)
  const doTime = (t: Time) => jogadores.filter((j) => j.time === t)
  const temGoleiro = (t: Time) => doTime(t).some((j) => j.goleiro)

  function incluir(time: Time, goleiro = false) {
    const numero = goleiro ? 1 : proximoNumero(jogadores, time)
    const id = idDeJogador(jogadores, time, numero)
    const x = goleiro ? (time === 'A' ? 0.03 : 0.97) : time === 'A' ? 0.4 : 0.6
    const y = goleiro ? 0.5 : 0.2 + Math.random() * 0.6
    const novo = { ...(time === 'A' ? azul(numero, x, y, goleiro) : verm(numero, x, y, goleiro)), id }
    aoMudar([...jogadores, novo], bola)
    aoSelecionar(id)
  }

  function tirar(id: string) {
    const resto = jogadores.filter((j) => j.id !== id)
    // A bola vai para outro jogador azul (ou fica sem bola, se puder)
    const novaBola = bola === id ? (semBola ? null : (resto.find((j) => j.time === 'A')?.id ?? resto[0]?.id ?? null)) : bola
    aoMudar(resto, novaBola)
    aoSelecionar(null)
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={doTime('A').length >= MAX_POR_TIME} onClick={() => incluir('A')} className={`${BOTAO} border-blue-300 bg-blue-50`}>
          + 🔵 Azul
        </button>
        <button type="button" disabled={doTime('B').length >= MAX_POR_TIME} onClick={() => incluir('B')} className={`${BOTAO} border-red-300 bg-red-50`}>
          + 🔴 Vermelho
        </button>
        {!temGoleiro('A') && (
          <button type="button" disabled={doTime('A').length >= MAX_POR_TIME} onClick={() => incluir('A', true)} className={`${BOTAO} border-green-300 bg-green-50`}>
            + 🧤 Goleiro azul
          </button>
        )}
        {!temGoleiro('B') && (
          <button type="button" disabled={doTime('B').length >= MAX_POR_TIME} onClick={() => incluir('B', true)} className={`${BOTAO} border-violet-300 bg-violet-50`}>
            + 🧤 Goleiro vermelho
          </button>
        )}
      </div>
      {quem ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2">
          <b>{nomeDoJogador(quem)}</b>
          <label className="flex items-center gap-1">
            nº
            <input
              type="number"
              min={1}
              max={99}
              value={quem.numero}
              onChange={(e) => {
                const numero = Math.max(1, Math.min(99, Number(e.target.value) || 1))
                aoMudar(
                  jogadores.map((j) => (j.id === quem.id ? { ...j, numero } : j)),
                  bola,
                )
              }}
              className="w-14 rounded-lg border-2 border-slate-300 px-1"
            />
          </label>
          <button type="button" disabled={bola === quem.id} onClick={() => aoMudar(jogadores, quem.id)} className={`${BOTAO} border-amber-300 bg-amber-50`}>
            ⚽ {bola === quem.id ? 'Está com a bola' : 'Dar a bola'}
          </button>
          <button type="button" disabled={jogadores.length <= 2} onClick={() => tirar(quem.id)} className={`${BOTAO} border-red-200 bg-white text-red-700`}>
            🗑️ Tirar
          </button>
          <button type="button" onClick={() => aoSelecionar(null)} className="ml-auto text-xs underline">
            fechar
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-600">Arraste os jogadores para o lugar. Toque num jogador para mudar o número, dar a bola ou tirar.</p>
      )}
    </div>
  )
}
