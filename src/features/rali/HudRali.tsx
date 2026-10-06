// Placar dos desafios: tempo, pontos e combo com multiplicador.
import { multiplicador } from './pontuacao'

interface Props {
  segundos: number
  pontos: number
  combo: number
}

export function HudRali({ segundos, pontos, combo }: Props) {
  const mult = multiplicador(combo)
  return (
    <div className="grid grid-cols-3 gap-2 text-center" aria-live="off">
      <p className="rounded-2xl bg-white py-1 shadow-sm">
        <span className="block text-xs font-bold">⏱️ Tempo</span>
        <span className="text-2xl font-black">{Math.ceil(segundos)}</span>
      </p>
      <p className="rounded-2xl bg-white py-1 shadow-sm">
        <span className="block text-xs font-bold">⭐ Pontos</span>
        <span key={pontos} className="pop inline-block text-2xl font-black">
          {pontos}
        </span>
      </p>
      <p className={`rounded-2xl py-1 shadow-sm ${mult > 1 ? 'bg-fogo text-white' : 'bg-white'}`}>
        <span className="block text-xs font-bold">🔥 Combo</span>
        <span className="text-2xl font-black">
          {combo}
          {mult > 1 && <span className="ml-1 text-base">x{mult}</span>}
        </span>
      </p>
    </div>
  )
}
