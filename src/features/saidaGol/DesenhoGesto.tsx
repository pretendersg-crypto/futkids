// Desenho de um gesto técnico do goleiro: o bonequinho (mesmo traço do bonequinho dos treinos)
// com luvas, na pose do gesto, e setas mostrando o movimento. Se os pais trocaram o desenho por
// uma imagem/GIF própria, mostra a imagem.
import { useImagemLocal } from '../../hooks/useImagemLocal'
import { POSES, type Desenho, type P, type PoseId } from './gestos'

const TRACO = { stroke: '#14532D', strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

const linha = (...pontos: P[]) => pontos.map((q) => `${q.x},${q.y}`).join(' ')

interface Props {
  desenho: Desenho
  /** Nome do gesto (texto alternativo e legenda) */
  nome: string
  tamanho?: number
  /** Mostra o nome embaixo */
  comNome?: boolean
}

export function DesenhoGesto({ desenho, nome, tamanho = 160, comNome = false }: Props) {
  return (
    <figure className="flex flex-col items-center gap-1">
      {desenho.tipo === 'imagem' ? <ImagemPropria id={desenho.id} nome={nome} tamanho={tamanho} /> : <Boneco pose={desenho.pose} nome={nome} tamanho={tamanho} />}
      {comNome && <figcaption className="text-center text-base leading-tight font-extrabold">{nome}</figcaption>}
    </figure>
  )
}

function ImagemPropria({ id, nome, tamanho }: { id: string; nome: string; tamanho: number }) {
  const url = useImagemLocal(id)
  const altura = (tamanho * 150) / 140
  if (!url) {
    return (
      <div style={{ width: tamanho, height: altura }} className="grid place-items-center rounded-2xl bg-white text-4xl" aria-label={`Imagem de ${nome}`}>
        🧤
      </div>
    )
  }
  return <img src={url} alt={`Como fazer: ${nome}`} style={{ width: tamanho, height: altura }} className="rounded-2xl bg-white object-contain" />
}

function Boneco({ pose: id, nome, tamanho }: { pose: PoseId; nome: string; tamanho: number }) {
  const pose = POSES[id]
  const chao = pose.chao ?? 136
  const { bola, setas } = pose
  // Na vista de lado, o braço/perna de trás fica mais claro (dá noção de profundidade)
  const trasDoLado = pose.vista === 'lado' ? 0.45 : 1
  const marcador = `seta-gesto-${id}`

  return (
    <svg viewBox="0 0 140 150" width={tamanho} height={(tamanho * 150) / 140} role="img" aria-label={`Desenho: ${nome}`}>
      <defs>
        <marker id={marcador} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
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

      {bola && (
        <g>
          <circle cx={bola.x} cy={bola.y} r={7} fill="#fff" stroke="#14532D" strokeWidth={2.5} />
          <circle cx={bola.x} cy={bola.y} r={2.4} fill="#14532D" />
        </g>
      )}

      {setas?.map((s, i) => (
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
            markerEnd={`url(#${marcador})`}
          />
          {s.texto && (
            <text x={(s.de.x + s.para.x) / 2} y={Math.min(s.de.y, s.para.y) + (s.de.y === s.para.y ? -5 : 0)} fontSize={9} fontWeight={700} fill="#c2410c" textAnchor="middle">
              {s.texto}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
