// Quadra de futsal vista de cima (40 x 20 m → 400 x 200 unidades do SVG; 1 m = 10).
// Mostra os jogadores (azul = seu time, vermelho = adversário, goleiros com cor própria), a bola,
// quem pode jogar (anel piscando) e, para o jogador escolhido, uma seta para cada jogada possível.
// Tocar no fim da seta (ou no companheiro/adversário alvo) escolhe a jogada.
// Também serve para as outras perguntas e para os editores: tocar num lugar da quadra
// (aoTocarQuadra), tocar em qualquer jogador (clicaveis), marcas de lugar, setas da prancheta e
// arrastar jogadores (aoArrastar).
// Os jogadores se movem com transição de CSS no transform (mexe sozinho quando a cena muda).
import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { posicaoDoAlvo } from './validador'
import { EMOJI_ACAO, type Jogador, type Opcao, type Ponto, type SetaPrancheta, type TipoAcao, type TipoSeta } from './tipos'
import './tatica.css'

const L = 400
const A = 200
const px = (p: Ponto) => ({ x: p.x * L, y: p.y * A })
const limitar = (v: number) => Math.min(1, Math.max(0, v))

const COR_ACAO: Record<TipoAcao, string> = {
  passe: '#fde047',
  movimentacao: '#7dd3fc',
  finalizacao: '#fb923c',
  drible: '#c4b5fd',
  marcacao: '#fca5a5',
  desarme: '#fca5a5',
}

const COR_SETA: Record<TipoSeta, string> = { passe: '#fde047', corrida: '#7dd3fc', conducao: '#c4b5fd', chute: '#fb923c' }
const TRACO_SETA: Record<TipoSeta, string | undefined> = { passe: '6 4', corrida: '2 3', conducao: undefined, chute: undefined }

function corDoJogador(j: Jogador) {
  if (j.goleiro) return j.time === 'A' ? '#16a34a' : '#7c3aed'
  return j.time === 'A' ? '#2563eb' : '#dc2626'
}

export type EstadoOpcao = 'certo' | 'errado'

/** Marca de um lugar na quadra (ex.: o lugar certo, o toque errado) */
export interface Marca {
  pos: Ponto
  cor: string
  /** Raio em partes da largura da quadra (0 a 1); sem = um pontinho */
  raio?: number
  rotulo?: string
}

interface Props {
  jogadores: Jogador[]
  /** Id de quem está com a bola, ou 'gol' (null = sem bola) */
  bola: string | null
  /** Jogadores azuis que podem jogar agora (anel piscando) */
  agem?: string[]
  selecionado?: string | null
  /** Jogadas do jogador selecionado (setas) */
  opcoes?: Opcao[]
  /** Cor de resultado de alguma jogada (ex.: a errada fica vermelha, a revelada verde) */
  estados?: Record<string, EstadoOpcao>
  /** false = só mostra (depois de responder) */
  interativa?: boolean
  aoTocarJogador?: (id: string) => void
  aoEscolher?: (opcao: Opcao) => void
  /** Outros jogadores que dá para tocar (ex.: "encontre o erro", editor) */
  clicaveis?: string[]
  /** Tocar num lugar vazio da quadra */
  aoTocarQuadra?: (p: Ponto) => void
  marcas?: Marca[]
  /** Setas desenhadas (prancheta) */
  setas?: SetaPrancheta[]
  /** Editor: arrastar jogadores (tocar sem arrastar = aoTocarJogador) */
  aoArrastar?: (id: string, p: Ponto) => void
  /** Rótulo de acessibilidade da quadra */
  rotulo?: string
}

/** Ativa com Enter ou Espaço (navegação por teclado) */
const teclado = (fazer: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fazer()
  }
}

/** Uma seta entre dois pontos (em unidades do SVG), afastada um pouco das pontas */
function Seta({ de, ate, cor, traco, marcador, largura = 2.2, recuoFim = 6 }: { de: Ponto; ate: Ponto; cor: string; traco?: string; marcador: string; largura?: number; recuoFim?: number }) {
  const dx = ate.x - de.x
  const dy = ate.y - de.y
  const d = Math.hypot(dx, dy) || 1
  return (
    <line
      x1={de.x + (dx / d) * 12}
      y1={de.y + (dy / d) * 12}
      x2={ate.x - (dx / d) * recuoFim}
      y2={ate.y - (dy / d) * recuoFim}
      stroke={cor}
      strokeWidth={largura}
      strokeDasharray={traco}
      markerEnd={`url(#${marcador})`}
    />
  )
}

