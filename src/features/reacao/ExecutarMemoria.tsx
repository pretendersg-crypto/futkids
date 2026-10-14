// Memória de cores (tipo "Genius"): as cores piscam numa sequência e a criança repete tocando na
// mesma ordem. Acertou, a sequência ganha mais uma cor; errou, perde uma vida e vê a mesma de novo.
// Termina sem vidas ou ao chegar na maior sequência do drill (drill.repeticoes). Tempos do drill:
// exibicaoMs = quanto cada cor fica acesa; esperaMinMs = o intervalo entre uma e outra.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWakeLock } from '../../hooks/useWakeLock'
import { sons } from '../../utils/som'
import type { Drill } from './drills'
import { PLACAR_ZERO, type Placar } from './finalizar'
import { corPorId, type CorId } from './sinais'

interface Props {
  drill: Drill
  aoTerminar: (placar: Placar, completo: boolean, duracaoS: number) => void
}

const VIDAS = 3
/** A primeira sequência já tem 2 cores */
const INICIO = 2

type Fase = 'contagem' | 'mostrando' | 'sua-vez' | 'acertou' | 'errou'

const CORES_PADRAO: CorId[] = ['vermelho', 'azul', 'verde', 'amarelo']

/** Duração do jogo (fora do componente: ler o relógio não é parte do desenho) */
const segundosDesde = (inicio: number) => (Date.now() - inicio) / 1000

const sortearCor = (cores: CorId[]) => cores[Math.floor(Math.random() * cores.length)]

export function ExecutarMemoria({ drill, aoTerminar }: Props) {
  const cores = drill.cores.length >= 2 ? drill.cores : CORES_PADRAO
  const [sequencia, setSequencia] = useState<CorId[]>(() => Array.from({ length: INICIO }, () => sortearCor(cores)))
  const [fase, setFase] = useState<Fase>('contagem')
  const [acesa, setAcesa] = useState<CorId | null>(null)
  const [posicao, setPosicao] = useState(0)
  const [vidas, setVidas] = useState(VIDAS)
  const placar = useRef<Placar>({ ...PLACAR_ZERO, maiorSequencia: 0 })
  const inicio = useRef(0)
  const terminou = useRef(false)

  useWakeLock(true)

  useEffect(() => {
    inicio.current = Date.now()
  }, [])

  function terminar(completo: boolean) {
    if (terminou.current) return
    terminou.current = true
    if (completo) sons.concluido()
    aoTerminar(placar.current, completo, segundosDesde(inicio.current))
  }

  // Mostra a sequência: acende uma cor de cada vez (depois de uma pausa curta)
  useEffect(() => {
    if (fase !== 'contagem' && fase !== 'mostrando') return
    const timers: number[] = []
    let t = fase === 'contagem' ? 1200 : 600
    if (fase === 'contagem') {
      timers.push(window.setTimeout(() => setFase('mostrando'), t))
      return () => timers.forEach(window.clearTimeout)
    }
    sequencia.forEach((cor) => {
      timers.push(
        window.setTimeout(() => {
          setAcesa(cor)
          sons.notaDaCor(cores.indexOf(cor))
        }, t),
      )
      t += drill.exibicaoMs
      timers.push(window.setTimeout(() => setAcesa(null), t))
      t += drill.esperaMinMs
    })
    timers.push(
      window.setTimeout(() => {
        setPosicao(0)
        setFase('sua-vez')
      }, t),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [fase, sequencia, drill.exibicaoMs, drill.esperaMinMs, cores])

  // Depois de acertar/errar, uma pausa e a próxima rodada
  useEffect(() => {
    if (fase !== 'acertou' && fase !== 'errou') return
    const timer = window.setTimeout(() => setFase('mostrando'), 1100)
    return () => window.clearTimeout(timer)
  }, [fase])

  function tocar(cor: CorId) {
    if (fase !== 'sua-vez' || terminou.current) return
    const p = placar.current
    setAcesa(cor)
    window.setTimeout(() => setAcesa((a) => (a === cor ? null : a)), 180)
    if (cor !== sequencia[posicao]) {
      sons.gol()
      p.erros++
      p.sinais++
      const restam = vidas - 1
      setVidas(restam)
      if (restam <= 0) return terminar(true)
      return setFase('errou')
    }
    sons.notaDaCor(cores.indexOf(cor))
    p.acertos++
    p.sinais++
    if (posicao + 1 < sequencia.length) return setPosicao(posicao + 1)
    // Sequência inteira certa
    p.maiorSequencia = Math.max(p.maiorSequencia ?? 0, sequencia.length)
    if (sequencia.length >= drill.repeticoes) return terminar(true)
    sons.defesa()
    setSequencia([...sequencia, sortearCor(cores)])
    setFase('acertou')
  }

  const aviso: Record<Fase, string> = {
    contagem: 'Preste atenção! 👀',
    mostrando: 'Olhe a sequência… 👀',
    'sua-vez': `Sua vez! ${posicao}/${sequencia.length}`,
    acertou: '✅ Isso! Agora com mais uma…',
    errou: '❌ Ops! Veja de novo…',
  }

  return createPortal(
    <div className="fixed inset-0 z-30 flex flex-col gap-3 bg-slate-800 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white">
      <header className="flex items-center gap-2">
        <span className="flex-1 text-lg leading-tight font-extrabold">
          🧠 Sequência de {sequencia.length} · {'❤️'.repeat(vidas)}
          {'🤍'.repeat(VIDAS - vidas)}
        </span>
        <button type="button" onClick={() => terminar(false)} className="min-h-12 rounded-full bg-white px-4 font-extrabold text-slate-900">
          Parar 🏁
        </button>
      </header>
      <p className={`text-center text-2xl font-black ${fase === 'acertou' ? 'text-green-300' : fase === 'errou' ? 'text-red-300' : ''}`}>{aviso[fase]}</p>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        {cores.map((id) => {
          const cor = corPorId(id)
          const ligada = acesa === id
          return (
            <button
              key={id}
              type="button"
              aria-label={cor.nome}
              disabled={fase !== 'sua-vez'}
              onPointerDown={(e) => {
                e.preventDefault()
                tocar(id)
              }}
              className={`touch-manipulation rounded-3xl border-4 text-xl font-black uppercase transition-[opacity,transform] duration-100 select-none ${ligada ? 'scale-105 border-white opacity-100 shadow-[0_0_40px_rgba(255,255,255,.7)]' : 'border-transparent opacity-45'}`}
              style={{ background: cor.fundo, color: cor.texto }}
            >
              {cor.nome}
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
