// Desafio "Condução": a bola corre para a frente sozinha (os cones descem na tela) e a criança
// a leva pelo meio de cada portão de cones, inclinando o celular ou arrastando o dedo.
// Fica mais rápido e com portões mais estreitos com o tempo. 45 segundos.
import { useEffect, useRef, useState } from 'react'
import { useLoopJogo } from '../../hooks/useLoopJogo'
import { sons } from '../../utils/som'
import { useControleHorizontal, type Controle } from './controle'
import { HudRali } from './HudRali'
import { multiplicador } from './pontuacao'

interface Props {
  controle: Controle
  aoTerminar: (r: { pontos: number; portoes: number; maiorCombo: number }) => void
}

const DURACAO = 45
const ALTURA = 4 / 3
const RAIO = 0.06
const BOLA_Y = 1.08
const ESPACO = 0.62 // distância entre portões
const PORTOES = 4 // quantos portões existem ao mesmo tempo (são reaproveitados)

interface Portao {
  y: number
  centro: number
  abertura: number
  resolvido: boolean
}

function Cone() {
  return (
    <svg viewBox="0 0 20 24" className="h-full w-auto" aria-hidden>
      <polygon points="10,0 19,22 1,22" fill="#F97316" />
      <polygon points="7,8 13,8 14.5,12 5.5,12" fill="#FFFFFF" />
      <rect x="0" y="21" width="20" height="3" rx="1" fill="#C2410C" />
    </svg>
  )
}

