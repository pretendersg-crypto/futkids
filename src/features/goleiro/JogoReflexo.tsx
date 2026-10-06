// Minijogo "Reflexo": a bola aparece num canto do gol e a criança toca nela antes do tempo
// acabar (o anel em volta mostra o tempo). A espera entre bolas varia, para não dar para adivinhar.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { sons } from '../../utils/som'
import { Arena, AvisoJogada } from './Arena'
import { GOL } from './geometria'
import { RODADAS, type NivelGoleiro } from './niveis'
import { PlacarRodadas } from './PlacarRodadas'

interface Props {
  nivel: NivelGoleiro
  aoTerminar: (historico: boolean[]) => void
}

type Fase = 'espera' | 'bola' | 'resultado'

export function JogoReflexo({ nivel, aoTerminar }: Props) {
  const [fase, setFase] = useState<Fase>('espera')
  const [posicao, setPosicao] = useState({ x: 0.5, y: 0.3 })
  const [historico, setHistorico] = useState<boolean[]>([])
  const historicoRef = useRef<boolean[]>([])
  const aoTerminarRef = useRef(aoTerminar)
  useEffect(() => {
    aoTerminarRef.current = aoTerminar
  })

  // Tamanho da bola em fração da arena (no mínimo uns 56px num celular comum, bom para o dedo)
  const tamanho = Math.max(nivel.reflexo.tamanhoBola * GOL.w, 0.17)

  function registrar(defendeu: boolean) {
    if (defendeu) sons.defesa()
    else sons.gol()
    historicoRef.current = [...historicoRef.current, defendeu]
    setHistorico(historicoRef.current)
    setFase('resultado')
  }

  useEffect(() => {
    if (fase === 'espera') {
      const t = setTimeout(
        () => {
          const meio = tamanho / 2
          setPosicao({
            x: GOL.x + meio + Math.random() * (GOL.w - 2 * meio),
            y: GOL.y + meio * 0.8 + Math.random() * (GOL.h - meio * 1.6),
          })
          setFase('bola')
        },
        500 + Math.random() * 900,
      )
      return () => clearTimeout(t)
    }
    if (fase === 'bola') {
      // Se o tempo acabar sem toque, é gol (o toque troca a fase e cancela este timer)
      const t = setTimeout(() => registrar(false), nivel.reflexo.tempoBolaMs)
      return () => clearTimeout(t)
    }
    if (fase === 'resultado') {
      const t = setTimeout(() => {
        if (historicoRef.current.length >= RODADAS) aoTerminarRef.current(historicoRef.current)
        else setFase('espera')
      }, 800)
      return () => clearTimeout(t)
    }
  }, [fase, nivel, tamanho])

  const ultimo = historico[historico.length - 1]

  return (
    <div className="flex flex-col gap-3">
      <PlacarRodadas historico={historico} />
      <p className="text-center text-lg font-bold">Toque na bola bem rápido! ⚡</p>

      <Arena>
        {fase === 'bola' && (
          <button
            type="button"
            aria-label="Bola! Toque para defender"
            // pointerdown responde no instante do toque (o click espera o dedo sair)
            onPointerDown={() => fase === 'bola' && registrar(true)}
            className="absolute z-10 grid aspect-square -translate-1/2 place-items-center rounded-full leading-none"
            style={{ left: `${posicao.x * 100}%`, top: `${posicao.y * 100}%`, width: `${tamanho * 100}%`, fontSize: `${tamanho * 75}cqw` }}
          >
            <span
              aria-hidden
              className="anel-tempo absolute inset-0 rounded-full border-4 border-sol"
              style={{ '--tempo': `${nivel.reflexo.tempoBolaMs}ms` } as CSSProperties}
            />
            <span aria-hidden>⚽</span>
          </button>
        )}
        {fase === 'resultado' && ultimo !== undefined && <AvisoJogada defendeu={ultimo} />}
      </Arena>
    </div>
  )
}
