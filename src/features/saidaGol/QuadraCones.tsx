// Desenho do circuito: o pedaço da quadra perto do gol, visto de cima, com o GOL EMBAIXO (o goleiro
// olha para cima, para a quadra: a esquerda dele é a esquerda da tela). Três jeitos de mostrar:
//  - montagem: só os cones, com a distância de cada um (para o adulto montar);
//  - percurso: o caminho todo, sem números (miniatura da lista);
//  - passo: só a seta do passo atual, bem grossa, e o goleiro deslizando até o lugar.
// No editor (prop "edicao"), os cones e a bola se arrastam com o dedo e a vista fica parada.
// Escala: 1 metro = 10 unidades do SVG. x = 0 é o meio do gol; y = 0 é a linha do gol.
import { useRef, type PointerEvent } from 'react'
import '../tatica/tatica.css'
import { ESTILO_MOVIMENTO, LIMITES_CONE, metros, ondeTermina, type Circuito, type Cone, type CorCone, type PassoCircuito } from './circuitos'

const COR_CONE: Record<CorCone, [string, string]> = {
  laranja: ['#fb923c', '#9a3412'],
  amarelo: ['#facc15', '#854d0e'],
  azul: ['#60a5fa', '#1e3a8a'],
  vermelho: ['#f87171', '#7f1d1d'],
}

const sx = (x: number) => x * 10
const sy = (y: number) => 105 - y * 10

export type ModoQuadra = 'montagem' | 'percurso' | 'passo'

/** Editor: arrastar cones e a bola ("bola" = a bola) */
export interface EdicaoCones {
  selecionado: string | null
  aoSelecionar: (id: string | null) => void
  /** Posição nova em metros */
  aoMover: (id: string, x: number, y: number) => void
}

interface Props {
  circuito: Circuito
  modo: ModoQuadra
  /** No modo "passo": qual passo (0...) */
  passo?: number
  edicao?: EdicaoCones
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
/** Posição de 10 em 10 cm (o adulto ajusta fino) */
const arredondar = (v: number) => Math.round(v * 10) / 10

/** Seta de um passo (de um cone a outro), afastada das pontas; a volta (recuo) fica um pouco ao lado */
function geometria(a: Cone, b: Cone, recuo: boolean) {
  const dx = sx(b.x) - sx(a.x)
  const dy = sy(b.y) - sy(a.y)
  const d = Math.hypot(dx, dy) || 1
  const desvio = recuo ? 5 : 0
  const ox = (-dy / d) * desvio
  const oy = (dx / d) * desvio
  return {
    x1: sx(a.x) + (dx / d) * 7 + ox,
    y1: sy(a.y) + (dy / d) * 7 + oy,
    x2: sx(b.x) - (dx / d) * 8 + ox,
    y2: sy(b.y) - (dy / d) * 8 + oy,
  }
}

export function QuadraCones({ circuito, modo, passo = 0, edicao }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const arrasto = useRef<{ id: string; mexeu: boolean } | null>(null)
  const cone = (id: string | undefined) => circuito.cones.find((c) => c.id === id)
  const atual: PassoCircuito | null = modo === 'passo' ? (circuito.passos[passo] ?? null) : null
  // Onde o goleiro está: no fim do passo (ou no começo do circuito)
  const inicio = circuito.passos[0]?.de
  const posGoleiro = cone(atual ? ondeTermina(atual) : inicio)

  /** Ponto da quadra (metros) debaixo do dedo */
  function metrosDoToque(e: { clientX: number; clientY: number }) {
    const matriz = svg.current?.getScreenCTM()
    if (!matriz) return null
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(matriz.inverse())
    return { x: arredondar(limitar(q.x / 10, -LIMITES_CONE.x, LIMITES_CONE.x)), y: arredondar(limitar((105 - q.y) / 10, LIMITES_CONE.yMin, LIMITES_CONE.yMax)) }
  }
  const pegar = (id: string) => (e: PointerEvent) => {
    if (!edicao) return
    e.preventDefault()
    e.stopPropagation()
    svg.current?.setPointerCapture(e.pointerId)
    arrasto.current = { id, mexeu: false }
    edicao.aoSelecionar(id)
  }
  function mover(e: PointerEvent) {
    const a = arrasto.current
    if (!a || !edicao) return
    const m = metrosDoToque(e)
    if (!m) return
    a.mexeu = true
    edicao.aoMover(a.id, m.x, m.y)
  }

  // Enquadra só a região do circuito (cones, bola, área e gol), para os cones ficarem grandes
  const xs = [...circuito.cones.map((c) => c.x), ...(circuito.bola ? [circuito.bola.x] : [])]
  const ys = [...circuito.cones.map((c) => c.y), ...(circuito.bola ? [circuito.bola.y] : [])]
  // No editor a vista é maior e quase parada (só cresce se um cone chegar perto da borda): assim dá
  // espaço para arrastar sem a quadra "andar" debaixo do dedo
  const minX = edicao ? Math.max(-10, Math.min(-6.5, Math.min(...xs) - 2)) : Math.max(-10, Math.min(-5, Math.min(...xs) - 1.8))
  const maxX = edicao ? Math.min(10, Math.max(6.5, Math.max(...xs) + 2)) : Math.min(10, Math.max(5, Math.max(...xs) + 1.8))
  const maxY = edicao ? Math.max(9, Math.max(...ys) + 2) : Math.max(6.8, Math.max(...ys) + 1.4)
  const vista = `${sx(minX)} ${sy(maxY)} ${sx(maxX) - sx(minX)} ${sy(-1.4) - sy(maxY)}`

  const setas = circuito.passos
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => p.movimento !== 'parado' && cone(p.de) && cone(p.para) && (modo === 'percurso' || (modo === 'passo' && i === passo)))

