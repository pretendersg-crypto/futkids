// Desafio "Passe e chute": a cada rodada, um companheiro brilha (passe) ou é hora de chutar ao gol.
// A criança desliza o dedo da bola na direção certa antes do tempo da rodada acabar.
// Sequência: passe, passe, chute... 45 segundos; acertos seguidos fazem combo, gol vale o dobro.
import { useRef, useState, type PointerEvent } from 'react'
import { useLoopJogo } from '../../hooks/useLoopJogo'
import { sons } from '../../utils/som'
import { HudRali } from './HudRali'
import { multiplicador } from './pontuacao'

interface Props {
  aoTerminar: (r: { pontos: number; passes: number; gols: number; maiorCombo: number }) => void
}

const DURACAO = 45
const ALTURA = 4 / 3
const BOLA = { x: 0.5, y: 1.18 }
const COMPANHEIROS = [
  { numero: 7, x: 0.17, y: 0.8 },
  { numero: 9, x: 0.5, y: 0.6 },
  { numero: 10, x: 0.83, y: 0.8 },
]
const GOL = { esquerda: 0.22, direita: 0.78, y: 0.12 }
const ALCANCE_GOLEIRO = 0.11
/** Diferença máxima de ângulo para o passe ser certo */
const TOLERANCIA_PASSE = 14

type Tipo = 'passe' | 'chute'
type Fase = 'mira' | 'voo' | 'resultado'
const SEQUENCIA: Tipo[] = ['passe', 'passe', 'chute']

const angulo = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI
const diferenca = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const pct = (x: number, y: number) => ({ left: `${x * 100}%`, top: `${(y / ALTURA) * 100}%` })