export function Quadra({
  jogadores,
  bola,
  agem = [],
  selecionado = null,
  opcoes = [],
  estados = {},
  interativa = false,
  aoTocarJogador,
  aoEscolher,
  clicaveis = [],
  aoTocarQuadra,
  marcas = [],
  setas = [],
  aoArrastar,
  rotulo = 'Quadra de futsal',
}: Props) {
  const svg = useRef<SVGSVGElement>(null)
  /** Arrasto em andamento (editor): quem, de onde começou e se já mexeu */
  const arrasto = useRef<{ id: string; x: number; y: number; mexeu: boolean } | null>(null)
  const quemSelecionado = jogadores.find((j) => j.id === selecionado)
  const comBola = jogadores.find((j) => j.id === bola)
  const posBola = bola === 'gol' ? { x: L + 5, y: A / 2 } : comBola ? { x: px(comBola.pos).x + 9, y: px(comBola.pos).y + 8 } : null

  /** Ponto da quadra (0 a 1) debaixo do dedo */
  function pontoDoToque(e: { clientX: number; clientY: number }): Ponto | null {
    const s = svg.current
    const matriz = s?.getScreenCTM()
    if (!s || !matriz) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matriz.inverse())
    return { x: limitar(p.x / L), y: limitar(p.y / A) }
  }

  // Tocar num jogador que é alvo de uma jogada do selecionado = escolher essa jogada
  function tocarJogador(id: string) {
    if (interativa) {
      const jogada = opcoes.find((o) => o.alvo.tipo === 'jogador' && o.alvo.id === id)
      if (jogada) return aoEscolher?.(jogada)
      if (agem.includes(id)) return aoTocarJogador?.(id)
    }
    if (clicaveis.includes(id)) aoTocarJogador?.(id)
  }

  // Arrastar (editor): começa no jogador, segue o dedo pela quadra
  const comecarArrasto = (id: string) => (e: PointerEvent) => {
    if (!aoArrastar) return
    e.preventDefault()
    svg.current?.setPointerCapture(e.pointerId)
    arrasto.current = { id, x: e.clientX, y: e.clientY, mexeu: false }
  }
  function moverArrasto(e: PointerEvent) {
    const a = arrasto.current
    if (!a || !aoArrastar) return
    if (!a.mexeu && Math.hypot(e.clientX - a.x, e.clientY - a.y) < 6) return
    a.mexeu = true
    const p = pontoDoToque(e)
    if (p) aoArrastar(a.id, p)
  }
  function soltarArrasto() {
    const a = arrasto.current
    arrasto.current = null
    // Tocou sem arrastar: é um toque no jogador
    if (a && !a.mexeu) tocarJogador(a.id)
  }

  return (
    <svg
      ref={svg}
      viewBox={`-16 -8 ${L + 32} ${A + 16}`}
      className={`w-full touch-manipulation rounded-2xl bg-green-800 select-none ${aoArrastar ? 'tatica-editor touch-none' : ''}`}
      role="group"
      aria-label={rotulo}
      onPointerMove={aoArrastar ? moverArrasto : undefined}
      onPointerUp={aoArrastar ? soltarArrasto : undefined}
      onPointerCancel={aoArrastar ? () => (arrasto.current = null) : undefined}
    >
      <defs>
        {Object.entries({ ...COR_ACAO, ...Object.fromEntries(Object.entries(COR_SETA).map(([k, v]) => [`p-${k}`, v])) }).map(([nome, cor]) => (
          <marker key={nome} id={`seta-${nome}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={cor} />
          </marker>
        ))}
        <marker id="seta-certo" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#4ade80" />
        </marker>
        <marker id="seta-errado" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#f87171" />
        </marker>
      </defs>

      {/* Piso e linhas (tocar no piso = escolher um lugar, quando a pergunta pede) */}
      <rect
        x={-16}
        y={-8}
        width={L + 32}
        height={A + 16}
        fill="transparent"
        onClick={aoTocarQuadra ? (e) => pontoDoToque(e) && aoTocarQuadra(pontoDoToque(e)!) : undefined}
        cursor={aoTocarQuadra ? 'crosshair' : undefined}
      />
      <rect x={0} y={0} width={L} height={A} fill="#15803d" pointerEvents="none" />
      <g fill="none" stroke="#f0fdf4" strokeWidth={1.5} opacity={0.85} pointerEvents="none">
        <rect x={0} y={0} width={L} height={A} />
        <line x1={L / 2} y1={0} x2={L / 2} y2={A} />
        <circle cx={L / 2} cy={A / 2} r={30} />
        {/* Áreas: quartos de círculo de 6 m em cada trave, ligados por uma reta */}
        <path d="M0 25 A60 60 0 0 1 60 85 L60 115 A60 60 0 0 1 0 175" />
        <path d={`M${L} 25 A60 60 0 0 0 ${L - 60} 85 L${L - 60} 115 A60 60 0 0 0 ${L} 175`} />
        {/* Gols (3 m) */}
        <rect x={-10} y={85} width={10} height={30} fill="#f0fdf4" fillOpacity={0.25} />
        <rect x={L} y={85} width={10} height={30} fill="#f0fdf4" fillOpacity={0.25} />
      </g>
      <g fill="#f0fdf4" opacity={0.85} pointerEvents="none">
        <circle cx={L / 2} cy={A / 2} r={1.8} />
        <circle cx={60} cy={A / 2} r={1.5} />
        <circle cx={100} cy={A / 2} r={1.5} />
        <circle cx={L - 60} cy={A / 2} r={1.5} />
        <circle cx={L - 100} cy={A / 2} r={1.5} />
      </g>
      <text x={8} y={A - 6} fontSize={8} fill="#bbf7d0" opacity={0.9} pointerEvents="none">
        seu gol ⬅
      </text>
      <text x={L - 8} y={A - 6} fontSize={8} fill="#bbf7d0" opacity={0.9} textAnchor="end" pointerEvents="none">
        ➡ ataque
      </text>

      {/* Marcas de lugar (o lugar certo, o toque da criança) */}
      {marcas.map((m, i) => {
        const p = px(m.pos)
        return (
          <g key={`m${i}`} pointerEvents="none">
            <circle cx={p.x} cy={p.y} r={m.raio ? m.raio * L : 4} fill={m.cor} fillOpacity={m.raio ? 0.3 : 0.9} stroke={m.cor} strokeWidth={1.5} strokeDasharray={m.raio ? '4 3' : undefined} />
            {m.rotulo && (
              <text x={p.x} y={p.y - (m.raio ? m.raio * L : 4) - 3} fontSize={9} fontWeight={800} fill="#fff" textAnchor="middle">
                {m.rotulo}
              </text>
            )}
          </g>
        )
      })}

      {/* Setas da prancheta */}
      {setas.map((s, i) => (
        <g key={`s${i}`} pointerEvents="none">
          <Seta de={px(s.de)} ate={px(s.para)} cor={COR_SETA[s.tipo]} traco={TRACO_SETA[s.tipo]} marcador={`seta-p-${s.tipo}`} largura={2.6} recuoFim={11} />
        </g>
      ))}

      {/* Setas das jogadas do jogador escolhido */}
      {quemSelecionado &&
        opcoes.map((o) => {
          const de = px(quemSelecionado.pos)
          const ate = o.alvo.tipo === 'gol' ? { x: L + 2, y: A / 2 } : px(posicaoDoAlvo(o.alvo, jogadores))
          const estado = estados[o.id]
          const cor = estado === 'certo' ? '#4ade80' : estado === 'errado' ? '#f87171' : COR_ACAO[o.acao]
          const dx = ate.x - de.x
          const dy = ate.y - de.y
          const d = Math.hypot(dx, dy) || 1
          const fim = o.alvo.tipo === 'jogador' ? 14 : 6
          return (
            <g key={o.id} pointerEvents="none">
              <Seta
                de={de}
                ate={ate}
                cor={cor}
                traco={o.acao === 'passe' ? '6 4' : o.acao === 'movimentacao' ? '2 3' : undefined}
                marcador={`seta-${estado ?? o.acao}`}
                largura={estado ? 3 : 2.2}
                recuoFim={fim}
              />
              <text x={(de.x + (dx / d) * 12 + ate.x - (dx / d) * fim) / 2} y={(de.y + (dy / d) * 12 + ate.y - (dy / d) * fim) / 2 - 4} fontSize={10} textAnchor="middle">
                {EMOJI_ACAO[o.acao]}
              </text>
            </g>
          )
        })}

      {/* Jogadores */}
      {jogadores.map((j) => {
        const p = px(j.pos)
        const podeAgir = interativa && agem.includes(j.id)
        const ehAlvo = interativa && opcoes.some((o) => o.alvo.tipo === 'jogador' && o.alvo.id === j.id)
        const clicavel = podeAgir || ehAlvo || clicaveis.includes(j.id) || Boolean(aoArrastar)
        return (
          <g
            key={j.id}
            className="tatica-jogador"
            style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
            onClick={aoArrastar ? undefined : () => tocarJogador(j.id)}
            onPointerDown={aoArrastar ? comecarArrasto(j.id) : undefined}
            onKeyDown={clicavel ? teclado(() => tocarJogador(j.id)) : undefined}
            role={clicavel ? 'button' : undefined}
            tabIndex={clicavel ? 0 : undefined}
            aria-label={`${j.goleiro ? 'Goleiro' : 'Jogador'} ${j.numero} ${j.time === 'A' ? 'azul' : 'vermelho'}${ehAlvo ? ': escolher esta jogada' : podeAgir ? ': pode jogar' : ''}`}
            cursor={aoArrastar ? 'grab' : clicavel ? 'pointer' : undefined}
          >
            {/* Área de toque maior que o desenho (dedo de criança) */}
            {clicavel && <circle r={18} fill="transparent" />}
            {podeAgir && <circle r={15} fill="none" stroke="#fde047" strokeWidth={selecionado === j.id ? 3.5 : 2} className={selecionado === j.id ? '' : 'tatica-pulso'} />}
            {!podeAgir && selecionado === j.id && <circle r={15} fill="none" stroke="#fde047" strokeWidth={3.5} />}
            {ehAlvo && <circle r={15} fill="none" stroke="#fde047" strokeWidth={2} strokeDasharray="4 3" />}
            <circle r={10} fill={corDoJogador(j)} stroke="#fff" strokeWidth={2} />
            <text y={3.6} fontSize={10} fontWeight={800} fill="#fff" textAnchor="middle" pointerEvents="none">
              {j.numero}
            </text>
          </g>
        )
      })}

      {/* Alvos que não são jogadores: lugares da quadra e o gol */}
      {interativa &&
        opcoes
          .filter((o) => o.alvo.tipo !== 'jogador')
          .map((o) => {
            const p = o.alvo.tipo === 'gol' ? { x: L + 5, y: A / 2 } : px(posicaoDoAlvo(o.alvo, jogadores))
            return (
              <g
                key={`alvo-${o.id}`}
                style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
                onClick={() => aoEscolher?.(o)}
                onKeyDown={teclado(() => aoEscolher?.(o))}
                role="button"
                tabIndex={0}
                aria-label={o.rotulo}
                cursor="pointer"
              >
                <circle r={16} fill="transparent" />
                <circle r={11} fill="#00000055" stroke={COR_ACAO[o.acao]} strokeWidth={2} strokeDasharray="3 3" className="tatica-pulso" />
                <text y={4} fontSize={11} textAnchor="middle" pointerEvents="none">
                  {EMOJI_ACAO[o.acao]}
                </text>
              </g>
            )
          })}

      {/* Bola */}
      {posBola && (
        <g className="tatica-jogador" style={{ transform: `translate(${posBola.x}px, ${posBola.y}px)` }} pointerEvents="none">
          <circle r={4.5} fill="#fff" stroke="#111827" strokeWidth={1.4} />
          <circle r={1.6} fill="#111827" />
        </g>
      )}
    </svg>
  )
}
