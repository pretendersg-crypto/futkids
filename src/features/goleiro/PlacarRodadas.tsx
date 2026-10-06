// Placar da partida: uma bolinha por chute (✓ defendeu, ✗ gol, contorno = chute atual).
import { RODADAS } from './niveis'

interface Props {
  historico: boolean[]
  /** Nome do ponto (singular, plural) e emoji; padrão: defesa */
  rotulo?: { singular: string; plural: string; emoji: string }
}

const DEFESA = { singular: 'defesa', plural: 'defesas', emoji: '🧤' }

export function PlacarRodadas({ historico, rotulo = DEFESA }: Props) {
  const defesas = historico.filter(Boolean).length
  return (
    <div className="flex flex-col items-center gap-1">
      <ol aria-label={`${defesas} ${defesas === 1 ? rotulo.singular : rotulo.plural} em ${historico.length} rodadas`} className="flex gap-1">
        {Array.from({ length: RODADAS }, (_, i) => {
          const r = historico[i]
          return (
            <li
              key={i}
              aria-hidden
              className={`grid size-6 place-items-center rounded-full border-2 text-xs font-black ${
                r === true
                  ? 'border-campo bg-campo text-white'
                  : r === false
                    ? 'border-red-300 bg-red-100 text-red-700'
                    : i === historico.length
                      ? 'border-campo-escuro bg-white'
                      : 'border-green-200 bg-white/60'
              }`}
            >
              {r === true ? '✓' : r === false ? '✗' : ''}
            </li>
          )
        })}
      </ol>
      <p className="text-lg font-extrabold">
        {rotulo.emoji} {defesas} {defesas === 1 ? rotulo.singular : rotulo.plural}
      </p>
    </div>
  )
}
