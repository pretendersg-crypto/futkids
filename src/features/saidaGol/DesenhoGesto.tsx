// Desenho de um gesto técnico do goleiro: o goleiro uniformizado (CorpoGoleiro) na pose do gesto,
// com a bola e setas mostrando o movimento. Poses com animação (animacoes.ts) se mexem: os pontos do
// corpo vão e voltam entre os quadros. Se os pais trocaram o desenho por uma imagem/GIF própria,
// mostra a imagem. Rodando localmente, a arte do aluno (src/local/goleiro3d, fora do GitHub) entra no
// lugar do goleiro desenhado.
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useImagemLocal } from '../../hooks/useImagemLocal'
import { ANIMACOES, poseNoTempo } from './animacoes'
import { arteLocalDaPose } from './arteLocal'
import { CorpoGoleiro } from './CorpoGoleiro'
import { POSES, type Desenho, type Pose, type PoseId } from './gestos'

interface Props {
  desenho: Desenho
  /** Nome do gesto (texto alternativo e legenda) */
  nome: string
  tamanho?: number
  /** Mostra o nome embaixo */
  comNome?: boolean
  /** Anima a pose (quando ela tem animação). Padrão: sim, a partir de 90 px */
  animado?: boolean
  /** Mostra a arte local do aluno no lugar do desenho, quando existe (padrão: sim) */
  comArte?: boolean
}

export function DesenhoGesto({ desenho, nome, tamanho = 160, comNome = false, animado = tamanho >= 90, comArte = true }: Props) {
  const arte = desenho.tipo === 'pose' && comArte ? arteLocalDaPose(desenho.pose) : undefined
  return (
    <figure className="flex flex-col items-center gap-1">
      {desenho.tipo === 'imagem' ? (
        <ImagemPropria id={desenho.id} nome={nome} tamanho={tamanho} />
      ) : arte ? (
        <img src={arte} alt={`Como fazer: ${nome}`} style={{ width: tamanho, height: (tamanho * 150) / 140 }} className="object-contain" />
      ) : (
        <Boneco pose={desenho.pose} nome={nome} tamanho={tamanho} animado={animado} />
      )}
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

/** A pose no instante atual da animação (ou parada, sem animação ou com "reduzir movimento") */
function usePose(id: PoseId, animado: boolean): Pose {
  const anim = ANIMACOES[id]
  const reduzir = useReducedMotion()
  const ligado = Boolean(anim) && animado && !reduzir
  const [ms, setMs] = useState(0)
  useEffect(() => {
    if (!ligado) return
    let quadro = 0
    const inicio = performance.now()
    const passo = (agora: number) => {
      setMs(agora - inicio)
      quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [ligado])
  return ligado && anim ? poseNoTempo(anim, ms) : POSES[id]
}

function Boneco({ pose: id, nome, tamanho, animado }: { pose: PoseId; nome: string; tamanho: number; animado: boolean }) {
  const pose = usePose(id, animado)
  const chao = pose.chao ?? 136
  const { bola, setas } = pose
  const marcador = `seta-gesto-${id}`

  return (
    <svg viewBox="0 0 140 150" width={tamanho} height={(tamanho * 150) / 140} role="img" aria-label={`Desenho: ${nome}`}>
      <defs>
        <marker id={marcador} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#ea580c" />
        </marker>
      </defs>
      {/* Chão */}
      <line x1={4} y1={chao + 4} x2={136} y2={chao + 4} stroke="#86efac" strokeWidth={4} strokeLinecap="round" />

      <CorpoGoleiro pose={pose} />

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
