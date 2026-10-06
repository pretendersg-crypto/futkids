// Bolinha, o mascote do FutKids: uma bola com rosto que guia, torce e comemora com a criança.
// Desenhado em SVG (leve, sem baixar nada). O humor muda rosto, braços e o jeito de se mexer.
import type { ReactNode } from 'react'
import './mascote.css'

export type Humor = 'feliz' | 'torcendo' | 'comemorando' | 'pensando'

interface Props {
  humor?: Humor
  /** Fala no balão ao lado (sem fala, só o mascote) */
  fala?: ReactNode
  tamanho?: number
  /** Balão à direita (padrão) ou embaixo do mascote */
  balao?: 'lado' | 'baixo'
}

const ESCURO = '#14532D'

function Corpo({ humor }: { humor: Humor }) {
  const bracosParaCima = humor === 'torcendo' || humor === 'comemorando'
  return (
    <svg viewBox="0 0 120 130" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id="mascote-bola">
          <circle cx="60" cy="58" r="40" />
        </clipPath>
      </defs>

      {/* Braços (atrás do corpo) */}
      <g className={bracosParaCima ? 'mascote-bracos-cima' : ''} stroke={ESCURO} strokeWidth="6" strokeLinecap="round">
        {bracosParaCima ? (
          <>
            <line x1="26" y1="54" x2="8" y2="28" />
            <line x1="94" y1="54" x2="112" y2="28" />
          </>
        ) : humor === 'pensando' ? (
          <>
            <line x1="24" y1="66" x2="10" y2="84" />
            <path d="M94 66 Q110 76 82 84" fill="none" />
          </>
        ) : (
          <>
            <line x1="24" y1="66" x2="8" y2="80" />
            <line x1="96" y1="66" x2="112" y2="80" />
          </>
        )}
      </g>

      {/* Pernas e tênis */}
      <g stroke={ESCURO} strokeWidth="6" strokeLinecap="round">
        <line x1="48" y1="94" x2="45" y2="112" />
        <line x1="72" y1="94" x2="75" y2="112" />
      </g>
      <ellipse cx="41" cy="116" rx="11" ry="6" fill="#F97316" stroke={ESCURO} strokeWidth="3" />
      <ellipse cx="79" cy="116" rx="11" ry="6" fill="#F97316" stroke={ESCURO} strokeWidth="3" />

      {/* Bola: branca com gomos verdes nas bordas, deixando o rosto livre */}
      <circle cx="60" cy="58" r="40" fill="#FFFFFF" />
      <g clipPath="url(#mascote-bola)" fill="#16A34A">
        <polygon points="60,10 72,18 68,30 52,30 48,18" />
        <polygon points="16,46 28,40 34,52 26,64 14,60" />
        <polygon points="104,46 92,40 86,52 94,64 106,60" />
        <polygon points="40,92 50,86 60,92 56,104 44,104" />
        <polygon points="80,92 70,86 60,92 64,104 76,104" />
      </g>
      <circle cx="60" cy="58" r="40" fill="none" stroke={ESCURO} strokeWidth="4" />

      {/* Rosto */}
      <circle cx="44" cy="70" r="5" fill="#F87171" opacity="0.4" />
      <circle cx="76" cy="70" r="5" fill="#F87171" opacity="0.4" />
      {humor === 'comemorando' ? (
        // Olhos fechadinhos de alegria
        <g stroke={ESCURO} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M42 58 Q48 52 54 58" />
          <path d="M66 58 Q72 52 78 58" />
        </g>
      ) : (
        <g>
          <ellipse cx="48" cy="57" rx="7" ry="8" fill="#FFFFFF" stroke={ESCURO} strokeWidth="3" />
          <ellipse cx="72" cy="57" rx="7" ry="8" fill="#FFFFFF" stroke={ESCURO} strokeWidth="3" />
          {/* Pensando: olha para cima */}
          <circle cx={humor === 'pensando' ? 50 : 49} cy={humor === 'pensando' ? 53 : 58} r="4" fill={ESCURO} />
          <circle cx={humor === 'pensando' ? 74 : 73} cy={humor === 'pensando' ? 53 : 58} r="4" fill={ESCURO} />
        </g>
      )}
      {humor === 'torcendo' || humor === 'comemorando' ? (
        <g>
          <path d="M48 72 Q60 90 72 72 Z" fill="#7F1D1D" stroke={ESCURO} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="60" cy="81" rx="6" ry="3" fill="#F87171" />
        </g>
      ) : humor === 'pensando' ? (
        <path d="M52 76 Q58 73 66 77" fill="none" stroke={ESCURO} strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M48 72 Q60 84 72 72" fill="none" stroke={ESCURO} strokeWidth="4" strokeLinecap="round" />
      )}

      {/* Estrelinhas na comemoração */}
      {humor === 'comemorando' && (
        <g className="mascote-estrelas" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5">
          <polygon points="12,8 15,15 22,15 16,19 18,26 12,22 6,26 8,19 2,15 9,15" />
          <polygon points="108,4 111,11 118,11 112,15 114,22 108,18 102,22 104,15 98,11 105,11" />
        </g>
      )}
    </svg>
  )
}

export function Mascote({ humor = 'feliz', fala, tamanho = 96, balao = 'lado' }: Props) {
  return (
    <div className={`flex items-center gap-2 ${balao === 'baixo' ? 'flex-col' : ''}`}>
      <div className={`mascote mascote--${humor} shrink-0`} style={{ width: tamanho, height: tamanho * (130 / 120) }}>
        <Corpo humor={humor} />
      </div>
      {fala && (
        <p
          className={`balao-fala relative rounded-3xl border-4 border-green-300 bg-white px-4 py-2 text-lg leading-snug font-bold shadow-sm ${
            balao === 'baixo' ? 'balao-fala--cima text-center' : 'balao-fala--esquerda'
          }`}
        >
          {fala}
        </p>
      )}
    </div>
  )
}