  return (
    <svg
      ref={svg}
      viewBox={vista}
      className={`w-full rounded-2xl bg-green-700 ${edicao ? 'tatica-editor touch-none' : ''}`}
      role="img"
      aria-label={`Circuito ${circuito.nome}: ${circuito.cones.length} cones`}
      onPointerMove={edicao ? mover : undefined}
      onPointerUp={edicao ? () => (arrasto.current = null) : undefined}
      onPointerCancel={edicao ? () => (arrasto.current = null) : undefined}
      onClick={edicao ? (e) => e.target === e.currentTarget && edicao.aoSelecionar(null) : undefined}
    >
      <defs>
        {Object.entries(ESTILO_MOVIMENTO).map(([m, e]) => (
          <marker key={m} id={`seta-cone-${m}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.6" markerHeight="3.6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={e.cor} />
          </marker>
        ))}
        <pattern id="rede-gol" width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M0 0 L3 3 M3 0 L0 3" stroke="#f0fdf4" strokeWidth={0.35} opacity={0.6} />
        </pattern>
      </defs>

      {/* Piso com faixas de grama, linhas, área (6 m) e o gol embaixo */}
      <rect x={-100} y={-20} width={200} height={140} fill="#15803d" />
      {Array.from({ length: 7 }, (_, k) => (
        <rect key={k} x={-100} y={105 - (k + 1) * 20} width={200} height={10} fill="#166534" opacity={0.35} />
      ))}
      <g fill="none" stroke="#f0fdf4" strokeWidth={1.2} opacity={0.9}>
        <polyline points="-100,-20 -100,105 100,105 100,-20" />
        <path d="M-75 105 A60 60 0 0 1 -15 45 L15 45 A60 60 0 0 1 75 105" />
      </g>
      <circle cx={0} cy={45} r={1.4} fill="#f0fdf4" />
      <text x={-14} y={42} fontSize={5} fill="#dcfce7" fontWeight={700}>
        6 m
      </text>
      {/* Gol: traves e rede */}
      <rect x={-15} y={105} width={30} height={9} fill="url(#rede-gol)" />
      <path d="M-15 105 L-15 114 L15 114 L15 105" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
      <text x={0} y={111.6} fontSize={5.5} fontWeight={900} fill="#fff" textAnchor="middle" letterSpacing={1}>
        GOL
      </text>

      {/* Montagem: régua de cada cone até a linha do gol */}
      {modo === 'montagem' &&
        circuito.cones.map((c) => (
          <line key={`r${c.id}`} x1={sx(c.x)} y1={sy(c.y) + 4} x2={sx(c.x)} y2={105} stroke="#fef08a" strokeWidth={0.6} strokeDasharray="1.5 1.5" opacity={0.8} />
        ))}

      {/* Bola de onde o adulto rola/lança */}
      {circuito.bola && (
        <g onPointerDown={pegar('bola')} cursor={edicao ? 'grab' : undefined}>
          {edicao?.selecionado === 'bola' && <circle cx={sx(circuito.bola.x)} cy={sy(circuito.bola.y)} r={7} fill="none" stroke="#fde047" strokeWidth={1.4} />}
          <circle cx={sx(circuito.bola.x)} cy={sy(circuito.bola.y)} r={3.4} fill="#fff" stroke="#111827" strokeWidth={1} />
          <circle cx={sx(circuito.bola.x)} cy={sy(circuito.bola.y)} r={1.1} fill="#111827" />
          <text x={sx(circuito.bola.x) + 5} y={sy(circuito.bola.y) + 2} fontSize={5} fill="#fff" fontWeight={800}>
            bola (adulto)
          </text>
        </g>
      )}

      {/* Setas */}
      {setas.map(({ p, i }) => {
        const { x1, y1, x2, y2 } = geometria(cone(p.de)!, cone(p.para)!, p.movimento === 'recuo')
        const estilo = ESTILO_MOVIMENTO[p.movimento as keyof typeof ESTILO_MOVIMENTO]
        const grossa = modo === 'passo'
        return (
          <g key={i}>
            {grossa && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.35} />}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={estilo.cor}
              strokeWidth={grossa ? 3.2 : 1.6}
              strokeDasharray={estilo.traco}
              strokeLinecap="round"
              markerEnd={`url(#seta-cone-${p.movimento})`}
            />
            {grossa && (
              <g transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})`}>
                <circle r={5} fill="#fff" stroke={estilo.cor} strokeWidth={1.2} />
                <text y={2} fontSize={5.5} textAnchor="middle">
                  {estilo.emoji}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Cones */}
      {circuito.cones.map((c) => {
        const [cor, borda] = COR_CONE[c.cor]
        const x = sx(c.x)
        const y = sy(c.y)
        const parado = atual?.movimento === 'parado' && atual.de === c.id
        const destino = atual && atual.movimento !== 'parado' && atual.para === c.id && atual.movimento !== 'bola'
        return (
          <g key={c.id} onPointerDown={pegar(c.id)} cursor={edicao ? 'grab' : undefined}>
            {edicao && <circle cx={x} cy={y} r={9} fill="transparent" />}
            {edicao?.selecionado === c.id && <circle cx={x} cy={y} r={8} fill="none" stroke="#fde047" strokeWidth={1.6} />}
            {(parado || destino) && <circle cx={x} cy={y} r={9} fill="none" stroke="#fde047" strokeWidth={1.6} className="tatica-pulso" />}
            <ellipse cx={x} cy={y + 3.6} rx={5} ry={1.4} fill="#000" opacity={0.25} />
            <path d={`M${x} ${y - 5.5} L${x - 4.4} ${y + 3.6} L${x + 4.4} ${y + 3.6} Z`} fill={cor} stroke={borda} strokeWidth={0.9} strokeLinejoin="round" />
            <path d={`M${x - 2.1} ${y - 1} L${x + 2.1} ${y - 1} L${x + 2.9} ${y + 0.9} L${x - 2.9} ${y + 0.9} Z`} fill="#fff" opacity={0.85} />
            {/* Letra do cone num selo branco */}
            <circle cx={x + 7} cy={y - 4} r={3.8} fill="#fff" stroke={borda} strokeWidth={0.8} />
            <text x={x + 7} y={y - 2.1} fontSize={5.2} fontWeight={900} fill="#14532d" textAnchor="middle">
              {c.id}
            </text>
            {modo === 'montagem' && (
              // Perto do gol, a distância vai para o lado (embaixo fica a palavra GOL)
              <text
                x={c.y < 1.5 ? x - 6.5 : x}
                y={c.y < 1.5 ? y + 2 : y + 9}
                fontSize={4.2}
                fontWeight={800}
                fill="#fef9c3"
                textAnchor={c.y < 1.5 ? 'end' : 'middle'}
                stroke="#14532d"
                strokeWidth={1.2}
                paintOrder="stroke"
              >
                {metros(c.y)} m
              </text>
            )}
          </g>
        )
      })}

      {/* Goleiro: desliza até o lugar do passo (na montagem, mostra onde começa) */}
      {modo !== 'percurso' && posGoleiro && (
        <g pointerEvents="none" className="tatica-jogador" style={{ transform: `translate(${sx(posGoleiro.x)}px, ${sy(posGoleiro.y) - 10}px)` }}>
          <circle r={6} fill="#f28a1b" stroke="#fff" strokeWidth={1.4} />
          <text y={2.3} fontSize={6.5} textAnchor="middle">
            🧤
          </text>
        </g>
      )}
    </svg>
  )
}
