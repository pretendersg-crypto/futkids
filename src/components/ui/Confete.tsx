// Chuva de confete (só CSS, sem biblioteca). Cai uma vez e para.
import { useState, type CSSProperties } from 'react'
import '../stickers/stickers.css'

const CORES = ['#16A34A', '#FACC15', '#0EA5E9', '#F97316', '#EC4899', '#8B5CF6']

export function Confete({ quantidade = 40 }: { quantidade?: number }) {
  const [pecas] = useState(() =>
    Array.from({ length: quantidade }, (_, i) => ({
      esquerda: Math.random() * 100,
      atraso: Math.random() * 0.8,
      duracao: 2 + Math.random() * 1.5,
      largura: 6 + Math.random() * 6,
      giro: Math.random() * 720 - 360,
      cor: CORES[i % CORES.length],
    })),
  )

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pecas.map((p, i) => (
        <span
          key={i}
          className="confete"
          style={
            {
              left: `${p.esquerda}%`,
              width: p.largura,
              height: p.largura * 1.6,
              background: p.cor,
              animationDelay: `${p.atraso}s`,
              animationDuration: `${p.duracao}s`,
              '--giro': `${p.giro}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
