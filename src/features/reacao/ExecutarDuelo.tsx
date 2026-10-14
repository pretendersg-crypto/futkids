// Duelo: dois jogadores, o tablet (ou celular) deitado na mesa entre eles. Cada um tem os botões
// de cores do seu lado (o de cima vê tudo de cabeça para baixo, virado para ele). A cor aparece no
// meio: quem tocar primeiro na cor certa ganha o ponto; tocou na errada, o ponto é do outro. Ninguém
// tocou a tempo: ninguém pontua. São drill.repeticoes sinais.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWakeLock } from '../../hooks/useWakeLock'
import { sons } from '../../utils/som'
import type { Drill } from './drills'
import { PLACAR_ZERO, type Placar } from './finalizar'
import { corPorId, sortearSinal, type CorId, type Sinal } from './sinais'

interface Props {
  drill: Drill
  aoTerminar: (placar: Placar, completo: boolean, duracaoS: number) => void
}

type Jogador = 0 | 1
type Fase =
  | { nome: 'contagem'; n: number }
  | { nome: 'espera' }
  | { nome: 'sinal'; cor: CorId }
  | { nome: 'ponto'; de: Jogador | null; motivo: 'rapido' | 'errou' | 'ninguem' }

const NOMES = ['Jogador 1', 'Jogador 2']
const sortear = (min: number, max: number) => min + Math.random() * Math.max(0, max - min)

/** O jogo fora do React (como o motor dos outros drills): só avisa a tela do que mudou */
function criarDuelo(drill: Drill, avisar: (f: Fase, pontos: [number, number]) => void, fim: (placar: Placar, completo: boolean) => void) {
  let fase: Fase = { nome: 'contagem', n: 3 }
  const pontos: [number, number] = [0, 0]
  let sinais = 0
  let anteriores: Sinal[] = []
  let timer: number | undefined
  let acabou = false

  const mudar = (f: Fase) => {
    fase = f
    avisar(f, [...pontos])
  }
  const agendar = (fazer: () => void, ms: number) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(fazer, ms)
  }
  const placar = (): Placar => ({ ...PLACAR_ZERO, sinais, rep: sinais, duelo: [...pontos] })

  function contagem(n: number) {
    mudar({ nome: 'contagem', n })
    if (n > 0) {
      sons.contagem()
      agendar(() => contagem(n - 1), 800)
    } else espera()
  }

  function espera() {
    if (sinais >= drill.repeticoes) return terminar(true)
    mudar({ nome: 'espera' })
    agendar(() => {
      const sinal = sortearSinal(drill, anteriores)
      anteriores = [...anteriores.slice(-4), sinal]
      sinais++
      // O duelo só usa cores
      if (sinal.tipo !== 'cor') return espera()
      sons.largada()
      mudar({ nome: 'sinal', cor: sinal.cor })
      agendar(() => ponto(null, 'ninguem'), drill.exibicaoMs)
    }, sortear(drill.esperaMinMs, drill.esperaMaxMs))
  }

  function ponto(de: Jogador | null, motivo: 'rapido' | 'errou' | 'ninguem') {
    if (de !== null) pontos[de]++
    if (motivo === 'rapido') sons.defesa()
    else if (motivo === 'errou') sons.gol()
    mudar({ nome: 'ponto', de, motivo })
    agendar(espera, 1300)
  }

  function terminar(completo: boolean) {
    if (acabou) return
    acabou = true
    window.clearTimeout(timer)
    if (completo) sons.vitoria()
    fim(placar(), completo)
  }

  return {
    iniciar: () => contagem(3),
    tocar: (jogador: Jogador, cor: CorId) => {
      if (acabou || fase.nome !== 'sinal') return
      if (cor === fase.cor) ponto(jogador, 'rapido')
      else ponto(jogador === 0 ? 1 : 0, 'errou')
    },
    terminar: () => terminar(false),
    desligar: () => {
      acabou = true
      window.clearTimeout(timer)
    },
  }
}

export function ExecutarDuelo({ drill, aoTerminar }: Props) {
  const [fase, setFase] = useState<Fase>({ nome: 'contagem', n: 3 })
  const [pontos, setPontos] = useState<[number, number]>([0, 0])
  const jogo = useRef<ReturnType<typeof criarDuelo> | null>(null)

  useWakeLock(true)

  useEffect(() => {
    const inicio = Date.now()
    const j = criarDuelo(
      drill,
      (f, p) => {
        setFase(f)
        setPontos(p)
      },
      (placar, completo) => aoTerminar(placar, completo, (Date.now() - inicio) / 1000),
    )
    jogo.current = j
    j.iniciar()
    return () => j.desligar()
  }, [drill, aoTerminar])

  const corDoSinal = fase.nome === 'sinal' ? corPorId(fase.cor) : null

  /** O que aparece no meio (cada jogador lê do seu lado) */
  let meio: string
  if (fase.nome === 'contagem') meio = fase.n > 0 ? String(fase.n) : 'Já!'
  else if (fase.nome === 'espera') meio = 'Atenção… 👀'
  else if (fase.nome === 'sinal') meio = corDoSinal!.nome
  else if (fase.de === null) meio = '⏰ Ninguém!'
  else meio = `${fase.motivo === 'errou' ? '❌ Errou! ' : '⚡ '}Ponto do ${NOMES[fase.de]}`

  const lado = (jogador: Jogador) => (
    <div className={`flex min-h-0 flex-1 flex-col gap-2 p-3 ${jogador === 1 ? 'rotate-180' : ''}`}>
      <p className="flex items-center justify-between text-xl font-black">
        <span>{NOMES[jogador]}</span>
        <span className={`rounded-full px-3 py-0.5 ${fase.nome === 'ponto' && fase.de === jogador ? 'pop bg-green-500' : 'bg-white/15'}`}>⭐ {pontos[jogador]}</span>
      </p>
      <div className="grid min-h-0 flex-1 auto-cols-fr grid-flow-col gap-2">
        {drill.cores.map((id) => {
          const cor = corPorId(id)
          return (
            <button
              key={id}
              type="button"
              aria-label={`${NOMES[jogador]}: ${cor.nome}`}
              onPointerDown={(e) => {
                e.preventDefault()
                jogo.current?.tocar(jogador, id)
              }}
              className="touch-manipulation rounded-2xl border-4 border-white/70 text-base font-black uppercase select-none active:scale-95"
              style={{ background: cor.fundo, color: cor.texto }}
            >
              {cor.nome}
            </button>
          )
        })}
      </div>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-30 flex flex-col bg-slate-800 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-white">
      {lado(1)}
      {/* Meio: o sinal, escrito para os dois lados */}
      <div
        className="relative flex h-[30%] shrink-0 flex-col items-center justify-center gap-1 border-y-4 border-white/30 text-center"
        style={corDoSinal ? { background: corDoSinal.fundo, color: corDoSinal.texto } : undefined}
      >
        <p className="rotate-180 text-3xl font-black uppercase">{meio}</p>
        <p className="text-3xl font-black uppercase">{meio}</p>
        <button type="button" onClick={() => jogo.current?.terminar()} className="absolute right-2 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-slate-900">
          Parar 🏁
        </button>
      </div>
      {lado(0)}
    </div>,
    document.body,
  )
}
