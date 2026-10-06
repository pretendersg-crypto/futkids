// Desafio "Embaixadinha": a bola cai e a criança coloca a chuteira embaixo dela (inclinando o
// celular ou arrastando o dedo). Bater com a ponta da chuteira manda a bola para o lado.
// 45 segundos; toques seguidos fazem combo. A física roda num laço próprio e mexe direto no
// estilo dos elementos (sem re-renderizar o React a cada quadro).
import { useRef, useState } from 'react'
import { useLoopJogo } from '../../hooks/useLoopJogo'
import { sons } from '../../utils/som'
import { useControleHorizontal, type Controle } from './controle'
import { HudRali } from './HudRali'
import { multiplicador } from './pontuacao'

interface Props {
  controle: Controle
  aoTerminar: (r: { pontos: number; toques: number; maiorCombo: number }) => void
}

const DURACAO = 45
// Medidas em "larguras da arena" (x de 0 a 1; y de 0 a ALTURA)
const ALTURA = 4 / 3
const RAIO = 0.065
const PE_Y = 1.18 // topo da chuteira
const PE_LARGURA = 0.26
const GRAVIDADE = 2.2
const PULO = 1.9 // velocidade da bola para cima depois do toque

export function JogoEmbaixadinha({ controle, aoTerminar }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const bolaRef = useRef<HTMLDivElement>(null)
  const peRef = useRef<HTMLDivElement>(null)
  const [ativo, setAtivo] = useState(true)
  const [hud, setHud] = useState({ segundos: DURACAO, pontos: 0, combo: 0 })
  const [caiu, setCaiu] = useState(false)
  const { alvo, eventos, semSensor } = useControleHorizontal(controle, arenaRef, ativo)

  const jogo = useRef({
    bola: { x: 0.5, y: 0.25, vx: 0, vy: 0 },
    pe: 0.5,
    tempo: DURACAO,
    esperaVolta: 0, // segundos até a bola voltar depois de cair
    pontos: 0,
    combo: 0,
    maiorCombo: 0,
    toques: 0,
    terminou: false,
  })

  useLoopJogo((dt) => {
    const j = jogo.current
    const b = j.bola
    j.tempo -= dt
    if (j.terminou) return
    if (j.tempo <= 0) {
      // Trava: o laço pode rodar mais um quadro antes de o React desligá-lo
      j.terminou = true
      setAtivo(false)
      aoTerminar({ pontos: j.pontos, toques: j.toques, maiorCombo: j.maiorCombo })
      return
    }

    // Chuteira segue o controle, com um pouco de atraso (fica natural e perdoa tremidas)
    const destino = Math.min(1 - PE_LARGURA / 2, Math.max(PE_LARGURA / 2, alvo()))
    j.pe += (destino - j.pe) * Math.min(1, dt * 14)

    if (j.esperaVolta > 0) {
      j.esperaVolta -= dt
      if (j.esperaVolta <= 0) {
        Object.assign(b, { x: 0.3 + Math.random() * 0.4, y: 0.2, vx: 0, vy: 0 })
        setCaiu(false)
      }
    } else {
      // Fica um pouco mais rápido conforme o combo cresce
      const g = GRAVIDADE * (1 + Math.min(j.combo, 30) * 0.015)
      b.vy += g * dt
      b.x += b.vx * dt
      b.y += b.vy * dt
      if (b.x < RAIO) Object.assign(b, { x: RAIO, vx: Math.abs(b.vx) })
      if (b.x > 1 - RAIO) Object.assign(b, { x: 1 - RAIO, vx: -Math.abs(b.vx) })

      const encostou = b.vy > 0 && b.y + RAIO >= PE_Y && b.y + RAIO <= PE_Y + 0.12 && Math.abs(b.x - j.pe) <= PE_LARGURA / 2 + RAIO * 0.6
      if (encostou) {
        b.y = PE_Y - RAIO
        b.vy = -(PULO + Math.random() * 0.15) * Math.sqrt(1 + Math.min(j.combo, 30) * 0.015)
        b.vx = (b.x - j.pe) * 4 + (Math.random() - 0.5) * 0.2
        j.combo++
        j.toques++
        j.maiorCombo = Math.max(j.maiorCombo, j.combo)
        j.pontos += multiplicador(j.combo)
        sons.toque(j.combo)
      } else if (b.y - RAIO > ALTURA) {
        j.combo = 0
        j.esperaVolta = 0.9
        sons.gol()
        setCaiu(true)
      }
    }

    // Desenha
    if (bolaRef.current) {
      bolaRef.current.style.left = `${b.x * 100}%`
      bolaRef.current.style.top = `${(b.y / ALTURA) * 100}%`
    }
    if (peRef.current) peRef.current.style.left = `${j.pe * 100}%`
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
        className="@container relative aspect-[3/4] w-full touch-none overflow-hidden rounded-3xl border-4 border-white bg-linear-to-b from-sky-300 via-sky-100 to-lime-200 shadow-lg select-none"
      >
        {/* Gramado */}
        <div className="absolute inset-x-0 bottom-0 h-[8%] bg-campo" />
        <div
          ref={bolaRef}
          aria-hidden
          className="absolute -translate-1/2 leading-none"
          style={{ left: '50%', top: `${(0.25 / ALTURA) * 100}%`, fontSize: `${RAIO * 200}cqw` }}
        >
          ⚽
        </div>
        {/* Chuteira (o topo dela é PE_Y) */}
        <div
          ref={peRef}
          aria-hidden
          className="absolute -translate-x-1/2 text-center leading-none"
          style={{ left: '50%', top: `${(PE_Y / ALTURA) * 100}%`, width: `${PE_LARGURA * 100}%`, fontSize: `${PE_LARGURA * 70}cqw` }}
        >
          👟
        </div>
        {caiu && (
          <p className="aviso-jogada absolute top-1/2 left-1/2 -translate-1/2 rounded-3xl bg-white px-5 py-2 text-2xl font-black whitespace-nowrap shadow-xl">
            Caiu! De novo 💪
          </p>
        )}
      </div>
      <p className="text-center text-base font-bold">{controle === 'inclinar' && !semSensor ? 'Incline o celular 📱' : 'Arraste o dedo 👆'}</p>
    </div>
  )
}