export function JogoPasseChute({ aoTerminar }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const bolaRef = useRef<HTMLDivElement>(null)
  const goleiroRef = useRef<HTMLDivElement>(null)
  const barraRef = useRef<HTMLDivElement>(null)
  const inicioToque = useRef<{ x: number; y: number } | null>(null)
  const [ativo, setAtivo] = useState(true)
  const [hud, setHud] = useState({ segundos: DURACAO, pontos: 0, combo: 0 })
  const [rodada, setRodada] = useState<{ n: number; tipo: Tipo; alvo: number; fase: Fase; mensagem: string; acertou: boolean }>({
    n: 0,
    tipo: 'passe',
    alvo: 1,
    fase: 'mira',
    mensagem: '',
    acertou: false,
  })

  const jogo = useRef({ tempo: DURACAO, tempoRodada: 4, limiteRodada: 4, goleiroX: 0.5, fase: 'mira' as Fase, pontos: 0, combo: 0, maiorCombo: 0, passes: 0, gols: 0, terminou: false, esperaResultado: 0 })

  function novaRodada() {
    const j = jogo.current
    setRodada((r) => {
      const n = r.n + 1
      const tipo = SEQUENCIA[n % SEQUENCIA.length]
      // Companheiro diferente do anterior, para a criança ter que olhar
      let alvo = Math.floor(Math.random() * COMPANHEIROS.length)
      if (alvo === r.alvo) alvo = (alvo + 1) % COMPANHEIROS.length
      return { n, tipo, alvo, fase: 'mira', mensagem: '', acertou: false }
    })
    j.limiteRodada = Math.max(2, 4 - j.combo * 0.1)
    j.tempoRodada = j.limiteRodada
    j.fase = 'mira'
    bolaRef.current?.getAnimations().forEach((a) => a.cancel())
  }

  function resolver(acertou: boolean, mensagem: string, destino: { x: number; y: number } | null, pontosAcerto: number) {
    const j = jogo.current
    j.fase = 'voo'
    if (acertou) {
      j.combo++
      j.maiorCombo = Math.max(j.maiorCombo, j.combo)
      j.pontos += pontosAcerto * multiplicador(j.combo)
      sons.defesa()
    } else {
      j.combo = 0
      sons.gol()
    }
    if (destino) {
      bolaRef.current?.animate([pct(BOLA.x, BOLA.y), pct(destino.x, destino.y)], { duration: 350, easing: 'ease-out', fill: 'forwards' })
    }
    j.esperaResultado = 1.1
    setRodada((r) => ({ ...r, fase: 'resultado', mensagem, acertou }))
  }

  function soltar(e: PointerEvent<HTMLDivElement>) {
    const inicio = inicioToque.current
    inicioToque.current = null
    const r = arenaRef.current?.getBoundingClientRect()
    if (!inicio || !r || jogo.current.fase !== 'mira') return
    // Direção do deslize em "larguras da arena" (mesma escala em x e y)
    const dx = (e.clientX - inicio.x) / r.width
    const dy = (e.clientY - inicio.y) / r.width
    if (Math.hypot(dx, dy) < 0.08) return // toque curto não conta
    const direcao = angulo(dx, dy)

    if (rodada.tipo === 'passe') {
      const diferencas = COMPANHEIROS.map((c) => diferenca(direcao, angulo(c.x - BOLA.x, c.y - BOLA.y)))
      const melhor = diferencas.indexOf(Math.min(...diferencas))
      const certo = melhor === rodada.alvo && diferencas[melhor] <= TOLERANCIA_PASSE
      if (certo) jogo.current.passes++
      const mira = diferencas[melhor] <= 25 ? COMPANHEIROS[melhor] : { x: BOLA.x + dx * 3, y: BOLA.y + dy * 3 }
      resolver(certo, certo ? 'Passe certo! 👟' : `Era para o ${COMPANHEIROS[rodada.alvo].numero}!`, mira, 1)
      return
    }

    // Chute: onde a linha do deslize cruza a linha do gol
    if (dy >= 0) return resolver(false, 'Chute para a frente! ⬆️', null, 0)
    const t = (GOL.y - BOLA.y) / dy
    const x = BOLA.x + t * dx
    const destino = { x: Math.min(1.1, Math.max(-0.1, x)), y: GOL.y }
    if (x < GOL.esquerda || x > GOL.direita) return resolver(false, 'Para fora! 😬', destino, 0)
    if (Math.abs(x - jogo.current.goleiroX) < ALCANCE_GOLEIRO) return resolver(false, 'O goleiro pegou! 🧤', destino, 0)
    jogo.current.gols++
    resolver(true, 'GOOOL! ⚽🎉', destino, 2)
  }

  useLoopJogo((dt) => {
    const j = jogo.current
    if (j.terminou) return
    j.tempo -= dt
    if (j.tempo <= 0) {
      j.terminou = true // trava: o laço pode rodar mais um quadro antes de desligar
      setAtivo(false)
      aoTerminar({ pontos: j.pontos, passes: j.passes, gols: j.gols, maiorCombo: j.maiorCombo })
      return
    }
    // Goleiro anda de um lado para o outro, mais rápido conforme o tempo passa
    const decorrido = DURACAO - j.tempo
    j.goleiroX = 0.5 + Math.sin(decorrido * (1.6 + decorrido * 0.03)) * 0.22
    if (goleiroRef.current) goleiroRef.current.style.left = `${j.goleiroX * 100}%`

    if (j.fase === 'mira') {
      j.tempoRodada -= dt
      if (barraRef.current) barraRef.current.style.width = `${Math.max(0, j.tempoRodada / j.limiteRodada) * 100}%`
      if (j.tempoRodada <= 0) resolver(false, 'Demorou! ⏰', null, 0)
    } else {
      j.esperaResultado -= dt
      if (j.esperaResultado <= 0) novaRodada()
    }

    const segundos = Math.ceil(j.tempo)
    if (segundos !== hud.segundos || j.pontos !== hud.pontos || j.combo !== hud.combo) {
      setHud({ segundos, pontos: j.pontos, combo: j.combo })
    }
  }, ativo)

  const instrucao = rodada.tipo === 'passe' ? `Passe para o ${COMPANHEIROS[rodada.alvo].numero}!` : 'Chute! Longe do goleiro 🧤'

  return (
    <div className="flex flex-col gap-3">
      <HudRali {...hud} />
      <p className="text-center text-xl font-extrabold" aria-live="polite">
        {rodada.fase === 'resultado' ? rodada.mensagem : instrucao}
      </p>
      <div
        ref={arenaRef}
        onPointerDown={(e) => (inicioToque.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={soltar}
        onPointerCancel={() => (inicioToque.current = null)}
        className="gramado @container relative aspect-[3/4] w-full touch-none overflow-hidden rounded-3xl border-4 border-white shadow-lg select-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #22c55e 0 32px, #16a34a 32px 64px)' }}
      >
        {/* Tempo da rodada */}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-white/40">
          <div ref={barraRef} className="h-full bg-sol" style={{ width: '100%' }} />
        </div>

        {/* Gol com goleiro */}
        <div
          className="absolute rounded-t-md border-4 border-b-0 border-white bg-white/25"
          style={{ left: `${GOL.esquerda * 100}%`, width: `${(GOL.direita - GOL.esquerda) * 100}%`, top: '1%', height: `${((GOL.y - 0.01) / ALTURA) * 100}%` }}
        />
        <div ref={goleiroRef} aria-hidden className="absolute -translate-1/2 text-[9cqw] leading-none" style={pct(0.5, GOL.y - 0.02)}>
          🧤
        </div>

        {/* Companheiros: o da vez brilha */}
        {COMPANHEIROS.map((c, i) => {
          const daVez = rodada.tipo === 'passe' && i === rodada.alvo
          return (
            <div
              key={c.numero}
              aria-hidden
              className={`absolute grid size-[17cqw] -translate-1/2 place-items-center rounded-full border-4 text-[8cqw] leading-none ${
                daVez ? 'border-sol bg-yellow-100 shadow-[0_0_0_6px_rgb(250_204_21/0.5)]' : 'border-white/70 bg-white/40'
              }`}
              style={pct(c.x, c.y)}
            >
              👕
              <span className="absolute -bottom-1 rounded-full bg-campo-escuro px-1.5 text-[4.5cqw] font-black text-white">{c.numero}</span>
            </div>
          )
        })}

        <div ref={bolaRef} aria-hidden className="absolute -translate-1/2 text-[11cqw] leading-none" style={pct(BOLA.x, BOLA.y)}>
          ⚽
        </div>
        {rodada.fase === 'mira' && rodada.n < 2 && (
          <p className="pointer-events-none absolute bottom-[3%] left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 text-sm font-bold whitespace-nowrap">
            Deslize o dedo a partir da bola 👆
          </p>
        )}
      </div>
    </div>
  )
}
