// Desenho do circuito: o pedaço da quadra perto do gol (visto de cima, gol EMBAIXO), os cones,
// uma seta numerada para cada passo e o goleiro, que desliza até o lugar de cada passo.
// Escala: 1 metro = 10 unidades do SVG. x = 0 é o meio do gol; y = 0 é a linha do gol.
import '../tatica/tatica.css'
import { ESTILO_MOVIMENTO, ondeTermina, type Circuito, type CorCone } from './circuitos'

const COR_CONE: Record<CorCone, [string, string]> = {
  laranja: ['#fb923c', '#9a3412'],
  amarelo: ['#facc15', '#854d0e'],
  azul: ['#60a5fa', '#1e3a8a'],
  vermelho: ['#f87171', '#7f1d1d'],
}


const sx = (x: number) => x * 10
const sy = (y: number) => 105 - y * 10

interface Props {
  circuito: Circuito
  /** Passo em destaque (0...); null = mostra todos iguais */
  passo: number | null
}

export function QuadraCones({ circuito, passo }: Props) {
  const cone = (id: string) => circuito.cones.find((c) => c.id === id)!
  // Onde o goleiro está: no fim do passo em destaque (ou no começo do circuito)
  const posGoleiro = cone(passo === null ? circuito.passos[0].de : ondeTermina(circuito.passos[passo]))
  const atual = passo === null ? null : circuito.passos[passo]

  // Enquadra só a região do circuito (cones, bola, área e gol), para os cones ficarem grandes
  const xs = [...circuito.cones.map((c) => c.x), ...(circuito.bola ? [circuito.bola.x] : [])]
  const ys = [...circuito.cones.map((c) => c.y), ...(circuito.bola ? [circuito.bola.y] : [])]
  const minX = Math.max(-10, Math.min(-5, Math.min(...xs) - 1.5))
  const maxX = Math.min(10, Math.max(5, Math.max(...xs) + 1.5))
  const maxY = Math.max(6.8, Math.max(...ys) + 1.2)
  const vista = `${sx(minX)} ${sy(maxY)} ${sx(maxX) - sx(minX)} ${sy(-1.2) - sy(maxY)}`

  return (
    <svg viewBox={vista} className="w-full rounded-2xl bg-green-700" role="img" aria-label={`Circuito ${circuito.nome}: ${circuito.cones.length} cones`}>
      <defs>
        {Object.entries(ESTILO_MOVIMENTO).map(([m, e]) => (
          <marker key={m} id={`seta-cone-${m}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={e.cor} />
          </marker>
        ))}
      </defs>

      {/* Piso e linhas: laterais, área (quartos de círculo de 6 m), marca de 6 m, gol */}
      <rect x={-100} y={4} width={200} height={101} fill="#15803d" />
      <g fill="none" stroke="#f0fdf4" strokeWidth={1.2} opacity={0.9}>
        <polyline points="-100,4 -100,105 100,105 100,4" />
        <path d="M-75 105 A60 60 0 0 1 -15 45 L15 45 A60 60 0 0 1 75 105" />
        <rect x={-15} y={105} width={30} height={9} fill="#f0fdf4" fillOpacity={0.3} />
      </g>
      <circle cx={0} cy={45} r={1.4} fill="#f0fdf4" />
      <text x={22} y={112} fontSize={5} fill="#dcfce7" fontWeight={700}>
        ⬅ GOL
      </text>
      <text x={-12} y={42} fontSize={5} fill="#dcfce7">
        6 m
      </text>

      {/* Bola de onde o adulto rola/lança */}
      {circuito.bola && (
        <g>
          <circle cx={sx(circuito.bola.x)} cy={sy(circuito.bola.y)} r={3.4} fill="#fff" stroke="#111827" strokeWidth={1} />
          <text x={sx(circuito.bola.x) + 5} y={sy(circuito.bola.y) + 2} fontSize={5.5} fill="#fff" fontWeight={700}>
            bola
          </text>
        </g>
      )}

      {/* Setas dos passos */}
      {circuito.passos.map((p, i) => {
        if (p.movimento === 'parado' || !p.para) return null
        const a = cone(p.de)
        const b = cone(p.para)
        const dx = sx(b.x) - sx(a.x)
        const dy = sy(b.y) - sy(a.y)
        const d = Math.hypot(dx, dy) || 1
        // Ida e volta pelo mesmo caminho: a volta (recuo) fica um pouco ao lado
        const desvio = p.movimento === 'recuo' ? 5 : 0
        const ox = (-dy / d) * desvio
        const oy = (dx / d) * desvio
        const x1 = sx(a.x) + (dx / d) * 6 + ox
        const y1 = sy(a.y) + (dy / d) * 6 + oy
        const x2 = sx(b.x) - (dx / d) * 7 + ox
        const y2 = sy(b.y) - (dy / d) * 7 + oy
        const estilo = ESTILO_MOVIMENTO[p.movimento]
        // Perto do começo da seta: na ida e volta pelo mesmo caminho, os números ficam em pontas opostas
        const t = 0.32
        const destaque = passo === i
        const apagada = passo !== null && !destaque
        return (
          <g key={i} opacity={apagada ? 0.3 : 1}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={estilo.cor}
              strokeWidth={destaque ? 2.6 : 1.8}
              strokeDasharray={estilo.traco}
              strokeLinecap="round"
              markerEnd={`url(#seta-cone-${p.movimento})`}
            />
            {/* Número do passo */}
            <circle cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={4} fill="#fff" stroke={estilo.cor} strokeWidth={1.2} />
            <text x={x1 + (x2 - x1) * t} y={y1 + (y2 - y1) * t + 2} fontSize={5.5} fontWeight={800} textAnchor="middle" fill="#111827">
              {i + 1}
            </text>
          </g>
        )
      })}

      {/* Cones */}
      {circuito.cones.map((c) => {
        const [cor, borda] = COR_CONE[c.cor]
        const x = sx(c.x)
        const y = sy(c.y)
        return (
          <g key={c.id}>
            {atual?.movimento === 'parado' && atual.de === c.id && <circle cx={x} cy={y} r={9} fill="none" stroke="#fde047" strokeWidth={1.6} className="tatica-pulso" />}
            <path d={`M${x} ${y - 5} L${x - 4.2} ${y + 3.5} L${x + 4.2} ${y + 3.5} Z`} fill={cor} stroke={borda} strokeWidth={0.9} strokeLinejoin="round" />
            <text x={x + 5.5} y={y + 1} fontSize={7} fontWeight={900} fill="#fff" stroke="#14532d" strokeWidth={1.6} paintOrder="stroke">
              {c.id}
            </text>
          </g>
        )
      })}

      {/* Goleiro: desliza até o lugar do passo em destaque */}
      <g className="tatica-jogador" style={{ transform: `translate(${sx(posGoleiro.x)}px, ${sy(posGoleiro.y) - 9}px)` }}>
        <circle r={5.2} fill="#16a34a" stroke="#fff" strokeWidth={1.4} />
        <text y={2.2} fontSize={6} textAnchor="middle">
          🧤
        </text>
      </g>
    </svg>
  )
}
