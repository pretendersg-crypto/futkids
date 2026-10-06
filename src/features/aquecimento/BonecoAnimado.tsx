// Bonequinho em SVG que faz o movimento do exercício (animações em boneco.css).
import type { CSSProperties } from 'react'
import type { AnimacaoBoneco } from '../../data/catalogo'
import './boneco.css'

interface Props {
  animacao: AnimacaoBoneco
  /** Duração de um ciclo do movimento, em ms */
  ritmoMs: number
  tamanho?: number
  pausado?: boolean
}

const LINHA = { stroke: '#14532D', strokeWidth: 10, strokeLinecap: 'round' } as const

/** Braço = parte de cima (gira no ombro) + antebraço (gira no cotovelo) */
function Braco({ lado }: { lado: 'e' | 'd' }) {
  return (
    <g className={`b-braco-${lado}`}>
      <line x1="100" y1="64" x2="100" y2="98" {...LINHA} />
      <g className={`b-antebraco-${lado}`}>
        <line x1="100" y1="98" x2="100" y2="128" {...LINHA} />
      </g>
    </g>
  )
}

/** Perna = coxa (gira no quadril) + canela (gira no joelho) */
function Perna({ lado }: { lado: 'e' | 'd' }) {
  return (
    <g className={`b-coxa-${lado}`}>
      <line x1="100" y1="130" x2="100" y2="168" {...LINHA} />
      <g className={`b-canela-${lado}`}>
        <line x1="100" y1="168" x2="100" y2="204" {...LINHA} />
      </g>
    </g>
  )
}

export function BonecoAnimado({ animacao, ritmoMs, tamanho = 180, pausado = false }: Props) {
  return (
    <svg
      // Começa em y=-12: com os braços para cima as mãos chegam a y≈0 e precisam de folga
      viewBox="0 -12 200 232"
      width={tamanho}
      height={tamanho * 1.16}
      className={`boneco boneco--${animacao} ${pausado ? 'pausado' : ''}`}
      style={{ '--duracao': `${ritmoMs}ms` } as CSSProperties}
      aria-hidden
    >
      {/* Sombra no chão */}
      <ellipse cx="100" cy="212" rx="50" ry="6" fill="#14532D" opacity="0.15" />
      <g className="b-corpo">
        <Perna lado="e" />
        <Perna lado="d" />
        <g className="b-tronco">
          <line x1="100" y1="64" x2="100" y2="130" stroke="#16A34A" strokeWidth="16" strokeLinecap="round" />
          <Braco lado="e" />
          <Braco lado="d" />
          <circle cx="100" cy="38" r="20" fill="#FACC15" stroke="#14532D" strokeWidth="4" />
          <circle cx="93" cy="36" r="2.5" fill="#14532D" />
          <circle cx="107" cy="36" r="2.5" fill="#14532D" />
          <path d="M92 45 Q100 51 108 45" fill="none" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