export function JogoConducao({ controle, aoTerminar }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const bolaRef = useRef<HTMLDivElement>(null)
  const portaoRefs = useRef<(HTMLDivElement | null)[]>([])
  const [ativo, setAtivo] = useState(true)
  const [hud, setHud] = useState({ segundos: DURACAO, pontos: 0, combo: 0 })
  const [aviso, setAviso] = useState<{ texto: string; n: number } | null>(null)
  const { alvo, eventos, semSensor } = useControleHorizontal(controle, arenaRef, ativo)

  // O aviso de "bateu" some sozinho
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 900)
    return () => clearTimeout(t)
  }, [aviso])

  const jogo = useRef({
    x: 0.5,
    tempo: DURACAO,
    pontos: 0,
    combo: 0,
    maiorCombo: 0,
    portoes: 0,
    terminou: false,
    // Os portões começam acima da tela, um atrás do outro
    lista: Array.from({ length: PORTOES }, (_, i): Portao => ({ y: -0.15 - i * ESPACO, centro: 0.5 + (i % 2 ? 0.18 : -0.18), abertura: 0.46, resolvido: false })),
  })

  /** Novo portão: abertura diminui com o tempo e o centro não pula longe demais do anterior */
  function sortear(p: Portao, anterior: number, decorrido: number) {
    p.abertura = Math.max(0.27, 0.46 - decorrido * 0.004)
    const min = Math.max(p.abertura / 2 + 0.03, anterior - 0.4)
    const max = Math.min(1 - p.abertura / 2 - 0.03, anterior + 0.4)
    p.centro = min + Math.random() * (max - min)
    p.resolvido = false
  }

  function desenharPortao(i: number, p: Portao) {
    const el = portaoRefs.current[i]
    if (!el) return
    const [esq, faixa, dir] = Array.from(el.children) as HTMLElement[]
    esq.style.left = `${(p.centro - p.abertura / 2) * 100}%`
    dir.style.left = `${(p.centro + p.abertura / 2) * 100}%`
    faixa.style.left = `${(p.centro - p.abertura / 2) * 100}%`
    faixa.style.width = `${p.abertura * 100}%`
  }

  useLoopJogo((dt) => {
    const j = jogo.current
    if (j.terminou) return
    j.tempo -= dt
    if (j.tempo <= 0) {
      j.terminou = true // trava: o laço pode rodar mais um quadro antes de desligar
      setAtivo(false)
      aoTerminar({ pontos: j.pontos, portoes: j.portoes, maiorCombo: j.maiorCombo })
      return
    }
    const decorrido = DURACAO - j.tempo
    const velocidade = 0.5 + decorrido * 0.01

    const destino = Math.min(1 - RAIO, Math.max(RAIO, alvo()))
    j.x += (destino - j.x) * Math.min(1, dt * 10)

    j.lista.forEach((p, i) => {
      const antes = p.y
      p.y += velocidade * dt
      // O portão cruzou a linha da bola: passou pelo meio ou bateu no cone?
      if (!p.resolvido && antes < BOLA_Y && p.y >= BOLA_Y) {
        p.resolvido = true
        const passou = Math.abs(j.x - p.centro) <= p.abertura / 2 - RAIO * 0.3
        const faixa = portaoRefs.current[i]?.children[1] as HTMLElement | undefined
        if (faixa) faixa.dataset.estado = passou ? 'passou' : 'bateu'
        if (passou) {
          j.combo++
          j.portoes++
          j.maiorCombo = Math.max(j.maiorCombo, j.combo)
          j.pontos += multiplicador(j.combo)
          sons.toque(j.combo)
        } else {
          j.combo = 0
          sons.gol()
          setAviso((a) => ({ texto: 'Bateu no cone! 💥', n: (a?.n ?? 0) + 1 }))
        }
      }
      // Saiu por baixo: volta lá para cima como um portão novo
      if (p.y > ALTURA + 0.15) {
        const maisAlto = Math.min(...j.lista.map((q) => q.y))
        const anterior = j.lista.reduce((a, q) => (q.y === maisAlto ? q : a), p).centro
        p.y = maisAlto - ESPACO
        sortear(p, anterior, decorrido)
        desenharPortao(i, p)
        const faixa = portaoRefs.current[i]?.children[1] as HTMLElement | undefined
        if (faixa) faixa.dataset.estado = '' // portão novo, sem cor de passou/bateu
      }
      const el = portaoRefs.current[i]
      if (el) el.style.top = `${(p.y / ALTURA) * 100}%`
    })

    if (bolaRef.current) bolaRef.current.style.left = `${j.x * 100}%`
    const segundos = Math.ceil(j.tempo)
    if (segundos !== hud.segundos || j.pontos !== hud.pontos || j.combo !== hud.combo) {
      setHud({ segundos, pontos: j.pontos, combo: j.combo })
    }
  }, ativo)

  return (
    <div className="flex flex-col gap-3">
      <HudRali {...hud} />
      {semSensor && <p className="rounded-2xl bg-white p-2 text-center font-bold">Sem sensor neste celular: arraste o dedo 👆</p>}
      <div
        ref={arenaRef}
        {...eventos}
        className="gramado @container relative aspect-[3/4] w-full touch-none overflow-hidden rounded-3xl border-4 border-white shadow-lg select-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #22c55e 0 32px, #16a34a 32px 64px)' }}
      >
        {/* Portões: posição e abertura são escritas direto no elemento (pelo laço e aqui no ref) */}
        {Array.from({ length: PORTOES }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              portaoRefs.current[i] = el
              const p = jogo.current.lista[i]
              if (!el) return
              el.style.top = `${(p.y / ALTURA) * 100}%`
              desenharPortao(i, p)
            }}
            aria-hidden
            className="absolute inset-x-0 h-[7%] -translate-y-1/2"
          >
            <span className="absolute h-full -translate-x-1/2">
              <Cone />
            </span>
            {/* Faixa entre os cones: fica amarela quando passa, vermelha quando bate */}
            <span className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/70 data-[estado=bateu]:bg-red-500 data-[estado=passou]:bg-sol" />
            <span className="absolute h-full -translate-x-1/2">
              <Cone />
            </span>
          </div>
        ))}
        <div
          ref={bolaRef}
          aria-hidden
          className="absolute -translate-1/2 leading-none"
          style={{ left: '50%', top: `${(BOLA_Y / ALTURA) * 100}%`, fontSize: `${RAIO * 200}cqw` }}
        >
          ⚽
        </div>
        {aviso && (
          <p
            key={aviso.n}
            className="aviso-jogada pointer-events-none absolute top-[30%] left-1/2 -translate-1/2 rounded-3xl bg-white px-5 py-2 text-xl font-black whitespace-nowrap shadow-xl"
          >
            {aviso.texto}
          </p>
        )}
      </div>
      <p className="text-center text-base font-bold">{controle === 'inclinar' && !semSensor ? 'Incline o celular 📱' : 'Arraste o dedo 👆'}</p>
    </div>
  )
}
