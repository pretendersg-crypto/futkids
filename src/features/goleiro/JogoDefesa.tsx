// Minijogo "Defesa": a bola sai da marca do pênalti para um ponto do gol e a criança arrasta
// a luva até lá antes de ela chegar. 10 chutes por partida.
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { sons } from '../../utils/som'
import { Arena, AvisoJogada } from './Arena'
import { GOL, PENALTI } from './geometria'
import { RODADAS, type NivelGoleiro } from './niveis'
import { PlacarRodadas } from './PlacarRodadas'

interface Props {
  nivel: NivelGoleiro
  aoTerminar: (historico: boolean[]) => void
}

type Fase = 'preparar' | 'chute' | 'resultado'
interface Ponto {
  x: number
  y: number
}

/** Raio da bola em fração da largura da arena */
const RAIO_BOLA = 0.045
const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Ponto aleatório dentro do gol (com folga das traves), em frações da arena */
function sortearAlvo(): Ponto {
  return { x: GOL.x + GOL.w * (0.08 + Math.random() * 0.84), y: GOL.y + GOL.h * (0.15 + Math.random() * 0.75) }
}

export function JogoDefesa({ nivel, aoTerminar }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const bolaRef = useRef<HTMLDivElement>(null)
  const inicioLuva = { x: 0.5, y: GOL.y + GOL.h * 0.6 }
  const luvaRef = useRef<Ponto>(inicioLuva)
  const [luva, setLuva] = useState<Ponto>(inicioLuva)
  const [alvo, setAlvo] = useState<Ponto | null>(null)
  const [fase, setFase] = useState<Fase>('preparar')
  const [historico, setHistorico] = useState<boolean[]>([])
  const historicoRef = useRef<boolean[]>([])
  // Guardado em ref: o efeito do chute não pode reiniciar quando o pai renderiza de novo
  const aoTerminarRef = useRef(aoTerminar)
  useEffect(() => {
    aoTerminarRef.current = aoTerminar
  })

  const raioLuvaArena = nivel.defesa.raioLuva * GOL.w // em fração da largura da arena

  function moverLuva(e: PointerEvent<HTMLDivElement>) {
    // Mouse só arrasta com o botão apertado; no toque, todo movimento vale
    if (e.pointerType === 'mouse' && e.buttons === 0) return
    const r = arenaRef.current?.getBoundingClientRect()
    if (!r) return
    const p = {
      x: limitar((e.clientX - r.left) / r.width, GOL.x, GOL.x + GOL.w),
      y: limitar((e.clientY - r.top) / r.height, GOL.y, GOL.y + GOL.h + 0.05),
    }
    luvaRef.current = p
    setLuva(p)
  }

  // Ciclo de cada chute: preparar (apito) → chute (bola voando) → resultado → próximo
  useEffect(() => {
    if (fase === 'preparar') {
      bolaRef.current?.getAnimations().forEach((a) => a.cancel()) // bola volta para a marca
      const t = setTimeout(() => {
        sons.apito()
        setAlvo(sortearAlvo())
        setFase('chute')
      }, 1000)
      return () => clearTimeout(t)
    }

    if (fase === 'chute' && alvo) {
      const duracao = nivel.defesa.duracaoChuteMs
      bolaRef.current?.animate(
        [
          { left: `${PENALTI.x * 100}%`, top: `${PENALTI.y * 100}%`, scale: '0.55' },
          { left: `${alvo.x * 100}%`, top: `${alvo.y * 100}%`, scale: '1' },
        ],
        { duration: duracao, easing: 'cubic-bezier(0.3, 0.1, 0.7, 1)', fill: 'forwards' },
      )
      const t = setTimeout(() => {
        // Defendeu se a luva estiver encostando na bola quando ela chega (distância em pixels)
        const r = arenaRef.current?.getBoundingClientRect()
        const l = luvaRef.current
        const dx = r ? (l.x - alvo.x) * r.width : 0
        const dy = r ? (l.y - alvo.y) * r.height : 0
        const alcance = r ? (raioLuvaArena + RAIO_BOLA) * r.width : 0
        const defendeu = Math.hypot(dx, dy) <= alcance
        if (defendeu) sons.defesa()
        else sons.gol()
        historicoRef.current = [...historicoRef.current, defendeu]
        setHistorico(historicoRef.current)
        setFase('resultado')
      }, duracao)
      return () => clearTimeout(t)
    }

    if (fase === 'resultado') {
      const t = setTimeout(() => {
        if (historicoRef.current.length >= RODADAS) aoTerminarRef.current(historicoRef.current)
        else setFase('preparar')
      }, 1200)
      return () => clearTimeout(t)
    }
    // Só fase/alvo disparam o ciclo; mexer a luva (que re-renderiza) não reinicia o chute
  }, [fase, alvo, nivel, raioLuvaArena])

  const ultimo = historico[historico.length - 1]

  return (
    <div className="flex flex-col gap-3">
      <PlacarRodadas historico={historico} />
      <p className="text-center text-lg font-bold">{fase === 'preparar' ? 'Atenção... 👀' : 'Arraste a luva até a bola! 🧤'}</p>

      <Arena ref={arenaRef} onPointerDown={moverLuva} onPointerMove={moverLuva}>
        {/* Alcance da luva (círculo claro) + luva */}
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 grid -translate-1/2 place-items-center rounded-full border-4 border-dashed border-white/80 bg-white/30"
          style={{
            left: `${luva.x * 100}%`,
            top: `${luva.y * 100}%`,
            width: `${raioLuvaArena * 200}%`,
            aspectRatio: '1',
            fontSize: `${raioLuvaArena * 120}cqw`,
          }}
        >
          🧤
        </div>
        {/* Bola: começa na marca do pênalti; o voo é animado no efeito acima */}
        <div
          ref={bolaRef}
          aria-hidden
          className="pointer-events-none absolute -translate-1/2 leading-none"
          style={{ left: `${PENALTI.x * 100}%`, top: `${PENALTI.y * 100}%`, fontSize: `${RAIO_BOLA * 200}cqw`, scale: '0.55' }}
        >
          ⚽
        </div>
        {fase === 'resultado' && ultimo !== undefined && <AvisoJogada defendeu={ultimo} />}
      </Arena>
    </div>
  )
}
