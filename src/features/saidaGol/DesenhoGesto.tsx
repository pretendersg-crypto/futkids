// Desenho de um gesto técnico do goleiro: o bonequinho (mesmo traço do bonequinho dos treinos)
// com luvas, na pose do gesto, e setas mostrando o movimento.
import { GESTOS, type GestoId, type P } from './gestos'

const TRACO = { stroke: '#14532D', strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

const linha = (...pontos: P[]) => pontos.map((q) => `${q.x},${q.y}`).join(' ')

interface Props {
  gesto: GestoId
  tamanho?: number
  /** Mostra o nome embaixo */
  comNome?: boolean
}

export function DesenhoGesto({ gesto, tamanho = 160, comNome = false }: Props) {
  const g = GESTOS[gesto]
  const pose = g.pose
  const chao = pose.chao ?? 136
  // Na vista de lado, o braço/perna de trás fica mais claro (dá noção de profundidade)
  const trasDoLado = pose.vista === 'lado' ? 0.45 : 1

  return (
    <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 140 150" width={tamanho} height={(tamanho * 150) / 140} role="img" aria-label={`Desenho: ${g.nome}`}>
        <defs>
          <marker id={`seta-gesto-${gesto}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#ea580c" />
          </marker>
        </defs>
        {/* Chão */}
        <line x1={4} y1={chao} x2={136} y2={chao} stroke="#86efac" strokeWidth={4} strokeLinecap="round" />

        {/* Membros de trás (vista de lado) ou esquerdos (vista de frente) */}
        <g opacity={trasDoLado}>
          <polyline points={linha(pose.quadril, pose.joelhos[0], pose.pes[0])} {...TRACO} />
          <polyline points={linha(pose.pescoco, pose.cotovelos[0], pose.maos[0])} {...TRACO} />
          <circle cx={pose.maos[0].x} cy={pose.maos[0].y} r={6.5} fill="#f59e0b" stroke="#14532D" strokeWidth={2.5} />
        </g>
        {/* Tronco (camisa de goleiro) e cabeça */}
        <line x1={pose.pescoco.x} y1={pose.pescoco.y} x2={pose.quadril.x} y2={pose.quadril.y} stroke="#15803d" strokeWidth={14} strokeLinecap="round" />
        <circle cx={pose.cabeca.x} cy={pose.cabeca.y} r={11} fill="#fde68a" stroke="#14532D" strokeWidth={3} />
        {/* Membros da frente / direitos */}
        <polyline points={linha(pose.quadril, pose.joelhos[1], pose.pes[1])} {...TRACO} />
        <polyline points={linha(pose.pescoco, pose.cotovelos[1], pose.maos[1])} {...TRACO} />
        <circle cx={pose.maos[1].x} cy={pose.maos[1].y} r={6.5} fill="#f59e0b" stroke="#14532D" strokeWidth={2.5} />

        {pose.bola && (
          <g>
            <circle cx={pose.bola.x} cy={pose.bola.y} r={7} fill="#fff" stroke="#14532D" strokeWidth={2.5} />
            <circle cx={pose.bola.x} cy={pose.bola.y} r={2.4} fill="#14532D" />
          </g>
        )}

        {pose.setas?.map((s, i) => (
          <g key={i}>
            <line
              x1={s.de.x}
              y1={s.de.y}
              x2={s.para.x}
              y2={s.para.y}
              stroke="#ea580c"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={s.tracejada ? '5 4' : undefined}
              markerEnd={`url(#seta-gesto-${gesto})`}
            />
            {s.texto && (
              <text x={(s.de.x + s.para.x) / 2} y={Math.min(s.de.y, s.para.y) + (s.de.y === s.para.y ? -5 : 0)} fontSize={9} fontWeight={700} fill="#c2410c" textAnchor="middle">
                {s.texto}
              </text>
            )}
          </g>
        ))}
      </svg>
      {comNome && <figcaption className="text-center text-base leading-tight font-extrabold">{g.nome}</figcaption>}
    </figure>
  )
}
